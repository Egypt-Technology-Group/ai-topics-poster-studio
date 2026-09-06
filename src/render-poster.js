// ---------- Render poster ----------
import {
  FONT_KEYS, FONTS, COLOR_VARS, POSTER_WIDTH, POSTER_MIN_HEIGHT,
  PAGE_SIZES, PAGE_TOP_PAD, PAGE_BOTTOM_PAD, CARD_GAP, MIN_CARD_SCALE,
  defaultFontScales,
} from './constants.js';
import { state } from './state.js';
import { esc, textDir, hexToRgb, hexToRgba } from './utils.js';
import { highlightCode, highlightCodeLines } from './highlighter.js';

export const FOOTER_SVG = `
    <svg viewBox="0 0 24 24" aria-label="Instagram"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
    <svg viewBox="0 0 24 24" aria-label="Facebook"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    <svg class="globe" viewBox="0 0 24 24" aria-label="Website"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z"/></svg>`;

function cornerStyle(p){
  const reset="left:auto;right:auto;top:auto;bottom:auto;";
  if(p.pos==="tl") return `position:absolute;${reset}left:${p.dx}px;top:${p.dy}px;`;
  if(p.pos==="tr") return `position:absolute;${reset}right:${p.dx}px;top:${p.dy}px;`;
  if(p.pos==="bl") return `position:absolute;${reset}left:${p.dx}px;bottom:${p.dy}px;`;
  if(p.pos==="br") return `position:absolute;${reset}right:${p.dx}px;bottom:${p.dy}px;`;
  return "";
}

// Compute shared poster CSS vars and logo styles from state
export function posterVars(s){
  const cssVars = COLOR_VARS.map(v=>`${v.k}:${s.colors[v.k]||''}`).join(';');
  const bg = s.bgHighlight || { enabled:true, color:'#61dafb', opacity:0.38, x:85, y:0, size:30 };
  let bgVars = bg.enabled !== false
    ? (()=>{ const rgb=hexToRgb(bg.color)||hexToRgb(s.colors['--red'])||hexToRgb('#61dafb'); return rgb ? `--bg-hl-r:${rgb.r};--bg-hl-g:${rgb.g};--bg-hl-b:${rgb.b};--bg-hl-opacity:${bg.opacity??0.38};--bg-hl-x:${bg.x??85}%;--bg-hl-y:${bg.y??0}%;--bg-hl-size:${bg.size??30}%;` : ''; })()
    : '--bg-hl-opacity:0;';
  const ul = s.userLogoPos || {pos:"auto-tl",size:210,dx:0,dy:0};
  const tl = s.techLogoPos || {pos:"tr",size:230,dx:45,dy:50};
  const userWrapStyle = ul.pos==="auto-tl"
    ? `width:${ul.size}px;transform:translate(${ul.dx||0}px,${ul.dy||0}px);`
    : cornerStyle(ul)+`width:${ul.size}px;`;
  const userWrapClass = ul.pos==="auto-tl" ? "brand" : "logo-abs";
  const h = s.logoHighlight || { enabled:true, color:'#61dafb', blur:25, opacity:0.35, x:0, y:0 };
  let techFilter = 'filter:none;';
  if(h.enabled !== false){
    const rgb = hexToRgb(h.color) || hexToRgb(s.colors['--red']) || hexToRgb('#61dafb');
    if(rgb) techFilter = `filter:drop-shadow(${(h.x||0)}px ${(h.y||0)}px ${(h.blur||25)}px rgba(${rgb.r},${rgb.g},${rgb.b},${h.opacity??0.35}));`;
  }
  const techStyle = cornerStyle(tl)+`width:${tl.size}px;height:${Math.round(tl.size*190/230)}px;${techFilter}`;
  const fs = s.fontScales || defaultFontScales();
  const fontScaleVars = FONT_KEYS.map(f=>`--fs-${f.k}:${fs[f.k]??1};`).join('');
  const fontFamily = FONTS.find(f=>f.key===s.fontFamily)?.family || 'Inter';
  const fontVar = `--poster-font:${fontFamily};`;
  return { cssVars, bgVars, userWrapStyle, userWrapClass, techStyle, fontScaleVars, fontVar, ul, tl };
}

// Resolve a card's effective span: 'auto' → 'half' for tip/warning/info/no-code cards, 'full' otherwise
export function resolveSpan(c){
  if(c.span==='full' || c.span==='half') return c.span;
  const ctype = c.type || 'code';
  if(ctype === 'tip' || ctype === 'warning' || ctype === 'info' || ctype === 'minimal' || ctype === 'minicode' || ctype === 'text' || ctype === 'heading') return 'half';
  if(c.code===undefined || c.code===null || c.code==='') return 'half';
  return 'full';
}

export function buildCardHTML(c, i){
  const ctype = c.type || 'code';
  const span = resolveSpan(c);
  const compact = c.compact ? ' card-compact' : '';
  const collapsed = c.collapsed ? ' card-collapsed' : '';
  const spanCls = span==='half' ? ' card-half' : '';
  const variantCls = (ctype==='tip'||ctype==='warning'||ctype==='info'||ctype==='minimal'||ctype==='minicode'||ctype==='text'||ctype==='heading') ? ` type-${ctype}` : '';
  const cls = `card${variantCls}${spanCls}${compact}${collapsed}`;
  const cardDir = ` dir="${textDir(c.title || c.ar)}"`;
  // Per-card custom style overrides (optional)
  const cardStyle = (() => {
    let parts = [];
    if(c.bg){ const op = c.bgOpacity!=='' && c.bgOpacity!=null ? (+c.bgOpacity/100) : 1; parts.push(`background:${hexToRgba(c.bg,op)}!important`); }
    if(c.borderColor){ parts.push(`border-color:${c.borderColor}`); }
    if(c.borderWidth!=='' && c.borderWidth!=null){ parts.push(`border-width:${c.borderWidth}px`); }
    if(c.radius!=='' && c.radius!=null){ parts.push(`border-radius:${c.radius}px`); }
    return parts.length ? ` style="${parts.join(';')}"` : '';
  })();
  const tipIcon = (variant) => {
    if(variant==='warning') return `<div class="tip-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`;
    if(variant==='info') return `<div class="tip-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>`;
    return `<div class="tip-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg></div>`;
  };
  if(ctype === 'tip' || ctype === 'warning' || ctype === 'info'){
    return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      ${tipIcon(ctype)}
      <h2 dir="auto">${esc(c.title)}</h2>
      <p class="ar">${esc(c.ar).replace(/\n/g,'<br>')}</p>
      ${(c.noteTitle||c.noteText) ? `
      <div class="note ar">
        ${c.noteTitle?`<strong>${esc(c.noteTitle)}</strong><br>`:''}
        ${esc(c.noteText||'').replace(/\n/g,'<br>')}
      </div>`:''}
    </div>`;
  }
  if(ctype === 'minimal'){
    return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      <h2 dir="auto">${esc(c.title)}</h2>
      <p class="ar">${esc(c.ar).replace(/\n/g,'<br>')}</p>
      ${(c.noteTitle||c.noteText) ? `
      <div class="note ar">
        ${c.noteTitle?`<strong>${esc(c.noteTitle)}</strong><br>`:''}
        ${esc(c.noteText||'').replace(/\n/g,'<br>')}
      </div>`:''}
    </div>`;
  }
  if(ctype === 'minicode'){
    return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      ${c.title ? `<h2 dir="auto">${esc(c.title)}</h2>` : ''}
      ${c.code!==undefined && c.code!==null && c.code!=='' ? `
      <div class="code code-${state.codeTheme||'dark'}${state.codeLineNumbers?' code-ln':''}">
        <pre>${c.rawCode ? c.code : (state.codeLineNumbers ? highlightCodeLines(c.code, (c.codeLang||'').toLowerCase()) : highlightCode(c.code, (c.codeLang||'').toLowerCase()))}</pre>
        ${c.collapsed ? '<div class="code-fade" aria-hidden="true"></div>' : ''}
      </div>`:''}
      ${(c.noteTitle||c.noteText) ? `
      <div class="note ar">
        ${c.noteTitle?`<strong>${esc(c.noteTitle)}</strong><br>`:''}
        ${esc(c.noteText||'').replace(/\n/g,'<br>')}
      </div>`:''}
    </div>`;
  }
  if(ctype === 'text'){
    return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      <p class="ar">${esc(c.ar).replace(/\n/g,'<br>')}</p>
    </div>`;
  }
  if(ctype === 'heading'){
    return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      ${c.title ? `<h2 dir="auto">${esc(c.title)}</h2>` : ''}
      ${c.ar ? `<p class="ar">${esc(c.ar).replace(/\n/g,'<br>')}</p>` : ''}
    </div>`;
  }
  return `
    <div class="${cls}" data-i="${i}"${cardDir}${cardStyle}>
      <div class="number">${esc(c.number)}</div>
      <h2 dir="auto">${esc(c.title)}</h2>
      <p class="ar">${esc(c.ar).replace(/\n/g,'<br>')}</p>
      ${c.code!==undefined && c.code!==null && c.code!=='' ? `
      <div class="code code-${state.codeTheme||'dark'}${state.codeLineNumbers?' code-ln':''}">
        <div class="code-head">
          <div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <span>${esc(c.codeLang||'CODE')}</span>
        </div>
        <pre>${c.rawCode ? c.code : (state.codeLineNumbers ? highlightCodeLines(c.code, (c.codeLang||'').toLowerCase()) : highlightCode(c.code, (c.codeLang||'').toLowerCase()))}</pre>
        ${c.collapsed ? '<div class="code-fade" aria-hidden="true"></div>' : ''}
      </div>`:''}
      ${(c.noteTitle||c.noteText) ? `
      <div class="note ar">
        ${c.noteTitle?`<strong>${esc(c.noteTitle)}</strong><br>`:''}
        ${esc(c.noteText||'').replace(/\n/g,'<br>')}
      </div>`:''}
    </div>`;
}

// Group cards into rows: 'full' = solo row, 'half' = pair up two per row
export function groupCardsIntoRows(cards){
  const rows = [];
  let pending = null;
  cards.forEach((c, i) => {
    const span = resolveSpan(c);
    if(span === 'full'){
      if(pending){ rows.push([pending]); pending = null; }
      rows.push([i]);
    } else { // half
      if(pending !== null){
        rows.push([pending, i]);
        pending = null;
      } else {
        pending = i;
      }
    }
  });
  if(pending !== null) rows.push([pending]);
  return rows;
}

export function buildHeaderHTML(s, includeIntro = true){
  const align = s.titleAlign || 'center';
  const badgeStyle = s.badgeStyle || 'rect';
  const weight = s.titleWeight != null ? s.titleWeight : 1000;
  const spacing = Math.max(0, s.titleSpacing != null ? s.titleSpacing : 0);
  const titleStyle = `text-align:${align};`;
  const tipsStyle = `font-weight:${weight};letter-spacing:${spacing}px;`;
  return `
    <div class="title" style="${titleStyle}">
      <div class="badge badge-${badgeStyle}">${esc(s.badge)}</div>
      <div class="tips" style="${tipsStyle}">${esc(s.titleMain)} <span>${esc(s.titleAccent)}</span></div>
      <div class="subtitle">${esc(s.subtitle)}</div>
    </div>
    ${includeIntro ? `<div class="intro ar">${esc(s.intro).replace(/\n/g,'<br>')}</div>` : ''}`;
}

export function buildFooterHTML(s, pageNum=0, totalPages=0){
  const icons = s.footerIcons !== false ? FOOTER_SVG : '';
  const pageBadge = totalPages > 1 ? `<span class="page-indicator" style="margin-inline-start:10px">${pageNum} / ${totalPages}</span>` : '';
  return `<div class="footer">${icons}${esc(s.footer)}${pageBadge}</div>`;
}

// Assemble a complete <section class="poster"> element
export function buildPosterElement(s, opts){
  const v = posterVars(s);
  const minHeightVar = opts.fixedHeight ? '--poster-min-height:0;' : `--poster-min-height:${POSTER_MIN_HEIGHT}px;`;
  const heightStyle = opts.fixedHeight ? `height:${opts.fixedHeight}px;` : '';
  const fontScaleVar = v.fontScaleVars;
  const fontVar = v.fontVar;
  const logos = `
    <div class="curve"></div>
    <div class="${v.userWrapClass}" style="${v.userWrapStyle}"><img class="user-logo" src="${esc(s.userLogo)}" alt="user logo"></div>
    <img class="tech-logo" src="${esc(s.techLogo)}" alt="tech logo" crossorigin="anonymous" referrerpolicy="no-referrer" style="${v.techStyle}">`;
  const cardScale = opts.cardScale != null ? opts.cardScale : 1;
  const headerHTML = opts.header || '';
  const cardsHTML = opts.cardsHTML || '';
  const inner = `${logos}${headerHTML}${cardsHTML}`;
  // When scaling, .content-fit becomes a "virtual poster" of width 900/sc with
  // padding 58/sc,55/sc,110/sc — after transform:scale(sc) everything maps back to
  // the real 900px frame proportionally (logos keep their padding-box positions).
  const sc = cardScale;
  const contentMarkup = sc < 1
    ? `<div class="content-fit" style="width:${(100/sc).toFixed(4)}%;padding:${(58/sc).toFixed(2)}px ${(55/sc).toFixed(2)}px ${(110/sc).toFixed(2)}px;transform:scale(${sc.toFixed(4)});transform-origin:top left">${inner}</div>`
    : inner;
  return `<section class="poster ${esc(s.theme)}" dir="ltr" style='--poster-width:${POSTER_WIDTH}px;${minHeightVar}${heightStyle}${fontScaleVar}${fontVar}${v.cssVars};${v.bgVars}'>
    ${contentMarkup}
    ${opts.footer ? buildFooterHTML(s, opts.pageNum||0, opts.totalPages||0) : ''}
  </section>`;
}

// Measure row heights and header end positions by rendering hidden posters.
// `vs` = the intended render scale. When vs < 1 the real render wraps content in
// a .content-fit "virtual poster" wider than 900px, where text wraps differently
// — so measurement must use the SAME virtual width or heights are overestimated
// (which wrongly pushes cards to new pages and leaves gaps before the footer).
export function measureLayout(vs = 1){
  const s = state;
  const v = posterVars(s);
  const rows = groupCardsIntoRows(s.cards);
  const stage = document.createElement('div');
  stage.className = 'poster-export-stage';
  stage.style.cssText += 'visibility:hidden;';

  // Mirror buildPosterElement's scaled wrapper (absolute, same width/padding,
  // NO transform — offsets are read in virtual units directly)
  const wrap = (html) => vs < 1
    ? `<div class="content-fit" style="width:${(100/vs).toFixed(4)}%;padding:${(58/vs).toFixed(2)}px ${(55/vs).toFixed(2)}px ${(110/vs).toFixed(2)}px">${html}</div>`
    : html;
  const containerOf = (poster) => vs < 1 ? poster.querySelector('.content-fit') : poster;

  // Full-layout measurement: full header + all cards in one long poster
  const poster = document.createElement('section');
  poster.className = 'poster ' + (s.theme||'');
  poster.style.cssText = `--poster-width:${POSTER_WIDTH}px;--poster-min-height:0;${v.fontScaleVars}${v.fontVar}${v.cssVars};${v.bgVars}`;
  const cardsHTML = rows.map(row => {
    if(row.length === 1) return buildCardHTML(s.cards[row[0]], row[0]);
    return `<div class="card-row">${row.map(i=>buildCardHTML(s.cards[i], i)).join('')}</div>`;
  }).join('');
  poster.innerHTML = wrap(
    `<div class="curve"></div>
    <div class="${v.userWrapClass}" style="${v.userWrapStyle}"><img class="user-logo" src="${esc(s.userLogo)}" alt="user logo"></div>
    <img class="tech-logo" src="${esc(s.techLogo)}" alt="tech logo" crossorigin="anonymous" referrerpolicy="no-referrer" style="${v.techStyle}">
    ${buildHeaderHTML(s)}` + cardsHTML);
  stage.appendChild(poster);
  document.body.appendChild(stage);

  // Measure each row (either a .card-row or a standalone .card)
  const container = containerOf(poster);
  const rowEls = Array.from(container.children).filter(el =>
    el.classList && (el.classList.contains('card-row') || el.classList.contains('card'))
  );
  const rowMetrics = rows.map((row, idx) => {
    const el = rowEls[idx];
    return { row, top: el ? el.offsetTop : 0, height: el ? el.offsetHeight : 0 };
  });

  // Continuation page header height (title/subtitle, no intro) measured with a dummy card
  const continuationPoster = document.createElement('section');
  continuationPoster.className = 'poster ' + (s.theme||'');
  continuationPoster.style.cssText = `--poster-width:${POSTER_WIDTH}px;--poster-min-height:0;${v.fontScaleVars}${v.fontVar}${v.cssVars};${v.bgVars}`;
  continuationPoster.innerHTML = wrap(
    `<div class="curve"></div>
    <div class="${v.userWrapClass}" style="${v.userWrapStyle}"><img class="user-logo" src="${esc(s.userLogo)}" alt="user logo"></div>
    <img class="tech-logo" src="${esc(s.techLogo)}" alt="tech logo" crossorigin="anonymous" referrerpolicy="no-referrer" style="${v.techStyle}">
    ${buildHeaderHTML(s, false)}<div class="card" style="height:1px"></div>`);
  stage.appendChild(continuationPoster);
  const dummyCard = containerOf(continuationPoster).querySelector('.card');
  const continuationHeaderEndY = dummyCard ? dummyCard.offsetTop : ((PAGE_TOP_PAD/vs) + 120);

  stage.remove();
  const headerEndY = rowMetrics[0] ? rowMetrics[0].top : 0;
  return { rowMetrics, headerEndY, continuationHeaderEndY };
}

// Greedy pagination with scale-to-fit: distribute rows across fixed-height pages.
// Each page computes a candidate scale; renderPoster() then applies the smallest
// one to ALL pages so typography/spacing stay visually consistent.
// Only when the scale would drop below MIN_CARD_SCALE does a row move to a new page.
// `vs` = intended render scale. rowMetrics/headerEndY are measured in VIRTUAL
// units at virtual width (790/vs content px), so the virtual top padding is
// PAGE_TOP_PAD/vs. page.scale = required render scale = availableH / virtualH.
export function paginateRows(rowMetrics, pageHeight, headerEndY, continuationHeaderEndY, vs = 1){
  const availableH = pageHeight - PAGE_TOP_PAD - PAGE_BOTTOM_PAD;
  const topPadV = PAGE_TOP_PAD / vs;
  const pages = [];
  let page = { type:'full', rows:[], scale:1 };
  let headerH = 0;           // header height inside the content wrapper
  let cardsNaturalH = 0;     // cumulative natural height of cards (+gaps)

  for(let i=0; i<rowMetrics.length; i++){
    const isFirstOnPage = page.rows.length === 0;
    const rowH = rowMetrics[i].height;

    if(isFirstOnPage){
      headerH = page.type === 'full'
        ? (headerEndY - topPadV)
        : (continuationHeaderEndY - topPadV);
      cardsNaturalH = 0;
    }

    const gap = isFirstOnPage ? 0 : CARD_GAP;
    const newCardsH = cardsNaturalH + gap + rowH;
    const newTotalH = headerH + newCardsH;
    const scaleWithNew = newTotalH > 0 ? availableH / newTotalH : 1;

    if(isFirstOnPage){
      // Always include the first row, even if scaling is needed
      page.rows.push(rowMetrics[i].row);
      cardsNaturalH = newCardsH;
      page.scale = Math.min(1, scaleWithNew);
    } else if(scaleWithNew >= MIN_CARD_SCALE){
      // Adding this row with uniform scaling is acceptable
      page.rows.push(rowMetrics[i].row);
      cardsNaturalH = newCardsH;
      page.scale = scaleWithNew;
    } else {
      // Scaling would be too aggressive — start a new page with this row
      pages.push(page);
      page = { type:'mini', rows:[], scale:1 };
      headerH = continuationHeaderEndY - PAGE_TOP_PAD;
      const singleTotalH = headerH + rowH;
      const singleScale = singleTotalH > 0 ? availableH / singleTotalH : 1;
      page.rows.push(rowMetrics[i].row);
      page.scale = Math.min(1, singleScale);
      cardsNaturalH = rowH;
    }
  }
  if(page.rows.length > 0) pages.push(page);
  return pages;
}

export function renderPoster(){
  const s = state;
  const stage = document.getElementById('stage');
  const ps = PAGE_SIZES[s.pageSize || 'auto'];

  if(!ps.h){
    // Auto: single poster, min-height, grows with content
    const rows = groupCardsIntoRows(s.cards);
    const cardsHTML = rows.map(row => {
      if(row.length === 1) return buildCardHTML(s.cards[row[0]], row[0]);
      return `<div class="card-row">${row.map(i=>buildCardHTML(s.cards[i], i)).join('')}</div>`;
    }).join('');
    stage.innerHTML = buildPosterElement(s, {
      header: buildHeaderHTML(s),
      cardsHTML,
      footer: true,
      pageNum: 1,
      totalPages: 1
    });
    updateDimInfo(ps, 1);
    return;
  }

  // Fixed size: measure, paginate, render multiple pages.
  // Iterate measure→paginate: at scale <1 the virtual canvas is wider so text
  // wraps differently — re-measure at the computed scale until it converges,
  // otherwise heights are overestimated (cards pushed to new pages + empty
  // gaps before the footer). All pages share ONE uniform scale for a
  // consistent look.
  let vs = 1;
  let { rowMetrics, headerEndY, continuationHeaderEndY } = measureLayout(vs);
  if(!rowMetrics.length){
    stage.innerHTML = buildPosterElement(s, {
      header: buildHeaderHTML(s),
      cardsHTML: '',
      footer: true,
      fixedHeight: ps.h,
      pageNum: 1,
      totalPages: 1
    });
    updateDimInfo(ps, 1);
    return;
  }

  let pages, globalScale = 1;
  for(let i = 0; i < 8; i++){
    pages = paginateRows(rowMetrics, ps.h, headerEndY, continuationHeaderEndY, vs);
    globalScale = Math.min(...pages.map(p => p.scale), 1);
    if(globalScale >= vs - 0.005) { globalScale = Math.min(globalScale, vs); break; }
    vs = globalScale;
    ({ rowMetrics, headerEndY, continuationHeaderEndY } = measureLayout(vs));
  }
  // If the loop hit its cap still needing a smaller scale, measure once at that scale
  if(globalScale < vs - 0.005){
    vs = globalScale;
    ({ rowMetrics, headerEndY, continuationHeaderEndY } = measureLayout(vs));
    pages = paginateRows(rowMetrics, ps.h, headerEndY, continuationHeaderEndY, vs);
    globalScale = Math.min(...pages.map(p => p.scale), vs);
  }
  const totalPages = pages.length;
  pages.forEach(p => { p.scale = globalScale; });
  let html = '';
  pages.forEach((pg, idx) => {
    const pageNum = idx + 1;
    const isLast = idx === totalPages - 1;
    const header = buildHeaderHTML(s, pg.type === 'full');
    const cardsHTML = pg.rows.map(row => {
      if(row.length === 1) return buildCardHTML(s.cards[row[0]], row[0]);
      return `<div class="card-row">${row.map(i=>buildCardHTML(s.cards[i], i)).join('')}</div>`;
    }).join('');
    html += buildPosterElement(s, {
      header,
      cardsHTML,
      footer: true,
      fixedHeight: ps.h,
      pageNum,
      totalPages,
      cardScale: pg.scale
    });
    if(!isLast) html += '<div class="page-sep" aria-hidden="true"></div>';
  });
  stage.innerHTML = html;
  updateDimInfo(ps, totalPages);
}

export function updateDimInfo(ps, totalPages){
  const el = document.getElementById('dimInfo');
  if(!el) return;
  if(ps.h){
    el.textContent = `${POSTER_WIDTH}×${ps.h}px` + (totalPages>1 ? ` (${totalPages} صفحات)` : '');
  } else {
    el.textContent = `${POSTER_WIDTH}px`;
  }
}
