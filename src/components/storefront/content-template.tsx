import type { ReactNode } from "react";
import type { StorefrontTemplateContent } from "@/lib/storefront-template";

interface StorefrontContentTemplateProps {
  eyebrow?: string;
  title: string;
  summary?: string | null;
  bodyHtml?: string;
  content?: StorefrontTemplateContent;
  children?: ReactNode;
}

function isEmbeddableVideo(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
}

function toEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  return url;
}

function RenderMedia({
  mediaType,
  mediaUrl,
  mediaAlt,
  posterUrl,
}: {
  mediaType?: "image" | "video";
  mediaUrl?: string;
  mediaAlt?: string;
  posterUrl?: string;
}) {
  if (!mediaUrl) {
    return null;
  }

  if (mediaType === "video") {
    if (isEmbeddableVideo(mediaUrl)) {
      return (
        <div className="aspect-[16/10] overflow-hidden bg-stone-950">
          <iframe
            src={toEmbedUrl(mediaUrl)}
            title={mediaAlt || "embedded video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        src={mediaUrl}
        poster={posterUrl}
        controls
        playsInline
        className="aspect-[16/10] h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden bg-stone-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mediaUrl} alt={mediaAlt || "content media"} className="h-full w-full object-cover" />
    </div>
  );
}

export function StorefrontContentTemplate({
  eyebrow,
  title,
  summary,
  bodyHtml,
  content,
  children,
}: StorefrontContentTemplateProps) {
  const hero = content?.hero;
  const spotlight = content?.spotlight;
  const heroHeading = hero?.heading || title;
  const heroEyebrow = hero?.eyebrow || eyebrow;
  const heroBody = hero?.body || summary || undefined;

  return (
    <div className="storefront-page-narrow space-y-10">
      <section className="storefront-card overflow-hidden">
        <div className={`grid ${hero?.mediaUrl ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            {heroEyebrow ? <p className="storefront-eyebrow">{heroEyebrow}</p> : null}
            <h1 className="mt-4 storefront-heading">{heroHeading}</h1>
            {heroBody ? <p className="mt-5 max-w-2xl storefront-copy">{heroBody}</p> : null}
          </div>
          {hero?.mediaUrl ? (
            <RenderMedia
              mediaType={hero.mediaType}
              mediaUrl={hero.mediaUrl}
              mediaAlt={hero.mediaAlt}
              posterUrl={hero.posterUrl}
            />
          ) : null}
        </div>
      </section>

      {spotlight?.title || spotlight?.body || spotlight?.mediaUrl ? (
        <section className="storefront-card-soft grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {spotlight.mediaUrl ? (
            <RenderMedia
              mediaType={spotlight.mediaType}
              mediaUrl={spotlight.mediaUrl}
              mediaAlt={spotlight.mediaAlt}
            />
          ) : (
            <div className="storefront-gold-strip min-h-48" />
          )}
          <div>
            {spotlight.title ? <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#3f3a37]">{spotlight.title}</h2> : null}
            {spotlight.body ? <p className="mt-4 storefront-copy">{spotlight.body}</p> : null}
          </div>
        </section>
      ) : null}

      {children}

      {bodyHtml ? (
        <section className="storefront-card px-6 py-8 sm:px-10 sm:py-10">
          <div className="storefront-prose mx-auto max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </section>
      ) : null}
    </div>
  );
}