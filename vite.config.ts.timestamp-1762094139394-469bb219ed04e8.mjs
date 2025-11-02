// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///home/project/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Auto Refresh",
  version: "1.0.1",
  description: "Automatically refresh tabs with keyword detection and auto-click functionality",
  permissions: [
    "activeTab",
    "tabs",
    "storage",
    "notifications",
    "scripting",
    "offscreen"
  ],
  host_permissions: [
    "<all_urls>"
  ],
  action: {
    default_popup: "index.html",
    default_title: "Auto Refresh"
  },
  background: {
    service_worker: "src/background.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content.ts"]
    }
  ],
  web_accessible_resources: [
    {
      resources: ["icon.png", "icons/*.png"],
      matches: ["<all_urls>"]
    }
  ],
  icons: {
    "16": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  }
};

// vite.config.ts
var vite_config_default = defineConfig({
  // base: '/asd',
  plugins: [react(), crx({ manifest: manifest_default })],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  server: {
    port: 5111,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173
    }
  },
  resolve: {
    alias: {
      // https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5qc29uJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBiYXNlOiAnL2FzZCcsXG5cdHBsdWdpbnM6IFtyZWFjdCgpLCBjcngoeyBtYW5pZmVzdCB9KV0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J11cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0cG9ydDogNTExMSxcblx0XHRzdHJpY3RQb3J0OiB0cnVlLFxuXHRcdGhtcjoge1xuXHRcdFx0cHJvdG9jb2w6ICd3cycsXG5cdFx0XHRob3N0OiAnbG9jYWxob3N0Jyxcblx0XHRcdHBvcnQ6IDUxNzNcblx0XHR9XG5cdH0sXG4gIHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3RhYmxlci90YWJsZXItaWNvbnMvaXNzdWVzLzEyMzMjaXNzdWVjb21tZW50LTI0MjgyNDUxMTlcblx0XHRcdCdAdGFibGVyL2ljb25zLXJlYWN0Jzpcblx0XHRcdFx0J0B0YWJsZXIvaWNvbnMtcmVhY3QvZGlzdC9lc20vaWNvbnMvaW5kZXgubWpzJ1xuXHRcdH1cblx0fVxufSlcbiIsICJ7XG4gIFwibWFuaWZlc3RfdmVyc2lvblwiOiAzLFxuICBcIm5hbWVcIjogXCJBdXRvIFJlZnJlc2hcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjFcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkF1dG9tYXRpY2FsbHkgcmVmcmVzaCB0YWJzIHdpdGgga2V5d29yZCBkZXRlY3Rpb24gYW5kIGF1dG8tY2xpY2sgZnVuY3Rpb25hbGl0eVwiLFxuICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICBcImFjdGl2ZVRhYlwiLFxuICAgIFwidGFic1wiLFxuICAgIFwic3RvcmFnZVwiLFxuICAgIFwibm90aWZpY2F0aW9uc1wiLFxuICAgIFwic2NyaXB0aW5nXCIsXG4gICAgXCJvZmZzY3JlZW5cIlxuICBdLFxuICBcImhvc3RfcGVybWlzc2lvbnNcIjogW1xuICAgIFwiPGFsbF91cmxzPlwiXG4gIF0sXG4gIFwiYWN0aW9uXCI6IHtcbiAgICBcImRlZmF1bHRfcG9wdXBcIjogXCJpbmRleC5odG1sXCIsXG4gICAgXCJkZWZhdWx0X3RpdGxlXCI6IFwiQXV0byBSZWZyZXNoXCJcbiAgfSxcbiAgXCJiYWNrZ3JvdW5kXCI6IHtcbiAgICBcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQudHNcIixcbiAgICBcInR5cGVcIjogXCJtb2R1bGVcIlxuICB9LFxuICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbXG4gICAge1xuICAgICAgXCJtYXRjaGVzXCI6IFtcIjxhbGxfdXJscz5cIl0sXG4gICAgICBcImpzXCI6IFtcInNyYy9jb250ZW50LnRzXCJdXG4gICAgfVxuICBdLFxuICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAge1xuICAgICAgXCJyZXNvdXJjZXNcIjogW1wiaWNvbi5wbmdcIiwgXCJpY29ucy8qLnBuZ1wiXSxcbiAgICAgIFwibWF0Y2hlc1wiOiBbXCI8YWxsX3VybHM+XCJdXG4gICAgfVxuICBdLFxuICBcImljb25zXCI6IHtcbiAgICBcIjE2XCI6IFwiaWNvbi5wbmdcIixcbiAgICBcIjQ4XCI6IFwiaWNvbi5wbmdcIixcbiAgICBcIjEyOFwiOiBcImljb24ucG5nXCJcblxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQVc7OztBQ0ZwQjtBQUFBLEVBQ0Usa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsYUFBZTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGtCQUFvQjtBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsZUFBaUI7QUFBQSxJQUNqQixlQUFpQjtBQUFBLEVBQ25CO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDWixnQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakI7QUFBQSxNQUNFLFNBQVcsQ0FBQyxZQUFZO0FBQUEsTUFDeEIsSUFBTSxDQUFDLGdCQUFnQjtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsMEJBQTRCO0FBQUEsSUFDMUI7QUFBQSxNQUNFLFdBQWEsQ0FBQyxZQUFZLGFBQWE7QUFBQSxNQUN2QyxTQUFXLENBQUMsWUFBWTtBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBRVQ7QUFDRjs7O0FEckNBLElBQU8sc0JBQVEsYUFBYTtBQUFBO0FBQUEsRUFFM0IsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsMkJBQVMsQ0FBQyxDQUFDO0FBQUEsRUFDcEMsY0FBYztBQUFBLElBQ2IsU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLE1BQ0osVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1A7QUFBQSxFQUNEO0FBQUEsRUFDQyxTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUE7QUFBQSxNQUVOLHVCQUNDO0FBQUEsSUFDRjtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
