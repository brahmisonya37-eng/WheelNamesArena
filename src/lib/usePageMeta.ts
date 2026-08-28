import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  jsonLd?: object | object[];
  /** Canonical URL for this page. */
  canonical?: string;
  /** Open Graph type, e.g. "website" or "article". */
  ogType?: string;
  /** Optional OG image. */
  ogImage?: string;
}

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string | undefined) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Set document title, meta description, canonical, OG tags and optional JSON-LD per page. */
export function usePageMeta({ title, description, jsonLd, canonical, ogType = "website", ogImage }: PageMeta) {
  useEffect(() => {
    document.title = title;
    upsertMeta("description", description);
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", ogType, "property");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);
    if (ogImage) {
      upsertMeta("og:image", ogImage, "property");
      upsertMeta("twitter:image", ogImage);
    }
  }, [title, description, ogType, ogImage]);

  useEffect(() => {
    upsertCanonical(canonical);
    if (canonical) upsertMeta("og:url", canonical, "property");
  }, [canonical]);

  useEffect(() => {
    const id = "page-jsonld";
    document.getElementById(id)?.remove();
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [jsonLd]);
}
