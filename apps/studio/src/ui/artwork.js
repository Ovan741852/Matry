(function attachArtwork(namespace) {
  function shotSvg(shot, size) {
    const [start, end] = namespace.palette[shot.imageSeed % namespace.palette.length];
    const title = escapeHtml(shot.title);
    const prompt = escapeHtml(shot.prompt.split("，")[0] || shot.prompt);
    const titleSize = size === "stage" ? 34 : size === "card" ? 18 : 14;
    const promptSize = size === "stage" ? 18 : 10;

    return `
      <svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
        <defs>
          <linearGradient id="g-${shot.id}-${shot.imageSeed}" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${start}" />
            <stop offset="100%" stop-color="${end}" />
          </linearGradient>
          <radialGradient id="spark-${shot.id}-${shot.imageSeed}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="rgba(255,255,255,.92)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="640" height="360" fill="url(#g-${shot.id}-${shot.imageSeed})" />
        <circle cx="320" cy="140" r="118" fill="url(#spark-${shot.id}-${shot.imageSeed})" opacity=".55" />
        <rect x="270" y="106" width="100" height="170" rx="24" fill="rgba(15,23,42,.62)" />
        <rect x="286" y="76" width="68" height="42" rx="10" fill="rgba(255,255,255,.28)" />
        <g fill="rgba(255,255,255,.7)">
          <circle cx="210" cy="92" r="7" />
          <circle cx="246" cy="62" r="5" />
          <circle cx="410" cy="82" r="8" />
          <circle cx="438" cy="128" r="4" />
          <circle cx="188" cy="152" r="4" />
          <circle cx="454" cy="198" r="6" />
        </g>
        <rect x="34" y="260" width="572" height="72" rx="12" fill="rgba(0,0,0,.42)" />
        <text x="58" y="293" fill="white" font-size="${titleSize}" font-weight="850" font-family="Inter, sans-serif">${title}</text>
        <text x="58" y="318" fill="rgba(255,255,255,.78)" font-size="${promptSize}" font-family="Inter, sans-serif">${prompt}</text>
      </svg>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  namespace.shotSvg = shotSvg;
  namespace.escapeHtml = escapeHtml;
})(window.MatryStudio = window.MatryStudio || {});
