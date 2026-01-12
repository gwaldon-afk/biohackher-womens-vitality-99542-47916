import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Split out charting libs (notably recharts + deps)
          if (id.includes("/recharts/") || id.includes("/d3-")) return "charts";

          // Large UI/framework-ish chunks
          if (id.includes("/@radix-ui/") || id.includes("/cmdk/") || id.includes("/vaul/")) return "ui";

          // Data/auth
          if (id.includes("/@supabase/")) return "supabase";
          if (id.includes("/@tanstack/")) return "tanstack";

          // Date utilities can be surprisingly chunky
          if (id.includes("/date-fns/")) return "date";

          // i18n bundles
          if (id.includes("/i18next/") || id.includes("/react-i18next/") || id.includes("/i18next-browser-languagedetector/")) {
            return "i18n";
          }

          // Motion/icons are common but nice to isolate
          if (id.includes("/framer-motion/")) return "motion";
          if (id.includes("/lucide-react/")) return "icons";

          // Everything else from node_modules
          return "vendor";
        },
      },
    },
  },
}));
