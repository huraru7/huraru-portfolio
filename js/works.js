const worksData = [];
let activeTagFilter = "";

marked.setOptions({ breaks: true, gfm: true });

function createProjectCard(work) {
	const tags = work.tags || [];
	const card = document.createElement("div");
	card.className = "project-card fade-in hidden";
	card.onclick = () => openModal(work.id);

	let mediaHTML = "";
	if (work.video) {
		mediaHTML = `
            <div class="project-media">
                <video src="${work.video}" poster="${work.image || ""}"
                    muted loop playsinline
                    onmouseenter="this.play()"
                    onmouseleave="this.pause(); this.currentTime=0;">
                </video>
            </div>`;
	} else if (work.image) {
		mediaHTML = `
            <div class="project-media">
                <img src="${work.image}" alt="${work.title}">
            </div>`;
	}

	card.innerHTML = `
        ${mediaHTML}
        <h3 class="project-title">${work.title}</h3>
        <p class="project-summary">${work.summary || ""}</p>
        <div class="project-tech">
            ${tags.map((tag) => `<span class="tech-tag">${tag}</span>`).join("")}
        </div>
        <p class="project-detail-link">詳細を見る →</p>
    `;

	return card;
}

function createFeaturedCard(work) {
	const card = createProjectCard(work);
	card.classList.add("featured-work-card");
	if (work.philosophyLink) {
		const tag = document.createElement("p");
		tag.className = "work-philosophy-tag";
		tag.textContent = work.philosophyLink;
		card.insertBefore(tag, card.querySelector(".project-detail-link"));
	}
	return card;
}

function createProjectInfoHTML(work) {
	const fields = [
		{ key: "teamSize", label: "制作人数" },
		{ key: "period", label: "制作期間" },
		{ key: "startDate", label: "開始日" },
		{ key: "endDate", label: "終了日" },
	];

	const items = fields
		.filter((f) => work[f.key])
		.map(
			(f) => `
				<div class="project-info-item">
					<span class="project-info-label">${f.label}</span>
					<span class="project-info-value">${work[f.key]}</span>
				</div>`,
		)
		.join("");

	if (!items) return "";

	return `<div class="project-info-grid">${items}</div>`;
}

function createRoleIntentHTML(work) {
	let html = "";
	if (work.myRole) {
		html += `
			<div class="work-role-block">
				<span class="work-block-label">My role</span>
				<p>${work.myRole}</p>
			</div>`;
	}
	if (work.designIntent) {
		html += `
			<div class="work-intent-block">
				<span class="work-block-label">企画意図</span>
				<p>${work.designIntent}</p>
			</div>`;
	}
	if (work.metrics && work.metrics.length) {
		html += `
			<div class="work-metrics-grid">
				<span class="work-block-label">数字的根拠</span>
				${work.metrics
					.map(
						(m) => `
					<div class="project-info-item">
						<span class="project-info-label">${m.label}</span>
						<span class="project-info-value">${m.value}</span>
					</div>`,
					)
					.join("")}
			</div>`;
	}
	return html;
}

function createPostmortemHTML(work) {
	if (!work.postmortem) return "";
	const { reception, gap, reflection } = work.postmortem;
	return `
		<div class="work-postmortem">
			<h3 class="work-postmortem-title">ポストモーテム</h3>
			<div class="postmortem-step">
				<span class="work-block-label">公開後の反応</span>
				<p>${reception || ""}</p>
			</div>
			<div class="postmortem-step">
				<span class="work-block-label">想定とのギャップ</span>
				<p>${gap || ""}</p>
			</div>
			<div class="postmortem-step">
				<span class="work-block-label">今の設計思想からの振り返り</span>
				<p>${reflection || ""}</p>
			</div>
		</div>`;
}

function createModal(work) {
	const modal = document.createElement("div");
	modal.className = "modal";
	modal.id = `modal-${work.id}`;
	modal.onclick = () => closeModal(work.id);

	modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
                <button class="modal-close" onclick="closeModal('${work.id}')">×</button>
                <h2 class="modal-title">${work.title}</h2>
                <p class="modal-subtitle">${work.subtitle || ""}</p>
            </div>
            <div class="modal-body">
                ${createProjectInfoHTML(work)}
                ${createRoleIntentHTML(work)}
                ${renderWork(work)}
                ${createPostmortemHTML(work)}
            </div>
        </div>
    `;

	return modal;
}

function showAllCards(grid) {
	if (!grid) return;
	grid.querySelectorAll(".project-card").forEach((card) => {
		card.classList.remove("hidden");
		card.classList.add("page-active");
	});
	applyScrollAnimation();
}

function applyScrollAnimation() {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
				}
			});
		},
		{ threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
	);

	document.querySelectorAll(".project-card.fade-in:not(.hidden)").forEach((el) => {
		observer.observe(el);
	});
}

function parseNumericValue(str) {
	if (!str) return null;
	const match = str.match(/\d+(\.\d+)?/);
	return match ? parseFloat(match[0]) : null;
}

function getDateTimestamp(str) {
	if (!str) return null;
	const d = new Date(str);
	return isNaN(d.getTime()) ? null : d.getTime();
}

function getSortValue(work, field) {
	switch (field) {
		case "teamSize":
		case "period":
			return parseNumericValue(work[field]);
		case "startDate":
		case "endDate":
			return getDateTimestamp(work[field]);
		default:
			return null;
	}
}

function applySortAndRender(field, order) {
	const projectGrid = document.getElementById("projectGrid");
	if (!projectGrid) return;

	const sorted = [...worksData];
	if (field) {
		sorted.sort((a, b) => {
			const va = getSortValue(a.work, field);
			const vb = getSortValue(b.work, field);
			if (va === null && vb === null) return 0;
			if (va === null) return 1;
			if (vb === null) return -1;
			const diff = va - vb;
			return order === "desc" ? -diff : diff;
		});
	} else {
		sorted.sort((a, b) => a.originalIndex - b.originalIndex);
	}

	sorted.forEach((p) => projectGrid.appendChild(p.card));
	applyScrollAnimation();
}

function initSort() {
	const sortContainer = document.getElementById("sortContainer");
	const sortField = document.getElementById("sortField");
	const sortOrderBtn = document.getElementById("sortOrderBtn");
	if (!sortContainer || !sortField || !sortOrderBtn) return;

	sortContainer.style.display = "";

	sortField.addEventListener("change", () => {
		applySortAndRender(sortField.value, sortOrderBtn.dataset.order);
	});

	sortOrderBtn.addEventListener("click", () => {
		const newOrder = sortOrderBtn.dataset.order === "asc" ? "desc" : "asc";
		sortOrderBtn.dataset.order = newOrder;
		sortOrderBtn.textContent = newOrder === "asc" ? "↑ 昇順" : "↓ 降順";
		if (sortField.value) {
			applySortAndRender(sortField.value, newOrder);
		}
	});
}

function initTagFilter() {
	const tagFilter = document.getElementById("tagFilter");
	if (!tagFilter) return;

	tagFilter.addEventListener("click", (e) => {
		const chip = e.target.closest(".tag-chip");
		if (!chip) return;

		tagFilter.querySelectorAll(".tag-chip").forEach((c) => c.classList.remove("active"));
		chip.classList.add("active");
		activeTagFilter = chip.dataset.tag || "";

		worksData.forEach(({ work, card }) => {
			const matches = !activeTagFilter || (work.tags || []).includes(activeTagFilter);
			card.classList.toggle("filtered-out", !matches);
		});

		applyScrollAnimation();
	});
}

async function getWorkFiles() {
	try {
		const response = await fetch("works/index.json");
		if (!response.ok) throw new Error("index.json not found");
		const data = await response.json();
		return (data.works || []).map((file) => `works/${file}`);
	} catch {
		return [];
	}
}

async function loadWorks() {
	const projectGrid = document.getElementById("projectGrid");
	const featuredGrid = document.getElementById("featuredWorksGrid");
	const modalContainer = document.getElementById("modalContainer");
	if ((!projectGrid && !featuredGrid) || !modalContainer) return;

	const workFiles = await getWorkFiles();
	const featuredByRole = {};

	for (const file of workFiles) {
		try {
			const response = await fetch(file);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const work = await response.json();
			if (!work.id || !work.title) continue;

			modalContainer.appendChild(createModal(work));

			if (work.featured && work.featuredRole) {
				featuredByRole[work.featuredRole] = work;
			}

			if (projectGrid) {
				const card = createProjectCard(work);
				worksData.push({ work, card, originalIndex: worksData.length });
				projectGrid.appendChild(card);
			}
		} catch (error) {
			console.error(`Failed to load ${file}:`, error);
		}
	}

	if (featuredGrid) {
		["game", "published", "design"].forEach((role) => {
			const work = featuredByRole[role];
			if (work) featuredGrid.appendChild(createFeaturedCard(work));
		});
		showAllCards(featuredGrid);
	}

	if (!projectGrid) return;

	if (worksData.length === 0) {
		projectGrid.innerHTML = `
			<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
				作品が見つかりませんでした。
			</p>`;
		return;
	}

	showAllCards(projectGrid);
	initSort();
	initTagFilter();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadWorks);
} else {
	loadWorks();
}
