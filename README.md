# FinalExport App

Scaffolded React + Vite + Tailwind project.

How to run:

1. Install dependencies

```powershell
cd FinalExport-App; npm install
```

2. Run dev server

```powershell
npm run dev
```

I'll implement the Figma design once you confirm which screen to prioritize.

Applying Figma tokens (colors/fonts/spacing)
-------------------------------------------

1. Export your design tokens from Figma. Recommended: use the "Figma Tokens" plugin and export JSON. Save it as `figma-tokens.json` in the project root.

2. Run the converter locally to generate Tailwind tokens:

```powershell
cd FinalExport-App
node scripts/figma-to-tailwind.js figma-tokens.json
```

This writes `tokens.tailwind.cjs`. Tailwind will pick these up when you run `npm run dev`.

If the converter doesn't map everything perfectly, open `tokens.tailwind.cjs` and tweak the `colors` and `fontFamily` objects.

If you'd like, paste the JSON content of `figma-tokens.json` here and I can suggest the exact `tokens.tailwind.cjs` values to paste into your repo.
