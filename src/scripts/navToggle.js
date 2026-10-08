// 狭い幅で表示されるハンバーガーメニューの開閉制御
const toggle = document.getElementById("navToggle");
const sideNav = document.getElementById("sideNav");
const overlay = document.getElementById("navOverlay");
const mobileQuery = window.matchMedia("(max-width: 768px)");

function setOpen(isOpen) {
	sideNav.classList.toggle("is-open", isOpen);
	overlay.classList.toggle("is-open", isOpen);
	toggle.classList.toggle("is-open", isOpen);
	toggle.setAttribute("aria-expanded", String(isOpen));
	toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
	document.body.style.overflow = isOpen ? "hidden" : "";
}

toggle.addEventListener("click", () => setOpen(!sideNav.classList.contains("is-open")));
overlay.addEventListener("click", () => setOpen(false));
sideNav.addEventListener("click", (event) => {
	if (event.target.closest(".side-nav-menu a")) setOpen(false);
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") setOpen(false);
});
mobileQuery.addEventListener("change", (event) => {
	if (!event.matches) setOpen(false);
});
