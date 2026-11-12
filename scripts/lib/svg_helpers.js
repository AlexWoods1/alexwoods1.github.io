// scripts/lib/svg_helpers.js
// Minimalist, spacious, authentic technical vector primitives adhering strictly to the
// portfolio's paper/ink/spike aesthetic: ample whitespace, crisp hairlines, and authentic facts.

export const COMMON_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap');
  .font-brand { font-family: 'Familjen Grotesk', 'Avenir Next', 'Segoe UI', -apple-system, sans-serif; font-weight: 600; }
  .font-sans { font-family: 'Familjen Grotesk', 'Avenir Next', 'Segoe UI', -apple-system, sans-serif; }
  .font-mono { font-family: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace; }
`;

export function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Subtle technical grid pattern with low opacity to preserve ample breathing room
export function makeMinimalGrid(idPrefix) {
  return `
    <pattern id="${idPrefix}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20, 19, 17, 0.035)" stroke-width="1"/>
    </pattern>
  `;
}

// Clean, single-line outer border with understated neo-brutalist 3px solid drop shadow
export function makeMinimalFrame(width, height, margin = 20) {
  const fw = width - margin * 2;
  const fh = height - margin * 2;
  return `
    <!-- Subtle drop shadow -->
    <rect x="${margin + 3}" y="${margin + 3}" width="${fw}" height="${fh}" fill="#141311" rx="0" />
    <!-- Paper background frame -->
    <rect x="${margin}" y="${margin}" width="${fw}" height="${fh}" fill="#f3f0e8" stroke="#141311" stroke-width="1.75" rx="0" />
  `;
}

// Minimal header: sparse, understated, with kicker, title, and authentic subtitle
export function makeMinimalHeader(x, y, kicker, title, subtitle) {
  return `
    <g transform="translate(${x}, ${y})">
      <text x="0" y="0" class="font-mono" font-size="10.5" font-weight="500" fill="#b42318" letter-spacing="0.12em">${escapeXml(kicker)}</text>
      <text x="0" y="32" class="font-brand" font-size="22" font-weight="600" fill="#141311" letter-spacing="-0.02em">${escapeXml(title)}</text>
      ${subtitle ? `<text x="0" y="52" class="font-mono" font-size="9.5" fill="rgba(20, 19, 17, 0.6)">${escapeXml(subtitle)}</text>` : ''}
    </g>
  `;
}
