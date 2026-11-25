#!/bin/bash
# Tap Rush deploy retry — waits for a STABLE egress window, closes leftover
# buffers (recover SOL), then runs anchor program deploy. Log: deploy-retry.log
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.npm-global/bin:$PATH"
BASE=~/workspace/hackathons/solana-blitz-v10
LOG="$BASE/deploy-retry.log"
echo "$(date -u +%FT%TZ) waiter start" >> "$LOG"

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

echo "$(date -u +%FT%TZ) egress stable, checking buffers" >> "$LOG"
solana program show --buffers >> "$LOG" 2>&1
for buf in $(solana program show --buffers 2>/dev/null | awk '/^[A-Za-z0-9]{32,44} \|/ {print $1}'); do
  echo "$(date -u +%FT%TZ) closing buffer $buf" >> "$LOG"
  solana program close "$buf" >> "$LOG" 2>&1
done
solana balance >> "$LOG" 2>&1
cd "$BASE/program" || exit 3
echo "$(date -u +%FT%TZ) starting anchor program deploy" >> "$LOG"
/home/hatch/.avm/bin/anchor-1.0.2 program deploy --provider.cluster devnet >> "$LOG" 2>&1
echo "DEPLOY_EXIT=$?" >> "$LOG"
echo "$(date -u +%FT%TZ) waiter done" >> "$LOG"
