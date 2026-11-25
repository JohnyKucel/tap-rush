# Tap Rush — Solana Blitz v10 (MagicBlock)

Game tap real-time 10 detik di atas Solana Ephemeral Rollups. Tiap tap adalah
transaksi gasless di rollup (blok ~10 ms); di akhir ronde skor di-commit kembali
ke Solana devnet dan best score + leaderboard tersimpan on-chain.

- Hackathon: Solana Blitz v10 — https://luma.com/hedv5sgh
- Hadiah: 1st $500 / 2nd $250 / 3rd $150 / Wizardio's Choice $100 (total $1.000 USDC)
- Deadline submit: Jumat 27 Nov 2026 21:00 WIB (22:00 SGT)
- Syarat yang dipenuhi: integrasi Ephemeral Rollups (delegate → tap di ER → commit + undelegate)
- Biaya: $0 — semua di Solana devnet + ER devnet, token dari faucet gratis. Tanpa mainnet, tanpa KYC, tanpa wallet Grey.
- Status: ✅ DEPLOYED ke devnet 25 Nov 2026 — program `PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N` (tx `3bpr75oamjFaRqzVbqEJXnmWLwXoBVbhZjzEEwy46d2SziBjMrVQQj7Kgj53tysxxea6ygcTqyWguaTgzrSWr6Vi`, Finalized, data 351.072 byte). E2E PASS: delegate → tap di ER → finish/commit → leaderboard on-chain (best 5). UI drive PASS (4 tap via browser). Demo video: `docs/tap-rush-demo.mp4` (74 detik). BELUM di-submit (menunggu putusan).

## Cara main
1. Connect wallet devnet (wallet baru khusus hackathon, bukan wallet Grey).
2. Tekan "Mulai ronde" — akun ronde di-delegate ke Ephemeral Rollup (devnet-us).
3. Tap secepat mungkin selama 10 detik. Tiap tap = `tap` di rollup, gratis, ~10 ms.
4. Ronde selesai — `finish_round` commit skor ke devnet + undelegate; best score tercatat.
5. `record_score` (base layer) memperbarui leaderboard global.

## Struktur
- `program/` — workspace Anchor: program `tap-rush` (Rust), mengikuti pola yang
  didokumentasikan MagicBlock (counter example): `#[ephemeral]`, `#[delegate]`,
  commit/undelegate via `ephemeral-rollups-sdk` 0.16.2.
- `app/` — frontend Vite + React + TypeScript (wallet-adapter, @coral-xyz/anchor,
  @magicblock-labs/ephemeral-rollups-sdk 0.14.3). Endpoint devnet:
  base `https://api.devnet.solana.com`, ER `https://devnet-as.magicblock.app`
  (endpoint region Asia; router `devnet.magicblock.app` tidak dipakai untuk WS).
- `docs/` — `RESEARCH.md` (fakta terverifikasi 3 kandidat) + `DESIGN.md` (rencana desain).
- `reference/` — clone read-only contoh resmi MagicBlock (MIT). HANYA dibaca;
  tidak ada file contoh yang disalin ke `program/` atau `app/`.

## Build (setelah toolchain siap)
- `cd program && anchor build` → `anchor deploy --provider.cluster devnet`
  (butuh SOL devnet dari faucet untuk deploy + akun; gratis)
- `cp program/target/idl/tap_rush.json app/src/idl/` (atau `npm run copy-idl` di app)
- `cd app && npm install && npm run dev`
- Demo video maks 3 menit (untuk submit) — direkam setelah deploy devnet jalan.

## Yang masih dibutuhkan dari parent/Grey
- TIDAK ADA untuk build. Untuk submit nanti: konfirmasi submit (parent yang putuskan),
  dan verifikasi halaman submit build.magicblock.app ("No open events" saat dicek 25 Nov).
- Wallet devnet baru dibuat saat deploy (keypair lokal, bukan wallet Grey).
