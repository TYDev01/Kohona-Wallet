Redesign the Konoha wallet landing/onboarding page to make it visually 
stunning and lively using React Bits components. The current page is too 
minimal — just a logo, name, tagline, and one button on a white background.

## Install React Bits components via CLI (TypeScript + Tailwind variants)

Run these commands first:
  npx shadcn@latest add https://reactbits.dev/r/Aurora-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/BlurText-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/Beams-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/BounceCards-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/BorderGlow-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/AnimatedList-TS-TW
  npx shadcn@latest add https://reactbits.dev/r/PixelTrail-TS-TW

## Overall vibe
Dark theme. Feels premium, trustworthy, and alive — like a next-gen wallet 
product. Think Linear or Vercel landing page energy but with a crypto/Web3 
identity. Color palette: deep navy/dark backgrounds, with electric blue or 
purple accent glows. Font should feel modern and clean.

## Page layout (top to bottom)

### 1. Full-screen hero section
- Use the Aurora background component as the full-page background with 
  blue/purple/teal color stops to create a living, breathing atmosphere
- Add PixelTrail so the cursor leaves a subtle glowing trail as the user 
  moves their mouse — adds immediate "wow" on first interaction
- Centered content stack:
    - The Konoha logo icon (keep existing, but give it a soft glow/pulse 
      animation via CSS keyframes)
    - "Konoha" title rendered with SplitText — animate each letter sliding 
      up with staggered delay on mount
    - Tagline rendered with BlurText: "A secure, non-custodial wallet for 
      Ethereum and EVM-compatible networks" — blur-in on mount after title 
      finishes
    - Two CTA buttons side by side:
        1. "Create New Wallet" — primary, use BorderGlow component to give 
           it an animated glowing border
        2. "Import Wallet" — secondary, ghost style, subtle border
    - Small trust line below buttons: 
      "🔒 Your keys, your crypto. No accounts. No tracking."

### 2. Feature highlights section (below the fold)
Three cards in a row using BounceCards layout. Each card floats in with a 
slight bounce on scroll into view. Cards:

  Card 1 — "Self-Custody"
    Icon: shield
    Body: Your private keys are encrypted locally. We never see them.

  Card 2 — "Multi-Account"
    Icon: users
    Body: Manage multiple wallets from a single seed phrase.

  Card 3 — "Multi-Network"  
    Icon: globe
    Body: Ethereum, Polygon, Arbitrum, Base and more — all in one place.

### 3. Live activity strip (above footer)
Use AnimatedList to show a scrolling feed of fake but realistic-looking 
on-chain activity to make the app feel alive:
  - "0x4a3f...c821 sent 0.42 ETH on Ethereum"
  - "0x91bc...f004 swapped 1,200 USDC → ETH on Arbitrum"
  - "0x7e12...aa03 added Account 3 from seed phrase"
  - "0xd04c...3310 connected to Uniswap on Base"
  - "0x23aa...9901 received 0.08 ETH on Polygon"
Add 5 more similar items. They should auto-scroll upward in a loop. Each 
item has a colored network dot (each network has a color), truncated address, 
and action text.

### 4. Footer
Minimal. Just: "Konoha Wallet · Open Source · Not financial advice"

## Theme & styling
- Set the entire app's background to dark (#0a0a0f or similar) in 
  index.css / tailwind config
- Update ShadCN CSS variables for dark mode as the default:
    --background: dark navy
    --foreground: near white
    --primary: electric blue (#3b82f6 or similar)
- Use Tailwind's `dark` class as base (not toggled — always dark)
- Cards should use a glassmorphism style: 
  bg-white/5 backdrop-blur-md border border-white/10
- All section transitions should be smooth — use framer-motion 
  (already likely installed) for scroll-triggered fade-ins if needed

## Routing
The two CTA buttons should route to:
  "Create New Wallet" → /onboarding/create
  "Import Wallet"     → /onboarding/import

## Do NOT change
- Any existing onboarding flow logic or components
- Keyring, store, or chain adapter code
- React Router route definitions (only add links to existing routes)