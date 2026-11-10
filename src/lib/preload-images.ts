import { useEffect } from "react";

/** Full-page world-map background on the About Us page. */
export const ABOUT_BACKGROUND_IMAGE = "/images/world-map-blue.webp";

/** Pictures fetched quietly once any page has finished loading, so the next page opens with them ready. */
const WARM_IMAGES = [ABOUT_BACKGROUND_IMAGE];

/** Downloads WARM_IMAGES into the browser cache after the current page is idle. */
export function useWarmImageCache() {
  useEffect(() => {
    const warm = () => {
      for (const src of WARM_IMAGES) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    if (document.readyState === "complete") {
      const id = window.setTimeout(warm, 300);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", warm, { once: true });
    return () => window.removeEventListener("load", warm);
  }, []);
}
