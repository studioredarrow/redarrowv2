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

  // Updated to handle object or string for backward compatibility
  function addCTA(cta) {
    if (!cta) return;
    
    const label = cta.label || "Explore";
    const route = cta.route || cta; // Handle generic string case

    const btn = document.createElement("button");
    btn.className = "btn primary chat-cta"; // Added chat-cta class for specific styling if needed
    btn.innerText = label;
    btn.onclick = () => (window.location.href = route);
    
    chatArea.appendChild(btn);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // New: Render Ad
  function addAd(ad) {
    if (!ad || !ad.image) return;

    const link = document.createElement("a");
    link.href = ad.route || "#";
    link.className = "chat-ad-link";

    const img = document.createElement("img");
    img.src = ad.image;
    img.className = "chat-ad-banner"; // Ensure css handles this width
    
    link.appendChild(img);
    chatArea.appendChild(link);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // New: Render Next Prompts
  function addNextPrompts(prompts) {
    if (!prompts || !prompts.length) return;

    const container = document.createElement("div");
    container.className = "chat-next-prompts";

    prompts.forEach(promptText => {
      const btn = document.createElement("button");
      btn.className = "chat-btn next-prompt-btn";
      btn.innerText = promptText;
      btn.onclick = () => handleQuestionClick(promptText); // Re-use handler logic
      container.appendChild(btn);
    });

    chatArea.appendChild(container);
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
     SHARED HANDLER
  -------------------------------- */
  async function handleQuestionClick(question, textResponse, memeResponse, ctaTo) {
      addMessage(question, "user");

      const thinkingBubble = await showThinkingBubble("answer_preparing");

      // PRISMIC RESPONSE (INSTANT)
      if (textResponse || memeResponse) {
        setTimeout(() => {
          thinkingBubble.remove();
          if (textResponse) addMessage(textResponse, "bot");
          if (memeResponse) addMeme(memeResponse);
          if (ctaTo) addCTA({ route: `/${ctaTo}`, label: "Explore" }); // Legacy adapter
        }, 2000);
        return;
      }

      // AI FALLBACK
      try {
        const data = await fetchAIResponse(question);
        thinkingBubble.remove();
        processAIResponse(data);
      } catch (e) {
        thinkingBubble.remove();
        addMessage("...silence...", "bot");
      }
  }

  function processAIResponse(data) {
      if (data.type === "text" || !data.type) {
           if (data.message || data.answer) addMessage(data.message || data.answer, "bot");
      }
      
      if (data.type === "meme" && data.meme) {
        addMeme(data.meme.image);
        if (data.meme.caption) addMessage(data.meme.caption, "bot");
      }

      // RENDER ORDER: CTA -> AD -> PROMPTS
      if (data.primaryCta) addCTA(data.primaryCta);
      if (data.ad) addAd(data.ad);
      if (data.nextPrompts) addNextPrompts(data.nextPrompts);
  }

  /* -------------------------------
     INPUT SUBMIT (AI ONLY) - Enter key + Send icon
  -------------------------------- */
  async function sendInputMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    addMessage(text, "user");

    const thinkingBubble = await showThinkingBubble("answer_preparing");

    try {
      const data = await fetchAIResponse(text);
      thinkingBubble.remove();
      processAIResponse(data);
    } catch (err) {
      thinkingBubble.remove();
      addMessage("...silence...", "bot");
    }
  }

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") sendInputMessage();
  });

  const sendIcon = document.querySelector(".chat-input .chat");
  if (sendIcon) {
    sendIcon.addEventListener("click", () => sendInputMessage());
    sendIcon.style.cursor = "pointer";
  }

  /* -------------------------------
     PRISMIC QUESTIONS
  -------------------------------- */
  document.querySelectorAll(".chat-btn").forEach((btn) => {
    // Exclude dynamically created ones if any exist linearly (though querySelectorAll matches snapshot)
    btn.addEventListener("click", () => {
       // logic moved to shared handler
       handleQuestionClick(
           btn.innerText.trim(), 
           btn.dataset.text, 
           btn.dataset.meme, 
           btn.dataset.cta
       );
    });
  });
});
