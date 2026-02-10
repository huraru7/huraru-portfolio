// ========== 設定 ==========
const PROJECTS_PER_PAGE = 3; // 1ページあたりの表示数
let currentPage = 1;
let totalPages = 1;

marked.setOptions({
	breaks: true,
	gfm: true,
});

// ========== Markdownのメタデータを解析 ==========
function parseMarkdown(content) {
	// 改行コードを統一
	content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

	if (content.charCodeAt(0) === 0xfeff) {
		content = content.substring(1);
	}

	// メタデータ確認
	if (!content.startsWith("---")) {
		console.error("メタデータが---で始まっていません");
		return {
			metadata: {
				id: "unknown",
				title: "タイトルなし",
				subtitle: "",
				tags: "",
				summary: "",
			},
			content: content,
		};
	}

	// ---を検索
	content = content.substring(3).trim();

	const endIndex = content.indexOf("\n---");
	if (endIndex === -1) {
		console.error("---が閉じられていません");
		return {
			metadata: {
				id: "unknown",
				title: "タイトルなし",
				subtitle: "",
				tags: "",
				summary: "",
			},
			content: content,
		};
	}

	// メタデータ部分と本文を分離
	const metaText = content.substring(0, endIndex).trim();
	const markdownContent = content.substring(endIndex + 4).trim();

	// メタデータを解析
	const metadata = {};
	metaText.split("\n").forEach((line) => {
		line = line.trim();
		if (!line) return;

		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			const key = line.substring(0, colonIndex).trim();
			const value = line.substring(colonIndex + 1).trim();
			metadata[key] = value;
		}
	});

	console.log("解析されたメタデータ:", metadata);

	return { metadata, content: markdownContent };
}

// ========== プロジェクトカードを生成 ==========
function createProjectCard(metadata) {
	const tags = metadata.tags ? metadata.tags.split(",").map((tag) => tag.trim()) : [];

	const card = document.createElement("div");
	card.className = "project-card fade-in hidden"; // 最初は非表示
	card.onclick = () => openModal(metadata.id);

	// 画像/動画のHTML生成
	let mediaHTML = "";
	if (metadata.video) {
		mediaHTML = `
            <div class="project-media">
                <video
                    src="${metadata.video}"
                    poster="${metadata.image || ""}"
                    muted
                    loop
                    playsinline
                    onmouseenter="this.play()"
                    onmouseleave="this.pause(); this.currentTime=0;"
                >
                </video>
            </div>
        `;
	} else if (metadata.image) {
		mediaHTML = `
            <div class="project-media">
                <img src="${metadata.image}" alt="${metadata.title}">
            </div>
        `;
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

// ========== モーダルを生成 ==========
function createModal(metadata, htmlContent) {
	const modal = document.createElement("div");
	modal.className = "modal";
	modal.id = `modal-${metadata.id}`;
	modal.onclick = () => closeModal(metadata.id);

	console.log(`モーダル生成: ${metadata.id}`);

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

// ========== ページネーション ==========

// 指定ページを表示
function showPage(page) {
	const projectGrid = document.getElementById("projectGrid");
	if (!projectGrid) return;

	const cards = Array.from(projectGrid.querySelectorAll(".project-card"));

	// すべてのカードを非表示
	cards.forEach((card) => {
		card.classList.add("hidden");
		card.classList.remove("page-active");
	});

	// 現在のページのカードのみ表示
	const startIndex = (page - 1) * PROJECTS_PER_PAGE;
	const endIndex = startIndex + PROJECTS_PER_PAGE;

	cards.slice(startIndex, endIndex).forEach((card) => {
		card.classList.remove("hidden");
		card.classList.add("page-active");
	});

	// ページネーションUIを更新
	updatePaginationUI();

	// スクロールアニメーションを再設定
	applyScrollAnimation();

	// プロジェクトセクションへスムーズスクロール
	const projectsSection = document.getElementById("projects");
	if (projectsSection) {
		projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

// ページ切り替え
function goToPage(page) {
	if (page < 1 || page > totalPages) return;
	currentPage = page;
	showPage(currentPage);
}

// ページネーションUIを更新
function updatePaginationUI() {
	const pageInfo = document.getElementById("pageInfo");
	const prevBtn = document.getElementById("prevBtn");
	const nextBtn = document.getElementById("nextBtn");

	if (pageInfo) {
		pageInfo.textContent = `${currentPage} / ${totalPages}`;
	}

	if (prevBtn) {
		prevBtn.disabled = currentPage === 1;
	}

	if (nextBtn) {
		nextBtn.disabled = currentPage === totalPages;
	}
}

// ページネーションを初期化
function initPagination(totalProjects) {
	totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

	const paginationContainer = document.getElementById("paginationContainer");
	if (!paginationContainer) {
		console.error("paginationContainerが見つかりません");
		return;
	}

	if (totalProjects > PROJECTS_PER_PAGE) {
		// style指定とクラス両方で確実に表示
		paginationContainer.style.display = "flex";
		paginationContainer.classList.add("visible");

		const prevBtn = document.getElementById("prevBtn");
		const nextBtn = document.getElementById("nextBtn");

		if (prevBtn) {
			prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
		} else {
			console.error("prevBtnが見つかりません");
		}

		if (nextBtn) {
			nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
		} else {
			console.error("nextBtnが見つかりません");
		}
	}

	showPage(1);
}

// ========== スクロールアニメーション ==========
function applyScrollAnimation() {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
				}
			});
		},
		{
			threshold: 0.1,
			rootMargin: "0px 0px -100px 0px",
		},
	);

	document.querySelectorAll(".project-card.fade-in:not(.hidden)").forEach((el) => {
		observer.observe(el);
	});
}

// ========== プロジェクトファイルを自動取得 ==========
async function getProjectFiles() {
	try {
		const response = await fetch("projects/index.json");
		if (!response.ok) throw new Error("index.json not found");

		const data = await response.json();
		return data.projects.map((file) => `projects/${file}`);
	} catch (error) {
		console.error("index.jsonの読み込みに失敗:", error);
		// フォールバック（手動リスト）
		return ["projects/project1.md", "projects/project2.md", "projects/project3.md"];
	}
}

// ========== Markdownファイルを読み込み ==========
async function loadProjects() {
	const projectGrid = document.getElementById("projectGrid");
	const modalContainer = document.getElementById("modalContainer");

	if (!projectGrid || !modalContainer) {
		console.error("projectGrid または modalContainer が見つかりません");
		return;
	}

	// プロジェクトファイルのリストを取得
	const projectFiles = await getProjectFiles();

	for (const file of projectFiles) {
		try {
			console.log(`読み込み中: ${file}`);
			const response = await fetch(file);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const markdown = await response.text();
			const { metadata, content } = parseMarkdown(markdown);

			// メタデータの必須項目チェック
			if (!metadata.id || !metadata.title) {
				console.error(`${file}: id または title が見つかりません`, metadata);
				continue;
			}

			// MarkdownをHTMLに変換
			const htmlContent = marked.parse(content);

			// プロジェクトカードを追加
			const card = createProjectCard(metadata);
			projectGrid.appendChild(card);

			// モーダルを追加
			const modal = createModal(metadata, htmlContent);
			modalContainer.appendChild(modal);

			console.log(`${file} の読み込み成功`);
		} catch (error) {
			console.error(`Failed to load ${file}:`, error);
		}
	}

	// 読み込んだプロジェクトの総数を取得してページネーションを初期化
	const totalProjects = projectGrid.querySelectorAll(".project-card").length;

	if (totalProjects === 0) {
		projectGrid.innerHTML = `
			<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
				プロジェクトが見つかりませんでした。
			</p>
		`;
		return;
	}

	initPagination(totalProjects);
}

// ========== ロード ==========
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadProjects);
} else {
	loadProjects();
}
