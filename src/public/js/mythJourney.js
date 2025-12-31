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

    addUserMessage(text);
  });

  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-message user";
    msg.textContent = text;

    chatArea.appendChild(msg);

    // Auto-scroll
    chatArea.scrollTop = chatArea.scrollHeight;
  }
});
