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

    // Aspettiamo due frame di rendering prima dello snapshot: senza questa pausa
    // html2canvas può catturare il layout un istante prima che il browser abbia
    // finito di ricalcolare posizioni/altezze dopo aver nascosto i controlli,
    // causando testo leggermente sfasato rispetto al resto della scheda.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
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
        });
    });
}

// ESPORTAZIONE PDF (testo vettoriale reale, non un'immagine incollata)
function exportPDF() {
    updateState();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const COLOR_INK = [42, 35, 23];
    const COLOR_INK_SOFT = [107, 95, 73];
    const COLOR_PAPER = [236, 227, 203];
    const COLOR_CARD = [247, 241, 225];
    const ACCENTS = [[176, 127, 36], [59, 105, 99]]; // ocra, verde salvia (alternati)

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentW = pageW - margin * 2;

    function paintBackground() {
        doc.setFillColor(...COLOR_PAPER);
        doc.rect(0, 0, pageW, pageH, 'F');
    }
    paintBackground();

    let y = margin;

    // --- HEADER: immagine (se presente) + titolo/sottotitolo ---
    let textX = margin;
    let textW = contentW;
    const imgBox = { w: 90, h: 112 };

    if (state.imageSrc) {
        try {
            const fmt = state.imageSrc.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(state.imageSrc, fmt, margin, y, imgBox.w, imgBox.h);
            textX = margin + imgBox.w + 16;
            textW = contentW - imgBox.w - 16;
        } catch (e) {
            console.warn('Immagine non incorporabile nel PDF (formato non supportato):', e);
        }
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLOR_INK);
    const titleLines = doc.splitTextToSize(state.title || 'Senza titolo', textW);
    doc.text(titleLines, textX, y + 22);
    const titleBlockH = titleLines.length * 26;

    let subBlockH = 0;
    if (state.subtitle) {
        doc.setFont('times', 'italic');
        doc.setFontSize(13);
        doc.setTextColor(...COLOR_INK_SOFT);
        const subLines = doc.splitTextToSize(state.subtitle, textW);
        doc.text(subLines, textX, y + 22 + titleBlockH + 2);
        subBlockH = subLines.length * 16;
    }

    const headerH = Math.max(imgBox.h, titleBlockH + subBlockH + 22) + 14;
    y += headerH;

    doc.setDrawColor(...COLOR_INK);
    doc.setLineWidth(1);
    doc.line(margin, y, pageW - margin, y);
    y += 22;

    // --- SEZIONI: griglia a 2 colonne ---
    const gap = 18;
    const colW = (contentW - gap) / 2;
    const pad = 12;
    const bodyFontSize = 10.5;
    const lineH = 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodyFontSize);

    // Pre-calcola righe e altezza di ogni sezione, per allineare correttamente le righe della griglia
    const measured = state.sections.map(sec => {
        const items = sec.items.map(it => doc.splitTextToSize(it.text || '', colW - pad * 2 - 12));
        const titleLines2 = doc.splitTextToSize(sec.title || 'Sezione', colW - pad * 2);
        const itemsH = items.reduce((sum, lines) => sum + lines.length * lineH + 6, 0);
        const h = pad * 2 + titleLines2.length * 16 + 8 + itemsH;
        return { items, titleLines: titleLines2, h };
    });

    function ensureSpace(h) {
        if (y + h > pageH - margin) {
            doc.addPage();
            paintBackground();
            y = margin;
        }
    }

    function drawSectionBox(m, x, yy, w, index) {
        const accent = ACCENTS[index % 2];

        doc.setDrawColor(...COLOR_INK);
        doc.setLineWidth(1);
        doc.setFillColor(...COLOR_CARD);
        doc.rect(x, yy, w, m.h, 'FD');

        let cy = yy + pad + 10;
        doc.setFillColor(...accent);
        doc.rect(x + pad, cy - 8, 6, 6, 'F');

        doc.setFont('times', 'bold');
        doc.setFontSize(12.5);
        doc.setTextColor(...COLOR_INK);
        doc.text(m.titleLines, x + pad + 12, cy);
        cy += m.titleLines.length * 16 + 4;

        doc.setDrawColor(...COLOR_INK);
        doc.setLineWidth(0.6);
        doc.line(x + pad, cy - 10, x + w - pad, cy - 10);
        cy += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(...COLOR_INK);

        m.items.forEach(lines => {
            doc.setFillColor(...accent);
            doc.rect(x + pad, cy - 6, 4, 4, 'F');
            doc.text(lines, x + pad + 12, cy);
            cy += lines.length * lineH + 6;
        });
    }

    for (let i = 0; i < measured.length; i += 2) {
        const left = measured[i];
        const right = measured[i + 1];
        const rowH = Math.max(left.h, right ? right.h : 0);

        ensureSpace(rowH);

        drawSectionBox(left, margin, y, colW, i);
        if (right) drawSectionBox(right, margin + colW + gap, y, colW, i + 1);

        y += rowH + gap;
    }

    doc.save('Scheda_Studio.pdf');
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
