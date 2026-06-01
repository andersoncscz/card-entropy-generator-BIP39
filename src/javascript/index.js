let entropy = "";

// The cards the user has entered, in the order their physically-shuffled deck
// presented them. This sequence is the entropy source — nothing is generated
// by the computer.
const selectedCards = [];

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
// user clicks cards (selectedCards). Shuffling the display just stops users from
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
    const count = selectedCards.length;
    const bits = Math.round(entropyBits(count));
    const progress =
        `<p>${count} / 52 cards entered &mdash; ~${bits} bits of entropy</p>` +
        (count < 52
            ? `<p class="text-hint">Enter your full shuffled deck (52 cards, ~225 bits) for maximum entropy.</p>`
            : ``);

    return document.getElementById('entropy-container').innerHTML =
        `${progress}
        <p class="linebreak-anywhere enthropy-value">
            ${entropy}
        </p>`;
}

function isUsed(card) {
    return selectedCards.includes(card);
}

function renderCards() {
    return document.getElementById('deck-container').innerHTML =
        `<div class="deck-grid">
            ${
                deck.map((card, index) => {
                    const used = isUsed(card);
                    const position = used ? selectedCards.indexOf(card) + 1 : null;
                    return (
                        `<div class="card-container">
                            <div class="card ${used ? "card--used" : ""}"
                                 ${used ? "" : `onclick="selectCard(${index})"`}>
                                <img src="${card.imageSource}" alt="${card.name}" />
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
    entropy = buildEntropy(selectedCards);
    renderEntropy();
    renderCards();
    syncBottomBarSpace();
}

function selectCard(index) {
    const card = deck[index];
    if (isUsed(card)) {
        return;
    }
    selectedCards.push(card);
    display();
}

function undoLast() {
    selectedCards.pop();
    display();
}

function reset() {
    selectedCards.length = 0;
    display();
}

// Reorder the displayed deck. Selected cards keep their sequence badge wherever
// they land; the entropy is unchanged.
function shuffleAndDisplay() {
    shuffleDeck();
    display();
}

function copyEntropyToClipboard() {
    if (!entropy) {
        alert("Enter at least one card before copying.");
        return;
    }
    navigator.clipboard.writeText(entropy)
        .then(() => alert("Entropy Copied to Clipboard"))
        .catch(() => alert("Could not copy to clipboard. Please copy the entropy manually."));
}
