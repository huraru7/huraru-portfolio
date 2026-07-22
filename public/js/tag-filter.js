function setupTagFilter() {
	const filterBar = document.getElementById("tagFilter");
	const grid = document.getElementById("projectGrid");
	if (!filterBar || !grid) return;

	const TAGS = ["ゲーム", "二次創作", "企画書", "その他"];
	filterBar.innerHTML = ["すべて", ...TAGS]
		.map((t) => `<button class="tag-chip${t === "すべて" ? " active" : ""}" data-tag="${t === "すべて" ? "" : t}">${t}</button>`)
		.join("");

	const cards = Array.from(grid.querySelectorAll(".project-card"));

	filterBar.addEventListener("click", (e) => {
		const btn = e.target.closest(".tag-chip");
		if (!btn) return;

		filterBar.querySelectorAll(".tag-chip").forEach((c) => c.classList.remove("active"));
		btn.classList.add("active");
		const tag = btn.dataset.tag;

		cards.forEach((card) => {
			const tags = (card.dataset.tags || "").split(",");
			card.hidden = Boolean(tag) && !tags.includes(tag);
		});
	});
}

setupTagFilter();
