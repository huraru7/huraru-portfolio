function getProjectsPerPage() {
	const grid = document.getElementById("projectGrid");
	if (grid) {
		const cols = window.getComputedStyle(grid).gridTemplateColumns;
		if (cols && cols !== "none") {
			const count = cols.trim().split(/\s+/).length;
			if (count > 0) return count;
		}
	}
	const width = window.innerWidth;
	if (width <= 480) return 1;
	if (width <= 768) return 2;
	return 3;
}

let currentPage = 1;
let totalPages = 1;
const projectsData = [];

marked.setOptions({ breaks: true, gfm: true });

function parseMarkdown(content) {
	content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

	if (content.charCodeAt(0) === 0xfeff) {
		content = content.substring(1);
	}

	const fallback = {
		metadata: { id: "unknown", title: "タイトルなし", subtitle: "", tags: "", summary: "" },
		content: content,
	};

	if (!content.startsWith("---")) return fallback;

	content = content.substring(3).trim();
	const endIndex = content.indexOf("\n---");
	if (endIndex === -1) return fallback;

	const metaText = content.substring(0, endIndex).trim();
	const markdownContent = content.substring(endIndex + 4).trim();

	const metadata = {};
	metaText.split("\n").forEach((line) => {
		line = line.trim();
		if (!line) return;
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			metadata[line.substring(0, colonIndex).trim()] = line.substring(colonIndex + 1).trim();
		}
	});

	return { metadata, content: markdownContent };
}

function createProjectCard(metadata) {
	const tags = metadata.tags ? metadata.tags.split(",").map((tag) => tag.trim()) : [];
	const card = document.createElement("div");
	card.className = "project-card fade-in hidden";
	card.onclick = () => openModal(metadata.id);

	let mediaHTML = "";
	if (metadata.video) {
		mediaHTML = `
            <div class="project-media">
                <video src="${metadata.video}" poster="${metadata.image || ""}"
                    muted loop playsinline
                    onmouseenter="this.play()"
                    onmouseleave="this.pause(); this.currentTime=0;">
                </video>
            </div>`;
	} else if (metadata.image) {
		mediaHTML = `
            <div class="project-media">
                <img src="${metadata.image}" alt="${metadata.title}">
            </div>`;
	}

	card.innerHTML = `
        ${mediaHTML}
        <h3 class="project-title">${metadata.title}</h3>
        <p class="project-summary">${metadata.summary}</p>
        <div class="project-tech">
            ${tags.map((tag) => `<span class="tech-tag">${tag}</span>`).join("")}
        </div>
        <p class="project-detail-link">詳細を見る →</p>
    `;

	return card;
}

function createProjectInfoHTML(metadata) {
	const fields = [
		{ key: "teamSize", label: "制作人数" },
		{ key: "period", label: "制作期間" },
		{ key: "startDate", label: "開始日" },
		{ key: "endDate", label: "終了日" },
	];

	const items = fields
		.filter((f) => metadata[f.key])
		.map(
			(f) => `
			<div class="project-info-item">
				<span class="project-info-label">${f.label}</span>
				<span class="project-info-value">${metadata[f.key]}</span>
			</div>`,
		)
		.join("");

	if (!items) return "";

	return `<div class="project-info-grid">${items}</div>`;
}

function createModal(metadata, htmlContent) {
	const modal = document.createElement("div");
	modal.className = "modal";
	modal.id = `modal-${metadata.id}`;
	modal.onclick = () => closeModal(metadata.id);

	modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
                <button class="modal-close" onclick="closeModal('${metadata.id}')">×</button>
                <h2 class="modal-title">${metadata.title}</h2>
                <p class="modal-subtitle">${metadata.subtitle || ""}</p>
            </div>
            <div class="modal-body">
                ${createProjectInfoHTML(metadata)}
                ${htmlContent}
            </div>
        </div>
    `;

	return modal;
}

function showPage(page) {
	const projectGrid = document.getElementById("projectGrid");
	if (!projectGrid) return;

	const cards = Array.from(projectGrid.querySelectorAll(".project-card"));

	cards.forEach((card) => {
		card.classList.add("hidden");
		card.classList.remove("page-active");
	});

	const perPage = getProjectsPerPage();
	const startIndex = (page - 1) * perPage;
	const endIndex = startIndex + perPage;

	cards.slice(startIndex, endIndex).forEach((card) => {
		card.classList.remove("hidden");
		card.classList.add("page-active");
	});

	updatePaginationUI();
	applyScrollAnimation();

	const projectsSection = document.getElementById("projects");
	if (projectsSection) {
		projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

function goToPage(page) {
	if (page < 1 || page > totalPages) return;
	currentPage = page;
	showPage(currentPage);
}

function updatePaginationUI() {
	const pageInfo = document.getElementById("pageInfo");
	const prevBtn = document.getElementById("prevBtn");
	const nextBtn = document.getElementById("nextBtn");

	if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
	if (prevBtn) prevBtn.disabled = currentPage === 1;
	if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function refreshPagination() {
	const projectGrid = document.getElementById("projectGrid");
	if (!projectGrid) return;

	const totalProjects = projectGrid.querySelectorAll(".project-card").length;
	const perPage = getProjectsPerPage();
	totalPages = Math.ceil(totalProjects / perPage);

	const paginationContainer = document.getElementById("paginationContainer");
	if (!paginationContainer) return;

	if (totalProjects > perPage) {
		paginationContainer.style.display = "flex";
		paginationContainer.classList.add("visible");
	} else {
		paginationContainer.style.display = "none";
	}

	if (currentPage > totalPages) {
		currentPage = totalPages;
	}

	showPage(currentPage);
}

function initPagination(totalProjects) {
	const perPage = getProjectsPerPage();
	totalPages = Math.ceil(totalProjects / perPage);

	const paginationContainer = document.getElementById("paginationContainer");
	if (!paginationContainer) return;

	if (totalProjects > perPage) {
		paginationContainer.style.display = "flex";
		paginationContainer.classList.add("visible");

		const prevBtn = document.getElementById("prevBtn");
		const nextBtn = document.getElementById("nextBtn");

		if (prevBtn) prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
		if (nextBtn) nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
	}

	let resizeTimer;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(refreshPagination, 200);
	});

	showPage(1);
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

function getSortValue(metadata, field) {
	switch (field) {
		case "teamSize":
		case "period":
			return parseNumericValue(metadata[field]);
		case "startDate":
		case "endDate":
			return getDateTimestamp(metadata[field]);
		default:
			return null;
	}
}

function applySortAndRender(field, order) {
	const projectGrid = document.getElementById("projectGrid");
	if (!projectGrid) return;

	const sorted = [...projectsData];
	if (field) {
		sorted.sort((a, b) => {
			const va = getSortValue(a.metadata, field);
			const vb = getSortValue(b.metadata, field);
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
	currentPage = 1;
	refreshPagination();
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

async function getProjectFiles() {
	try {
		const response = await fetch("projects/index.json");
		if (!response.ok) throw new Error("index.json not found");
		const data = await response.json();
		const grid = document.getElementById("projectGrid");
		const isFeatured = grid && grid.dataset.featured === "true";
		const files = (isFeatured && data.featured) ? data.featured : data.projects;
		return files.map((file) => `projects/${file}`);
	} catch {
		return ["projects/project1.md", "projects/project2.md", "projects/project3.md"];
	}
}

function showAllFeatured() {
	document.querySelectorAll(".project-card").forEach((card) => {
		card.classList.remove("hidden");
		card.classList.add("page-active");
	});
	applyScrollAnimation();
}

async function loadProjects() {
	const projectGrid = document.getElementById("projectGrid");
	const modalContainer = document.getElementById("modalContainer");
	if (!projectGrid || !modalContainer) return;

	const projectFiles = await getProjectFiles();

	for (const file of projectFiles) {
		try {
			const response = await fetch(file);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const markdown = await response.text();
			const { metadata, content } = parseMarkdown(markdown);

			if (!metadata.id || !metadata.title) continue;

			const htmlContent = marked.parse(content);
			const card = createProjectCard(metadata);
			projectsData.push({ metadata, card, originalIndex: projectsData.length });
			projectGrid.appendChild(card);
			modalContainer.appendChild(createModal(metadata, htmlContent));
		} catch (error) {
			console.error(`Failed to load ${file}:`, error);
		}
	}

	const totalProjects = projectGrid.querySelectorAll(".project-card").length;

	if (totalProjects === 0) {
		projectGrid.innerHTML = `
			<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
				プロジェクトが見つかりませんでした。
			</p>`;
		return;
	}

	const isFeatured = projectGrid && projectGrid.dataset.featured === "true";
	if (isFeatured) {
		showAllFeatured();
	} else {
		initPagination(totalProjects);
		initSort();
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadProjects);
} else {
	loadProjects();
}
