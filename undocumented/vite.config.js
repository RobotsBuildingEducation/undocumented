import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // Enable PWA in development for testing
      },
      manifest: {
        name: "Undocumented",
        short_name: "Undocumented",
        description: "Civil rights information assistance with AI",
        theme_color: "#fffef5",
        background_color: "#fffef5",
        display: "standalone",
        icons: [
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1731923546/FFFEF5_192_x_192_px_wyojqb.png", // Replace with your icon path
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1731923476/icon_image_ftse8y.png", // Replace with your icon path
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
