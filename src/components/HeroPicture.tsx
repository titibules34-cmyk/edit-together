const cyberJusticeHeroImg = "/images/cyber-justice-hero.webp";
const mobileHeroImg = "/images/lady-justice-mobile.webp";

const DESKTOP_HERO = cyberJusticeHeroImg;

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
      <source media="(max-width: 639px)" srcSet={mobileHeroImg} />
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
