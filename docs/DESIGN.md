# Design Plan — Tap Rush (pass 1: rencana, pass 2: review)
# Skill dipakai: anthropic-frontend-design (baca penuh) + design-taste-frontend
# (tasteskill 2.5, baca penuh 25 Nov 11:12 WIB, atas perintah Grey: tiru PENALARAN
# Claude, bukan gaya visualnya; out-of-the-box, jangan monoton/kaku).
# Aturan Grey 25 Nov 11:12: kerja desain jalan OTOMATIS, jangan ditanya-tanya;
# builder WAJIB baca SKILL.md desain relevan sebelum nulis kode visual.
# Berlaku untuk semua desain jalan (Tap Rush, ChainShift, Even Realities —
# Even Realities dikerjakan koordinator fase-2, bukan di repo ini).

## Brief
- Subjek: game arcade tap real-time di atas Solana. Penonton: juri Blitz + pemain Solana.
- Job utama halaman: bikin 10 detik tap terasa elektrik DAN membuktikan round-trip
  on-chain itu nyata (delegate → tap di rollup → commit ke devnet terlihat langsung).
- Kind (tasteskill): gaming — hero = gamenya sendiri, nama di h1, satu efek + satu-dua momen.

## Pass 1 — token + layout (REVISI 25 Nov 11:12 — palet ungu DIBUANG)
- ALASAN REVISI: tasteskill house rule — ungu/lavender DILARANG di desain halaman
  (accent, ground, gradient, warna efek). Palet lama (#171230, #221A4A) melanggar itu.
- Penalaran dari subjek (bukan selera): tap race = arcade fisik. Tombol arcade yang
  ditekan keras-keras, skor mekanik, sumbu yang terbakar. Jadi:
- Warna (bernama):
  - `night` #141210 — arang hangat, bukan hitam dingin
  - `panel` #241D18 — permukaan panel, cokelat-arang
  - `signal` #FF5A1F — SATU aksen berani: orange sinyal arcade (panas/cepat)
  - `ink` #F4EFE6 — kertas hangat
  - `muted` #A89E8F — abu hangat
  - `good` #3DDC97 — hanya status "committed" (fungsional)
- Tipografi: Space Grotesk (display + UI). IBM Plex Mono HANYA untuk data mesin
  (signature tx, latensi ms, status commit) — pemakaian fungsional.
- Layout (satu layar arcade, hero sendiri di layar pertama):
  - Tengah: target tap bundar raksasa sebagai TOMBOL ARCADE FISIK (highlight atas,
    cincin bawah tebal, turun 6px saat ditekan) — hero = momen interaktif itu sendiri.
  - Cincin countdown 10 detik mengelilingi target (sumbu yang terbakar).
  - Skor sebagai PAPAN SKOR MEKANIK: tabular-nums, rapat.
  - Strip status sebagai sirkuit: dot berdenyut saat live, hijau saat committed.
  - Panel leaderboard top 5 + tombol wallet.
- Prinsip: satu elemen yang diingat (tombol arcade berdenyut); sisanya tenang dan disiplin.
  Motion hanya menjawab aksi (ripple tap, flash commit, hero masuk sekali saat load).
  Tombol naik 2px saat hover, turun saat klik. Tanpa kartu SaaS seragam, tanpa label
  eyebrow all-caps, tanpa penanda bernomor, tanpa caption di bawah visual.

## Pass 2 — review lawan brief + cek klise
- Cek klise skill: bukan krem + terracotta, bukan hitam + hijau asam, bukan broadsheet,
  bukan SaaS-card-kit, bukan ungu. Arang hangat + orange sinyal = pilihan spesifik
  brief ini (arcade fisik), bukan template. Mono dipakai hanya untuk data mesin.
  Lolos — lanjut build mengikuti rencana ini.
- Copy (dari perspektif pemain, kalimat kerja, bukan jualan):
  - Tombol: "Mulai ronde", "Tap!", "Simpan skor" (kata kerja + objek).
  - Status: "Terhubung ke devnet", "Ronde jalan di rollup", "Skor tersimpan di devnet".
  - H1 menamai gamenya; satu fakta keras di layar pertama: "10 detik. Tiap tap
    tercatat on-chain." Error: jelas + ada jalan keluar.
- Kualitas dasar: responsif sampai HP, fokus keyboard terlihat, hormati reduced-motion,
  kontras teks di atas #141210 terjaga. Satu section per layar, tepi kiri-kanan sama.

## Catatan implementasi
- Timer + ripple jalan di canvas/DOM lokal; angka skor dari state rollup (bukan animasi palsu).
- Demo video untuk submit direkam dari build ini (bukan mockup).
