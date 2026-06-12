### Offline Card Entropy Generator

Turns a **physically shuffled deck of cards** into entropy you can use with the [Ian Coleman tool](https://iancoleman.io/bip39/) to create BIP39 mnemonic codes.

The randomness comes entirely from your real-world shuffle — this tool never generates randomness itself. You shuffle a standard 52-card deck by hand, then click each card in the exact order it appears in your deck. The app records that order and converts it to entropy in the `[A2-9TJQK][cdhs]` format the Ian Coleman tool accepts.

<img width="1440" height="762" alt="Screenshot 2026-06-12 at 20 37 56" src="https://github.com/user-attachments/assets/8b47a18c-c03f-49bc-9105-a4304f10b777" />

### How to use it?
- Shuffle a standard 52-card deck thoroughly by hand.
- Open the app ([online version](https://andersoncscz.github.io/card-entropy-generator-BIP39/src/index.html)).
- Click each card in the order it appears in your shuffled deck. Each card gets a sequence number and the entropy updates as you go. Use **Undo Last** or **Reset** to correct mistakes.
- Enter the full 52-card deck (~225 bits). A single deck can't exceed this, so reaching the 256-bit target needs a second, independent shuffle.
- Once the full deck is in, **physically reshuffle it** and click **Reshuffle & Continue**. Click roughly 6 more cards in their new order — the sequence numbers keep counting up (53, 54, …) and the entropy adds on top.
- At **256 bits (a 24-word BIP39 mnemonic)** the deck locks automatically and **Copy to Clipboard** unlocks. Paste the entropy into the Ian Coleman BIP39 tool's "Card" entropy field.

### How to use it offline?
- [Download](https://github.com/andersoncscz/card-entropy-generator-BIP39/tree/main) the project.
- Go to the `src` folder and open the `index.html` file.
- The app will open in your browser.

For real funds, do everything offline and make sure your shuffle is thorough. The responsibility of keeping your wallet safe is entirely yours.
