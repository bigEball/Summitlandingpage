import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { buildSitemap } from './src/landing/seo'

/**
 * Emits `sitemap.xml` from the route table the site itself routes on.
 *
 * Kept as a build step rather than a checked-in file in `public/` so that a
 * new marketing page cannot ship without appearing in the sitemap — there is
 * one list, in `seo.ts`, and this reads it.
 */
function sitemap(): Plugin {
  return {
    name: 'summit-sitemap',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemap(new Date().toISOString().slice(0, 10)),
      })
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  /* The SSR pass builds one Node bundle for the prerenderer. Splitting it into
     browser cache chunks and re-emitting the sitemap alongside it would be
     meaningless, so both are browser-build only. */
  plugins: isSsrBuild ? [react()] : [react(), sitemap()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            /* React and the router are on every page and never change between
               deploys of our own code, so they get their own long-lived chunk. */
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            },
          },
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    /* The contact form posts to the API server in the `dentalai` repository.
       In development `VITE_API_BASE` is left empty, so the request is
       same-origin and lands here to be forwarded. In production it is set to
       the API's absolute origin and this proxy is not involved. */
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}))
