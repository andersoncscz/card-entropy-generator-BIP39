### Offline Card Entropy Generator

Turns a **physically shuffled deck of cards** into entropy you can use with the [Ian Coleman tool](https://iancoleman.io/bip39/) to create BIP39 mnemonic codes.

The randomness comes entirely from your real-world shuffle — this tool never generates randomness itself. You shuffle a standard 52-card deck by hand, then click each card in the exact order it appears in your deck. The app records that order and converts it to entropy in the `[A2-9TJQK][cdhs]` format the Ian Coleman tool accepts.

### How to use it?
- Shuffle a standard 52-card deck thoroughly by hand.
- Open the app ([online version](https://andersoncscz.github.io/card-entropy-generator-BIP39/src/index.html)).
- Click each card in the order it appears in your shuffled deck. Each card gets a sequence number and the entropy updates as you go. Use **Undo Last** or **Reset** to correct mistakes.
- Enter the full deck for maximum entropy (~225 bits). Fewer cards yield proportionally less.
- Click **Copy to Clipboard** and paste the entropy into the Ian Coleman BIP39 tool's "Card" entropy field.

### How to use it offline?
- [Download](https://github.com/andersoncscz/card-entropy-generator-BIP39/tree/main) the project.
- Go to the `src` folder and open the `index.html` file.
- The app will open in your browser.

For real funds, do everything offline and make sure your shuffle is thorough. The responsibility of keeping your wallet safe is entirely yours.
