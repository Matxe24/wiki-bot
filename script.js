document.addEventListener('DOMContentLoaded', () => {
    const chatOutput = document.getElementById('chat-output');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Funzione per aggiungere i messaggi alla chat
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${sender}: ${message}`;
        messageDiv.className = sender === 'ChatBot' ? 'bot-message' : 'user-message';
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll automatico
    }

    // Funzione per rimuovere i tag HTML dalla risposta
    function removeHTMLTags(text) {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.textContent || "";
    }

    // Funzione per rimuovere LaTeX e MathML
    function removeLaTeX(text) {
        let latexFree = text.replace(/\\displaystyle.*?}/g, ''); // Formula in LaTeX
        latexFree = latexFree.replace(/\\\[(.*?)\\\]/g, ''); // Formula in LaTeX tra \[ \]
        latexFree = latexFree.replace(/\\\(.*?\\\)/g, ''); // Formula in LaTeX tra \( \)
        latexFree = latexFree.replace(/<math.*?<\/math>/g, ''); // Rimuovi MathML
        return latexFree;
    }

    // Funzione per decodificare le entità HTML (ad esempio &lt; -> <)
    function decodeHTML(text) {
        const txt = document.createElement('textarea');
        txt.innerHTML = text;
        return txt.value;
    }

    // Funzione per limitare il numero di parole
    function shortenTextByWords(text, maxWords = 30) {
        // Dividi il testo in parole usando spazi come delimitatori
        const words = text.trim().split(/\s+/);
        if (words.length > maxWords) {
            // Se ci sono più parole di quelle consentite, tronca
            return words.slice(0, maxWords).join(' ') + '...';
        }
        return text; // Se il numero di parole è inferiore o uguale al limite, restituisci il testo intero
    }

    // Funzione per ottenere la risposta da Wikipedia utilizzando AllOrigins
    async function getWikipediaAnswer(query) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = 'https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=&titles=';

        try {
            // Fai la richiesta tramite AllOrigins per bypassare CORS
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl + query));
            const data = await response.json();

            // Estrai la pagina dalla risposta
            const pages = JSON.parse(data.contents).query.pages;
            const page = Object.values(pages)[0];

            if (page.missing) {
                return "Mi dispiace, non ho trovato informazioni su questa pagina.";
            }

            // Rimuovi i tag HTML, le formule LaTeX, MathML e decodifica le entità HTML dalla risposta
            let cleanText = removeHTMLTags(page.extract);
            cleanText = removeLaTeX(cleanText); // Rimuovi LaTeX
            cleanText = decodeHTML(cleanText); // Decodifica entità HTML

            // Limita la lunghezza del testo in base al numero di parole
            const shortText = shortenTextByWords(cleanText, 1000); // Limita a 30 parole

            return shortText;
        } catch (error) {
            console.error("Errore durante la richiesta:", error);
            return "Si è verificato un errore nella ricerca su Wikipedia.";
        }
    }

    // Gestisci l'invio del messaggio
    sendButton.addEventListener('click', async () => {
        const userMessage = userInput.value.trim();
        if (userMessage) {
            appendMessage('Tu', userMessage);
            userInput.value = ''; // Pulisci l'input
            const botResponse = await getWikipediaAnswer(userMessage);
            appendMessage('ChatBot', botResponse);
        }
    });

    // Consenti l'invio anche con il tasto Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendButton.click();
    });
});
