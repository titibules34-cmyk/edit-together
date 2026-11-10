import cyberJusticeHeroImg from "@/assets/cyber-justice-hero.webp.asset.json";
import mobileHeroImg from "@/assets/lady-justice-mobile.webp.asset.json";

const DESKTOP_HERO = cyberJusticeHeroImg.url;

/** Lady Justice hero photo: a tall portrait crop on phones, the wide original on larger screens. */
export function HeroPicture({
  className,
  alt = "",
  priority = false,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    // `contents` keeps the <img> positioned against the hero section; data-reveal opts out of the scroll animation.
    <picture className="contents" data-reveal="skip">
      <source media="(max-width: 639px)" srcSet={mobileHeroImg.url} />
      <img
        src={DESKTOP_HERO}
        alt={alt}
        className={className}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
