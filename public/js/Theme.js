const LATITUDE = 35.6895;
const LONGITUDE = 139.6917;

function getAutoTheme() {
	const now = new Date();
	const sun = getSunHours(now, LATITUDE, LONGITUDE);
	return now.getHours() >= sun.sunriseHour && now.getHours() < sun.sunsetHour ? "day" : "night";
}

document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.getElementById("theme-toggle");
	if (!toggleButton) return;

	function applyTheme(mode) {
		document.documentElement.classList.toggle("night-theme", mode === "night");
		toggleButton.classList.toggle("night", mode === "night");
	}

	applyTheme(localStorage.getItem("theme") || getAutoTheme());

	toggleButton.addEventListener("click", () => {
		const current = localStorage.getItem("theme") || getAutoTheme();
		const next = current === "night" ? "day" : "night";
		applyTheme(next);
		localStorage.setItem("theme", next);
	});
});
