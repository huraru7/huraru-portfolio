const LATITUDE = 35.6895; // 東京
const LONGITUDE = 139.6917;

//link要素取得
const themeLink = document.getElementById("theme-style");
const themeSkill = document.getElementById("theme-skill");
const themeAbout = document.getElementById("theme-about");
const themeHero = document.getElementById("theme-hero");

//テーマ適用(テーマごとに動きなども変更予定なので、cssファイル自体を切り替え)
function applyTheme(mode) {
	if (mode === "day") {
		themeLink.href = "css/style.css";
		themeSkill.href = "css/skill.css";
		themeAbout.href = "css/about.css";
		themeHero.href = "css/hero.css";
	} else {
		themeLink.href = "css/style-night.css";
		themeSkill.href = "css/skill-night.css";
		themeAbout.href = "css/about-night.css";
		themeHero.href = "css/hero-night.css";
	}
}

//自動判定
function getAutoTheme() {
	const now = new Date();
	const nowHour = now.getHours();

	const sun = getSunHours(now, LATITUDE, LONGITUDE);

	return nowHour >= sun.sunriseHour && nowHour < sun.sunsetHour ? "day" : "night";
}

//初期化
function initTheme() {
	const saved = localStorage.getItem("theme");

	if (saved) {
		applyTheme(saved);
	} else {
		const autoTheme = getAutoTheme();
		applyTheme(autoTheme);
	}
}

//ボタン切り替え
function setupToggleButton() {
	const button = document.getElementById("theme-toggle");
	if (!button) return;

	button.addEventListener("click", () => {
		const current = localStorage.getItem("theme") || getAutoTheme();
		const next = current === "night" ? "day" : "night";

		applyTheme(next);
		localStorage.setItem("theme", next);
	});
}

//実行
document.addEventListener("DOMContentLoaded", () => {
	initTheme();
	setupToggleButton();
});
