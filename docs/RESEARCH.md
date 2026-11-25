# Riset Hackathon Testnet — dari daftar @orihimexweb3 (post 25 Nov 2026 00:32 WIB)
# Diverifikasi langsung 25 Nov 2026 ~09:40–09:50 WIB via halaman resmi (browser.open) + docs.
# Semua angka/link di bawah dibaca dari halaman itu, bukan dari postingan X.

## Kandidat 1 — ChainShift 2026 (Hack4Hack) — PRIORITAS JANGKA MENENGAH
- Halaman: https://hack4hack.com/hackathons/chainshift-2026-web3-hackathon-dbx6
- Status: ONLINE, TESTNET ONLY, registrasi GRATIS.
- Hadiah: total $1.500 untuk top 10 — 1st $500, 2nd $300, 3rd $200, 4th–5th $100, 6th–10th $60.
- Timeline (WIB = IST − 1,5 jam):
  - Round 1 — registrasi + submit deck ide 6 slide: 15 Nov – 16 Des 2026 (tutup 16 Des 23:59 IST = 22:29 WIB)
  - Round 2 diumumkan: 17 Des 2026
  - Round 2 — build online: 18–26 Des 2026 (submit repo + alamat kontrak testnet + video demo maks 3 mnt + deck 6 slide, tenggat 26 Des 23:59 IST)
  - Pitching live online: 27 Des 2026 (demo 5 mnt + Q&A 3 mnt, slot dikirim email 26 Des)
  - Hasil: 30 Des 2026
- Chain: testnet publik apa pun (Ethereum Sepolia, Base Sepolia, Polygon Amoy, Arbitrum Sepolia, Solana Devnet). Token faucet gratis. Dilarang mainnet / dana asli / token launch.
- Problem statements (pilih 1): PS-01 stablecoin payments; PS-02 AI agents with onchain wallets; PS-03 DeFi/RWA; PS-04 identity/privacy/credentials; PS-05 onboarding next 100M users; PS-06 open track. Wajib deploy ≥1 smart contract/program ke testnet + dipakai di demo.
- Penilaian (100): problem fit 25, onchain design & security 25, demo & UX 20, inovasi 15, presentasi 15.
- BLOKIR (jujur, dari halaman FAQ/aturan):
  - Tim 2–4 orang WAJIB. Solo tidak bisa ("Can I participate alone? No, teams need 2 to 4 members"). Ada opsi "Find a team" di platform.
  - Tim yang lolos Round 2 wajib konfirmasi dengan biaya $10 (₹999) per tim, bayar sebelum 21 Des. Ini BUKAN gratis — butuh keputusan Grey.
  - Pitching live 27 Des dalam bahasa Inggris, online — Grey tidak bisa pitching sendiri; butuh anggota tim yang pitching.
- Cocok untuk kita: PS-02 (AI agents with onchain wallets) nyambung langsung ke kerja Agent ID; PS-06 open track bebas. Round 1 hanya deck ide — murah dibuat. Build baru mulai 18 Des.
- Keputusan yang dibutuhkan parent/Grey: cari tim (2–4 orang) + setuju $10 kalau lolos + siapa pitching.

## Kandidat 2 — Solana Blitz v10 (MagicBlock) — DIBANGUN SEKARANG
- Halaman: https://luma.com/hedv5sgh
- Status: ONLINE, seminggu penuh, pendaftaran GRATIS (General Admission 0 USD). Solo boleh ("Show up solo, leave with a team").
- Hadiah: total $1.000 USDC — 1st $500, 2nd $250, 3rd $150, Wizardio's Choice $100.
- Deadline: SUBMIT sebelum Jumat 27 Nov 2026 22:00 SGT = 21:00 WIB. Build 20–27 Nov. Sisa waktu saat riset: ~59 jam.
- Tema: real-time apps on Solana ("Entertainment Finance": trading games, skill games, collectible packs). Satu syarat: integrasikan Ephemeral Rollups, Private Ephemeral Rollups, atau MagicBlock VRF.
- Testnet: DEVNET. Validator ER devnet resmi (devnet-as/eu/us/tee.magicblock.app), endpoint https://devnet.magicblock.app, router https://devnet-router.magicblock.app. Semua contoh + quickstart resmi jalan di devnet; sesi delegasi 0,003 SOL (faucet devnet, gratis).
- Submit: https://build.magicblock.app/?stage=blitz#submit — CATATAN: saat dicek 25 Nov 09:39 WIB halaman itu menampilkan "No open events to submit to right now" (kemungkinan render statis crawler; link submit resmi dari Luma tetap itu). WAJIB diverifikasi ulang sebelum submit — jangan asumsikan.
- Stack (dari docs resmi, diverifikasi): Solana 3.1.9, Rust 1.89.0, Anchor 1.0.2, Node 24.10.0; anchor-lang 1.0.2 + ephemeral-rollups-sdk 0.16.2 (Rust); TS client @magicblock-labs/ephemeral-rollups-sdk 0.14.3 + @coral-xyz/anchor ^0.32.1 + @solana/web3.js ^1.98.0.
- Referensi resmi (MIT): github.com/magicblock-labs/magicblock-engine-examples (contoh counter Anchor + React client, live demo counter-example.magicblock.app). Contoh HANYA dibaca (plain view); tidak ada file contoh yang disalin ke repo ini — program ditulis sendiri mengikuti pola yang didokumentasikan.
- Kompetisi: Blitz edisi sebelumnya ramai (v9: 55 proyek; total >330 proyek). Peluang menang realistis: kecil, tapi ini satu-satunya jendela testnet yang masih terbuka SEKARANG.
- Yang dibangun: "Tap Rush" — game tap real-time 10 detik; tiap tap = increment gasless di Ephemeral Rollup; skor di-commit kembali ke Solana devnet di akhir ronde; best score + leaderboard tersimpan on-chain. Lihat README.md.

## Kandidat 3 — OKX X Layer "TapeOut Accelerate" — DIVERIFIKASI, TIDAK MASUK (bukan testnet-only)
- Halaman: https://web3.okx.com/xlayer/build-x-series
- KOREKSI angka postingan: bukan $10.000 — prize pool 100.000 USDT (1st 20.000; 2nd 5×10.000; 3rd 5×6.000).
- Deadline submit: 7 Des 2026 23:59 UTC (provisional).
- Syarat: bangun dalam ekosistem TapeOut — pakai sirkuit/kontrak/data on-chain TapeOut di X Layer, atau jalan di X Layer DeWEB. Individu/tim boleh, online; tim shortlist hadir Demo Day OFFLINE.
- Alasan tidak masuk: TIDAK testnet-only (tidak ada kata testnet di syarat; deploy yang diminta di X Layer), pemenang wajib lolos identity check (KYC-ish), Demo Day offline (Grey tidak bisa datang), dan belajar TapeOut circuits dari nol dalam 12 hari tidak realistis.
- Dicatat di sini supaya tidak diriset ulang.

## Kandidat lain dari daftar (tidak dicek detail — di luar perintah "testnet saja")
- Pi ($10.000), HSK Chain ($6.000), ETHChiangmai ($3.000), Telegraph ($10.000), ETHGlobal ($2.500), QIE ($5.000, wajib mainnet), Dev3pack ($10.000), Decentralize AI ($2.500), SLAY HACKS ($5.000), World Build Korea ($5.000, Seoul in-person), START Zürich ($2.000, in-person).

## Rekomendasi
- Bangun dulu: Solana Blitz v10 ("Tap Rush") — satu-satunya yang gratis + solo + devnet + deadline masih bisa dikejar.
- Siapkan paralel: deck ide 6 slide ChainShift Round 1 (tenggat 16 Des) untuk PS-02 — TAPI jangan registrasi sebelum parent/Grey putuskan soal tim, $10, dan pitching.
- Jangan sentuh: OKX TapeOut (bukan testnet, KYC, offline).
