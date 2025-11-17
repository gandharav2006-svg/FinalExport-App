/*
Simple converter script for Figma Tokens JSON -> tokens.tailwind.cjs

Usage (locally):
  1. Export your design tokens from Figma (using Figma Tokens plugin or any export)
     into a JSON file, e.g. `figma-tokens.json`.
  2. Run:
     node scripts/figma-to-tailwind.js figma-tokens.json
  3. The script will generate `tokens.tailwind.cjs` which Tailwind will pick up.

Expected minimal JSON formats supported by this script (flexible):
{
  "colors": { "primary": "#0ea5a4", "background": "#ffffff", ... },
  "typography": { "fontFamily": { "base": "Inter, system-ui, sans-serif" }, "fontSize": { "h1": "48px" } },
  "spacing": { "1": "4px", "2": "8px" },
  "breakpoints": { "sm": "640px", "md": "768px" }
}

The script tries to map common tokens to Tailwind's `colors`, `fontFamily`, `spacing`, and `screens`.
*/

const fs = require('fs')
const path = require('path')

function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => (c ? c.toUpperCase() : ''))
}

function normalizeColorValues(colors) {
  // If values are objects with multiple modes, try to pick a hex string
  const out = {}
  for (const k in colors) {
    const v = colors[k]
    if (!v) continue
    if (typeof v === 'string') {
      out[k] = v
    } else if (v.value) {
      out[k] = v.value
    } else if (v.hex) {
      out[k] = v.hex
    } else if (typeof v === 'object') {
      // try to find a nested "value" or a nested color scale
      if (v.default) out[k] = v.default
      else if (v.base) out[k] = v.base
      else {
        // pick first string leaf
        const leaf = Object.values(v).find(x => typeof x === 'string')
        if (leaf) out[k] = leaf
      }
    }
  }
  return out
}

function toJsModule(obj) {
  return 'module.exports = ' + JSON.stringify(obj, null, 2) + '\n'
}

async function main() {
  const argv = process.argv.slice(2)
  if (argv.length < 1) {
    console.error('Usage: node scripts/figma-to-tailwind.js <figma-tokens.json>')
    process.exit(1)
  }
  const infile = path.resolve(argv[0])
  if (!fs.existsSync(infile)) {
    console.error('File not found:', infile)
    process.exit(1)
  }

  const raw = fs.readFileSync(infile, 'utf8')
  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse JSON:', err.message)
    process.exit(1)
  }

  const out = { colors: {}, fontFamily: {}, spacing: {}, screens: {} }

  // Colors
  if (data.colors) {
    out.colors = normalizeColorValues(data.colors)
  } else if (data.color) {
    out.colors = normalizeColorValues(data.color)
  } else {
    // try to find top-level color-like keys
    const colorCandidates = Object.keys(data).filter(k => /color/i.test(k) || k === 'colors')
    if (colorCandidates.length) {
      out.colors = normalizeColorValues(data[colorCandidates[0]])
    }
  }

  // Typography
  if (data.typography) {
    const t = data.typography
    if (t.fontFamily) {
      // expecting object like { base: 'Inter, sans-serif' }
      out.fontFamily = t.fontFamily
    } else if (t.fonts) {
      out.fontFamily = t.fonts
    }
  }
  if (data.fonts) {
    out.fontFamily = data.fonts
  }

  // Spacing
  if (data.spacing) out.spacing = data.spacing
  if (data.space) out.spacing = data.space

  // Breakpoints
  if (data.breakpoints) out.screens = data.breakpoints
  if (data.breakpoint) out.screens = data.breakpoint

  // Basic cleanup: ensure object keys are valid JS identifiers
  // (Tailwind accepts strings but we'll keep keys as-is)

  const outFile = path.resolve(path.join(process.cwd(), 'tokens.tailwind.cjs'))
  fs.writeFileSync(outFile, toJsModule(out), 'utf8')
  console.log('Wrote', outFile)
  console.log('colors:', Object.keys(out.colors).length, 'fontFamily keys:', Object.keys(out.fontFamily).length)
  console.log('If values look odd, open tokens.tailwind.cjs and adjust keys/values manually.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
