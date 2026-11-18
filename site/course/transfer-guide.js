// Copyright © 2026 Christopher Snow

import { escape } from "./html.js";

// The guide is read-only reference prose. Its snippets never enter the lesson workspace.
export function transferGuideMarkup(guide) {
  const inline = (value) =>
    escape(value).replace(/`([^`]+)`/g, "<code>$1</code>");
  const paragraphs = (values) =>
    (values ?? []).map((value) => `<p>${inline(value)}</p>`).join("\n");
  return `<section class="transfer-guide" aria-label="${escape(guide.title)}">${guide.sections
    .map(
      (section) => `
    <section class="transfer-guide-section">
      <h2>${escape(section.heading)}</h2>
      ${paragraphs(section.prose)}
      ${section.table ? `<div class="transfer-table-scroll" tabindex="0" role="region" aria-label="${escape(section.heading)}"><table><thead><tr>${section.table.headings.map((label) => `<th scope="col">${escape(label)}</th>`).join("")}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell, index) => (index === 0 ? `<th scope="row">${inline(cell)}</th>` : `<td>${inline(cell)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
      ${section.snippets ? `<div class="transfer-listings">${section.snippets.map((snippet) => `<figure><figcaption>${escape(snippet.label)}</figcaption><pre tabindex="0"><code>${escape(snippet.source)}</code></pre></figure>`).join("")}</div>` : ""}
      ${paragraphs(section.after)}
      ${section.links ? `<ul>${section.links.map((link) => `<li><a href="${escape(link.href)}">${escape(link.label)}</a></li>`).join("")}</ul>` : ""}
    </section>`,
    )
    .join("")}</section>`;
}
