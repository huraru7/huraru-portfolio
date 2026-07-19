// works/[id].md (frontmatter + Markdown + :::ディレクティブ記法) パーサー
// ビルド不要。サイト側で fetch した本文をそのまま実行時にパースする。

function parseFrontmatter(raw) {
	let content = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

	if (content.charCodeAt(0) === 0xfeff) {
		content = content.substring(1);
	}

	if (!content.startsWith("---")) {
		return { meta: {}, body: content };
	}

	content = content.substring(3).trim();
	const endIndex = content.indexOf("\n---");
	if (endIndex === -1) {
		return { meta: {}, body: content };
	}

	const metaText = content.substring(0, endIndex).trim();
	const body = content.substring(endIndex + 4).trim();

	const meta = {};
	metaText.split("\n").forEach((line) => {
		line = line.trim();
		if (!line) return;
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			meta[line.substring(0, colonIndex).trim()] = line.substring(colonIndex + 1).trim();
		}
	});

	return { meta, body };
}

function splitParagraphs(lines) {
	const paragraphs = [];
	let buf = [];
	lines.forEach((line) => {
		if (line.trim() === "") {
			if (buf.length) paragraphs.push(buf);
			buf = [];
		} else {
			buf.push(line);
		}
	});
	if (buf.length) paragraphs.push(buf);
	return paragraphs;
}

function parseKeyValueLines(lines) {
	const obj = {};
	lines.forEach((line) => {
		const idx = line.indexOf(":");
		if (idx === -1) return;
		const key = line.slice(0, idx).trim();
		const value = line.slice(idx + 1).trim();
		obj[key] = value;
	});
	return obj;
}

function buildDirectiveBlock(type, bodyLines) {
	const kv = parseKeyValueLines(bodyLines);

	if (type === "image" || type === "flowchart") {
		return { type, src: kv.src || "", caption: kv.caption || "" };
	}
	if (type === "image-pair") {
		return { type, src: [kv.src1 || "", kv.src2 || ""], caption: kv.caption || "" };
	}
	if (type === "video") {
		return { type, provider: kv.provider || "youtube", id: kv.id || "", caption: kv.caption || "" };
	}
	if (type === "custom") {
		return { type: "custom", ...kv };
	}
	return { type: "custom", note: `[unknown directive] ${type}` };
}

// 本文(frontmatter除去後)を、連続するMarkdownチャンク({type:"markdown"})と
// :::type ... ::: ディレクティブブロックの配列にパースする。
// allowRow=false の場合、row directive はネスト不可のため custom フォールバックにする。
function parseBlockLines(lines, allowRow) {
	const blocks = [];
	let i = 0;
	let plainBuffer = [];

	function flushMarkdown(paraLines) {
		const paragraphs = splitParagraphs(paraLines);
		if (paragraphs.length === 0) return;
		blocks.push({ type: "markdown", content: paraLines.join("\n").trim() });
	}

	while (i < lines.length) {
		const line = lines[i];
		const fenceMatch = line.match(/^:::([\w-]+)(?:\s+(.*))?$/);

		if (fenceMatch) {
			flushMarkdown(plainBuffer);
			plainBuffer = [];

			const type = fenceMatch[1];
			const attrsRaw = fenceMatch[2] || "";
			const attrs = {};
			attrsRaw.replace(/(\w+)=(\S+)/g, (_, k, v) => {
				attrs[k] = v;
			});

			const body = [];
			i++;
			while (i < lines.length && lines[i].trim() !== ":::") {
				body.push(lines[i]);
				i++;
			}
			i++; // 閉じ ":::" の次へ

			if (type === "row" && allowRow) {
				const columns = [];
				let currentCol = null;
				let colBuffer = [];

				function flushCol() {
					if (currentCol) {
						currentCol.blocks = parseBlockLines(colBuffer, false);
						columns.push(currentCol);
					}
					colBuffer = [];
				}

				body.forEach((bl) => {
					const colMatch = bl.match(/^::col(?:\s+ratio=(\d+))?/);
					if (colMatch) {
						flushCol();
						currentCol = { ratio: colMatch[1] ? Number(colMatch[1]) : 1, blocks: [] };
					} else if (currentCol) {
						colBuffer.push(bl);
					}
				});
				flushCol();

				blocks.push({ type: "row", columns });
			} else if (type === "custom") {
				const block = buildDirectiveBlock("custom", body);
				if (attrs.render) block.render = attrs.render;
				blocks.push(block);
			} else if (type === "row") {
				// ネスト不可の row はフォールバック
				blocks.push({ type: "custom", note: "[row のネストは1階層までです]" });
			} else {
				blocks.push(buildDirectiveBlock(type, body));
			}
		} else {
			plainBuffer.push(line);
			i++;
		}
	}

	flushMarkdown(plainBuffer);
	return blocks;
}

function parseWorkMarkdown(raw) {
	const { meta, body } = parseFrontmatter(raw);
	const lines = body.split("\n");
	const blocks = parseBlockLines(lines, true);

	return {
		id: meta.id || "",
		title: meta.title || "",
		subtitle: meta.subtitle || "",
		tags: meta.tags
			? meta.tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: [],
		image: meta.image || "",
		summary: meta.summary || "",
		blocks,
	};
}
