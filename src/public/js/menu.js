const menuTrigger = document.querySelector(".menu-trigger");
const menuOverlay = document.querySelector(".menu-overlay");

menuTrigger?.addEventListener("click", () => {
  menuOverlay.classList.toggle("hidden");
});
