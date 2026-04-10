const LATITUDE = 35.6895;
const LONGITUDE = 139.6917;

function getAutoTheme() {
	const now = new Date();
	const sun = getSunHours(now, LATITUDE, LONGITUDE);
	return now.getHours() >= sun.sunriseHour && now.getHours() < sun.sunsetHour ? "day" : "night";
}

document.addEventListener("DOMContentLoaded", () => {
	const themeSwitch = document.getElementById("theme-switch");

	function applyTheme(mode) {
		document.documentElement.classList.toggle("night-theme", mode === "night");
		if (themeSwitch) {
			themeSwitch.checked = mode === "night";
		}
	}

	applyTheme(localStorage.getItem("theme") || getAutoTheme());

	if (themeSwitch) {
		themeSwitch.addEventListener("change", () => {
			const next = themeSwitch.checked ? "night" : "day";
			applyTheme(next);
			localStorage.setItem("theme", next);
		});
	}
});
