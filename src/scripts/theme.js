document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.getElementById("theme-toggle");
	if (!toggleButton) return;

	// --theme-transition-speedと同じ値(ms)。CSS変数を変更した場合はここも合わせる
	const THEME_TRANSITION_MS = 800;

	function applyTheme(mode, { withTransition = true } = {}) {
		if (withTransition) {
			const root = document.documentElement;
			root.classList.add("theme-switching");
			window.setTimeout(() => {
				root.classList.remove("theme-switching");
			}, THEME_TRANSITION_MS);
		}
		document.documentElement.classList.toggle("night-theme", mode === "night");
		toggleButton.classList.toggle("night", mode === "night");
	}

	applyTheme(localStorage.getItem("theme") || "night", { withTransition: false });

	toggleButton.addEventListener("click", () => {
		const current = localStorage.getItem("theme") || "night";
		const next = current === "night" ? "day" : "night";
		applyTheme(next);
		localStorage.setItem("theme", next);
	});
});
