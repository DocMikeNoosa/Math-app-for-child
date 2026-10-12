/* Line icons in an SF Symbols-like style (24×24, round caps). UI.icon(name, size) returns a <span class="i"> with inline SVG. */
(function () {
  'use strict';
  const LA = window.LA;
  const P = {
    home: '<path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9v10.2c0 .7.5 1.3 1.2 1.3h3.6v-5.7h3.4v5.7h3.6c.7 0 1.2-.6 1.2-1.3V9"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    tray: '<path d="M4 13.5 6.3 5.6c.2-.6.7-1.1 1.4-1.1h8.6c.7 0 1.2.5 1.4 1.1L20 13.5"/><path d="M4 13.5v5c0 .8.7 1.5 1.5 1.5h13c.8 0 1.5-.7 1.5-1.5v-5h-4.5a3 3 0 0 1-6 0Z"/>',
    textformat: '<path d="M3.5 18 8 6l4.5 12"/><path d="M5.2 13.6h5.6"/><path d="M15 11.5c.6-.8 1.5-1.2 2.6-1.2 1.7 0 2.9 1 2.9 2.7V18"/><path d="M20.5 14.6c-3.6-.4-5.7.4-5.7 2 0 1 .8 1.6 2 1.6 1.9 0 3.7-1.3 3.7-3.6"/>',
    arrows: '<path d="M4 8h13.5"/><path d="m14 4.5 3.5 3.5-3.5 3.5"/><path d="M20 16H6.5"/><path d="M10 12.5 6.5 16l3.5 3.5"/>',
    question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    person2: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.8" cy="9.5" r="2.5"/><path d="M15.6 14.6c2.6-.3 4.4 1.3 4.9 4.4"/>',
    book: '<path d="M12 6.5c-1.8-1.4-4.2-2-7.5-2v13.8c3.3 0 5.7.6 7.5 2 1.8-1.4 4.2-2 7.5-2V4.5c-3.3 0-5.7.6-7.5 2Z"/><path d="M12 6.5v13.8"/>',
    pencil: '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4Z"/><path d="m13.5 6.5 4 4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.3 2.6 2.6 5-5.3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    repeat: '<path d="M4.5 11V9.5a3 3 0 0 1 3-3h11"/><path d="m15.5 3.5 3 3-3 3"/><path d="M19.5 13v1.5a3 3 0 0 1-3 3h-11"/><path d="m8.5 20.5-3-3 3-3"/>',
    doc: '<path d="M6.5 3.5h7l4 4v12c0 .6-.4 1-1 1h-10c-.6 0-1-.4-1-1v-15c0-.6.4-1 1-1Z"/><path d="M13.5 3.5v4h4"/><path d="M9 12.5h6M9 16h6"/>',
    star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.7-5 2.7.9-5.6-4-3.9 5.6-.8Z"/>',
    flame: '<path d="M12 21c3.6 0 6-2.4 6-5.8 0-3.6-2.7-5.6-3.7-9.2-1.6 1.2-2.4 2.9-2.3 4.8-1.2-.6-1.9-1.8-2-3.2C8 9.1 6 11.6 6 15.2 6 18.6 8.4 21 12 21Z"/>',
    sparkles: '<path d="M10 3.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z"/><path d="M17.5 14c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z"/>',
    speaker: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v2.5"/>',
    play: '<path d="M7.5 5.2v13.6c0 .6.6.9 1.1.6l10.6-6.8c.5-.3.5-.9 0-1.2L8.6 4.6c-.5-.3-1.1 0-1.1.6Z"/>',
    chevronR: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    chevronL: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    xmark: '<path d="m6 6 12 12M18 6 6 18"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6"/>',
    chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6.5" width="3" height="11" rx="1"/><rect x="15.5" y="13.5" width="3" height="4" rx="1"/>',
    cloud: '<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5a4.5 4.5 0 0 0 0 9Z"/>',
    cloudCheck: '<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5a4.5 4.5 0 0 0 0 9Z"/><path d="m9.5 13.8 1.8 1.8 3.4-3.6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    download: '<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
    upload: '<path d="M12 15.5v-11"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M5 19.5h14"/>',
    trash: '<path d="M4.5 6.5h15"/><path d="M9 6.5V4.8c0-.7.5-1.3 1.2-1.3h3.6c.7 0 1.2.6 1.2 1.3v1.7"/><path d="M6.5 6.5 7.4 19c.1.8.7 1.5 1.5 1.5h6.2c.8 0 1.4-.7 1.5-1.5l.9-12.5"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    bolt: '<path d="M13.5 3 5.5 13.5h6L10.5 21l8-10.5h-6Z"/>',
    flag: '<path d="M5.5 20.5v-16"/><path d="M5.5 4.5c4-2 7 2 13 0v9c-6 2-9-2-13 0"/>',
    graduation: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5Z"/><path d="M6.5 11v4.5c1.6 1.4 3.4 2 5.5 2s3.9-.6 5.5-2V11"/><path d="M21.5 9v5"/>',
    mappin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11.5V5a1.5 1.5 0 0 1 3 0v6.5"/><path d="M14 11.5V6.5a1.5 1.5 0 0 1 3 0V14c0 3.9-2.6 6.5-6 6.5-2.4 0-3.9-1-5.2-3L3.9 14.3a1.4 1.4 0 0 1 2.3-1.6L8 15"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 12.5h.01M18 12.5h.01M8.5 15h7"/>',
    // subject glyphs
    abc: '<path d="M3 18 7.5 6 12 18"/><path d="M4.7 13.6h5.6"/><circle cx="17.3" cy="14.6" r="3.4"/><path d="M20.7 11.2V18"/>',
    sum: '<path d="M17 5H7l5.5 7L7 19h10"/>',
    flask: '<path d="M9.5 3.5h5"/><path d="M10.5 3.5v5.6L5.2 18c-.6 1.1.2 2.5 1.5 2.5h10.6c1.3 0 2.1-1.4 1.5-2.5l-5.3-8.9V3.5"/><path d="M7.6 14.5h8.8"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z"/>',
    heart: '<path d="M12 19.5s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10Z"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.2-1.1-1.6-1.1-2.7 0-.9.7-1.6 1.6-1.6h2.2a4 4 0 0 0 4-4c0-3.9-3.8-7-8.5-7Z"/><circle cx="7.8" cy="11" r="1" fill="currentColor"/><circle cx="10.5" cy="7.3" r="1" fill="currentColor"/><circle cx="15" cy="7.8" r="1" fill="currentColor"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3"/>',
    leaf: '<path d="M5 19c0-8.5 5-13.5 14.5-14-.5 9.5-5.5 14.5-14 14Z"/><path d="M5 19c3-3.5 6-6 9.5-8"/>',
    columns: '<path d="m3.5 8.5 8.5-5 8.5 5"/><path d="M4.5 20.5h15"/><path d="M6.5 10.5v7.5M10 10.5v7.5M14 10.5v7.5M17.5 10.5v7.5"/>',
    castle: '<path d="M4.5 20.5V8.5h3v2h2v-2h5v2h2v-2h3v12"/><path d="M10 20.5v-4a2 2 0 0 1 4 0v4"/><path d="M3.5 20.5h17"/>',
    music: '<path d="M9 18V6l10.5-2.5v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/>',
    wrench: '<path d="M14.8 4a4.5 4.5 0 0 0-5 6L4.3 15.5a1.8 1.8 0 0 0 2.5 2.5l5.5-5.5a4.5 4.5 0 0 0 6-5l-2.8 2.8-2.4-.6-.6-2.4Z"/>',
  };
  LA.ICONS = P;
  const svg = (name, size) => `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.sparkles}</svg>`;
  LA.iconSVG = svg;
  LA.icon = (name, size) => { const s = document.createElement('span'); s.className = 'i'; s.innerHTML = svg(name, size); return s; };
  /* App-icon style tile: coloured rounded square with a white glyph */
  LA.appIcon = (glyph, color, size) => {
    const s = document.createElement('span');
    s.className = 'appicon';
    s.style.setProperty('--c', color || '#007aff');
    if (size) { s.style.width = s.style.height = size + 'px'; }
    s.innerHTML = svg(glyph, Math.round((size || 44) * 0.56));
    return s;
  };
})();
