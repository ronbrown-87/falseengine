// Downscale any image source to a JPEG data URL (keeps uploads small for the server).
const IMAGE_LOAD_TIMEOUT_MS = 15_000;
const MAX_IMAGE_PIXELS = 80_000_000;

export function toJpegDataUrl(src: string, max = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const finish = (error?: Error, result?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      if (error) reject(error);
      else if (result) resolve(result);
      else reject(new Error("Could not process that image."));
    };
    const timer = setTimeout(() => {
      finish(new Error("Image loading timed out."));
      img.src = "";
    }, IMAGE_LOAD_TIMEOUT_MS);
    img.onload = () => {
      try {
        if (!img.width || !img.height || img.width * img.height > MAX_IMAGE_PIXELS) {
          finish(new Error("That image is too large to process."));
          return;
        }
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const context = c.getContext("2d");
        if (!context) {
          finish(new Error("Could not prepare that image."));
          return;
        }
        context.drawImage(img, 0, 0, c.width, c.height);
        finish(undefined, c.toDataURL("image/jpeg", quality));
      } catch {
        finish(new Error("Could not process that image."));
      }
    };
    img.onerror = () => finish(new Error("Could not read that image."));
    img.src = src;
  });
}
