// STATO APPLICAZIONE (Inizia vuoto)
let state = {
    title: "",
    subtitle: "",
    imageSrc: "",
    sections: [
        { id: 1, title: "Titolo Sezione 1:", items: [{ id: 101, text: "Inserisci qui il tuo primo punto." }] },
        { id: 2, title: "Titolo Sezione 2:", items: [{ id: 201, text: "Inserisci qui il tuo primo punto." }] }
    ]
};

// NORMALIZZAZIONE DATI (Retrocompatibilità per vecchi file JSON)
function normalizeLoadedData(data) {
    let normalized = {
        title: data.title || data.mainTitle || "",
        subtitle: data.subtitle || "",
        imageSrc: data.imageSrc || "",
        sections: []
    };

    if (data.sections && Array.isArray(data.sections)) {
        normalized.sections = data.sections.map((sec, sIdx) => {
            let newItems = [];
            if (sec.items && Array.isArray(sec.items)) {
                newItems = sec.items.map((item, iIdx) => {
                    // Se il vecchio JSON aveva un array di stringhe, lo convertiamo in oggetti
                    if (typeof item === 'string') {
                        return { id: Date.now() + iIdx, text: item };
                    }
                    // Se è già un oggetto, lo teniamo
                    return item;
                });
            }
            return {
                id: sec.id || Date.now() + sIdx,
                title: sec.title || "",
                items: newItems
            };
        });
    }
    return normalized;
}

// RENDERING DELL'INTERFACCIA
function render() {
    // Aggiorna Header
    document.getElementById('main-title').innerText = state.title;
    document.getElementById('main-subtitle').innerText = state.subtitle;

    const imgEl = document.getElementById('main-image');
    const imgPh = document.getElementById('image-placeholder');
    const rmvBtn = document.getElementById('remove-image-btn');

    if (state.imageSrc) {
        imgEl.src = state.imageSrc;
        imgEl.classList.remove('hidden');
        imgPh.classList.add('hidden');
        rmvBtn.classList.remove('hidden');
    } else {
        imgEl.src = "";
        imgEl.classList.add('hidden');
        imgPh.classList.remove('hidden');
        rmvBtn.classList.add('hidden');
    }

    // Aggiorna Sezioni
    const grid = document.getElementById('sections-grid');
    grid.innerHTML = '';

    state.sections.forEach((sec, sIndex) => {
        let itemsHtml = '';
        const accent = sIndex % 2 === 0 ? 'var(--ochre)' : 'var(--teal)';

        sec.items.forEach((item, iIndex) => {
            itemsHtml += `
                <div class="group flex items-start gap-3 relative min-w-0 mb-3 pl-1">
                    <!-- Segno punto -->
                    <div class="w-2 h-2 mt-[7px] shrink-0" style="background:${accent}"></div>

                    <!-- Testo Editable -->
                    <div contenteditable="true" data-section-id="${sec.id}" data-item-id="${item.id}"
                         class="bullet-text outline-none flex-1 text-[14px] leading-[1.5] break-words min-w-0"
                         onblur="updateItemText(this)">${item.text}</div>

                    <!-- Controlli Hover (Nascosi nell'esportazione PNG) -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 absolute right-0 top-0 pl-2 no-export" style="background:var(--card);">
                        <button onclick="moveItem(${sec.id}, ${item.id}, -1)" class="icon-btn" title="Sposta Su"><i class="fa-solid fa-chevron-up"></i></button>
                        <button onclick="moveItem(${sec.id}, ${item.id}, 1)" class="icon-btn" title="Sposta Giù"><i class="fa-solid fa-chevron-down"></i></button>
                        <button onclick="deleteItem(${sec.id}, ${item.id})" class="icon-btn" style="color:var(--rust)" title="Elimina"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML += `
            <div class="p-6 card-container relative group/section" style="background:var(--card); border:1.5px solid var(--ink); box-shadow:4px 4px 0 rgba(42,35,23,0.3);">
                <!-- Intestazione Sezione -->
                <div class="flex items-center gap-2 mb-4 pb-2" style="border-bottom:1.5px solid var(--ink);">
                    <span class="w-2.5 h-2.5 shrink-0" style="background:${accent}"></span>
                    <div contenteditable="true" data-section-title-id="${sec.id}" class="font-display text-lg font-semibold outline-none break-words flex-1" onblur="updateSectionTitle(this)">${sec.title}</div>
                </div>

                <!-- Pulsante Elimina Sezione (Hover) -->
                <button onclick="deleteSection(${sec.id})" class="icon-btn absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity no-export" style="color:var(--rust)" title="Elimina Sezione">
                    <i class="fa-solid fa-trash"></i>
                </button>

                <!-- Lista Punti -->
                <div class="flex flex-col">
                    ${itemsHtml}
                </div>

                <!-- Aggiungi Punto (Visibile sempre, anche nel PNG come richiesto) -->
                <button onclick="addItem(${sec.id})" class="text-sm mt-2 font-semibold transition-colors flex items-center gap-1" style="color:${accent}">
                    <i class="fa-solid fa-plus"></i> Aggiungi punto
                </button>
            </div>
        `;
    });
}

// AGGIORNAMENTO STATO DAI CAMPI TESTUALI
function updateState() {
    state.title = document.getElementById('main-title').innerText;
    state.subtitle = document.getElementById('main-subtitle').innerText;
}

function updateSectionTitle(el) {
    const secId = parseInt(el.getAttribute('data-section-title-id'));
    const sec = state.sections.find(s => s.id === secId);
    if (sec) sec.title = el.innerText;
}

function updateItemText(el) {
    const secId = parseInt(el.getAttribute('data-section-id'));
    const itemId = parseInt(el.getAttribute('data-item-id'));
    const sec = state.sections.find(s => s.id === secId);
    if (sec) {
        const item = sec.items.find(i => i.id === itemId);
        if (item) item.text = el.innerText;
    }
}

// GESTIONE IMMAGINE
function uploadImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            state.imageSrc = e.target.result;
            render();
        }
        reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset input
}

function removeImage(event) {
    event.stopPropagation();
    state.imageSrc = "";
    render();
}

// AZIONI SUI PUNTI ELENCO E SEZIONI
function addSection() {
    state.sections.push({
        id: Date.now(),
        title: "Nuova Sezione:",
        items: [{ id: Date.now() + 1, text: "Nuovo punto..." }]
    });
    render();
}

function deleteSection(secId) {
    state.sections = state.sections.filter(s => s.id !== secId);
    render();
}

function addItem(secId) {
    const sec = state.sections.find(s => s.id === secId);
    if (sec) {
        sec.items.push({ id: Date.now(), text: "Nuovo punto..." });
        render();
    }
}

function deleteItem(secId, itemId) {
    const sec = state.sections.find(s => s.id === secId);
    if (sec) {
        sec.items = sec.items.filter(i => i.id !== itemId);
        render();
    }
}

function moveItem(secId, itemId, direction) {
    const sec = state.sections.find(s => s.id === secId);
    if (!sec) return;

    const index = sec.items.findIndex(i => i.id === itemId);
    if (index < 0) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sec.items.length) return; // Fuori dai limiti

    // Scambia gli elementi
    const temp = sec.items[index];
    sec.items[index] = sec.items[newIndex];
    sec.items[newIndex] = temp;

    render();
}

// JSON IMPORT / EXPORT
function saveJSON() {
    updateState(); // Assicura che i dati testuali in focus siano salvati
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Scheda_Studio_Visual_Note.json");
    dlAnchorElem.click();
}

function loadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            // Applica il filtro di retrocompatibilità
            state = normalizeLoadedData(parsedData);
            render();
        } catch (err) {
            alert("Errore nel caricamento del file JSON. Assicurati che sia il file corretto.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ESPORTAZIONE PNG
function exportPNG() {
    updateState();
    const captureArea = document.getElementById('capture-area');

    // Aggiungiamo la classe che nasconde gli elementi con .no-export
    document.body.classList.add('is-exporting');

    html2canvas(captureArea, {
        backgroundColor: "#ECE3CB", // Colore di sfondo base dell'area
        scale: 2, // Alta risoluzione
        useCORS: true,
        ignoreElements: (element) => element.classList.contains('no-export')
    }).then(canvas => {
        // Rimuoviamo la classe al termine dello screenshot
        document.body.classList.remove('is-exporting');

        const link = document.createElement('a');
        link.download = 'Scheda_Studio.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        document.body.classList.remove('is-exporting');
        console.error("Errore durante l'esportazione", err);
        alert("Si è verificato un errore durante l'esportazione dell'immagine.");
    });
}

// GESTIONE MODALE RESET
function openModal() { document.getElementById('confirm-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('confirm-modal').classList.add('hidden'); }
function resetApp() {
    state = {
        title: "",
        subtitle: "",
        imageSrc: "",
        sections: [
            { id: 1, title: "Titolo Sezione 1:", items: [{ id: 101, text: "Inserisci qui il tuo primo punto." }] },
            { id: 2, title: "Titolo Sezione 2:", items: [{ id: 201, text: "Inserisci qui il tuo primo punto." }] }
        ]
    };
    render();
    closeModal();
}

// AVVIO APPLICAZIONE
window.onload = () => {
    render();
};
