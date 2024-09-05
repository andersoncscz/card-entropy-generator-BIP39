let entropy = "";
const deck = ["Hearts", "Diamonds", "Clubs", "Spades"].map(symbol => {
    return ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"].map(type => {
        const name = `${type} of ${symbol}`;
        const image = `${type.toLowerCase()}-of-${symbol.toLowerCase()}`
        const imageSource = `../src/images/${image}.png`;

        return {
            symbol,
            type,
            name,
            imageSource
        }
    })
})
.flat();

function shuffle(array) { 
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}; 

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

function renderEntropy() {
    return document.getElementById('entropy-container').innerHTML = 
        `<p class="linebreak-anywhere">
            ${entropy}
        </p>`;
}

function renderCards() {
    return document.getElementById('deck-container').innerHTML = 
        `<div class="deck-grid">
            ${
                deck.map(card => {
                    return (
                        `<div class="card-container">
                            <div class="card">
                                <img src="${card.imageSource}" alt="${card.name}" />
                            </div>
                            <span>${card.name}</span>
                        </div>`
                    )
                }).join("")
            }
        </div>`;
};

function shuffleAndDisplay() {
    shuffle(deck);
    entropy = buildEntropy(deck);
    renderEntropy();
    renderCards();
}

function copyEntropyToClipboard() {
    navigator.clipboard.writeText(entropy);
    alert("Entropy Copied to Clipboard");
}