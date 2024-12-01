document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const infoButton = document.getElementById('info-button');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.querySelector('.chat-output');
    const modal = document.getElementById('info-modal');
    const closeButton = document.querySelector('.close-button');

    // Funzione per estrarre il termine da cercare
    function extractSearchQuery(input) {
        const cleanInput = input.trim(); // Rimuoviamo spazi

        // Pattern per estrarre il termine
        const patterns = [
            /\bchi\b\s*(è|era|sono|siamo)\s+(.+)$/i,  // "Chi è <nome>" o "Chi era <nome>"
            /\bcos'\b\s*(è|è\s+la)\s+(.+)$/i,  // "Cos'è <nome>" o "Cos'è la <nome>"
            /\bcome\b\s*(si\s+chiama)\s+(.+)$/i,  // "Come si chiama <nome>"
        ];

        // Proviamo a fare il match con ogni pattern
        for (let pattern of patterns) {
            const match = cleanInput.match(pattern);
            if (match && match[2]) {
                console.log("Termine estratto:", match[2]);
                return match[2].trim(); // Restituisce il nome trovato
            }
        }

        // Se l'input è "Chi è" o simile, chiediamo di essere più specifici
        if (/^(chi è|cos'è|come si chiama)$/i.test(cleanInput)) {
            return null;
        }

        // Se l'input è un nome o termine, lo restituiamo direttamente
        console.log("Input trattato come termine generico:", cleanInput);
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

            console.log("Risultato trovato su Wikipedia:", pageContent.extract);
            return pageContent.extract;
        } catch (error) {
            console.error("Errore durante la ricerca:", error);
            return "Si è verificato un errore durante la ricerca su Wikipedia.";
        }
    }

    // Funzione per inviare il messaggio
    sendButton.addEventListener('click', async function () {
        const query = userInput.value.trim();

        if (query) {
            chatOutput.innerHTML += `<div class="user-message">${query}</div>`;

            // Estrai il termine di ricerca
            const searchQuery = extractSearchQuery(query);

            if (!searchQuery) {
                chatOutput.innerHTML += `<div class="bot-message">Per favore, specifica di chi o cosa stai parlando. Esempio: 'Chi è Albert Einstein?' o 'Cos'è la teoria della relatività?'</div>`;
            } else {
                chatOutput.innerHTML += `<div class="bot-message">Sto cercando su Wikipedia...</div>`;
                chatOutput.scrollTop = chatOutput.scrollHeight;

                // Cerca su Wikipedia
                const response = await searchWikipedia(searchQuery);

                chatOutput.innerHTML += `<div class="bot-message">${response}</div>`;
            }

            chatOutput.scrollTop = chatOutput.scrollHeight;
            userInput.value = ''; // Pulisci l'input
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
