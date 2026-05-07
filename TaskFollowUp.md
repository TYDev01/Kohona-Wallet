Add a wallet import feature to the existing EVM wallet app. This should feel 
native to the existing onboarding flow, not bolted on.

## New Routes to add under /onboarding

/onboarding/import                  # Entry point — choose import method
/onboarding/import/seed-phrase      # Import via mnemonic
/onboarding/import/private-key      # Import via private key
/onboarding/import/keystore         # Import via JSON keystore file

The existing /onboarding landing page should now present two clear paths:
"Create a new wallet" and "Import existing wallet"

## Import via Seed Phrase (highest priority)

- Textarea input for 12 or 24 word mnemonic
- Validate the mnemonic in real time using @scure/bip39's validateMnemonic
- Show a clear error if the mnemonic is invalid before allowing the user to proceed
- After validation, derive the first 5 accounts using BIP-44 path m/44'/60'/0'/0/{index}
  for index 0 through 4
- For each derived account, fetch its ETH balance using the currently selected
  network's PublicClient (use Promise.allSettled so a failed fetch doesn't block
  the others)
- Display the 5 accounts in a selectable list showing:
    - Account index (Account 1, Account 2, etc.)
    - Truncated address
    - ETH balance (show a skeleton loader while fetching)
- Allow the user to select one or more accounts to import (checkboxes)
- At least one account must be selected to proceed
- A "Load more" button derives and fetches the next 5 accounts (indices 5-9, etc.)
- After account selection, proceed to the shared SetPassword page
- On completion, store all selected accounts in the Keyring under their respective
  BIP-44 indices so more accounts can be derived later

## Import via Private Key

- Single input for a 0x-prefixed hex private key
- Validate format with a simple regex and viem's isHex check
- Derive the address client-side using viem's privateKeyToAccount and show it
  immediately below the input as confirmation the key is valid
- No account selection step — it's always a single account import
- Proceed directly to SetPassword
- In the Keyring, store this as an "imported" account (not HD-derived) — flag it
  differently so the UI can show an "Imported" badge on the account later

## Import via JSON Keystore File

- File upload input accepting .json files only
- Use @ethereumjs/wallet to decrypt the keystore with a password the user provides
- Show a clear error if the password is wrong
- On success, extract the private key and treat it the same as the private key
  import flow from this point forward
- Proceed to SetPassword

## Keyring changes

Add these methods to the existing Keyring class:

  importFromMnemonic(mnemonic: string, selectedIndices: number[], password: string)
  importFromPrivateKey(privateKey: Hex, password: string)
  importFromKeystore(keystoreJson: string, keystorePassword: string, encryptionPassword: string)

importFromMnemonic should store the full mnemonic (encrypted) plus the selected
indices so that more accounts can be derived later without re-importing.

Add a method deriveNextAccount() that derives the next unused BIP-44 index and
adds it to the in-memory account list — this is used by the "Add account" feature
in the dashboard later.

## walletStore changes

- accounts should be typed as:
    type Account = {
      address: Hex
      index?: number        # present for HD-derived accounts
      label: string         # "Account 1", "Account 2", or custom later
      imported: boolean     # true for private-key/keystore imports
    }
- Add a setActiveAccount(address: Hex) action

## UX details

- The account selection list during seed phrase import should feel like MetaMask's:
  clean rows, subtle hover states, checkbox on the left, address + balance on
  the right, "Imported" badge where relevant
- Show a loading state on the "Next" button while balances are being fetched
- If balance fetching fails for an account, show "Balance unavailable" rather
  than blocking the flow
- All new pages should reuse existing ShadCN components already installed

## Do NOT change

- The existing CreateWallet → ConfirmSeed → SetPassword flow
- The Keyring encryption scheme (AES-GCM + PBKDF2)
- The existing store structure beyond the Account type update above