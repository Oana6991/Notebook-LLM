// ============================================================
// CONFIGURARE
// ============================================================
const NOTEBOOKS = [
  { id: "7f3f1d0d-8e82-47c1-946c-c1f32af61f75", label: "Upriserz" },
  { id: "193e048b-1796-430b-a6f6-ad725877eae4", label: "Avatar Client IMM" },
  { id: "2527f96c-18e9-4c7c-8309-3c2f8fc06d43", label: "IMM" },
  { id: "81d897a2-ba0f-45f2-854e-e62513885bbb", label: "GALSS" },
  { id: "c7fe1db8-bd81-47e1-bbf6-a649d6ff8220", label: "IMV" },
];
// "all" = caută în toate, array = caută în mai multe selectate
let selectedNotebooks = ["all"];
const API_ENDPOINT = "/api/chat";
// ============================================================

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("userInput");
const suggestionsEl = document.getElementById("suggestions");
const selectorEl = document.getElementById("notebookSelector");

// ── SELECTOR NOTEBOOK ───────────────────────────────────────
function buildSelector() {
  selectorEl.innerHTML = "";

  // Buton "Toate"
  const allBtn = document.createElement("button");
  allBtn.className = "nb-btn" + (selectedNotebooks.includes("all") ? " active" : "");
  allBtn.textContent = "🔍 Toate";
  allBtn.onclick = () => {
    selectedNotebooks = ["all"];
    updateSelectorUI();
  };
  selectorEl.appendChild(allBtn);

  NOTEBOOKS.forEach((nb) => {
    const btn = document.createElement("button");
    const isActive = selectedNotebooks.includes(nb.id);
    btn.className = "nb-btn" + (isActive ? " active" : "");
    btn.textContent = nb.label;
    btn.onclick = () => {
      if (selectedNotebooks.includes("all")) {
        selectedNotebooks = [nb.id];
      } else if (selectedNotebooks.includes(nb.id)) {
        selectedNotebooks = selectedNotebooks.filter(id => id !== nb.id);
        if (selectedNotebooks.length === 0) selectedNotebooks = ["all"];
      } else {
        selectedNotebooks = [...selectedNotebooks, nb.id];
      }
      updateSelectorUI();
    };
    selectorEl.appendChild(btn);
  });
}

function updateSelectorUI() {
  const btns = selectorEl.querySelectorAll(".nb-btn");
  btns[0].classList.toggle("active", selectedNotebooks.includes("all"));
  NOTEBOOKS.forEach((nb, i) => {
    btns[i + 1].classList.toggle("active", selectedNotebooks.includes(nb.id));
  });
}

buildSelector();

// ── HELPERS ─────────────────────────────────────────────────
function getActiveIds() {
  if (selectedNotebooks.includes("all")) return NOTEBOOKS.map(n => n.id);
  return selectedNotebooks;
}

function getActiveLabels() {
  if (selectedNotebooks.includes("all")) return "Toate notebook-urile";
  return selectedNotebooks.map(id => NOTEBOOKS.find(n => n.id === id)?.label).join(", ");
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 140) + "px";
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendSuggestion(btn) {
  inputEl.value = btn.textContent;
  suggestionsEl.style.display = "none";
  sendMessage();
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
    .replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(.+)$/, "<p>$1</p>");
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "ai" ? "ai" : "user-av"}`;
  avatar.textContent = role === "ai" ? "AI" : "Tu";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = role === "ai" ? renderMarkdown(text) : text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

function showTyping() {
  const msg = document.createElement("div");
  msg.className = "message ai typing";
  msg.id = "typing-indicator";
  const avatar = document.createElement("div");
  avatar.className = "avatar ai";
  avatar.textContent = "AI";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

// ── QUERY (unul sau mai multe notebook-uri) ─────────────────
async function queryNotebooks(question) {
  const ids = getActiveIds();
  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_ids: ids, question }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.answer || "Nu am primit un răspuns valid.";
}

// ── EXPORT CONVERSAȚIE PDF ──────────────────────────────────
function exportChat() {
  const meta = document.getElementById("printMeta");
  meta.textContent = `Surse: ${getActiveLabels()} · ${new Date().toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })}`;
  document.getElementById("printHeader").style.display = "block";
  window.print();
  document.getElementById("printHeader").style.display = "none";
}

// ── MODAL GENEREAZĂ MATERIAL ────────────────────────────────
function openGenerateModal() {
  document.getElementById("generateModal").classList.add("open");
  document.getElementById("generatePrompt").focus();
}

function closeGenerateModal() {
  document.getElementById("generateModal").classList.remove("open");
}

function setTemplate(text) {
  document.getElementById("generatePrompt").value = text;
}

async function generateMaterial() {
  const prompt = document.getElementById("generatePrompt").value.trim();
  if (!prompt) return;

  closeGenerateModal();
  suggestionsEl.style.display = "none";

  const fullPrompt = `Creează un material educațional complet și detaliat despre: ${prompt}.
Structurează răspunsul cu titlu, introducere, secțiuni clare cu subtitluri, puncte cheie și concluzii.
Folosește informațiile din knowledge base.`;

  appendMessage("user", `📄 Generează material: ${prompt}`);
  showTyping();

  try {
    const answer = await queryNotebooks(fullPrompt);
    hideTyping();
    appendMessage("ai", answer);
    setTimeout(() => exportChat(), 400);
  } catch (err) {
    hideTyping();
    appendMessage("ai", "⚠️ Nu am putut genera materialul. Încearcă din nou.");
    console.error(err);
  }

  document.getElementById("generatePrompt").value = "";
}

// ── TRIMITE MESAJ ───────────────────────────────────────────
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  suggestionsEl.style.display = "none";
  appendMessage("user", text);
  inputEl.value = "";
  inputEl.style.height = "auto";
  showTyping();

  try {
    const answer = await queryNotebooks(text);
    hideTyping();
    appendMessage("ai", answer);
  } catch (err) {
    hideTyping();
    appendMessage("ai", "⚠️ Nu am putut obține un răspuns. Verifică că serverul rulează și încearcă din nou.");
    console.error(err);
  }
}
