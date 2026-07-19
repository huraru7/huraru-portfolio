if (typeof marked !== "undefined") {
	marked.setOptions({ breaks: true, gfm: true });
}

function escapeHtml(s = "") {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cardMedia(work) {
	if (!work.image) return "";
	return `<div class="project-media"><img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}"></div>`;
}

function cardExcerpt(work) {
	if (work.summary) return work.summary;
	const markdownBlock = work.blocks.find((b) => b.type === "markdown");
	const raw = (markdownBlock?.content ?? "").replace(/[#*_`>-]/g, "").replace(/\n/g, " ");
	return raw.slice(0, 60);
}

function renderCard(work) {
	const card = document.createElement("article");
	card.className = "work-card project-card fade-in hidden";
	card.dataset.id = work.id;
	card.dataset.tags = work.tags.join(",");
	card.innerHTML = `
		${cardMedia(work)}
		<h3 class="project-title">${escapeHtml(work.title)}</h3>
		<div class="work-card-tags project-tech">
			${work.tags.map((t) => `<span class="tag tech-tag">${escapeHtml(t)}</span>`).join("")}
		</div>
		<p class="work-card-excerpt project-summary">${escapeHtml(cardExcerpt(work))}</p>
		<p class="project-detail-link">詳細を見る →</p>
	`;
	card.addEventListener("click", () => openWorkModal(work));
	return card;
}

function renderCardList(works, container) {
	container.innerHTML = "";
	works.forEach((work) => container.appendChild(renderCard(work)));
	container.querySelectorAll(".project-card").forEach((card) => {
		card.classList.remove("hidden");
		card.classList.add("page-active");
	});
	applyScrollAnimation();
}

function applyScrollAnimation() {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) entry.target.classList.add("visible");
			});
		},
		{ threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
	);
	document.querySelectorAll(".project-card.fade-in:not(.hidden)").forEach((el) => observer.observe(el));
}

function setupTagFilter(works, container, filterBar) {
	const TAGS = ["ゲーム", "二次創作", "企画書", "その他"];
	filterBar.innerHTML = ["すべて", ...TAGS]
		.map((t) => `<button class="tag-chip${t === "すべて" ? " active" : ""}" data-tag="${t === "すべて" ? "" : t}">${t}</button>`)
		.join("");

	filterBar.addEventListener("click", (e) => {
		const btn = e.target.closest(".tag-chip");
		if (!btn) return;
		filterBar.querySelectorAll(".tag-chip").forEach((c) => c.classList.remove("active"));
		btn.classList.add("active");
		const tag = btn.dataset.tag;
		const filtered = !tag ? works : works.filter((w) => w.tags.includes(tag));
		renderCardList(filtered, container);
	});
}

function openWorkModal(work) {
	const modal = document.getElementById("work-modal");
	if (!modal) return;
	modal.querySelector(".p-title").textContent = work.title;
	modal.querySelector(".p-tags").innerHTML = work.tags
		.map((t) => `<span class="p-tag">${escapeHtml(t)}</span>`)
		.join("");
	modal.querySelector(".p-body").innerHTML = renderWork(work);
	modal.classList.add("is-open");
	document.body.style.overflow = "hidden";
}

function closeWorkModal() {
	const modal = document.getElementById("work-modal");
	if (!modal) return;
	modal.classList.remove("is-open");
	document.body.style.overflow = "";
}

function initWorkModal() {
	const modal = document.getElementById("work-modal");
	if (!modal) return;
	modal.addEventListener("click", (e) => {
		if (e.target === modal) closeWorkModal();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal.classList.contains("is-open")) closeWorkModal();
	});
}

async function getWorkIndex() {
	try {
		const response = await fetch("works/index.json");
		if (!response.ok) throw new Error("index.json not found");
		return await response.json();
	} catch {
		return { works: [], featured: [] };
	}
}

async function fetchWork(file) {
	const response = await fetch(`works/${file}`);
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const raw = await response.text();
	const work = parseWorkMarkdown(raw);
	work._file = file;
	return work;
}

async function loadWorks() {
	const featuredGrid = document.getElementById("featuredWorksGrid");
	const projectGrid = document.getElementById("projectGrid");
	if (!featuredGrid && !projectGrid) return;

	const index = await getWorkIndex();
	const allFiles = index.works || [];
	const featuredFiles = index.featured || [];

	const allWorks = [];
	for (const file of allFiles) {
		try {
			allWorks.push(await fetchWork(file));
		} catch (error) {
			console.error(`Failed to load works/${file}:`, error);
		}
	}

	if (featuredGrid) {
		const featured = featuredFiles
			.map((file) => allWorks.find((w) => w._file === file))
			.filter(Boolean);
		renderCardList(featured, featuredGrid);
	}

	if (projectGrid) {
		if (allWorks.length === 0) {
			projectGrid.innerHTML = `
				<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
					作品が見つかりませんでした。
				</p>`;
			return;
		}
		renderCardList(allWorks, projectGrid);
		const tagFilter = document.getElementById("tagFilter");
		if (tagFilter) setupTagFilter(allWorks, projectGrid, tagFilter);
	}
}

initWorkModal();

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadWorks);
} else {
	loadWorks();
}
