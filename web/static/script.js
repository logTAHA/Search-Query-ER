async function analyzeText() {
    const text = document.getElementById("inputText").value;
    const analyzeBtn = document.getElementById("analyzeBtn");
    
    if (!text.trim()) {
        alert("text is blank");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("error").style.display = "none";

    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "در حال تحلیل...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        document.getElementById("loading").style.display = "none";

        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "تحلیل متن";

        if (data.error) {
            showError(data.error);
            return;
        }

        showResults(data);

    } catch (err) {
        document.getElementById("loading").style.display = "none";

        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "تحلیل متن";

        showError("can't connect to server");
    }
}

function showResults(data) {
    const resultsDiv = document.getElementById("results");
    const normalizedTextDiv = document.getElementById("normalizedText");
    const highlightedDiv = document.getElementById("highlightedText");
    const listDiv = document.getElementById("entitiesList");

    const normalizedText = data.normalized_text || data.text || "";
    const entities = Array.isArray(data.entities) ? data.entities : [];

    // نمایش متن نرمال‌شده
    normalizedTextDiv.innerText = normalizedText;

    // ساخت متن هایلایت‌شده از روی متن نرمال‌شده
    highlightedDiv.innerHTML = buildHighlightedText(normalizedText, entities);

    // ساخت لیست entity ها
    listDiv.innerHTML = "";

    if (entities.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-state";
        emptyDiv.innerText = "هیچ entity پیدا نشد.";
        listDiv.appendChild(emptyDiv);
    } else {
        entities.forEach(ent => {
            const div = document.createElement("div");
            div.className = "entity-item";

            const textSpan = document.createElement("span");
            textSpan.className = "entity-text";
            textSpan.innerText = ent.text;

            const labelSpan = document.createElement("span");
            labelSpan.className = "entity-label";
            labelSpan.innerText = ent.label;

            div.appendChild(textSpan);
            div.appendChild(labelSpan);

            listDiv.appendChild(div);
        });
    }

    resultsDiv.style.display = "block";
}

function buildHighlightedText(text, entities) {
    if (!entities || entities.length === 0) {
        return escapeHtml(text);
    }

    // مرتب‌سازی از ابتدا به انتها
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    let result = "";
    let cursor = 0;

    sortedEntities.forEach(ent => {
        const start = ent.start;
        const end = ent.end;

        // جلوگیری از offset خراب یا entity های هم‌پوشان
        if (
            typeof start !== "number" ||
            typeof end !== "number" ||
            start < cursor ||
            end > text.length ||
            start >= end
        ) {
            return;
        }

        // متن قبل از entity
        result += escapeHtml(text.slice(cursor, start));

        // خود entity
        const entityText = text.slice(start, end);
        const labelClass = getLabelClass(ent.label);

        result += `
            <span class="entity ${labelClass}" title="${escapeHtml(ent.label)}">
                ${escapeHtml(entityText)}
                <small>${escapeHtml(ent.label)}</small>
            </span>
        `;

        cursor = end;
    });

    // باقی متن بعد از آخرین entity
    result += escapeHtml(text.slice(cursor));

    return result;
}

function getLabelClass(label) {
    if (!label) return "misc";

    const cleanLabel = label.toLowerCase();

    const labelMap = {
        "person": "person",
        "per": "person",
        "location": "location",
        "loc": "location",
        "gpe": "location",
        "organization": "organization",
        "org": "organization",
        "date": "date",
        "time": "date",
        "misc": "misc"
    };

    return labelMap[cleanLabel] || "misc";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showError(msg) {
    const errorDiv = document.getElementById("error");
    errorDiv.innerText = msg;
    errorDiv.style.display = "block";
}
