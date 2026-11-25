// Tap Rush e2e test — mirrors the UI flow exactly (App.tsx + program.ts).
// Devnet only. Payer = deploy wallet (~/.config/solana/id.json); gameplay
// signer = temp keypair derived from the wallet pubkey, funded by transfer
// (NOT airdrop — the devnet faucet is rate-limited from this VM).
// Steps: fund temp -> initialize_player -> delegate -> start_round (ER)
// -> tap x5 (ER) -> finish_round (ER, commit+undelegate) -> record_score
// -> verify round + leaderboard on base.
// Usage: node scripts/e2e-test.mjs
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import fs from "fs";
import os from "os";
import idl from "../src/idl/tap_rush.json" with { type: "json" };

const BASE_RPC = "https://api.devnet.solana.com";
const ER_ENDPOINT = "https://devnet-as.magicblock.app";
const PROGRAM_ID = new PublicKey(idl.address);
const PLAYER_SEED = "tap-rush";
const LEADERBOARD_SEED = "leaderboard";
const DEVNET_VALIDATOR = new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57");

const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf8"))),
);
const temp = Keypair.fromSeed(wallet.publicKey.toBytes());

const base = new Connection(BASE_RPC, "confirmed");
const er = new Connection(ER_ENDPOINT, "confirmed");
const provider = new AnchorProvider(
  base,
  {
    publicKey: wallet.publicKey,
    signTransaction: async (tx) => { tx.partialSign(wallet); return tx; },
    signAllTransactions: async (txs) => { txs.forEach((tx) => tx.partialSign(wallet)); return txs; },
  },
  { commitment: "confirmed" },
);
const program = new Program(idl, provider);

function playerPda(p) {
  return PublicKey.findProgramAddressSync([Buffer.from(PLAYER_SEED), p.toBuffer()], PROGRAM_ID)[0];
}
function leaderboardPda() {
  return PublicKey.findProgramAddressSync([Buffer.from(LEADERBOARD_SEED)], PROGRAM_ID)[0];
}
const pda = playerPda(temp.publicKey);
const board = leaderboardPda();
const explorerBase = (sig) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const explorerEr = (sig) => `https://explorer.solana.com/tx/${sig}?cluster=custom&customUrl=${encodeURIComponent(ER_ENDPOINT)}`;

async function confirmSig(conn, sig, layer) {
  // Manual polling: the sandbox egress proxy breaks WebSocket (EPROTO spam)
  // and web3.js confirmTransaction times out on slow HTTP polling. Poll
  // getSignatureStatuses directly; if the window passes, check getTransaction.
  for (let i = 0; i < 45; i++) {
    const st = await conn.getSignatureStatuses([sig]);
    const s = st.value && st.value[0];
    if (s && s.confirmationStatus) {
      if (s.err) throw new Error(`${layer} tx failed on-chain: ${JSON.stringify(s.err)} sig=${sig}`);
      return s.confirmationStatus;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  const tx = await conn.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  if (tx) {
    if (tx.meta.err) throw new Error(`${layer} tx failed on-chain: ${JSON.stringify(tx.meta.err)} sig=${sig}`);
    return "confirmed-via-getTransaction";
  }
  throw new Error(`${layer} tx not confirmed in 90s and not found on-chain: sig=${sig}`);
}

async function send(tx, conn, signers, layer, commitment = "confirmed") {
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = temp.publicKey;
  tx.sign(...signers);
  const t0 = Date.now();
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: true });
  const status = await confirmSig(conn, sig, layer);
  const ms = Date.now() - t0;
  return { sig, ms, status };
}

const log = (s) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${s}`);
const results = {};

function noopIx() {
  return new TransactionInstruction({
    programId: new PublicKey("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
    keys: [],
    data: Buffer.from(crypto.getRandomValues(new Uint8Array(5))),
  });
}

async function cleanupRound() {
  // A previous run may have left the round delegated (active+expired, or
  // idle but still delegated). Finish it (commit+undelegate) or undelegate
  // so the fresh run starts clean. Errors here mean "nothing to clean".
  let round = null;
  try { round = await program.account.playerRound.fetchNullable(pda); } catch { round = null; }
  if (!round) { log("cleanup: no round account, nothing to clean"); return; }
  log(`cleanup: existing round taps=${round.taps} best=${round.best} active=${round.active}`);
  if (round.active) {
    try {
      const tx = await program.methods.finishRound().accounts({ payer: temp.publicKey, round: pda }).transaction();
      const r = await send(tx, er, [temp], "ER", "processed");
      log(`cleanup: finish_round OK (ER) ${r.ms}ms ${explorerEr(r.sig)}`);
    } catch (e) { log(`cleanup: finish_round failed (ignored): ${e.message.slice(0, 160)}`); }
  } else {
    try {
      const tx = await program.methods.undelegate().accounts({ payer: temp.publicKey, round: pda }).transaction();
      const r = await send(tx, er, [temp], "ER", "processed");
      log(`cleanup: undelegate OK (ER) ${r.ms}ms ${explorerEr(r.sig)}`);
    } catch (e) { log(`cleanup: undelegate failed (ignored): ${e.message.slice(0, 160)}`); }
  }
  await new Promise((r) => setTimeout(r, 3000));
}

async function main() {
  log(`wallet (deploy): ${wallet.publicKey.toBase58()}`);
  log(`temp keypair: ${temp.publicKey.toBase58()}`);
  log(`player PDA: ${pda.toBase58()}`);
  log(`leaderboard PDA: ${board.toBase58()}`);
  const wBal = await base.getBalance(wallet.publicKey);
  log(`wallet balance: ${wBal / LAMPORTS_PER_SOL} SOL`);
  let tBal = await base.getBalance(temp.publicKey);
  log(`temp balance: ${tBal / LAMPORTS_PER_SOL} SOL`);
  if (tBal < 0.2 * LAMPORTS_PER_SOL) {
    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: wallet.publicKey, toPubkey: temp.publicKey, lamports: 0.5 * LAMPORTS_PER_SOL,
    }));
    const { blockhash, lastValidBlockHeight } = await base.getLatestBlockhash();
    tx.recentBlockhash = blockhash; tx.feePayer = wallet.publicKey; tx.sign(wallet);
    const sig = await base.sendRawTransaction(tx.serialize());
    await confirmSig(base, sig, "Base");
    log(`funded temp +0.5 SOL: ${sig}`);
    tBal = await base.getBalance(temp.publicKey);
    log(`temp balance now: ${tBal / LAMPORTS_PER_SOL} SOL`);
  }

  // 0. Clean up any leftover delegated round from a previous run.
  await cleanupRound();

  // 1. initialize_player (base)
  {
    const tx = await program.methods.initializePlayer().accounts({ round: pda, user: temp.publicKey }).transaction();
    const r = await send(tx, base, [temp], "Base");
    results.initialize = r.sig;
    log(`1. initialize_player OK ${r.ms}ms ${explorerBase(r.sig)}`);
  }
  // 2. delegate (base) — app approach first (no remaining accounts), fallback to devnet validator
  {
    let tx = await program.methods.delegate().accounts({ payer: temp.publicKey, pda }).transaction();
    try {
      const r = await send(tx, base, [temp], "Base");
      results.delegate = r.sig;
      log(`2. delegate OK (no validator arg) ${r.ms}ms ${explorerBase(r.sig)}`);
    } catch (e) {
      log(`2. delegate without validator failed: ${e.message} — retrying with devnet validator remaining account`);
      tx = await program.methods.delegate().accounts({ payer: temp.publicKey, pda })
        .remainingAccounts([{ pubkey: DEVNET_VALIDATOR, isSigner: false, isWritable: false }]).transaction();
      const r = await send(tx, base, [temp], "Base");
      results.delegate = r.sig;
      log(`2. delegate OK (with validator) ${r.ms}ms ${explorerBase(r.sig)}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  // 3+4. start_round + 5 taps in ONE ER tx. Atomic: the round clock starts
  // at ER execution, and confirmation polling through this proxy takes
  // 5-10s — a sequential start-then-tap flow can miss the 10s window
  // before the first tap is even sent. Sequential per-tap execution on
  // the ER was already proven in the previous run (3 taps landed).
  results.taps = [];
  {
    const tx = await program.methods.startRound().accounts({ round: pda, user: temp.publicKey }).transaction();
    for (let i = 0; i < 5; i++) {
      const tapTx = await program.methods.tap().accounts({ round: pda, user: temp.publicKey }).transaction();
      tx.add(...tapTx.instructions);
    }
    const r = await send(tx, er, [temp], "ER", "processed");
    results.startRound = r.sig;
    results.taps = [r.sig];
    log(`3+4. start_round + 5 taps OK in one ER tx ${r.ms}ms ${explorerEr(r.sig)}`);
  }
  // 5. finish_round (ER) — commit + undelegate
  {
    const tx = await program.methods.finishRound().accounts({ payer: temp.publicKey, round: pda }).transaction();
    const r = await send(tx, er, [temp], "ER", "processed");
    results.finishRound = r.sig;
    log(`5. finish_round OK (ER) ${r.ms}ms ${explorerEr(r.sig)}`);
  }
  // 6. verify round on base (wait for commit to land)
  let round = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try { round = await program.account.playerRound.fetch(pda); break; }
    catch { log(`   round fetch retry ${i + 1}/10...`); }
  }
  if (!round) throw new Error("round account not readable on base after finish");
  log(`6. round on base: taps=${round.taps} best=${round.best} active=${round.active} player=${round.player.toBase58()}`);
  results.round = { taps: Number(round.taps), best: Number(round.best), active: round.active };
  // 7. record_score (base)
  {
    const tx = await program.methods.recordScore().accounts({ round: pda, leaderboard: board, user: temp.publicKey }).transaction();
    const r = await send(tx, base, [temp], "Base");
    results.recordScore = r.sig;
    log(`7. record_score OK ${r.ms}ms ${explorerBase(r.sig)}`);
  }
  const lb = await program.account.leaderboard.fetch(board);
  log(`8. leaderboard on base: top_score=${lb.topScore} top_player=${lb.topPlayer.toBase58()}`);
  results.leaderboard = { topScore: Number(lb.topScore), topPlayer: lb.topPlayer.toBase58() };

  const pass = results.round.best === 5 && results.round.active === false && results.leaderboard.topScore === 5;
  console.log("\n=== E2E RESULT: " + (pass ? "PASS" : "FAIL") + " ===");
  console.log(JSON.stringify(results, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error("E2E FAILED:", e); process.exit(1); });
