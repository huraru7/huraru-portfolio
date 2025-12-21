// プロジェクトのMarkdownList
const projectFiles = ["projects/project1.md"];

marked.setOptions({
	breaks: true,
	gfm: true,
});

// Markdownのメタデータを解析
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

// プロジェクトカードを生成
function createProjectCard(metadata) {
	const tags = metadata.tags ? metadata.tags.split(",").map((tag) => tag.trim()) : [];

	const card = document.createElement("div");
	card.className = "project-card fade-in";
	card.onclick = () => openModal(metadata.id);

	card.innerHTML = `
        <h3 class="project-title">${metadata.title}</h3>
        <p class="project-summary">
            ${metadata.summary}
        </p>
        <div class="project-tech">
            ${tags.map((tag) => `<span class="tech-tag">${tag}</span>`).join("")}
        </div>
        <p class="project-detail-link">詳細を見る →</p>
    `;

	return card;
}

// モーダルを生成
function createModal(metadata, htmlContent) {
	const modal = document.createElement("div");
	modal.className = "modal";
	modal.id = `modal-${metadata.id}`;
	modal.onclick = () => closeModal(metadata.id);

	console.log(`モーダル生成: ${metadata.id}`);
	console.log("HTMLコンテンツ:", htmlContent);

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

// Markdownファイルを読み込ん部分
async function loadProjects() {
	const projectGrid = document.getElementById("projectGrid");
	const modalContainer = document.getElementById("modalContainer");

	if (!projectGrid || !modalContainer) {
		console.error("projectGrid または modalContainer が見つかりません");
		return;
	}

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
			console.log("変換されたHTML:", htmlContent);

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

	// スクロールアニメーションを適用
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
		}
	);

	document.querySelectorAll(".project-card.fade-in").forEach((el) => {
		observer.observe(el);
	});
}

// ロード
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", loadProjects);
} else {
	loadProjects();
}
