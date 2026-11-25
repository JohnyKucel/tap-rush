import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Solana web3.js + Anchor need Node globals in the browser.
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: { port: 5173 },
});
