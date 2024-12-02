document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const infoButton = document.getElementById('info-button');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.querySelector('.chat-output');
    const modal = document.getElementById('info-modal');
    const closeButton = document.querySelector('.close-button');
    const customLengthButton = document.getElementById('custom-length-button');
    const customLengthInput = document.getElementById('custom-length-input');

    let maxWords = 30; // Default summary length

    // Imposta la lunghezza massima dal pulsante personalizzato
    customLengthButton.addEventListener('click', () => {
        const customLength = customLengthInput.value.trim().toLowerCase();

        if (customLength === 'infinito' || customLength === 'infinity') {
            maxWords = Infinity; // Nessun limite
            chatOutput.innerHTML += `<div class="bot-message">Lunghezza del riassunto impostata a "infinito".</div>`;
        } else if (!isNaN(parseInt(customLength, 10)) && parseInt(customLength, 10) > 0) {
            maxWords = parseInt(customLength, 10); // Imposta il valore numerico
            chatOutput.innerHTML += `<div class="bot-message">Lunghezza del riassunto impostata a ${maxWords} parole.</div>`;
        } else {
            chatOutput.innerHTML += `<div class="bot-message">Errore: inserisci un numero valido o scrivi "infinito".</div>`;
        }

        customLengthInput.value = ''; // Pulisce l'input
        chatOutput.scrollTop = chatOutput.scrollHeight;
    });

    // Funzione per limitare il numero di parole
    function shortenTextByWords(text, maxWords) {
        if (maxWords === Infinity) return text; // Nessun limite
        const words = text.split(/\s+/);
        return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
    }

    // Funzione per estrarre il termine da cercare
    function extractSearchQuery(input) {
        const cleanInput = input.trim();
        const patterns = [
            /\bchi\b\s*(è|era|sono|siamo)\s+(.+)$/i,
            /\bcos'\b\s*(è|è\s+la)\s+(.+)$/i,
            /\bcome\b\s*(si\s+chiama)\s+(.+)$/i,
        ];

        for (let pattern of patterns) {
            const match = cleanInput.match(pattern);
            if (match && match[2]) {
                return match[2].trim();
            }
        }

        if (/^(chi è|cos'è|come si chiama)$/i.test(cleanInput)) {
            return null;
        }

        return cleanInput;
    }

    // Funzione per cercare su Wikipedia
    async function searchWikipedia(query) {
        if (!query) return "Non ho trovato un termine da cercare. Prova a essere più specifico.";
        try {
            const response = await fetch(
                `https://api.allorigins.win/get?url=${encodeURIComponent(`https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&titles=${query}&redirects=1`)}`
            );
            const data = await response.json();
            const page = JSON.parse(data.contents).query.pages;
            const pageId = Object.keys(page)[0];
            const pageContent = page[pageId];

            if (pageContent.missing) {
                return `Non ho trovato nulla su Wikipedia riguardo a "${query}".`;
            }

            return shortenTextByWords(pageContent.extract, maxWords);
        } catch (error) {
            return "Si è verificato un errore durante la ricerca su Wikipedia.";
        }
    }

    // Funzione per inviare il messaggio
    sendButton.addEventListener('click', async function () {
        const query = userInput.value.trim();

        if (query) {
            chatOutput.innerHTML += `<div class="user-message">${query}</div>`;

            const searchQuery = extractSearchQuery(query);

            if (!searchQuery) {
                chatOutput.innerHTML += `<div class="bot-message">Per favore, specifica di chi o cosa stai parlando. Esempio: 'Chi è Albert Einstein?' o 'Cos'è la teoria della relatività?'</div>`;
            } else {
                chatOutput.innerHTML += `<div class="bot-message">Sto cercando su Wikipedia...</div>`;
                chatOutput.scrollTop = chatOutput.scrollHeight;

                const response = await searchWikipedia(searchQuery);

                chatOutput.innerHTML += `<div class="bot-message">${response}</div>`;
            }

            chatOutput.scrollTop = chatOutput.scrollHeight;
            userInput.value = '';
        }
    });

    // Funzione per aprire il modal Info
    infoButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Funzione per chiudere il modal Info
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Chiudi il modal cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Consenti l'invio anche con il tasto Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
});
