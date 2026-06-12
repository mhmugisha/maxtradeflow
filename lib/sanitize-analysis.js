// Display-side defense for bot-published analysis text. Article bodies are
// HTML written by our own bot, but they pass through an LLM and have shipped
// with artifacts (```html fences) before — so everything rendered via
// dangerouslySetInnerHTML goes through sanitizeAnalysisHtml first. This is a
// deliberately small regex pass, not a full HTML parser: it only has to
// neutralize active content (scripts, event handlers), never to preserve
// adversarial markup.

/**
 * Strip LLM markdown artifacts: wrapping code fences (```html … ```),
 * stray heading markers at line starts, and excess blank lines. Bodies and
 * excerpts both pass through here before any rendering; the publish-time
 * fix lives bot-side.
 */
export function stripMarkdownArtifacts(text) {
  if (!text) return '';
  return text
    .replace(/^\s*```[a-z]*\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** True when the text contains HTML tags (vs plain text / markdown). */
export function looksLikeHtml(text) {
  return /<[a-z][^>]*>/i.test(text ?? '');
}

/** Strip script/style/iframe elements, on* handlers, and javascript: URLs. */
export function sanitizeAnalysisHtml(html) {
  if (!html) return '';
  return html
    .replace(/<(script|style|iframe)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?(script|style|iframe)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"]?)\s*javascript:[^'">\s]*\2/gi, '');
}
