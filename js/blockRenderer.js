function markdownBlock(text) {
	if (typeof marked !== "undefined" && marked.parse) {
		return marked.parse(text || "");
	}
	return text || "";
}

function embedVideo(provider, id) {
	if (provider === "youtube") {
		return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="video" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`;
	}
	return "";
}

const blockRenderers = {
	text: (b) => `<div class="work-text-block">${markdownBlock(b.content)}</div>`,
	image: (b) => `<figure class="work-figure"><img src="${b.src}" alt="${b.caption || ""}" loading="lazy"><figcaption>${b.caption || ""}</figcaption></figure>`,
	"image-pair": (b) => `<div class="img-pair">${(b.src || []).map((s) => `<img src="${s}" loading="lazy">`).join("")}</div><p class="img-pair-caption">${b.caption || ""}</p>`,
	video: (b) => embedVideo(b.provider, b.id),
	flowchart: (b) => `<figure class="work-figure"><img class="flowchart" src="${b.src}" alt="${b.caption || ""}" loading="lazy"><figcaption>${b.caption || ""}</figcaption></figure>`,
	row: (b, depth) => {
		if (depth > 0) {
			console.warn("row block nesting beyond 1 level is not supported; skipping");
			return "";
		}
		const cols = (b.columns || [])
			.map(
				(c) =>
					`<div class="col">${(c.blocks || []).map((child) => renderBlock(child, depth + 1)).join("")}</div>`,
			)
			.join("");
		const template = (b.columns || []).map((c) => `${c.ratio}fr`).join(" ");
		return `<div class="row" style="grid-template-columns:${template}">${cols}</div>`;
	},
	custom: (b) => customRenderers[b.render]?.(b) ?? `<p class="work-custom-note">${b.note || ""}</p>`,
};

const customRenderers = {};

function renderBlock(block, depth = 0) {
	const renderer = blockRenderers[block.type];
	return renderer ? renderer(block, depth) : "";
}

function renderWork(work) {
	return (work.blocks || []).map((b) => renderBlock(b, 0)).join("");
}
