#!/bin/bash
# Tap Rush deploy v2 — write-buffer with a FIXED buffer (resumable) over RPC.
# Why: anchor deploy creates a fresh buffer each run (progress lost) and the
# solana CLI defaults to TPU/QUIC sends, which cannot traverse the HTTP egress
# proxy. --use-rpc forces all sends through HTTPS RPC.
# Log: deploy-writebuffer.log
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.npm-global/bin:$PATH"
BASE=~/workspace/hackathons/solana-blitz-v10
LOG="$BASE/deploy-writebuffer.log"
echo "$(date -u +%FT%TZ) waiter v2 start" >> "$LOG"

ok_count=0
for i in $(seq 1 90); do
  if curl -s -m 20 -X POST https://api.devnet.solana.com -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}' 2>/dev/null | grep -q '"result":"ok"'; then
    ok_count=$((ok_count + 1))
    echo "$(date -u +%FT%TZ) getHealth OK ($ok_count/3) minute $i" >> "$LOG"
    if [ "$ok_count" -ge 3 ]; then break; fi
    sleep 20
  else
    ok_count=0
    sleep 60
  fi
done
if [ "$ok_count" -lt 3 ]; then
  echo "$(date -u +%FT%TZ) EGRESS NEVER STABLE after 90 min — giving up" >> "$LOG"
  exit 2
fi

cd "$BASE/program" || exit 3
echo "$(date -u +%FT%TZ) egress stable, cleaning leftover buffers" >> "$LOG"
for buf in $(solana program show --buffers 2>/dev/null | awk '/^[A-Za-z0-9]{32,44} \|/ {print $1}'); do
  echo "$(date -u +%FT%TZ) closing buffer $buf" >> "$LOG"
  solana program close "$buf" >> "$LOG" 2>&1
done
solana balance >> "$LOG" 2>&1

if [ ! -f buffer-keypair.json ]; then
  solana-keygen new --no-bip39-passphrase --silent -o buffer-keypair.json >> "$LOG" 2>&1
  echo "$(date -u +%FT%TZ) buffer keypair: $(solana-keygen pubkey buffer-keypair.json)" >> "$LOG"
fi

# Write the program into the fixed buffer, retrying. Each run rewrites chunks;
# a run that reaches 100% exits 0.
for attempt in 1 2 3 4 5 6; do
  echo "$(date -u +%FT%TZ) write-buffer attempt $attempt" >> "$LOG"
  solana program write-buffer --buffer buffer-keypair.json --use-rpc --commitment processed --skip-preflight target/deploy/tap_rush.so >> "$LOG" 2>&1
  rc=$?
  echo "$(date -u +%FT%TZ) write-buffer attempt $attempt exit=$rc" >> "$LOG"
  solana program show --buffers >> "$LOG" 2>&1
  if [ "$rc" -eq 0 ]; then break; fi
  sleep 30
done
if [ "$rc" -ne 0 ]; then
  echo "$(date -u +%FT%TZ) write-buffer FAILED after 6 attempts" >> "$LOG"
  exit 4
fi

echo "$(date -u +%FT%TZ) deploying from buffer" >> "$LOG"
solana program deploy --program-id target/deploy/tap_rush-keypair.json --buffer buffer-keypair.json --use-rpc >> "$LOG" 2>&1
echo "DEPLOY_EXIT=$?" >> "$LOG"
solana program show PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N >> "$LOG" 2>&1
solana balance >> "$LOG" 2>&1
echo "$(date -u +%FT%TZ) waiter v2 done" >> "$LOG"
