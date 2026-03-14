import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "img", "hr", "span", "div", "figure", "figcaption", "sup", "sub",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "target", "rel",
      "width", "height", "loading",
    ],
  });
}
