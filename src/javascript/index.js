let entropy = "";

// Target entropy. 256 bits = a 24-word BIP39 mnemonic. A single shuffled 52-card
// deck only holds log2(52!) ≈ 225.6 bits, so reaching 256 requires more than one
// independent shuffle (see `rounds` below).
const TARGET_BITS = 256;

// The cards the user has entered, grouped into rounds. Each round is one
// independent shuffle of the deck, recorded in click order; within a round a
// card can't repeat. A fresh shuffle is an independent randomness source, so the
// total entropy is the SUM of each round's entropy — that's what lets the user
// push past a single deck's ~225-bit ceiling toward TARGET_BITS.
const rounds = [[]];

// The round currently being filled.
function currentRound() {
    return rounds[rounds.length - 1];
}

// Every card entered so far, across all rounds, in order — the full entropy source.
function allSelectedCards() {
    return rounds.flat();
}

// Total entropy is additive across independent rounds.
function totalEntropyBits() {
    return rounds.reduce((bits, round) => bits + entropyBits(round.length), 0);
}

// Once the target is met the deck locks so no extra (unnecessary) cards are added.
function isFrozen() {
    return totalEntropyBits() >= TARGET_BITS;
}

// Reshuffling is only allowed after the whole deck has been entered in the
// current round (~225 bits). This forces each round to be a complete, committed
// shuffle and stops users from re-clicking a few cards to fake entropy.
function canReshuffle() {
    return !isFrozen() && currentRound().length === deck.length;
}

const deck = ["Hearts", "Diamonds", "Clubs", "Spades"].map(symbol => {
    return ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"].map(type => {
        const name = `${type} of ${symbol}`;
        const image = `${type.toLowerCase()}-of-${symbol.toLowerCase()}`
        const imageSource = `images/${image}.png`;

        return {
            symbol,
            type,
            name,
            imageSource
        }
    })
})
.flat();

// Cryptographically secure, unbiased integer in [0, maxExclusive).
// Rejection sampling discards the top of the uint32 range so the modulo is even.
function secureRandomInt(maxExclusive) {
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);
    let value;
    do {
        crypto.getRandomValues(buffer);
        value = buffer[0];
    } while (value >= limit);
    return value % maxExclusive;
}

// Reorders the on-screen deck only — a Fisher-Yates shuffle using the Web Crypto
// CSPRNG. This does NOT affect the entropy: the entropy comes from the order the
// user clicks cards (the rounds). Shuffling the display just stops users from
// always picking cards in the same static order. Using crypto (not Math.random)
// keeps the result secure even if a user simply shuffles and clicks in order.
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function buildFilteredEntropy(card) {
    const typeFirstCharValue = card.type.charAt(0).toLowerCase();
    const firstChar = typeFirstCharValue !== "1" ? typeFirstCharValue : "t"
    const lastChar = card.symbol.charAt(0).toLowerCase();
    const filteredEntropy = `${firstChar}${lastChar}`;

    return filteredEntropy;
}

function buildEntropy(cards) {
    return cards.map(card => buildFilteredEntropy(card)).join("");
};

// Bits of entropy from drawing `count` cards, in order and without repetition,
// from a 52-card deck: log2(52! / (52 - count)!) = sum of log2 over the range.
function entropyBits(count) {
    let bits = 0;
    for (let k = 52 - count + 1; k <= 52; k++) {
        bits += Math.log2(k);
    }
    return bits;
}

function renderEntropy() {
    const bits = Math.round(totalEntropyBits());
    const roundCount = currentRound().length;
    const totalCount = allSelectedCards().length;
    const pct = Math.min(100, Math.round((totalEntropyBits() / TARGET_BITS) * 100));

    let progress;
    if (isFrozen()) {
        progress =
            `<p>🔒 Locked &mdash; ~${bits} bits reached (256-bit / 24-word target) from ${totalCount} cards over ${rounds.length} shuffle(s).</p>` +
            `<p class="text-hint">The deck is frozen so you don't add unnecessary cards. Use Undo or Reset to change your entry.</p>`;
    } else {
        const roundNote = rounds.length > 1 ? `round ${rounds.length}, ` : ``;
        progress =
            `<p>${roundNote}${roundCount} / 52 cards this shuffle &mdash; ~${bits} / ${TARGET_BITS} bits (${pct}%)</p>` +
            (roundCount >= 52
                ? `<p class="text-hint">Full deck entered. To reach 256 bits, physically reshuffle and press &ldquo;Reshuffle &amp; Continue&rdquo; &mdash; about 6 more cards will do it.</p>`
                : `<p class="text-hint">Enter your full shuffled deck (52 cards, ~225 bits). Reshuffling unlocks once the whole deck is in.</p>`);
    }

    const bar =
        `<div class="entropy-progress${isFrozen() ? ' entropy-progress--full' : ''}">
            <div class="entropy-progress__fill" style="width: ${pct}%"></div>
        </div>`;

    return document.getElementById('entropy-container').innerHTML =
        `${bar}
        ${progress}
        <p class="linebreak-anywhere enthropy-value">${entropy}</p>`;
}

function isUsed(card) {
    return currentRound().includes(card);
}

function renderCards() {
    const round = currentRound();
    const frozen = isFrozen();
    // Badges count continuously across rounds, so the second round picks up where
    // the first left off (e.g. 53, 54, ...) rather than restarting at 1.
    const priorCards = allSelectedCards().length - round.length;
    return document.getElementById('deck-container').innerHTML =
        `<div class="deck-grid">
            ${
                deck.map((card, index) => {
                    const used = round.includes(card);
                    const position = used ? priorCards + round.indexOf(card) + 1 : null;
                    const clickable = !used && !frozen;
                    return (
                        `<div class="card-container">
                            <div class="card" ${clickable ? `onclick="selectCard(${index})"` : ""}>
                                <img class="${used || frozen ? "card-img--used" : ""}" src="${card.imageSource}" alt="${card.name}" />
                                ${used ? `<span class="card-badge">${position}</span>` : ``}
                            </div>
                            <span>${card.name}</span>
                        </div>`
                    )
                }).join("")
            }
        </div>`;
};

// The bottom bar is fixed, so it would overlap the end of the deck. Reserve its
// exact height as body padding so the last cards always clear it — the bar's
// height changes as the entropy text grows and as buttons wrap on small screens.
function syncBottomBarSpace() {
    const bar = document.querySelector('.bottom-bar');
    if (bar) {
        document.body.style.paddingBottom = `${bar.offsetHeight + 16}px`;
    }
}

window.addEventListener('resize', syncBottomBarSpace);

function display() {
    entropy = buildEntropy(allSelectedCards());
    renderEntropy();
    renderCards();
    syncControls();
    syncBottomBarSpace();
}

// Enable "Reshuffle & Continue" only once the current deck is fully entered, and
// "Copy to Clipboard" only once the 256-bit target is reached.
function syncControls() {
    const reshuffleButton = document.getElementById('reshuffle-button');
    if (reshuffleButton) {
        reshuffleButton.disabled = !canReshuffle();
    }
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.disabled = !isFrozen();
    }
}

function selectCard(index) {
    if (isFrozen()) {
        return;
    }
    const card = deck[index];
    if (isUsed(card)) {
        return;
    }
    currentRound().push(card);
    display();
}

function undoLast() {
    const round = currentRound();
    if (round.length > 0) {
        round.pop();
    } else if (rounds.length > 1) {
        // Current round is empty — step back into the previous round and undo there.
        rounds.pop();
        currentRound().pop();
    }
    display();
}

function reset() {
    rounds.splice(0, rounds.length, []);
    display();
}

// Reorder the displayed deck. Selected cards keep their sequence badge wherever
// they land; the entropy is unchanged.
function shuffleAndDisplay() {
    shuffleDeck();
    display();
}

// The user physically reshuffled their real deck — a new, independent randomness
// source. Bank the current round and open a fresh one whose entropy adds on top,
// then crypto-shuffle the on-screen deck so all 52 cards are selectable again.
function reshuffleAndContinue() {
    if (!canReshuffle()) {
        return;
    }
    rounds.push([]);
    shuffleDeck();
    display();
}

// Reorder the displayed deck. Selected cards keep their sequence badge wherever
// they land; the entropy is unchanged.
function shuffleAndDisplay() {
    shuffleDeck();
    display();
}

function copyEntropyToClipboard() {
    if (!isFrozen()) {
        alert(`Reach ${TARGET_BITS} bits of entropy before copying.`);
        return;
    }
    navigator.clipboard.writeText(entropy)
        .then(() => alert("Entropy Copied to Clipboard"))
        .catch(() => alert("Could not copy to clipboard. Please copy the entropy manually."));
}
