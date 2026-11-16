// Copyright © 2026 Christopher Snow
export const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const icons = {
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14"/>',
  book: '<path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',
  layout:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M10 9v12"/>',
  guide: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  calculator:
    '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1m3 0h1m3 0h1M8 14h1m3 0h1m3 0h1M8 18h1m3 0h1m3 0h1"/>',
};
export const icon = (name) =>
  `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
export const resourceSummary = (label, name, description = "") =>
  `<summary>${icon(name)}<span class="resource-label">${label}${description ? `<span class="resource-description">${description}</span>` : ""}</span><span class="resource-chevron" aria-hidden="true"></span></summary>`;
