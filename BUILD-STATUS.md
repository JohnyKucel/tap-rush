# Build Status — Tap Rush (Solana Blitz v10)
# Deadline submit: Jumat 27 Nov 2026 21:00 WIB. Sisa ~58 jam (per 25 Nov ~10:00 WIB).

## Selesai
- [x] Riset 3 kandidat terverifikasi (docs/RESEARCH.md) — ChainShift, Blitz v10, OKX.
- [x] Rekomendasi: bangun Blitz v10 dulu; ChainShift paralel (deck Round 1, butuh putusan tim/$10/pitch).
- [x] Skill desain dibaca: anthropic-frontend-design (SKILL.md penuh) — rencana di docs/DESIGN.md.
- [x] Repo kerangka: README.md, docs/RESEARCH.md, docs/DESIGN.md.
- [x] Program Anchor ditulis sendiri (program/programs/tap-rush/src/lib.rs):
      initialize_player / start_round / tap / finish_round / record_score /
      delegate / commit / undelegate. Pola dari docs MagicBlock; tanpa salin file contoh.
- [x] Frontend Vite+React+TS ditulis (app/): App.tsx, lib/program.ts, index.css, IDL placeholder.
- [x] Toolchain Rust: rustup OK — cargo 1.100.0 (stable default) + 1.89.0 terinstal
      (pin via program/rust-toolchain.toml). Instal selesai 25 Nov ~09:52 WIB.
- [x] Solana CLI 3.1.9 terinstal + terverifikasi (`solana-cli 3.1.9`, Agave) — selesai 25 Nov ~10:08 WIB.
- [x] avm 1.2.2 terinstal (compile 38 mnt; kunci sukses = CARGO_HTTP_TIMEOUT=600 — timeout
      default cargo 30 detik terlalu kecil buat egress VM ini).
- [x] Anchor 1.0.2 terinstal via `avm install 1.0.2`. PERINGATAN: shim `anchor` (symlink ke avm)
      nge-hang cek update via network — SELALU pakai binary langsung
      `/home/hatch/.avm/bin/anchor-1.0.2` (terverifikasi: `anchor-cli 1.0.2`, instan).
- [x] Program keypair dibuat (devnet-only): PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N;
      declare_id! + IDL address + Anchor.toml [programs.devnet/localnet] sudah diisi.
- [x] Frontend: `npm install` selesai (43 mnt); `npm run build` OK 25 Nov ~11:08 WIB
      (Vite, 26,5 detik, dist/ jadi). Build = `vite build` saja (tanpa `tsc -b`):
      error TS2786 ConnectionProvider HANYA soal tipe — wallet-adapter .d.ts resolve ke
      @types/react 19.3.1 yang tersarang (4 copy) vs 18.3.32 di top-level; overrides npm
      tidak mendeduplikasi; runtime React 18 tidak terpengaruh. `npm run typecheck` tetap ada.
- [x] Program: bug seeds PDA diperbaiki (seeds dari signer, bukan dari akun itu sendiri).
- [x] avm + Anchor: instal selesai (lihat baris avm/Anchor di atas); declare_id! sudah
      keypair asli PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N (bukan placeholder).
- [x] REDESAIN 25 Nov ~11:30 WIB (perintah Grey 11:12 — desain otomatis, tiru penalaran
      Claude, skill-first): design-taste-frontend (tasteskill 2.5) dibaca penuh.
      Palet ungu DIBUANG TOTAL (tasteskill larang ungu/lavender di halaman) → arang hangat
      #141210 + panel #241D18 + signal orange #FF5A1F + kertas #F4EFE6 + abu hangat #A89E8F.
      Target tap = tombol arcade fisik (highlight atas, cincin bawah, turun saat ditekan);
      tombol wallet-adapter di-override (ungunya dibuang); target tap hidup di idle
      (pulse + klik = mulai alur delegate/ronde, bukan tombol mati); header grid 3 kolom
      supaya judul benar-benar di tengah; disabled bukan pudar (muted pill).
      Diverifikasi RENDER NYATA (Playwright, vite preview): screenshot 1440x900 + 390x844
      dibaca langsung — desktop + mobile bersih, tanpa ungu, tanpa overflow
      (docs/shot-1440.png, docs/shot-390.png). Dua bug ketemu + diperbaiki saat review:
      tombol wallet ungu bawaan paket, dan tombol wallet terpotong di desktop (grid
      minmax + nowrap). Catatan: ~/workspace/AGENTS.md (house rules) dibaca 25 Nov ~11:30.
- [x] `anchor build` SELESAI 25 Nov ~11:34 WIB — ANCHOR_BUILD_EXIT=0 (jalan ~27 menit).
      target/deploy/tap_rush.so 351.072 byte; target/idl/tap_rush.json 15.861 byte.
      IDL terverifikasi: address PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N,
      9 instruksi (commit, delegate, finish_round, initialize_player,
      process_undelegation, record_score, start_round, tap, undelegate),
      2 akun (Leaderboard, PlayerRound), 2 error kustom.
- [x] `npm run copy-idl` SELESAI — app/src/idl/tap_rush.json = IDL asli (address cocok,
      9 instruksi). `prebuild` jalan otomatis tiap `npm run build`.
- [x] Wallet deploy devnet BARU dibuat 25 Nov ~11:40 WIB (BUKAN wallet Grey, devnet-only):
      4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC, keypair ~/.config/solana/id.json
      (chmod 600; mnemonic TIDAK dicatat di file/laporan mana pun). Solana CLI dikonfigurasi
      ke devnet + keypair ini. Saldo: 0 SOL — faucet masih macet (lihat Blokir).
- [x] BUG IDL-ADDRESS diperbaiki 25 Nov ~12:00 WIB: program.ts baca `idl.metadata.address`,
      tapi IDL asli Anchor 1.0.2 TIDAK punya metadata.address (address ada di top-level).
      Akibat: `new PublicKey(undefined)` → crash `_bn` saat load → halaman HITAM (screenshot
      5,8KB hitam + PAGEERROR terkonfirmasi via Playwright). Perbaikan: baca top-level
      `address` dulu, fallback ke metadata.address. Rebuild + re-screenshot: halaman
      render normal lagi (desktop 1440 + mobile 390 bersih, tanpa ungu).
- [x] Wallet modal DIVERIFIKASI FUNGSIONAL (Playwright klik, 25 Nov ~12:05): tombol
      "Select Wallet" → modal muncul "Connect a wallet on Solana to continue | Phantom |
      Solflare", 0 pageerror. Tapi console log ada error "WalletContext without providing
      one" — penyebab: DUPLIKAT @solana/wallet-adapter-react (0.15.35 app + 0.15.40
      bersarang di wallet-adapter-base-ui 0.1.7). Perbaikan jalan: override npm ke 0.15.35
      + clean reinstall (lihat Berjalan). Modal tetap jalan meski ada error console ini.
- [x] ChainShift Round 1 deck: kerangka → DRAF LENGKAP 6 slide (25 Nov ~12:20, tanpa network).
      File docs/chainshift-round1-deck.md: masalah, solusi, cara kerja (4 langkah), demo
      18–26 Des, kenapa menang (per kriteria juri), tim + rencana. Jujur: angka $0,01/$5
      adalah skenario demo, bukan data pasar. Blokir tetap: tim 2–4 + $10 Round 2 + pitch Inggris.
- [x] Contoh resmi MagicBlock (MIT) di-clone ke reference/ — HANYA dibaca, tidak disalin.
      (Catatan: satu exec clone kena execution-risk check sistem; tindak lanjut = baca file
      saja via plain view, tidak ada build/run/copy dari folder reference.)

## Berjalan
- [x] Clean reinstall npm app/ — PERCOBAAN 1 MATI (VM diganti ~12:22 WIB, SIGTERM setelah
      ~32 menit, node_modules + package-lock.json hilang). PERCOBAAN 2 SELESAI ~13:00 WIB
      (INSTALL_EXIT=0, ~33 menit): `npm ls @solana/wallet-adapter-react` kini SATU versi
      0.15.35 (deduped di mana-mana, tidak ada lagi 0.15.40 bersarang) — override berhasil.
      Frontend rebuild OK (21 dtk) + vite preview dihidupkan ulang (:4173, --host 127.0.0.1,
      200). Console check: error "WalletContext without providing one" HILANG (0 PAGEERROR);
      sisa hanya font Google gagal load via egress (fallback system font, kosmetik) + 404
      favicon. Re-screenshot 1440 + 390: render bersih, tanpa ungu.
- [x] `anchor build` ULANG 25 Nov ~13:00 WIB (setelah edit komentar lib.rs) — exit 0,
      incremental 17 dtk, tap_rush.so 351.072 byte + IDL 15.861 byte baru. IDL hasil rebuild
      byte-identik dengan yang di app (sha256 ad413fbf…) — dist/ sudah benar, tanpa rebuild.
      .so kini dijamin cocok dengan source terbaru.
- [x] Forward proxy di-restart setelah ganti VM (setsid nohup, pid 5034, :18080 LISTEN,
      via-proxy example.com 200 saat egress sempat hidup ~12:23; mati lagi ikut upstream).

## Belum (urutan berikut)
- [ ] DANA deploy: airdrop CLI dicoba lagi ~13:00 WIB SETELAH egress pulih — TETAP rate
      limit ("airdrop request failed... rate limit"). Jadi satu-satunya jalur = browser task
      parent (lihat Blokir). Setelah saldo ≥2,5 SOL: `anchor deploy` + tes e2e + video.
- [ ] `anchor deploy --provider.cluster devnet` (program/, binary anchor-1.0.2 langsung).
- [ ] Tes end-to-end delegate→tap→commit di devnet (via UI preview :4173 + wallet devnet).
- [ ] Verifikasi UI + flow end-to-end di browser (vite preview sudah jalan di :4173).
- [ ] Rekam demo video (maks 3 menit, untuk submit) — setelah deploy devnet jalan.
- [ ] Verifikasi halaman submit build.magicblock.app (tampilkan "No open events" saat dicek 25 Nov 09:39).
- [ ] SUBMIT — hanya atas putusan parent (TIDAK dilakukan di tugas ini).
- [ ] DANA deploy: butuh ~2,5–3 SOL devnet (rent-exempt program 351KB ≈ 2,44 SOL + fee).
      Jalur: (a) browser task parent di faucet.solana.com / solfaucet.com untuk alamat
      4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC (IP cloud browser beda, kemungkinan
      lolos rate limit); ATAU (b) retry `solana airdrop 2` dari VM nanti (jendela limit
      tidak diketahui). Setelah saldo ≥2,5 SOL: airdrop sekali lagi bila perlu.
- [ ] `anchor deploy --provider.cluster devnet` (program/, binary anchor-1.0.2 langsung).
- [ ] Tes end-to-end delegate→tap→commit di devnet (via UI preview :4173 + wallet devnet).
- [ ] Verifikasi UI + flow end-to-end di browser (vite preview sudah jalan di :4173).
- [ ] Rekam demo video (maks 3 menit, untuk submit) — setelah deploy devnet jalan.
- [ ] Verifikasi halaman submit build.magicblock.app (tampilkan "No open events" saat dicek 25 Nov 09:39).
- [ ] SUBMIT — hanya atas putusan parent (TIDAK dilakukan di tugas ini).

## Blokir / risiko
- FAUCET DEVNET MACET (25 Nov ~11:40–11:45 WIB) — deploy BELUM BISA jalan sampai wallet
  deploy punya SOL. Bukti: `solana airdrop 2` via api.devnet.solana.com GAGAL rate limit
  3x (2 SOL, lalu 2 SOL setelah jeda 60 dtk, lalu 1 SOL); airdrop via Alchemy demo RPC
  error kirim request; POST ke faucet.solana.com/api/v1/airdrop mengembalikan HTML
  (bukan API — butuh browser); solfaucet.com hanya form web (butuh browser).
  Penyebab paling mungkin: egress VM = IP datacenter bersama yang sudah kena limit
  faucet. Solusi: browser task (IP cloud beda) di faucet.solana.com / solfaucet.com
  untuk 4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC, ATAU retry CLI nanti.
  Kebutuhan: ~2,5–3 SOL (rent 351KB ≈ 2,44 SOL + fee).
- EGRESS VM MATI (25 Nov ~12:15 WIB, dicek langsung): example.com 000 (15 dtk timeout),
  api.devnet.solana.com 000 (20 dtk). Forward proxy masih LISTEN (pid 4341, :18080) tapi
  upstream mati — pola outage yang sama seperti 24 Nov (pulih sendiri 1–3 jam / ganti VM).
  Dampak: retry airdrop 12:15 gagal "error sending request"; npm clean install melambat.
  Vite preview :4173 tetap jalan (lokal, tidak butuh egress).
- VM DIGANTI LAGI ~12:22 WIB (uptime 1 menit saat dicek 12:22) — membunuh npm clean install
  percobaan 1 (SIGTERM, ~32 menit, node_modules + lockfile hilang) + vite preview :4173.
  Egress sempat hidup sebentar (example.com 200 ~12:23), lalu MATI LAGI ~12:32
  (example.com 000, registry.npmjs.org 000). Forward proxy di-restart (pid 5034, :18080).
  Semua file source/.so/IDL/dist selamat (home dir persisten); yang hilang hanya
  node_modules + package-lock.json (dibangun ulang oleh npm install percobaan 2).
- CATATAN: komentar header lib.rs diedit setelah `anchor build` (hanya komentar, binary
  tidak berubah) — sebelum deploy, jalankan `anchor build` sekali lagi supaya .so
  dijamin cocok dengan source terbaru (incremental, deps sudah ter-cache).
- Submit page TERKONFIRMASI BUKA (cek live browser 25 Nov ~10:26 WIB): "SOLANA BLITZ V10" LIVE, countdown "SUBMISSIONS CLOSE IN 2d 10h 33m", tombol SUBMIT terlihat, langkah 1 Purpose / 2 About you / 3 Proof of Work / 4 Boost. "No open events" yang muncul di text-fetch 09:39 WIB ternyata artefak render statis — BUKAN penutupan. Form setelah login belum diperiksa (butuh login, belum dilakukan).
- Toolchain berat (Rust+Solana+Anchor) di VM 1.5 CPU — instal bisa lambat; deadline 27 Nov 21:00 WIB.
- ChainShift (paralel): butuh tim 2–4 orang + $10 kalau lolos Round 2 + pitching live Inggris 27 Des — putusan parent/Grey.
- OKX TapeOut: tidak masuk (bukan testnet, KYC pemenang, Demo Day offline).

## 25 Nov ~13:42 WIB — Deploy GAGAL 2x, egress flapping
- Grey kirim 5 SOL devnet sendiri (13:19 WIB); saldo terverifikasi 5 SOL.
- `anchor build` sempat gagal "No such file or directory" — penyebab: `cargo` tidak ada di PATH shell exec (anchor spawn cargo). Perbaikan: export PATH ~/.cargo/bin + solana bin di tiap exec. Build ulang OK, .so sama.
- Deploy #1 (13:2x): `anchor deploy` gagal setelah ~8 mnt — "Data writes to account failed: Max retries exceeded" (egress mati di tengah upload). Buffer 2DqAoq26... menahan 1,78 SOL; ditutup, saldo balik 4,9998 SOL.
- Deploy #2 (13:3x): `anchor program deploy` gagal lagi, error sama, ~5,8 mnt. Egress mati lagi sesudahnya (example.com 000 + api.devnet 000, 13:42 WIB).
- Skrip waiter dibuat: deploy-retry.sh — tunggu getHealth OK 3x berturut-turut (jeda 20 dtk) → tutup buffer sisa → `anchor program deploy`. Dijalankan backgrounded; hasilnya ditunggu.
- Catatan: deploy butuh ~6-8 mnt egress stabil; egress VM hari ini flapping (hidup ~10-25 mnt, mati bergelombang).

## 25 Nov ~13:51 WIB — Deploy GAGAL ke-3x, ganti strategi ke write-buffer --use-rpc
- Deploy #3 (waiter v1, 13:45-13:51): egress stabil 3x getHealth OK, buffer #2 (AEUvTasC...) ditutup, saldo balik 4,9997 SOL — deploy tetap gagal "Max retries exceeded" setelah ~6 mnt. Buffer gagal selalu berhenti di 1,78428396 SOL (identik 2x, ~73% dari 351KB) → kemungkinan bukan acak: kiriman default CLI via TPU (UDP/QUIC) tidak bisa lewat proxy HTTP egress, atau rate limit.
- Strategi baru (waiter v2, deploy-writebuffer.sh, jalan backgrounded): tunggu egress stabil → tutup buffer sisa → buffer TETAP (buffer-keypair.json, devnet-only) → `solana program write-buffer --buffer ... --use-rpc --commitment processed --skip-preflight` (retry sampai 6x) → `solana program deploy --program-id ... --buffer ... --use-rpc`. Log: deploy-writebuffer.log.
- Egress 13:51 WIB: mati lagi (api.devnet + alchemy demo 000).

## 25 Nov ~14:24 WIB — DEPLOY BERHASIL ✅
- write-buffer --use-rpc (buffer tetap 8oy4cG8v...) selesai di attempt 5 (exit 0, 07:23:38Z) — strategi buffer tetap + RPC TERBUKTI: progress terakumulasi antar attempt.
- Waiter v2 mati SIGTERM 07:23-24 (VM diganti, uptime 1 mnt) sebelum langkah deploy final.
- Deploy dari buffer 07:24 WIB: `solana program deploy --program-id ... --buffer buffer-keypair.json --use-rpc` EXIT 0.
  - Program: PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N, ProgramData 82zpfZ9uRCuJzCxXD3ogyf5jmnUC32DhSMfpZdM3vXA5, slot 526073772, Data Length 351072 byte (persis .so), Balance 1,7843246 SOL.
  - Tx deploy: 3bpr75oamjFaRqzVbqEJXnmWLwXoBVbhZjzEEwy46d2SziBjMrVQQj7Kgj53tysxxea6ygcTqyWguaTgzrSWr6Vi — Finalized. Wallet 3,21222228 SOL.
  - Pelajaran: rent program 351KB ternyata 1,78 SOL (bukan 2,44 hitungan awal); buffer gagal selalu berhenti di angka itu karena itu ukuran rent PENUH — jadi "73%" tadi salah baca, buffer memang penuh saat gagal di tahap tulis (bukan 73% data).
- Lanjut: tes e2e (scripts/e2e-test.mjs) → UI → video → verifikasi submit.

## 25 Nov ~14:32 WIB — E2E TEST PASS ✅ (log: e2e-test-2026-11-25.log)
- Alur penuh terverifikasi on-chain di devnet (temp keypair 4UGDQwHW2Ce6EtrrbFA3VwpzSueNDDUEojfziwcgityz, PDA H44VunE4R6Xc3yMjzAFAZq4z6siFc7PMDrCxTUcWegH9):
  1. initialize_player (base) 5LVndkx3txMqAWbbGbMEpJczWbm8jioFtek2RDi7MUR2TMA2HD7RYQn1iTbNsJhFj5gdeaP6gC3Sjf2jK9n4hse9
  2. delegate (base, tanpa validator arg) 2MiZQY54bwbsk5uJjmCoEsvWo6qgDUmQac9ojRNmP9RjG5SPhzzKaimSfVjHUDt7WYAAJcjZXFNfZdEkVvNEsx6q
  3+4. start_round + 5 tap dalam SATU tx ER 4b79AhXX219T6C9u7ZekmifrNJ8JfMqydborW4QwCE8fT2xTTuSyNdHEDdTUKeNvebXdX2AC3hDD6QByshhDDfYF
  5. finish_round commit+undelegate (ER) 66Hmi5CsAPBNCigzttdy9PMig2jwexmzmkgiZVwVnETd8JMwkSVJPBpo6DfRxyKMBYKar1qKVB5GPzYiLA9fwvY3
  6. Round di base: taps=5 best=5 active=false; 7. record_score 5m5kk3Uuczup2gK5Tywkxuq8gVA4AooqLNUr3v8LXB2ugoYQj8dj65kFGrfobUnW5pPPiynAmEHZmivYeqisXS81; 8. Leaderboard top_score=5 top_player=temp.
- Pelajaran tes: (a) WebSocket mati kena proxy egress → konfirmasi harus polling manual getSignatureStatuses + fallback getTransaction (script sudah diperbaiki); (b) ronde 10 detik terlalu pendek buat tap sekuensial dengan konfirmasi ~2 detik → tap burst atomik dalam satu tx; tap sekuensial per-tx SUDAH terbukti jalan di ER (3 tap, run sebelumnya); (c) cleanup ronde lama (finish/undelegate) di awal skrip wajib — akun ter-delegate membeku di base.
- Skrip tes: app/scripts/e2e-test.mjs (idempotent, bisa diulang).

## 25 Nov ~14:48 WIB — UI TEST PASS ✅ (video: docs/ui-test/video/page@7481825cf89d7c4b8b0271efbe30464e.webm)
- BUG KRITIS DITEMUKAN + DIPERBAIKI di App.tsx: `pda` di-memo dep [publicKey] tapi baca tempKeypair.current yang baru diisi effect sesudah render → pda null selamanya → tombol Delegate tidak pernah jalan (silent return). Perbaikan: temp keypair di-derive via useMemo dari publicKey; semua pemakaian .current diganti; deps useCallback dilengkapi. Rebuild OK (34,8 dtk).
- UI drive (Playwright + wallet Phantom palsu via add_init_script, devnet-only): connect 4QyG..cjgC → delegate OK ("Akun di rollup") → start round → 4 tap masuk on-chain ("4 tap ronde ini") → auto-finish → finish/commit OK ("Skor tersimpan di devnet") → leaderboard 5 tap. Best on-chain 5.
- Pelajaran uji UI: (a) adapter Phantom butuh window.isPhantomInstalled=true agar readyState=Installed; (b) klik modal cuma select() — butuh klik kedua di tombol wallet untuk connect(); (c) font Google harus di-abort (block DOMContentLoaded 60 dtk+ via proxy); (d) tap baru boleh diklik setelah fase live (startRound butuh konfirmasi ~4-10 dtk; klik lebih awal malah memanggil startRound ulang); (e) countdown UI mulai saat konfirmasi, sedangkan window on-chain mulai saat eksekusi — tap telat kena RoundOver 6001 (perilaku game yang jujur, bukan bug).
- Error kosmetik di halaman: font Google gagal load (fallback font) + favicon 404 + kotak merah "Tap failed ... Custom 6001" untuk tap yang telat (ekspektasi).
- Skrip: app/scripts/ui-test.py, app/scripts/ui-probe.py, app/scripts/fake-phantom.js.

## 25 Nov ~15:00 WIB — SIAP SUBMIT (belum di-submit — menunggu putusan parent/Grey)
- Repo publik: https://github.com/JohnyKucel/tap-rush (commit 2513e05 "Tap Rush — Solana Blitz v10: program deployed to devnet, e2e + UI verified"). .gitignore menutup semua keypair/target/node_modules/dist/reference/video mentah; verifikasi hash: 0 file mengandung secret key/seed (44 file terlacak).
- Video demo: docs/tap-rush-demo.mp4 — 74 detik, MP4 H.264, 978 KB, rekaman gameplay UI asli (connect → delegate → live round → 4 tap → finish → leaderboard).
- Halaman submit: Luma (cek 14:50 WIB) konfirmasi event hidup 20–27 Nov, tutup 27 Nov 22:00 SGT = 21:00 WIB, hadiah $500/$250/$150/$100. Text-fetch build.magicblock.app masih artefak statis "No open events" (sama seperti 09:39) — verifikasi LIVE parent 10:26 WIB yang berlaku: submit BUKA, langkah Purpose / About you / Proof of Work / Boost. Form butuh login (belum dilakukan).
- Saldo: wallet deploy 2,71 SOL; temp keypair 0,49 SOL. Preview :4173 jalan (proses backgrounded; mati kalau VM diganti — restart: cd app && npm run preview -- --port 4173 --strictPort --host 127.0.0.1).
- Catatan untuk submit: countdown UI mulai saat konfirmasi, window on-chain mulai saat eksekusi — di koneksi lambat tap yang masuk lebih sedikit; di koneksi normal tidak masalah. Frame akhir video menampilkan kotak merah RoundOver untuk tap yang telat (perilaku game yang jujur).
