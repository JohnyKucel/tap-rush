import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import {
  ER_ENDPOINT,
  ROUND_SECONDS,
  getProgram,
  leaderboardPda,
  noopIx,
  playerPda,
  sendTx,
  tapAccounts,
  tempKeypairFor,
  topUp,
} from "./lib/program";

type Phase = "idle" | "delegated" | "live" | "finishing" | "done";

const ER_SUBSCRIBE_COMMITMENT = "processed" as const;

const App: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const erConnection = useRef<Connection | null>(null);
  const program = useRef<Program | null>(null);
  const roundTimer = useRef<number | null>(null);

  // Temp keypair is derived synchronously from the wallet pubkey (memoized),
  // NOT via a ref filled in an effect: the old ref pattern left `pda` stuck
  // at null (the pda memo ran before the effect filled the ref, and its
  // [publicKey] deps never changed again), which silently disabled Delegate.
  const tempKeypair = useMemo(
    () => (publicKey ? tempKeypairFor(publicKey) : null),
    [publicKey],
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [taps, setTaps] = useState(0);
  const [best, setBest] = useState(0);
  const [topScore, setTopScore] = useState<number | null>(null);
  const [topPlayer, setTopPlayer] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [lastTxMs, setLastTxMs] = useState<number | null>(null);
  const [lastTxUrl, setLastTxUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pda = useMemo(
    () => (tempKeypair ? playerPda(tempKeypair.publicKey) : null),
    [tempKeypair],
  );

  // Wallet connected -> init program + ER connection, fund temp keypair.
  useEffect(() => {
    if (!publicKey || !tempKeypair) return;
    const temp = tempKeypair;
    const init = async () => {
      try {
        if (!program.current) {
          // Minimal provider shape: Anchor only needs connection + wallet-ish object.
          program.current = getProgram({
            connection,
            wallet: { publicKey, signTransaction: async (tx: Transaction) => tx, signAllTransactions: async (txs: Transaction[]) => txs },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        }
        if (!erConnection.current) {
          erConnection.current = new Connection(ER_ENDPOINT, { commitment: "confirmed" });
        }
        await topUp(connection, temp.publicKey);
        await topUp(connection, publicKey);
        const round = pda ? await tapAccounts(program.current).playerRound.fetchNullable(pda) : null;
        if (round) {
          setBest(Number(round.best));
          setTaps(Number(round.taps));
        }
        const board = await tapAccounts(program.current).leaderboard.fetchNullable(leaderboardPda());
        if (board) {
          setTopScore(Number(board.topScore));
          setTopPlayer(board.topPlayer.toBase58());
        }
      } catch (e) {
        setError(`Init failed: ${e}`);
      }
    };
    init().catch((e) => setError(`Init failed: ${e}`));
  }, [publicKey, connection, pda, tempKeypair]);

  const runTx = useCallback(
    async (
      build: (client: Program) => Promise<Transaction>,
      ephemeral: boolean,
    ) => {
      if (!program.current || !tempKeypair || !publicKey || !erConnection.current) {
        throw new Error("Wallet or program not ready yet.");
      }
      const tx = await build(program.current);
      const res = await sendTx(tx, tempKeypair, publicKey, connection, erConnection.current, sendTransaction, {
        useTempKeypair: true,
        ephemeral,
      });
      setLastTxMs(res.totalMs);
      setLastTxUrl(res.explorerUrl ?? null);
      return res;
    },
    [connection, publicKey, sendTransaction, tempKeypair],
  );

  const delegate = useCallback(async () => {
    if (!pda || !tempKeypair) return;
    setBusy(true);
    setError(null);
    try {
      await topUp(connection, tempKeypair.publicKey);
      const tx = await program.current!.methods
        .delegate()
        .accounts({ payer: tempKeypair.publicKey, pda })
        .transaction();
      await runTx(async () => tx as Transaction, false);
      setPhase("delegated");
    } catch (e) {
      setError(`Delegate failed: ${e}`);
    } finally {
      setBusy(false);
    }
  }, [pda, connection, runTx, tempKeypair]);

  const startRound = useCallback(async () => {
    if (!pda || !tempKeypair) return;
    setBusy(true);
    setError(null);
    try {
      const tx = await program.current!.methods
        .startRound()
        .accounts({ round: pda, user: tempKeypair.publicKey })
        .transaction();
      await runTx(async () => tx as Transaction, true);
      setTaps(0);
      setSecondsLeft(ROUND_SECONDS);
      setPhase("live");
      const startedAt = Date.now();
      roundTimer.current = window.setInterval(() => {
        const left = ROUND_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
        setSecondsLeft(Math.max(0, left));
        if (left <= 0 && roundTimer.current) {
          window.clearInterval(roundTimer.current);
          roundTimer.current = null;
          void finishRound();
        }
      }, 100);
    } catch (e) {
      setError(`Start round failed: ${e}`);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pda, runTx, tempKeypair]);

  const tap = useCallback(async () => {
    if (phase !== "live" || !pda || !tempKeypair) return;
    try {
      const tx = await program.current!.methods
        .tap()
        .accounts({ round: pda, user: tempKeypair.publicKey })
        .transaction();
      tx.add(noopIx());
      await runTx(async () => tx as Transaction, true);
      setTaps((t) => t + 1);
    } catch (e) {
      setError(`Tap failed: ${e}`);
    }
  }, [phase, pda, runTx, tempKeypair]);

  const finishRound = useCallback(async () => {
    if (!pda || !tempKeypair) return;
    setPhase("finishing");
    setError(null);
    try {
      const tx = await program.current!.methods
        .finishRound()
        .accounts({ payer: tempKeypair.publicKey, round: pda })
        .transaction();
      await runTx(async () => tx as Transaction, true);
      const round = await tapAccounts(program.current!).playerRound.fetch(pda);
      const newBest = Number(round.best);
      setBest(newBest);
      // Base-layer leaderboard update.
      const recTx = await program.current!.methods
        .recordScore()
        .accounts({
          round: pda,
          leaderboard: leaderboardPda(),
          user: tempKeypair.publicKey,
        })
        .transaction();
      await runTx(async () => recTx as Transaction, false);
      const board = await tapAccounts(program.current!).leaderboard.fetch(leaderboardPda());
      setTopScore(Number(board.topScore));
      setTopPlayer(board.topPlayer.toBase58());
      setPhase("done");
    } catch (e) {
      setError(`Finish failed: ${e}`);
      setPhase("delegated");
    }
  }, [pda, runTx, tempKeypair]);

  // Target tap = jalan masuk utama: di idle ia mengundang (pulse), diklik ia
  // mulai alurnya (delegate → mulai ronde), bukan tombol mati yang menunggu.
  const handleTapTarget = useCallback(() => {
    if (busy) return;
    if (phase === "live") { void tap(); return; }
    if (phase === "delegated" || phase === "done") { void startRound(); return; }
    if (phase === "idle") {
      if (!publicKey) {
        setError("Hubungkan wallet dulu lewat tombol di kanan atas, lalu tap lagi.");
        return;
      }
      void delegate();
    }
  }, [busy, phase, tap, startRound, delegate, publicKey]);

  useEffect(() => () => {
    if (roundTimer.current) window.clearInterval(roundTimer.current);
  }, []);

  const ringPct = secondsLeft / ROUND_SECONDS;
  const ringC = 2 * Math.PI * 140;

  return (
    <div className="tap-rush">
      <header>
        <span className="spacer-cell" aria-hidden="true" />
        <div className="title-block">
          <h1>
            Tap <span>Rush</span>
          </h1>
          <p className="subtitle">10 detik. Tiap tap = transaksi gasless di Ephemeral Rollup.</p>
        </div>
        <div className="wallet-cell">
          <WalletMultiButton />
        </div>
      </header>

      <div className="status-strip">
        <span className={`status-pill ${phase !== "idle" ? "done" : ""}`}><span className="dot" />Devnet terhubung</span>
        <span className={`status-pill ${phase === "delegated" || phase === "live" || phase === "finishing" || phase === "done" ? "on" : ""}`}>
          <span className="dot" />{phase === "idle" ? "Belum di-delegate" : "Akun di rollup"}
        </span>
        <span className={`status-pill ${phase === "live" ? "on" : ""}`}>
          <span className="dot" />{phase === "live" ? "Ronde jalan di rollup" : phase === "done" ? "Skor tersimpan di devnet" : "Menunggu ronde"}
        </span>
      </div>

      <div className="arena">
        <svg className="timer-ring" viewBox="0 0 300 300" aria-hidden="true">
          <circle className="track" cx="150" cy="150" r="140" />
          <circle
            className="left"
            cx="150"
            cy="150"
            r="140"
            strokeDasharray={ringC}
            strokeDashoffset={ringC * (1 - ringPct)}
          />
        </svg>
        <button
          className={`tap-target ${phase === "live" || phase === "idle" ? "pulse" : ""}`}
          onClick={handleTapTarget}
          aria-label="Tap secepat mungkin"
        >
          {phase === "live" ? secondsLeft : phase === "delegated" || phase === "done" ? "MULAI" : "TAP"}
        </button>
      </div>

      <div className="score-row">
        <div>
          <div className="num">{taps}</div>
          <div className="lbl">tap ronde ini</div>
        </div>
        <div>
          <div className="num">{best}</div>
          <div className="lbl">best kamu (on-chain)</div>
        </div>
      </div>

      <div className="actions">
        {phase === "idle" && (
          <button className="btn-primary" onClick={delegate} disabled={!publicKey || busy}>
            Delegate ke rollup
          </button>
        )}
        {(phase === "delegated" || phase === "done") && (
          <button className="btn-primary" onClick={startRound} disabled={busy}>
            Mulai ronde
          </button>
        )}
        {phase === "live" && (
          <button className="btn-ghost" onClick={finishRound} disabled={busy}>
            Selesai lebih awal
          </button>
        )}
      </div>

      {lastTxMs !== null && (
        <p className="data">
          tx terakhir: {lastTxMs}ms
          {lastTxUrl && (
            <>
              {" · "}
              <a href={lastTxUrl} target="_blank" rel="noreferrer">
                lihat di explorer
              </a>
            </>
          )}
        </p>
      )}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="board">
        <h2>Leaderboard devnet</h2>
        {topScore === null ? (
          <p className="hint">Belum ada skor — jadilah yang pertama.</p>
        ) : (
          <div className="row">
            <span className="data">{topPlayer?.slice(0, 8)}…{topPlayer?.slice(-4)}</span>
            <span>{topScore} tap</span>
          </div>
        )}
      </div>

      <p className="hint">
        Semua transaksi jalan di Solana devnet + Ephemeral Rollup devnet. Tanpa mainnet, tanpa dana asli.
      </p>
    </div>
  );
};

export default App;
