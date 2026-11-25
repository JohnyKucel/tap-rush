// Tap Rush client — devnet + Ephemeral Rollup wiring.
// Architecture follows the flow documented by MagicBlock: one base-layer
// connection (Solana devnet) and one ER connection pinned to a single region
// endpoint (the router breaks WS subscriptions). Gameplay txs are signed by a
// temp keypair derived from the connected wallet, funded from the devnet faucet.
import { BN, Idl, Program, Provider } from "@coral-xyz/anchor";
import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import tapRushIdl from "../idl/tap_rush.json";

export const BASE_RPC = "https://api.devnet.solana.com";
// Pinned region endpoint (devnet-as). The router (devnet.magicblock.app) must
// not be used for WS subscriptions: a subscription binds to whichever ER the
// router picked at connect time and txs routed elsewhere never fire it.
export const ER_ENDPOINT =
  import.meta.env.VITE_ER_ENDPOINT || "https://devnet-as.magicblock.app";
// Devnet ER validator (Asia). Used as remaining account only on localnet;
// on devnet the delegation program picks the validator from the endpoint.
export const PROGRAM_ID = new PublicKey(
  (tapRushIdl as unknown as { address?: string; metadata?: { address?: string } })
    .address ??
    (tapRushIdl as unknown as { metadata: { address: string } }).metadata.address,
);

export const PLAYER_SEED = "tap-rush";
export const LEADERBOARD_SEED = "leaderboard";
export const ROUND_SECONDS = 10;

export function playerPda(player: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(PLAYER_SEED), player.toBuffer()],
    PROGRAM_ID,
  );
  return pda;
}

export function leaderboardPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(LEADERBOARD_SEED)],
    PROGRAM_ID,
  );
  return pda;
}

export function tempKeypairFor(wallet: PublicKey): Keypair {
  return Keypair.fromSeed(wallet.toBytes());
}

export function getProgram(provider: Provider): Program {
  return new Program(tapRushIdl as unknown as Idl, provider);
}

// Typed account accessors. Anchor's generic Program<Idl> does not carry
// named accounts, so the cast lives here in one place instead of at every
// call site. u64 fields decode to BN.
export type PlayerRoundData = {
  player: PublicKey;
  taps: BN;
  best: BN;
  roundStart: BN;
  active: boolean;
};

export type LeaderboardData = {
  topPlayer: PublicKey;
  topScore: BN;
};

export type TapRushAccounts = {
  playerRound: {
    fetchNullable(pda: PublicKey): Promise<PlayerRoundData | null>;
    fetch(pda: PublicKey): Promise<PlayerRoundData>;
  };
  leaderboard: {
    fetchNullable(pda: PublicKey): Promise<LeaderboardData | null>;
    fetch(pda: PublicKey): Promise<LeaderboardData>;
  };
};

export function tapAccounts(program: Program): TapRushAccounts {
  return program.account as unknown as TapRushAccounts;
}

export async function topUp(
  connection: Connection,
  target: PublicKey,
): Promise<void> {
  const info = await connection.getAccountInfo(target);
  if (!info || info.lamports <= 0.01 * LAMPORTS_PER_SOL) {
    await connection.requestAirdrop(target, LAMPORTS_PER_SOL);
  }
}

export type SendOpts = {
  useTempKeypair: boolean;
  ephemeral: boolean;
  commitment?: Commitment;
  watchAccount?: PublicKey;
};

export type SendResult = {
  signature: string | null;
  totalMs: number;
  explorerUrl?: string;
};

/**
 * Send a prepared transaction on the base layer or the ER, confirm it, and
 * report timing. Mirrors the reference flow: fresh blockhash, fee payer from
 * the temp keypair when gameplay, raw send with skipPreflight on ER.
 */
export async function sendTx(
  tx: Transaction,
  tempKeypair: Keypair,
  walletPubkey: PublicKey,
  baseConnection: Connection,
  erConnection: Connection,
  sendTransaction: (
    tx: Transaction,
    connection: Connection,
    opts?: { minContextSlot?: number },
  ) => Promise<string>,
  opts: SendOpts,
): Promise<SendResult> {
  const target = opts.ephemeral ? erConnection : baseConnection;
  const layer = opts.ephemeral ? "ER" : "Base";
  const commitment: Commitment = opts.commitment ?? (opts.ephemeral ? "processed" : "confirmed");
  const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight },
  } = await target.getLatestBlockhashAndContext();
  if (!tx.recentBlockhash) tx.recentBlockhash = blockhash;
  if (!tx.feePayer) {
    tx.feePayer = opts.useTempKeypair ? tempKeypair.publicKey : walletPubkey;
  }
  if (opts.useTempKeypair) tx.sign(tempKeypair);
  const t0 = performance.now();
  let signature: string;
  if (!opts.ephemeral && !opts.useTempKeypair) {
    signature = await sendTransaction(tx, target, { minContextSlot });
  } else {
    signature = await target.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
    });
  }
  const res = await target.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    commitment,
  );
  if (res.value.err) {
    throw new Error(`Transaction failed on ${layer}: ${JSON.stringify(res.value.err)}`);
  }
  const totalMs = Math.round(performance.now() - t0);
  const explorerUrl = opts.ephemeral
    ? `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(ER_ENDPOINT)}`
    : `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  return { signature, totalMs, explorerUrl };
}

/** A no-op instruction with random bytes, so repeated identical taps stay unique. */
export function noopIx(): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
    keys: [],
    data: Buffer.from(crypto.getRandomValues(new Uint8Array(5))),
  });
}
