document.addEventListener("DOMContentLoaded", () => {

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  const loader = document.getElementById("myth-loader");
  const mainContent = document.getElementById("myth-main");
  const chatArea = document.getElementById("chat-area");
  const input = document.querySelector(".chat-input input");

  /* -------------------------------
     PAGE LOAD LOADER (UNCHANGED)
  -------------------------------- */
  setTimeout(async () => {
    loader.style.display = "none";
    mainContent.classList.remove("hidden");

    const incomingQuestion = getQueryParam("q");

    if (incomingQuestion) {
      const decoded = decodeURIComponent(incomingQuestion);

      // Show user message
      addMessage(decoded, "user");

      // Thinking bubble
      const thinkingBubble = await showThinkingBubble("answer_preparing");

      // First try AI
      const data = await fetchAIResponse(decoded);

      thinkingBubble.remove();

      if (data.type === "text") addMessage(data.message, "bot");
      if (data.type === "meme" && data.meme) {
        addMeme(data.meme.image);
        if (data.meme.caption) addMessage(data.meme.caption, "bot");
      }      
      // ✅ CLEAN URL AFTER USING IT
    window.history.replaceState({}, document.title, "/myth-journey");
    }
  }, 1500);


  /* -------------------------------
     CHAT HELPERS
  -------------------------------- */
  function addMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `chat-message ${sender}`;
    msg.innerText = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
    return msg;
  }

  function addMeme(src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "chat-meme";
    chatArea.appendChild(img);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function addCTA(ctaTo) {
    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.innerText = "Explore";
    btn.onclick = () => (window.location.href = `/${ctaTo}`);
    chatArea.appendChild(btn);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  /* -------------------------------
     INLINE THINKING BUBBLE
  -------------------------------- */
  async function showThinkingBubble(context) {
    const res = await fetch(`/myth-journey/thinking/${context}`);
    const data = await res.json();

    const bubble = document.createElement("div");
    bubble.className = "chat-message bot thinking";

    const text = document.createElement("div");
    text.className = "thinking-text";
    text.innerHTML = data?.text || "Thinking 🤖...";
    bubble.appendChild(text);

     if (data?.image) {
      const img = document.createElement("img");
      img.src = data.image;
      img.className = "thinking-image";
      bubble.appendChild(img);
    }

    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;

    return bubble;
  }

  /* -------------------------------
     AI CALL
  -------------------------------- */
  async function fetchAIResponse(message) {
    const res = await fetch("/myth-journey/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    return res.json();
  }

  /* -------------------------------
     INPUT SUBMIT (AI ONLY)
  -------------------------------- */
  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const text = input.value.trim();
      input.value = "";

      addMessage(text, "user");

      const thinkingBubble = await showThinkingBubble("answer_preparing");

      const data = await fetchAIResponse(text);

      thinkingBubble.remove();

      if (data.type === "text") addMessage(data.message, "bot");
      if (data.type === "meme" && data.meme) {
        addMeme(data.meme.image);
        if (data.meme.caption) addMessage(data.meme.caption, "bot");
      }      
    }
  });

  /* -------------------------------
     PRISMIC QUESTIONS
  -------------------------------- */
  document.querySelectorAll(".chat-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const question = btn.innerText.trim();
      const textResponse = btn.dataset.text;
      const memeResponse = btn.dataset.meme;
      const ctaTo = btn.dataset.cta;

      addMessage(question, "user");

      const thinkingBubble = await showThinkingBubble("answer_preparing");

      // PRISMIC RESPONSE (INSTANT)
      if (textResponse || memeResponse) {
        setTimeout(() => {
          thinkingBubble.remove();

          if (textResponse) addMessage(textResponse, "bot");
          if (memeResponse) addMeme(memeResponse);
          if (ctaTo) addCTA(ctaTo);
        }, 2000);
        return;
      }

      // AI FALLBACK
      const data = await fetchAIResponse(question);

      thinkingBubble.remove();

      if (data.type === "text") addMessage(data.message, "bot");
      if (data.type === "meme" && data.meme) {
        addMeme(data.meme.image);
        if (data.meme.caption) addMessage(data.meme.caption, "bot");
      }      
      if (ctaTo) addCTA(ctaTo);
    });
  });
});
