const PROJECTS_PER_PAGE = 3;
let currentPage = 1;
let totalPages = 1;

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

	const startIndex = (page - 1) * PROJECTS_PER_PAGE;
	const endIndex = startIndex + PROJECTS_PER_PAGE;

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

function initPagination(totalProjects) {
	totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

	const paginationContainer = document.getElementById("paginationContainer");
	if (!paginationContainer) return;

	if (totalProjects > PROJECTS_PER_PAGE) {
		paginationContainer.style.display = "flex";
		paginationContainer.classList.add("visible");

		const prevBtn = document.getElementById("prevBtn");
		const nextBtn = document.getElementById("nextBtn");

		if (prevBtn) prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
		if (nextBtn) nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
	}

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

async function getProjectFiles() {
	try {
		const response = await fetch("projects/index.json");
		if (!response.ok) throw new Error("index.json not found");
		const data = await response.json();
		return data.projects.map((file) => `projects/${file}`);
	} catch {
		return ["projects/project1.md", "projects/project2.md", "projects/project3.md"];
	}
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
			projectGrid.appendChild(createProjectCard(metadata));
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

	initPagination(totalProjects);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadProjects);
} else {
	loadProjects();
}
