import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: [
      "./src/background.ts",
      "./src/content.ts",
      "./src/popup.tsx",
      "./src/injected.ts"
    ],
    bundle: true,
    minify: false,
    sourcemap: process.env.NODE_ENV !== "production",
    target: ['es2020'],
    outdir: "./public/build",
    define: {
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      
    }
  })
  .catch(() => process.exit(1));