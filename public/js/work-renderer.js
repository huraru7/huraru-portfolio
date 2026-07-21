function escapeHtml(s = "") {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ポストモーテム等、短文向けの簡易インライン装飾(太字・改行のみ)
function mdInline(s = "") {
	return escapeHtml(s)
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.+?)\*/g, "<em>$1</em>")
		.replace(/\n/g, "<br>");
}

// 本文チャンク用: 見出し・箇条書き等を含むフルMarkdown(marked.jsに委譲)
function mdBlock(s = "") {
	if (typeof marked !== "undefined" && marked.parse) {
		return marked.parse(s || "");
	}
	return `<p>${mdInline(s)}</p>`;
}

function videoEmbedSrc(provider, id) {
	if (!id) return "";
	return provider === "vimeo"
		? `https://player.vimeo.com/video/${id}`
		: `https://www.youtube.com/embed/${id}`;
}

const renderers = {
	markdown: (b) => `<div class="work-text">${mdBlock(b.content)}</div>`,

	image: (b) => `<figure class="work-image">
      <img src="${escapeHtml(b.src)}" loading="lazy">
      ${b.caption ? `<figcaption>${escapeHtml(b.caption)}</figcaption>` : ""}
    </figure>`,

	"image-pair": (b) => `<div class="work-image-pair">
      ${b.src.map((s) => `<img src="${escapeHtml(s)}" loading="lazy">`).join("")}
      ${b.caption ? `<div class="work-caption">${escapeHtml(b.caption)}</div>` : ""}
    </div>`,

	video: (b) => `<div class="work-video">
      <div class="work-video-frame">
        <iframe src="${videoEmbedSrc(b.provider, b.id)}" allowfullscreen loading="lazy"></iframe>
      </div>
      ${b.caption ? `<div class="work-caption">${escapeHtml(b.caption)}</div>` : ""}
    </div>`,

	flowchart: (b) => `<div class="work-flowchart">
      <img src="${escapeHtml(b.src)}" loading="lazy">
      ${b.caption ? `<div class="work-caption">${escapeHtml(b.caption)}</div>` : ""}
    </div>`,

	row: (b) => `<div class="work-row" style="grid-template-columns:${b.columns.map((c) => `${c.ratio}fr`).join(" ")}">
      ${b.columns.map((c) => `<div class="work-col">${c.blocks.map(renderBlock).join("")}</div>`).join("")}
    </div>`,

	custom: (b) =>
		customRenderers[b.render]
			? customRenderers[b.render](b)
			: `<div class="work-custom-fallback">${escapeHtml(b.note || "")}</div>`,
};

// 個別作品だけ特殊実装が要る場合はここに追加していく
const customRenderers = {
	postmortem: (b) => `<div class="work-postmortem">
      <h3 class="work-postmortem-title">ポストモーテム</h3>
      <div class="postmortem-step">
        <span class="work-block-label">公開後の反応</span>
        <p>${mdInline(b.reception || "")}</p>
      </div>
      <div class="postmortem-step">
        <span class="work-block-label">想定とのギャップ</span>
        <p>${mdInline(b.gap || "")}</p>
      </div>
      <div class="postmortem-step">
        <span class="work-block-label">今の設計思想からの振り返り</span>
        <p>${mdInline(b.reflection || "")}</p>
      </div>
    </div>`,
};

function renderBlock(b) {
	const fn = renderers[b.type];
	return fn ? fn(b) : "";
}

function renderWork(work) {
	return work.blocks.map(renderBlock).join("");
}
