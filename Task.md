Build a browser-based EVM wallet web app (similar to MetaMask/Rabby) with the following spec:

## Tech Stack
- Vite + React + TypeScript
- ShadCN UI (with Tailwind CSS)
- viem for EVM interactions
- Zustand for global state management
- React Query (TanStack Query) for async data fetching
- React Router for navigation
- idb for IndexedDB access
- @scure/bip39 and @scure/bip32 for key derivation
- vite-plugin-node-polyfills for Node.js polyfills (Buffer, process, etc.)

## Project Structure to scaffold

src/
├── main.tsx
├── App.tsx
│
├── chains/
│   └── evm/
│       ├── client.ts         # viem PublicClient + WalletClient factory functions
│       ├── adapter.ts        # EVMAdapter class: getBalance, sendTransaction, estimateGas
│       ├── tokens.ts         # ERC-20 balance fetching using viem
│       ├── gas.ts            # EIP-1559 gas estimation helpers
│       └── networks.ts       # Network config (mainnet, polygon, arbitrum, base, sepolia)
│
├── keyring/
│   ├── mnemonic.ts           # Generate and validate BIP-39 mnemonic
│   ├── derive.ts             # Derive EVM private key from mnemonic using BIP-44 path m/44'/60'/0'/0/index
│   ├── encrypt.ts            # AES-GCM encrypt/decrypt using Web Crypto API (no external libs)
│   └── keyring.ts            # Keyring class: create, unlock, lock, addAccount, getAccounts
│
├── store/
│   ├── walletStore.ts        # Zustand: current account, accounts list, locked/unlocked state
│   ├── networkStore.ts       # Zustand: current network, custom RPCs
│   └── uiStore.ts            # Zustand: loading states, modals, notifications
│
├── hooks/
│   ├── useBalance.ts         # React Query hook: fetch native ETH balance
│   ├── useTokenBalances.ts   # React Query hook: fetch ERC-20 balances
│   ├── useGasPrice.ts        # React Query hook: fetch current gas price
│   └── useWallet.ts          # Convenience hook wrapping walletStore selectors
│
├── pages/
│   ├── Onboarding/
│   │   ├── index.tsx         # Route: /onboarding
│   │   ├── CreateWallet.tsx  # Step 1: generate mnemonic, show seed phrase
│   │   ├── ConfirmSeed.tsx   # Step 2: confirm seed phrase (word selection UI)
│   │   └── SetPassword.tsx   # Step 3: set encryption password
│   ├── Unlock/
│   │   └── index.tsx         # Route: /unlock — password input to decrypt keyring
│   └── Dashboard/
│       ├── index.tsx         # Route: / — main wallet view
│       ├── Overview.tsx      # Account address, total balance
│       ├── AssetList.tsx     # ETH + ERC-20 token list
│       ├── Send.tsx          # Send transaction flow
│       └── Receive.tsx       # Show address + QR code
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Sidebar/header layout wrapper
│   │   └── BottomNav.tsx     # Mobile nav
│   ├── wallet/
│   │   ├── AccountAvatar.tsx # Blockie-style address avatar
│   │   ├── AddressDisplay.tsx # Truncated address with copy button
│   │   ├── NetworkBadge.tsx  # Current network pill
│   │   └── BalanceDisplay.tsx # Formatted ETH/USD balance
│   └── ui/                   # ShadCN generated components live here
│
└── lib/
    ├── utils.ts              # ShadCN cn() utility + general helpers
    ├── constants.ts          # App-wide constants (chain IDs, default networks)
    └── format.ts             # Format addresses, amounts, gas prices

## Key implementation details

### Keyring / Security
- The mnemonic must NEVER be stored in plain text
- Encrypt the mnemonic with AES-GCM using a key derived from the user's password via PBKDF2 (Web Crypto API only, no external crypto libs)
- Store the encrypted keyring blob in IndexedDB via idb
- The Keyring class should have a locked/unlocked state — private keys are only in memory when unlocked
- On lock, clear all key material from memory

### viem clients
- Create a PublicClient per network (keyed by chainId)
- WalletClient is created on-demand from a privateKeyToAccount(privateKey) account
- Export a getPublicClient(chainId) factory that returns a cached client

### Networks
- Preconfigure: Ethereum mainnet, Polygon, Arbitrum One, Base, Sepolia (testnet)
- Each network entry should have: chainId, name, rpcUrl, nativeCurrency, blockExplorer
- networkStore should support adding custom RPC networks

### Routing
- If no keyring exists in IndexedDB → redirect to /onboarding
- If keyring exists but is locked → redirect to /unlock
- If unlocked → show dashboard at /

### ShadCN setup
- Initialize ShadCN with the "default" style and neutral base color
- Install these ShadCN components to start: Button, Input, Card, Badge, Dialog, Separator, Tooltip, Sonner (for toast notifications)

### React Query
- Set staleTime to 30 seconds for balance queries
- Set refetchInterval to 15 seconds for balance and gas price queries
- All queries should be keyed by [chainId, address] to avoid cross-account cache collisions

## Do NOT implement yet
- Solana or Bitcoin support (stubs only if needed for folder structure)
- NFT support
- Transaction history
- Hardware wallet support
- WalletConnect

## Deliverable
Scaffold the full project with all files above. Each file should have working, production-quality code — not just comments or todos. The app should run with `npm run dev` and the onboarding flow (create wallet → confirm seed → set password → dashboard) should be functional end to end.