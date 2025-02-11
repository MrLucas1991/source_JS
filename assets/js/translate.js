document.addEventListener("DOMContentLoaded", function () {
    const TRANSLATION_URL = "https://lukaszkopczyk.com/assets/json/translations.json"; 
    let translations = {};

    function translateText(text) {
        return translations[text] || text; // Jeśli tłumaczenie istnieje, zamień
    }

    function translateElement(element) {
        if (!translations || Object.keys(translations).length === 0) return;

        // Tłumaczenie atrybutów title, placeholder, alt, aria-label, value
        ["title", "placeholder", "alt", "aria-label", "value"].forEach(attr => {
            if (element.hasAttribute(attr)) {
                const attrValue = element.getAttribute(attr).trim();
                element.setAttribute(attr, translateText(attrValue));
            }
        });

        // Tłumaczenie tekstu wewnątrz elementów
        element.childNodes.forEach(node => {
            if (node.nodeType === 3) { // Tylko węzły tekstowe
                let trimmedText = node.nodeValue.trim();
                if (translations[trimmedText]) {
                    node.nodeValue = translations[trimmedText];
                }
            }
        });
    }

    function applyTranslations() {
        document.querySelectorAll("*").forEach(translateElement);
    }

    function fetchTranslations() {
        console.log("📥 Pobieranie tłumaczeń z:", TRANSLATION_URL);

        fetch(TRANSLATION_URL)
            .then(response => {
                if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
                return response.json();
            })
            .then(data => {
                translations = data;
                console.log("✅ Załadowane tłumaczenia:", translations);
                applyTranslations();
            })
            .catch(error => console.error("❌ Błąd ładowania tłumaczeń:", error));
    }

    function observeChanges() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Sprawdzamy tylko elementy HTML
                        translateElement(node);
                        node.querySelectorAll("*").forEach(translateElement);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function detectGhostPortal() {
        const ghostObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains("gh-portal-content")) {
                        console.log("📢 Wykryto Ghost Portal – tłumaczenie aktywne!");
                        setTimeout(() => {
                            applyTranslations();
                            node.querySelectorAll("*").forEach(translateElement);
                        }, 500); 
                    }
                });
            });
        });

        ghostObserver.observe(document.body, { childList: true, subtree: true });
    }

    fetchTranslations();
    observeChanges();
    detectGhostPortal();
});
