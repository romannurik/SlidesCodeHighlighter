import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico"],
  manifest: {
    name: "SlidesCodeHighlighter",
    short_name: "SlidesCodeHighlighter",
    description:
      "A simple source code highlighter that pastes well in to Keynote and Google Slides.",
    icons: [
      {
        src: "images/logo_144x144.png",
        type: "image/png",
        sizes: "144x144",
      },
      {
        src: "images/logo_192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "images/logo_512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    display: "standalone",
    start_url: "/SlidesCodeHighlighter/",
    theme_color: "#607d8b",
    background_color: "#607d8b",
  },
  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    cleanupOutdatedCaches: true,
    sourcemap: true,
  },
  // Add strategies for development mode
  strategies: "generateSW",
  injectRegister: "auto",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugin)],
  base: "",
});
