// Images for "Opis z obrazu": size limits, masking rectangles (patient data blacked out before
// anything leaves the computer) and encoding to JPEG for the AI.

export const MAX_IMAGES = 8;
export const MAX_PDF_BYTES = 15 * 1024 * 1024;
// Claude reads images up to about 1568 px on the long edge / 1.15 megapixels; larger ones are
// scaled down by the API anyway, so they are scaled here (smaller upload, same detail).
export const MAX_EDGE = 1568;
export const MAX_PIXELS = 1.15e6;

/** Target size for an image of w x h pixels (never enlarged). */
export function fitSize(w, h, maxEdge = MAX_EDGE, maxPixels = MAX_PIXELS) {
  if (!(w > 0 && h > 0)) return { w: 0, h: 0, scale: 0 };
  const scale = Math.min(1, maxEdge / Math.max(w, h), Math.sqrt(maxPixels / (w * h)));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)), scale };
}

/** Rectangle from two drag points, clipped to the image; null when too small to be deliberate. */
export function dragRect(x1, y1, x2, y2, w, h, min = 4) {
  const cl = (v, max) => Math.max(0, Math.min(max, v));
  const left = cl(Math.min(x1, x2), w);
  const top = cl(Math.min(y1, y2), h);
  const right = cl(Math.max(x1, x2), w);
  const bottom = cl(Math.max(y1, y2), h);
  if (right - left < min || bottom - top < min) return null;
  return { x: left, y: top, w: right - left, h: bottom - top };
}

export const scaleRect = (r, s) => ({ x: r.x * s, y: r.y * s, w: r.w * s, h: r.h * s });

/** What kind of file this is for the image list: 'image', 'pdf' or null (not supported). */
export function fileKind(file) {
  const type = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (/^image\/(png|jpe?g|webp|gif|bmp)$/.test(type) || /\.(png|jpe?g|webp|gif|bmp)$/.test(name)) return 'image';
  return null;
}

/** Draw the image with its masks onto a canvas (scaled by `scale`). */
export function drawMasked(ctx, source, masks, scale) {
  ctx.drawImage(source, 0, 0, Math.round(source.width * scale), Math.round(source.height * scale));
  ctx.fillStyle = '#000';
  for (const m of masks) {
    const r = scaleRect(m, scale);
    ctx.fillRect(Math.floor(r.x), Math.floor(r.y), Math.ceil(r.w) + 1, Math.ceil(r.h) + 1);
  }
}

/** Browser only: the image (with masks burnt in) as base64 JPEG for the AI. */
export function encodeImage(source, masks) {
  const { w, h, scale } = fitSize(source.width, source.height);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // transparent PNGs → white, not black
  ctx.fillRect(0, 0, w, h);
  drawMasked(ctx, source, masks, scale);
  return { type: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.92).split(',')[1] };
}

/** Browser only: a File → a decoded image (an ImageBitmap-like source with width / height). */
export async function loadImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    // a canvas copy, so the object URL can be released and masks are drawn on stable pixels
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Browser only: a File → base64 (for PDFs, sent as they are). */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
