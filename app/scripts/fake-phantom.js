
(() => {
  const PUBKEY_B58 = "4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC";
  const PUBKEY_BYTES = [50, 183, 10, 252, 86, 172, 252, 95, 222, 91, 68, 158, 25, 120, 22, 208, 101, 95, 248, 129, 225, 254, 120, 127, 76, 77, 242, 250, 30, 49, 60, 193];
  function makePubkeyShim() {
    return {
      toBytes: () => Uint8Array.from(PUBKEY_BYTES),
      toBase58: () => PUBKEY_B58,
      toString: () => PUBKEY_B58,
      equals: (o) => {
        try {
          const b = o && o.toBytes ? o.toBytes() : o;
          return b && b.length === 32 && PUBKEY_BYTES.every((v, i) => v === b[i]);
        } catch (e) { return false; }
      },
    };
  }
  const listeners = {};
  const fake = {
    isPhantom: true,
    isConnected: false,
    publicKey: null,
    connect: async () => {
      fake.isConnected = true;
      fake.publicKey = makePubkeyShim();
      return { publicKey: fake.publicKey };
    },
    disconnect: async () => { fake.isConnected = false; fake.publicKey = null; },
    on: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
    off: (ev, fn) => { listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn); },
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  };
  window.solana = fake;
  window.phantom = { solana: fake };
  // The real Phantom extension sets this flag; the adapter's detection
  // requires it before marking the wallet Installed.
  window.isPhantomInstalled = true;
})();
