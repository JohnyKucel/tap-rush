# ChainShift Round 1 — Deck Ide (DRAF LENGKAP, belum registrasi)
# Tenggat: 16 Des 2026 22:29 WIB (16 Des 23:59 IST). Format: maks 6 slide, link dari team workspace.
# BLOKIR sebelum registrasi: tim 2–4 orang WAJIB (Grey solo) + $10 kalau lolos Round 2 + pitching live Inggris 27 Des.
# Jangan registrasi / submit deck sebelum parent/Grey putuskan 3 hal itu.
# Aturan desain Grey 25 Nov 11:12: tiru PENALARAN Claude (satu ide per slide, hierarki jelas),
# bukan gaya visualnya; out-of-the-box, jangan monoton; jujur, tanpa klaim palsu.

## Konsep: PS-02 — AI agents with onchain wallets
# Judul: "AgentPay — dompet on-chain untuk AI agent dengan batas belanja + persetujuan manusia"
# Nyambung ke kerja Agent ID Grey (Binance Agent ID, rosytan.ai) — agent yang sama, dompet yang sama,
# tapi di sini fokusnya: agent bayar API/data/layanan per request, dalam limit yang diset pemilik.
# Testnet saja (Base Sepolia). Gratis sampai Round 2 ($10 hanya kalau lolos).

## Slide 1 — Masalah (satu ide: agent bisa bertindak, tapi tidak bisa bayar dengan aman)
- AI agent hari ini bisa merencanakan, menelepon API, dan mengeksekusi — tapi begitu ada
  tagihan, ia mentok: API berbayar butuh kartu kredit manusia.
- Pemilik agent takut dua hal: agent boros tanpa batas, dan agent disalahgunakan pihak lain.
- Akibatnya: agent otonom hanya jalan di layanan gratis — pasar berbayar (data, komputasi,
  API premium) tertutup buat mereka.
- Fakta keras: setiap pembayaran agent hari ini lewat kartu pemilik — tidak ada jejak on-chain,
  tidak ada batas yang ditegakkan mesin, tidak ada audit.

## Slide 2 — Solusi (satu ide: dompet agent yang dikunci kontrak, bukan kepercayaan)
- AgentPay: tiap agent pegang dompet testnet sendiri. Setiap pembayaran tercatat on-chain.
- Kontrak menegakkan tiga hal: batas belanja per hari, allowlist merchant/API, dan ambang
  persetujuan manusia — di atas ambang, pembayaran antre sampai pemilik setuju.
- Pemilik bisa mencabut akses kapan saja; semua pembayaran bisa diaudit siapa pun.
- Yang TIDAK kami klaim: ini bukan dompet mainnet, bukan produk kustodi, bukan pengganti kartu.

## Slide 3 — Cara kerja (satu ide: empat langkah, semua terlihat)
- Diagram (4 kotak, panah lurus): 1) Pemilik set limit + allowlist → 2) Agent minta bayar →
  3) Kontrak cek limit + allowlist → 4a) di bawah ambang: bayar langsung, tercatat; 4b) di
  atas ambang: antre persetujuan manusia → bayar / tolak, tercatat.
- Satu kalimat: tidak ada pembayaran yang lolos tanpa melewati kontrak.
- Yang dilihat juri di demo: saldo agent, log pembayaran real-time, tombol setujui/tolak.

## Slide 4 — Demo yang dibangun 18–26 Des (satu ide: end-to-end, bukan slideware)
- Kontrak testnet (Base Sepolia): limit harian + allowlist + antrean persetujuan.
- Dashboard: saldo agent, log pembayaran, tombol setujui/tolak, tampilan merchant.
- Skenario demo (60 detik): agent beli data cuaca $0,01 (langsung lolos) → agent minta beli
  dataset $5 (di atas ambang → antre → pemilik setujui dari HP → tercatat).
- Gas disponsori untuk payer demo (gasless) — juri tidak perlu isi saldo apa pun.

## Slide 5 — Kenapa menang (satu ide: tiap kriteria juri dijawab satu bukti)
- Problem nyata (25 poin): pembayaran agent adalah penghalang otonomi yang sebenarnya —
  bukan masalah buatan.
- Desain on-chain + keamanan (25 poin): limit + allowlist + persetujuan ditegakkan kontrak,
  bukan janji di dokumen.
- Demo end-to-end (20 poin): kontrak + dashboard + skenario 60 detik yang bisa diulang juri.
- Baru (15 poin): kebanyakan dompet agent hari ini tanpa batas mesin + tanpa persetujuan manusia.
- Presentasi jelas (15 poin): satu ide per slide, satu demo, satu angka: $0,01 vs $5.

## Slide 6 — Tim + rencana (satu ide: jujur soal yang belum ada)
- Tim: 2–4 anggota — STATUS: BELUM ADA (Grey solo; ini blokir registrasi).
- Rencana: registrasi + deck ini (Round 1, tutup 16 Des) → umumkan 17 Des → build 18–26 Des
  → pitching live 27 Des (5 menit demo + 3 menit Q&A, Inggris) → hasil 30 Des.
- Biaya: $0 sampai Round 1; $10 hanya kalau lolos ke Round 2 (dibayar 21 Des).
- Kalau tim tidak terbentuk / tidak ada yang pitching: ChainShift tidak jalan — fokus ke Blitz v10.

## Catatan jujur
- Deck ini HANYA draf konten. Visual final (6 slide) dibuat setelah tim ada.
- Tidak ada angka yang difabrikasi: $0,01 dan $5 adalah angka skenario demo, bukan data pasar.
- PS-02 dipilih karena nyambung ke kerja Agent ID yang sudah jalan — bukan ide dari nol.
