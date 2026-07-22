export type MarkdownBlock = { type: 'markdown'; content: string };
export type ImageBlock = { type: 'image' | 'flowchart'; src: string; caption: string };
export type ImagePairBlock = { type: 'image-pair'; src: [string, string]; caption: string };
export type VideoBlock = { type: 'video'; provider: string; id: string; caption: string };
export type ColumnBlock = { ratio: number; blocks: WorkBlock[] };
export type RowBlock = { type: 'row'; columns: ColumnBlock[] };
export type CustomBlock = { type: 'custom'; render?: string; note?: string; [key: string]: unknown };

export type WorkBlock =
  | MarkdownBlock
  | ImageBlock
  | ImagePairBlock
  | VideoBlock
  | RowBlock
  | CustomBlock;

function splitParagraphs(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  let buf: string[] = [];
  lines.forEach((line) => {
    if (line.trim() === '') {
      if (buf.length) paragraphs.push(buf);
      buf = [];
    } else {
      buf.push(line);
    }
  });
  if (buf.length) paragraphs.push(buf);
  return paragraphs;
}

function parseKeyValueLines(lines: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  lines.forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    obj[key] = value;
  });
  return obj;
}

function buildDirectiveBlock(type: string, bodyLines: string[]): WorkBlock {
  const kv = parseKeyValueLines(bodyLines);

  if (type === 'image' || type === 'flowchart') {
    return { type, src: kv.src || '', caption: kv.caption || '' };
  }
  if (type === 'image-pair') {
    return { type: 'image-pair', src: [kv.src1 || '', kv.src2 || ''], caption: kv.caption || '' };
  }
  if (type === 'video') {
    return { type: 'video', provider: kv.provider || 'youtube', id: kv.id || '', caption: kv.caption || '' };
  }
  if (type === 'custom') {
    return { type: 'custom', ...kv };
  }
  return { type: 'custom', note: `[unknown directive] ${type}` };
}

// 本文(frontmatter除去後)を、連続するMarkdownチャンク({type:"markdown"})と
// :::type ... ::: ディレクティブブロックの配列にパースする。
// allowRow=false の場合、row directive はネスト不可のため custom フォールバックにする。
export function parseBlockLines(lines: string[], allowRow: boolean): WorkBlock[] {
  const blocks: WorkBlock[] = [];
  let i = 0;
  let plainBuffer: string[] = [];

  function flushMarkdown(paraLines: string[]) {
    const paragraphs = splitParagraphs(paraLines);
    if (paragraphs.length === 0) return;
    blocks.push({ type: 'markdown', content: paraLines.join('\n').trim() });
  }

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^:::([\w-]+)(?:\s+(.*))?$/);

    if (fenceMatch) {
      flushMarkdown(plainBuffer);
      plainBuffer = [];

      const type = fenceMatch[1];
      const attrsRaw = fenceMatch[2] || '';
      const attrs: Record<string, string> = {};
      attrsRaw.replace(/(\w+)=(\S+)/g, (_, k, v) => {
        attrs[k] = v;
        return '';
      });

      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        body.push(lines[i]);
        i++;
      }
      i++; // 閉じ ":::" の次へ

      if (type === 'row' && allowRow) {
        const columns: ColumnBlock[] = [];
        let currentCol: ColumnBlock | null = null;
        let colBuffer: string[] = [];

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

        blocks.push({ type: 'row', columns });
      } else if (type === 'custom') {
        const block = buildDirectiveBlock('custom', body) as CustomBlock;
        if (attrs.render) block.render = attrs.render;
        blocks.push(block);
      } else if (type === 'row') {
        // ネスト不可の row はフォールバック
        blocks.push({ type: 'custom', note: '[row のネストは1階層までです]' });
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

export function parseWorkBlocks(body: string): WorkBlock[] {
  const lines = (body ?? '').split('\n');
  return parseBlockLines(lines, true);
}

export function getCardExcerpt(summary: string, blocks: WorkBlock[]): string {
  if (summary) return summary;
  const markdownBlock = blocks.find((b): b is MarkdownBlock => b.type === 'markdown');
  const raw = (markdownBlock?.content ?? '').replace(/[#*_`>-]/g, '').replace(/\n/g, ' ');
  return raw.slice(0, 60);
}
