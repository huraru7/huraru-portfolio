const LATITUDE = 35.6895;
const LONGITUDE = 139.6917;

function getAutoTheme() {
	const now = new Date();
	const nowHour = now.getHours();
	const sun = getSunHours(now, LATITUDE, LONGITUDE);
	return nowHour >= sun.sunriseHour && nowHour < sun.sunsetHour ? "day" : "night";
}

// メイン処理
document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.getElementById("theme-toggle");

	if (!toggleButton) {
		console.warn("テーマ関連の要素が見つかりません");
		return;
	}

	function applyTheme(mode) {
		if (mode === "night") {
			document.documentElement.classList.add("night-theme");
		} else {
			document.documentElement.classList.remove("night-theme");
		}
		toggleButton.classList.toggle("night", mode === "night");
	}

	// 初期テーマの適用
	const savedTheme = localStorage.getItem("theme");
	applyTheme(savedTheme || getAutoTheme());

	// ボタンクリック時の処理
	toggleButton.addEventListener("click", () => {
		const current = localStorage.getItem("theme") || getAutoTheme();
		const next = current === "night" ? "day" : "night";

		// フェード処理不要、直接適用
		applyTheme(next);
		localStorage.setItem("theme", next);
	});
});
