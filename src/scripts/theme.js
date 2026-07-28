document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.getElementById("theme-toggle");
	if (!toggleButton) return;

	function applyTheme(mode) {
		document.documentElement.classList.toggle("night-theme", mode === "night");
		toggleButton.classList.toggle("night", mode === "night");
	}

	applyTheme(localStorage.getItem("theme") || "night");

	toggleButton.addEventListener("click", () => {
		const current = localStorage.getItem("theme") || "night";
		const next = current === "night" ? "day" : "night";
		applyTheme(next);
		localStorage.setItem("theme", next);
	});
});
