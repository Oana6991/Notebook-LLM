// ============================================================
// CONFIGURARE — completează aceste valori
// ============================================================
const NOTEBOOK_ID = "YOUR_NOTEBOOK_ID_HERE";
const API_ENDPOINT = "/api/chat"; // endpoint-ul tău backend
// ============================================================

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("userInput");
const suggestionsEl = document.getElementById("suggestions");

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

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "ai" ? "ai" : "user-av"}`;
  avatar.textContent = role === "ai" ? "AI" : "Tu";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

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

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // hide config notice after first message
  document.getElementById("configNotice").style.display = "none";
  suggestionsEl.style.display = "none";

  appendMessage("user", text);
  inputEl.value = "";
  inputEl.style.height = "auto";

  showTyping();

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notebook_id: NOTEBOOK_ID, question: text }),
    });

    hideTyping();

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    appendMessage("ai", data.answer || "Nu am primit un răspuns valid.");
  } catch (err) {
    hideTyping();
    appendMessage(
      "ai",
      "⚠️ Nu am putut obține un răspuns. Verifică configurarea API-ului sau încearcă din nou."
    );
    console.error(err);
  }
}
