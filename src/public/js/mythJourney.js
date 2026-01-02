document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("myth-loader");
  const mainContent = document.getElementById("myth-main");
  const chatArea = document.getElementById("chat-area");

  // Initial loader hide
  setTimeout(() => {
    loader.style.display = "none";
    mainContent.classList.remove("hidden");
  }, 1500);

  // Handle ALL button clicks (chat + CTA buttons)
  document.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const text = button.innerText.trim();
    if (!text) return;

    // addUserMessage(text);
  });

  // function addUserMessage(text) {
  //   const msg = document.createElement("div");
  //   msg.className = "chat-message user";
  //   msg.textContent = text;

  //   chatArea.appendChild(msg);

  //   // Auto-scroll
  //   chatArea.scrollTop = chatArea.scrollHeight;
  // }

  const input = document.querySelector(".chat-input input");
  const buttons = document.querySelectorAll(".chat-btn");

  function addMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `chat-message ${sender}`;
    msg.innerText = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  async function sendMessage(text) {
    addMessage(text, "user");

    const res = await fetch("/myth-journey/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    if (data.type === "text") {
      addMessage(data.message, "bot");
    }
    if (data.type === "meme") {
  const img = document.createElement("img");
  img.src = data.image;
  img.className = "chat-meme";
  chatArea.appendChild(img);

  if (data.caption) addMessage(data.caption, "bot");
}


    if (data.type === "cta") {
      addMessage(data.message, "bot");

      const btn = document.createElement("button");
      btn.className = "btn primary";
      btn.innerText = data.cta.label;
      btn.onclick = () => (window.location.href = data.cta.route);
      chatArea.appendChild(btn);
    }
  }

  // Input submit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      sendMessage(input.value.trim());
      input.value = "";
    }
  });

  // Quick buttons
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sendMessage(btn.innerText.trim());
    });
  });
});
