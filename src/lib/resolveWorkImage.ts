import type { ImageMetadata } from 'astro';

const assetImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{png,jpg,jpeg,webp}',
  { eager: true }
);

// works/*.md のfrontmatter・本文には "images/Asset/xxx.png" のような
// public/images/ 起点の文字列パスがそのまま残っている。src/assets/ に
// 移動済みの画像であれば最適化済みのImageMetadataを返し、そうでなければ
// (og-image.jpg等、対象外の画像やTODOの空値) nullを返して呼び出し側で
// 通常の<img>にフォールバックさせる。
export function resolveWorkImage(path: string | null | undefined): ImageMetadata | null {
  if (!path) return null;
  const normalized = path.replace(/^\/+/, '').replace(/^images\//, '');
  const match = assetImages[`/src/assets/${normalized}`];
  return match?.default ?? null;
}
