// ---------- Sidebar render ----------
import {
  FONT_KEYS, FONTS, COLOR_VARS, THEMES, PRESETS, PAGE_SIZES, EXPORT_SCALES,
  exportScale, defaultFontScales,
} from './constants.js';
import { state } from './state.js';
import { esc } from './utils.js';
import { readImage } from './mutations.js';

export let sidebarSearchTerm = '';
export function setSidebarSearchTerm(v){ sidebarSearchTerm = v; }

// Persistent set of open section IDs — survives re-renders so sections
// don't snap back to their hardcoded default state on every interaction.
export const openSections = new Set();

export function sidebarSection(id, title, icon, bodyHTML, count){
  const open = openSections.has(id);
  const cnt = count!=null ? `<span class="sec-cnt">${count}</span>` : '';
  return `<div class="sec ${open?'open':''}" id="sec-${id}">
    <button type="button" class="sec-h" onclick="toggleSec('${id}')" aria-expanded="${open?'true':'false'}" aria-controls="sec-${id}-body">
      ${icon}<span>${title}</span>${cnt}<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="sec-b" id="sec-${id}-body"><div class="sec-b-w">${bodyHTML}</div></div>
  </div>`;
}

export function toggleSec(id){
  const sec = document.getElementById('sec-'+id);
  if(!sec) return;
  const body = sec.querySelector('.sec-b');
  if(!body) return;
  const willOpen = !sec.classList.contains('open');
  if(willOpen){
    // open with measured height for a clean animation
    body.style.maxHeight = '0px';
    body.offsetHeight; // force reflow
    body.style.maxHeight = body.scrollHeight + 'px';
    openSections.add(id);
  } else {
    // close from measured height
    body.style.maxHeight = body.scrollHeight + 'px';
    body.offsetHeight; // force reflow
    body.style.maxHeight = '0px';
    openSections.delete(id);
  }
  sec.classList.toggle('open', willOpen);
  const btn = sec.querySelector('.sec-h');
  if(btn) btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  // after the transition, remove the inline max-height so re-renders pick up the CSS
  const onEnd = ()=>{
    if(sec.classList.contains('open')){
      // set to a safe large value via CSS; remove inline override
      body.style.maxHeight = '';
    }
  };
  body.removeEventListener('transitionend', body._onEnd);
  body._onEnd = onEnd;
  body.addEventListener('transitionend', onEnd, {once:true});
  updateNavActive();
}

export function onSidebarSearch(val){
  sidebarSearchTerm = val;
  applySidebarFilter();
  // show/hide quick-nav depending on whether search is active
  const nav = document.getElementById('sbNav');
  if(nav) nav.style.display = val.trim() ? 'none' : '';
}

// Ordered list of sidebar sections for quick-nav + active tracking
export const SIDEBAR_SECTIONS = [
  {id:'layout', label:'الأبعاد'},
  {id:'lang',   label:'القالب'},
  {id:'color',  label:'الألوان'},
  {id:'theme',  label:'الثيم'},
  {id:'font',   label:'الخط'},
  {id:'bghl',   label:'الإضاءة'},
  {id:'title',  label:'العنوان'},
  {id:'card',   label:'البطاقات'},
  {id:'code',   label:'الكود'},
  {id:'logo',   label:'الشعارات'},
  {id:'foot',   label:'الفوتر'},
];

export function expandAllSections(){
  document.querySelectorAll('#sidebar .sec').forEach(sec=>{
    const id = sec.id.replace('sec-','');
    if(id) openSections.add(id);
    const body = sec.querySelector('.sec-b');
    sec.classList.add('open');
    if(body){
      body.style.maxHeight = '0px';
      body.offsetHeight;
      body.style.maxHeight = body.scrollHeight + 'px';
    }
    const btn = sec.querySelector('.sec-h');
    if(btn) btn.setAttribute('aria-expanded','true');
  });
}

export function collapseAllSections(){
  document.querySelectorAll('#sidebar .sec').forEach(sec=>{
    const body = sec.querySelector('.sec-b');
    if(body){
      body.style.maxHeight = body.scrollHeight + 'px';
      body.offsetHeight;
      body.style.maxHeight = '0px';
    }
    sec.classList.remove('open');
    const btn = sec.querySelector('.sec-h');
    if(btn) btn.setAttribute('aria-expanded','false');
  });
  openSections.clear();
}

export function jumpToSection(id){
  const sec = document.getElementById('sec-'+id);
  if(!sec) return;
  const body = sec.querySelector('.sec-b');
  sec.classList.add('open');
  openSections.add(id);
  if(body){
    body.style.maxHeight = '0px';
    body.offsetHeight;
    body.style.maxHeight = body.scrollHeight + 'px';
  }
  const btn = sec.querySelector('.sec-h');
  if(btn) btn.setAttribute('aria-expanded','true');
  sec.scrollIntoView({behavior:'smooth', block:'start'});
  // brief flash highlight
  sec.classList.remove('flash');
  void sec.offsetWidth; // reflow to restart animation
  sec.classList.add('flash');
  setTimeout(()=>sec.classList.remove('flash'), 900);
  updateNavActive(id);
}

let _navObserver = null;
export function updateNavActive(forceId){
  const chips = document.querySelectorAll('#sbNav .sb-nav-chip');
  if(!chips.length) return;
  let activeId = forceId;
  if(!activeId){
    // pick the section whose header is closest to the top of the sidebar viewport
    const sb = document.getElementById('sidebar');
    if(!sb) return;
    let best = null, bestDist = Infinity;
    SIDEBAR_SECTIONS.forEach(s=>{
      const el = document.getElementById('sec-'+s.id);
      if(!el) return;
      const r = el.getBoundingClientRect();
      const sbTop = sb.getBoundingClientRect().top;
      const dist = Math.abs(r.top - sbTop - 8);
      // prefer sections that have scrolled past the top (header near/above top)
      const adj = r.top - sbTop - 8 <= 0 ? dist * 0.5 : dist;
      if(adj < bestDist){ bestDist = adj; best = s.id; }
    });
    activeId = best;
  }
  chips.forEach(c=>{
    const id = c.getAttribute('data-sec');
    c.classList.toggle('active', id === activeId);
    c.setAttribute('aria-current', id === activeId ? 'true' : 'false');
  });
}

export function setupSidebarScrollTracking(){
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  if(sb._navWired) return;
  sb._navWired = true;
  let raf = 0;
  sb.addEventListener('scroll', ()=>{
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = 0; updateNavActive(); });
  }, {passive:true});
  // back-to-top button
  const bt = document.createElement('button');
  bt.type = 'button';
  bt.className = 'sb-back-top';
  bt.setAttribute('aria-label','العودة لأعلى اللوحة');
  bt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
  bt.addEventListener('click', ()=> sb.scrollTo({top:0, behavior:'smooth'}));
  sb.appendChild(bt);
  const updateBt = ()=>{
    bt.classList.toggle('show', sb.scrollTop > 320);
  };
  sb.addEventListener('scroll', updateBt, {passive:true});
  updateBt();
}

export function applySidebarFilter(){
  const term = sidebarSearchTerm.trim().toLowerCase();
  const sb = document.getElementById('sidebar');
  if(!sb) return;
  sb.querySelectorAll('.sec').forEach(sec=>{
    const id = sec.id.replace('sec-','');
    if(!term){ sec.style.display=''; return; }
    const title = sec.querySelector('.sec-h > span');
    if(title && title.textContent.toLowerCase().includes(term)){
      sec.style.display='';
      const body = sec.querySelector('.sec-b');
      if(body && !sec.classList.contains('open')){
        body.style.maxHeight = body.scrollHeight + 'px';
      }
      sec.classList.add('open');
      openSections.add(id);
      const btn = sec.querySelector('.sec-h');
      if(btn) btn.setAttribute('aria-expanded','true');
    } else {
      sec.style.display='none';
    }
  });
}

export function renderSidebar(){
  const s = state;
  const icons = {
    lang:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7"/><path d="M9 3v2c0 4.4-2.7 8.4-6.5 10.5"/><path d="M5 9c0 2.4 3.1 4.5 7 5"/><path d="M14 19l4-9 4 9"/><path d="M15.5 16h5"/></svg>',
    color:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 1 1 0-20 8 8 0 0 1 8 8c0 2.5-1.7 4.6-4 5.2-1.6.4-3 .8-3 2a2 2 0 0 0 2 2 2 2 0 0 1-2 2z"/></svg>',
    theme:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
    title:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    card:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><line x1="7" y1="7.5" x2="7" y2="7.5"/><line x1="7" y1="16.5" x2="7" y2="16.5"/></svg>',
    logo:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
    foot:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l4-4 4 4 8-8"/><path d="M12 9h8v8"/></svg>',
    bghl:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>',
    code:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    font:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
  };

  // Language / preset
  let presetHTML = '<div class="presets">';
  Object.keys(PRESETS).forEach(k=>{
    const p=PRESETS[k];
    presetHTML += `<button type="button" class="preset" onclick="applyPreset('${k}')" aria-pressed="${s.lang===k?'true':'false'}"><span class="sw" style="background:${p.red}"></span>${p.label}</button>`;
  });
  presetHTML += '</div>';

  // Colors
  let colorHTML = '<div class="color-grid">';
  COLOR_VARS.forEach(v=>{
    const val = s.colors[v.k] || '#000000';
    colorHTML += `<div class="color-cell">
      <input type="color" value="${val}" data-cv="${v.k}" oninput="setColor('${v.k}',this.value)">
      <span class="lbl">${v.nm}</span>
      <input class="hex" type="text" value="${val}" data-cvh="${v.k}" oninput="setColor('${v.k}',this.value)">
    </div>`;
  });
  colorHTML += '</div>';
  colorHTML += `<div class="fld" style="margin-top:10px"><button type="button" class="addbtn" onclick="randomPalette()"><svg class="abi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M7.5 4.21 12 6.81l4.5-2.6"/><path d="M7.5 19.79V14.6L3 12"/><path d="M21 12l-4.5 2.6v5.19"/></svg><span>لوحة ألوان عشوائية متناسقة</span></button></div>`;

  // Theme
  let themeHTML = '<div class="themes">';
  THEMES.forEach(t=>{
    themeHTML += `<button type="button" class="theme-opt ${s.theme===t.id?'sel':''}" onclick="setTheme('${t.id}')" aria-pressed="${s.theme===t.id?'true':'false'}" aria-label="${esc(t.nm)}">
      <span class="th-prev ${t.id}" aria-hidden="true"></span>
      <span class="nm">${t.nm}</span>
    </button>`;
  });
  themeHTML += '</div>';

  // Font family selector
  const fontOptions = FONTS.map(f=>`<option value="${esc(f.key)}" ${s.fontFamily===f.key?'selected':''} style='font-family:${f.family},Arial,sans-serif'>${esc(f.label)}</option>`).join('');
  const fontHTML = `
    <div class="fld"><label>عائلة الخط</label>
      <select onchange="setFontFamily(this.value)">${fontOptions}</select>
      <div class="hint">خط البوستر الرئيسي. النصوص العربية تبقى ترجع للخط "Cairo" إن لم يكن الخط يدعم العربية.</div>
    </div>`;

  // Title fields
  const titleHTML = `
    <div class="fld"><label>الشارة (Badge)</label><input type="text" value="${esc(s.badge)}" oninput="setField('badge',this.value)"></div>
    <div class="fld"><label>نمط الشارة</label>
      <div class="btn-group">
        <button type="button" class="mini-btn ${(s.badgeStyle||'rect')==='rect'?'active':''}" onclick="setField('badgeStyle','rect');renderSidebar()">مستطيل</button>
        <button type="button" class="mini-btn ${s.badgeStyle==='pill'?'active':''}" onclick="setField('badgeStyle','pill');renderSidebar()">حبة</button>
        <button type="button" class="mini-btn ${s.badgeStyle==='bar'?'active':''}" onclick="setField('badgeStyle','bar');renderSidebar()">شريط</button>
      </div>
    </div>
    <div class="fld"><label>محاذاة العنوان</label>
      <div class="btn-group">
        <button type="button" class="mini-btn ${(s.titleAlign||'center')==='center'?'active':''}" onclick="setField('titleAlign','center');renderSidebar()">وسط</button>
        <button type="button" class="mini-btn ${s.titleAlign==='left'?'active':''}" onclick="setField('titleAlign','left');renderSidebar()">يسار</button>
        <button type="button" class="mini-btn ${s.titleAlign==='right'?'active':''}" onclick="setField('titleAlign','right');renderSidebar()">يمين</button>
      </div>
    </div>
    <div class="fld"><label>العنوان الرئيسي</label><input type="text" value="${esc(s.titleMain)}" oninput="setField('titleMain',this.value)"></div>
    <div class="fld"><label>الكلمة المميزة (لون مختلف)</label><input type="text" value="${esc(s.titleAccent)}" oninput="setField('titleAccent',this.value)"></div>
    <div class="fld"><label>وزن خط العنوان — <b>${s.titleWeight!=null?s.titleWeight:1000}</b></label>
      <input type="range" min="400" max="1000" step="100" value="${s.titleWeight!=null?s.titleWeight:1000}" oninput="setField('titleWeight',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value">
    </div>
    <div class="fld"><label>تباعد أحرف العنوان — <b>${Math.max(0,s.titleSpacing!=null?s.titleSpacing:0)}px</b></label>
      <input type="range" min="0" max="20" value="${Math.max(0,s.titleSpacing!=null?s.titleSpacing:0)}" oninput="setField('titleSpacing',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'px'">
    </div>
    <div class="fld"><label>العنوان الفرعي</label><input type="text" value="${esc(s.subtitle)}" oninput="setField('subtitle',this.value)"></div>
    <div class="fld"><label>المقدمة (عربي RTL)</label><textarea oninput="setField('intro',this.value)">${esc(s.intro)}</textarea></div>`;

  // Cards
  let cardsHTML = '';
  s.cards.forEach((c,i)=>{
    cardsHTML += `<div class="card-item" id="ci-${i}">
      <div class="ci-h">
        <div class="num">${esc(c.number||'?')}</div>
        <div class="tt">${esc(c.title||'بدون عنوان')}</div>
        <div class="mv">
          <button type="button" class="iconbtn" onclick="moveCard(${i},-1)" title="أعلى" aria-label="أعلى"><svg class="ibi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>
          <button type="button" class="iconbtn" onclick="moveCard(${i},1)" title="أسفل" aria-label="أسفل"><svg class="ibi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
          <button type="button" class="iconbtn" onclick="duplicateCard(${i})" title="تكرار البطاقة" aria-label="تكرار"><svg class="ibi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
          <button type="button" class="iconbtn" onclick="toggleCard(${i})" title="طي" aria-label="طي"><svg class="ibi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
          <button type="button" class="iconbtn del" onclick="delCard(${i})" title="حذف" aria-label="حذف"><svg class="ibi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
      </div>
      <div class="ci-body">
        <div class="fld"><label>نوع البطاقة</label><select onchange="setCard(${i},'type',this.value);renderSidebar()"><option value="code" ${(c.type||'code')==='code'?'selected':''}>كود</option><option value="tip" ${c.type==='tip'?'selected':''}>نصيحة</option><option value="warning" ${c.type==='warning'?'selected':''}>تحذير</option><option value="info" ${c.type==='info'?'selected':''}>معلومة</option><option value="minimal" ${c.type==='minimal'?'selected':''}>بسيطة</option><option value="minicode" ${c.type==='minicode'?'selected':''}>كود بسيط</option><option value="text" ${c.type==='text'?'selected':''}>نص فقط</option><option value="heading" ${c.type==='heading'?'selected':''}>عنوان + نص</option></select></div>
        <div class="fld"><label>العرض (تخطيط)</label>
          <div class="btn-group">
            <button type="button" class="mini-btn ${(c.span||'auto')==='auto'?'active':''}" onclick="setCard(${i},'span','auto');renderSidebar()">تلقائي</button>
            <button type="button" class="mini-btn ${c.span==='full'?'active':''}" onclick="setCard(${i},'span','full');renderSidebar()">كامل</button>
            <button type="button" class="mini-btn ${c.span==='half'?'active':''}" onclick="setCard(${i},'span','half');renderSidebar()">نصف</button>
          </div>
        </div>
        <div class="fld"><label>توفير المساحة</label>
          <div class="btn-group">
            <button type="button" class="mini-btn ${c.compact?'active':''}" onclick="toggleCardProp(${i},'compact');renderSidebar()">مضغوط</button>
            <button type="button" class="mini-btn ${c.collapsed?'active':''}" onclick="toggleCardProp(${i},'collapsed');renderSidebar()" ${(c.type||'code')==='code'?'':'disabled'}>طي الكود</button>
          </div>
        </div>
        <div class="row">
          <div class="fld"><label>الرقم</label><input type="text" value="${esc(c.number)}" oninput="setCard(${i},'number',this.value)"></div>
          <div class="fld"><label>عنوان البطاقة (EN)</label><input type="text" value="${esc(c.title)}" oninput="setCard(${i},'title',this.value)"></div>
        </div>
        <div class="fld"><label>النص العربي (RTL)</label><textarea oninput="setCard(${i},'ar',this.value)">${esc(c.ar)}</textarea></div>
        ${(c.type||'code')==='code' ? `
        <div class="row">
          <div class="fld"><label>لغة الكود</label><select onchange="setCard(${i},'codeLang',this.value)">${[{v:'laravel',l:'Laravel'},{v:'vue',l:'Vue'},{v:'react',l:'React'},{v:'js',l:'JS'},{v:'jsx',l:'JSX'},{v:'css',l:'CSS'},{v:'html',l:'HTML'},{v:'php',l:'PHP'},{v:'tailwind',l:'Tailwind'},{v:'bootstrap',l:'Bootstrap'},{v:'flutter',l:'Flutter'},{v:'python',l:'Python'},{v:'typescript',l:'TypeScript'},{v:'bash',l:'Bash'},{v:'sql',l:'SQL'},{v:'json',l:'JSON'},{v:'markdown',l:'Markdown'}].map(l=>`<option value="${l.v}" ${(c.codeLang||'').toLowerCase()===l.v?'selected':''}>${l.l}</option>`).join('')}</select></div>
          <div class="fld" style="flex:0 0 130px;align-self:flex-end">
            <label class="chk"><input type="checkbox" ${c.rawCode?'checked':''} onchange="setCard(${i},'rawCode',this.checked)"> كود HTML خام</label>
          </div>
        </div>
        <div class="fld"><label>الكود ${c.rawCode?'(HTML خام مع spans)':'(تلوين تلقائي)'}</label><textarea style="min-height:120px;font-family:'Courier New',monospace;direction:ltr;text-align:left" oninput="setCard(${i},'code',this.value)">${esc(c.code)}</textarea></div>` : ''}
        <div class="fld"><label>عنوان الملاحظة</label><input type="text" value="${esc(c.noteTitle)}" oninput="setCard(${i},'noteTitle',this.value)"></div>
        <div class="fld"><label>نص الملاحظة (عربي)</label><textarea oninput="setCard(${i},'noteText',this.value)">${esc(c.noteText)}</textarea></div>
        <div class="fld" style="margin-top:14px;border-top:1px solid var(--ui-line);padding-top:12px">
          <label style="display:flex;align-items:center;justify-content:space-between">
            <span>مظهر البطاقة (اختياري)</span>
            <button type="button" class="addbtn" style="width:auto;padding:4px 10px;margin:0;font-size:10px" onclick="resetCardStyle(${i})">إعادة الضبط</button>
          </label>
        </div>
        <div class="color-cell" style="margin-top:8px">
          <input type="color" value="${c.bg||'#101722'}" oninput="setCard(${i},'bg',this.value);renderSidebar()">
          <span class="lbl">لون الخلفية</span>
          ${c.bg?`<button type="button" class="rm" style="margin:0;padding:2px 6px;font-size:10px" onclick="event.stopPropagation();setCard(${i},'bg','');renderSidebar()">إزالة</button>`:'<span></span>'}
        </div>
        <div class="fld"><label>شفافية الخلفية — <b>${c.bgOpacity!==''&&c.bgOpacity!=null?c.bgOpacity:'100'}%</b></label>
          <input type="range" min="0" max="100" value="${c.bgOpacity!==''&&c.bgOpacity!=null?c.bgOpacity:100}" oninput="setCard(${i},'bgOpacity',this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
        </div>
        <div class="color-cell" style="margin-top:8px">
          <input type="color" value="${c.borderColor||'#61dafb'}" oninput="setCard(${i},'borderColor',this.value);renderSidebar()">
          <span class="lbl">لون الحدود</span>
          ${c.borderColor?`<button type="button" class="rm" style="margin:0;padding:2px 6px;font-size:10px" onclick="event.stopPropagation();setCard(${i},'borderColor','');renderSidebar()">إزالة</button>`:'<span></span>'}
        </div>
        <div class="row">
          <div class="fld"><label>عرض الحدود — <b>${c.borderWidth!==''&&c.borderWidth!=null?c.borderWidth:'1'}px</b></label>
            <input type="range" min="0" max="6" value="${c.borderWidth!==''&&c.borderWidth!=null?c.borderWidth:1}" oninput="setCard(${i},'borderWidth',this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'px'">
          </div>
          <div class="fld"><label>نصف قطر الزاوية — <b>${c.radius!==''&&c.radius!=null?c.radius:'28'}px</b></label>
            <input type="range" min="0" max="40" value="${c.radius!==''&&c.radius!=null?c.radius:28}" oninput="setCard(${i},'radius',this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'px'">
          </div>
        </div>
      </div>
    </div>`;
  });
  cardsHTML += `<div class="tpl-row">
    <button type="button" class="addbtn" onclick="addCard()"><svg class="abi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>بطاقة فارغة</span></button>
  </div>
  <div class="tpl-grid">
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('code')">كود + ملاحظة</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('tip')">نصيحة</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('warning')">تحذير</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('info')">معلومة</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('compare')">مقارنة</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('minimal')">بسيطة</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('minicode')">كود بسيط</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('text')">نص فقط</button>
    <button type="button" class="tpl-btn" onclick="addCardFromTemplate('heading')">عنوان + نص</button>
  </div>`;

  // Logo position controls block
  function posControls(key, isUser){
    const p = isUser ? (s.userLogoPos||{pos:"auto-tl",size:210,dx:0,dy:0})
                     : (s.techLogoPos||{pos:"tr",size:230,dx:45,dy:50});
    const opts = isUser
      ? [['auto-tl','أعلى يسار (تلقائي)'],['tl','أعلى يسار (مطلق)'],['tr','أعلى يمين'],['bl','أسفل يسار'],['br','أسفل يمين']]
      : [['tr','أعلى يمين (تلقائي)'],['tl','أعلى يسار'],['bl','أسفل يسار'],['br','أسفل يمين']];
    const optHTML = opts.map(o=>`<option value="${o[0]}" ${p.pos===o[0]?'selected':''}>${o[1]}</option>`).join('');
    return `
      <div class="fld"><label>الموضع</label>
        <select onchange="setLogoPos('${key}','pos',this.value)">${optHTML}</select>
      </div>
      <div class="fld"><label>الحجم (px) — <b>${p.size}</b></label>
        <input type="range" min="60" max="400" value="${p.size}" oninput="setLogoPos('${key}','size',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value">
      </div>
      <div class="row">
        <div class="fld"><label>إزاحة X (px)</label><input type="number" value="${p.dx}" oninput="setLogoPos('${key}','dx',+this.value||0)"></div>
        <div class="fld"><label>إزاحة Y (px)</label><input type="number" value="${p.dy}" oninput="setLogoPos('${key}','dy',+this.value||0)"></div>
      </div>
      <div class="fld"><button type="button" class="addbtn" onclick="resetLogoPos('${key}')">إعادة للموضع الافتراضي</button></div>`;
  }

  function highlightControls(){
    const h = s.logoHighlight || { enabled:true, color:'#61dafb', blur:25, opacity:0.35, x:0, y:0 };
    return `
    <div class="fld" style="margin-top:14px;border-top:1px solid var(--ui-line);padding-top:12px">
      <label class="chk"><input type="checkbox" ${h.enabled!==false?'checked':''} onchange="setLogoHighlight('enabled',this.checked)"> تفعيل الهايلايت خلف الشعار</label>
    </div>
    <div class="fld">
      <label>لون الهايلايت</label>
      <div class="color-cell hl-color">
        <input type="color" value="${h.color||'#61dafb'}" oninput="setLogoHighlight('color',this.value)">
        <span class="lbl">لون الهايلايت</span>
        <input class="hex" type="text" value="${h.color||'#61dafb'}" oninput="setLogoHighlight('color',this.value)">
      </div>
    </div>
    <div class="fld"><label>انتشار الضبابية (px) — <b>${h.blur||25}</b></label>
      <input type="range" min="0" max="80" value="${h.blur||25}" oninput="setLogoHighlight('blur',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value">
    </div>
    <div class="fld"><label>الشفافية — <b>${Math.round((h.opacity??0.35)*100)}%</b></label>
      <input type="range" min="0" max="100" value="${Math.round((h.opacity??0.35)*100)}" oninput="setLogoHighlight('opacity',+this.value/100);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
    </div>`;
  }

  function bgHighlightControls(){
    const h = s.bgHighlight || { enabled:true, color:'#61dafb', opacity:0.38, x:85, y:0, size:30 };
    return `
    <div class="fld">
      <label class="chk"><input type="checkbox" ${h.enabled!==false?'checked':''} onchange="setBgHighlight('enabled',this.checked)"> تفعيل الهايلايت الخلفي</label>
    </div>
    <div class="fld">
      <label>لون الهايلايت الخلفي</label>
      <div class="color-cell bg-hl-color">
        <input type="color" value="${h.color||'#61dafb'}" oninput="setBgHighlight('color',this.value)">
        <span class="lbl">لون الخلفية</span>
        <input class="hex" type="text" value="${h.color||'#61dafb'}" oninput="setBgHighlight('color',this.value)">
      </div>
    </div>
    <div class="row">
      <div class="fld"><label>الشفافية — <b>${Math.round((h.opacity??0.38)*100)}%</b></label>
        <input type="range" min="0" max="100" value="${Math.round((h.opacity??0.38)*100)}" oninput="setBgHighlight('opacity',+this.value/100);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
      </div>
      <div class="fld"><label>حجم الانتشار — <b>${h.size??30}%</b></label>
        <input type="range" min="0" max="100" value="${h.size??30}" oninput="setBgHighlight('size',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
      </div>
    </div>
    <div class="row">
      <div class="fld"><label>الموضع X — <b>${h.x??85}%</b></label>
        <input type="range" min="0" max="100" value="${h.x??85}" oninput="setBgHighlight('x',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
      </div>
      <div class="fld"><label>الموضع Y — <b>${h.y??0}%</b></label>
        <input type="range" min="0" max="100" value="${h.y??0}" oninput="setBgHighlight('y',+this.value);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
      </div>
    </div>`;
  }

  // Logos
  const logoHTML = `
    <div class="fld"><label>شعار المستخدم</label>
      <div class="drop" id="dropUser" role="button" tabindex="0" aria-label="رفع شعار المستخدم" onclick="pickFile('userLogo')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pickFile('userLogo')}">
        ${s.userLogo ? `<img class="pv" alt="معاينة شعار المستخدم" src="${esc(s.userLogo)}">`:''}
        <div class="pl">اسحب صورة هنا أو انقر للرفع</div>
        ${s.userLogo?`<button type="button" class="rm" onclick="event.stopPropagation();clearLogo('userLogo')">إزالة</button>`:''}
      </div>
    </div>
    ${posControls('userLogoPos',true)}
    <div class="fld" style="margin-top:18px;border-top:1px solid var(--ui-line);padding-top:14px"><label>شعار التقنية</label>
      <div class="drop" id="dropTech" role="button" tabindex="0" aria-label="رفع شعار التقنية" onclick="pickFile('techLogo')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();pickFile('techLogo')}">
        ${s.techLogo ? `<img class="pv" alt="معاينة شعار التقنية" src="${esc(s.techLogo)}">`:''}
        <div class="pl">اسحب صورة هنا أو انقر للرفع</div>
        ${s.techLogo?`<button type="button" class="rm" onclick="event.stopPropagation();clearLogo('techLogo')">إزالة</button>`:''}
      </div>
    </div>
    ${posControls('techLogoPos',false)}
    ${highlightControls()}
    <div class="fld"><label>أو رابط شعار التقنية (URL)</label><input type="text" value="${esc(s.techLogo)}" oninput="setField('techLogo',this.value)" placeholder="https://..."></div>`;

  const footHTML = `
    <div class="fld"><label>نص الفوتر (المعرّف)</label><input type="text" value="${esc(s.footer)}" oninput="setField('footer',this.value)"></div>
    <div class="fld"><label class="chk"><input type="checkbox" ${s.footerIcons!==false?'checked':''} onchange="setField('footerIcons',this.checked);renderSidebar()"> إظهار أيقونات التواصل</label></div>`;
  const codeHTML = `
    <div class="fld"><label>ثيم تلوين الكود</label>
      <div class="btn-group">
        <button type="button" class="mini-btn ${(s.codeTheme||'dark')==='dark'?'active':''}" onclick="setField('codeTheme','dark');renderSidebar()">داكن</button>
        <button type="button" class="mini-btn ${s.codeTheme==='light'?'active':''}" onclick="setField('codeTheme','light');renderSidebar()">فاتح</button>
        <button type="button" class="mini-btn ${s.codeTheme==='contrast'?'active':''}" onclick="setField('codeTheme','contrast');renderSidebar()">تباين عالي</button>
      </div>
    </div>
    <div class="fld"><label class="chk"><input type="checkbox" ${s.codeLineNumbers?'checked':''} onchange="setField('codeLineNumbers',this.checked);renderSidebar()"> إظهار أرقام الأسطر</label></div>`;
  const bgHighlightHTML = bgHighlightControls();

  // Page size + font scales
  const pageSizeOpts = Object.values(PAGE_SIZES).map(p=>
    `<option value="${p.id}" ${(s.pageSize||'auto')===p.id?'selected':''}>${p.label}</option>`
  ).join('');
  const fs = s.fontScales || defaultFontScales();
  const fontSliders = FONT_KEYS.map(f=>{
    const val = fs[f.k] ?? 1;
    const pct = Math.round(val*100);
    return `<div class="fld"><label>${f.nm} — <b>${pct}%</b> <span class="fs-base">(${f.base}px)</span></label>
      <input type="range" min="50" max="160" value="${pct}" oninput="setFontScale('${f.k}',this.value/100);this.previousElementSibling.querySelector('b').textContent=this.value+'%'">
    </div>`;
  }).join('');
  const layoutHTML = `
    <div class="fld"><label>أبعاد الصورة</label>
      <select onchange="setPageSize(this.value)">${pageSizeOpts}</select>
    </div>
    <div class="fld"><label>جودة التصدير (PNG)</label>
      <select onchange="setExportScale(this.value)">${EXPORT_SCALES.map(sc=>`<option value="${sc.v}" ${exportScale===sc.v?'selected':''}>${sc.label}</option>`).join('')}</select>
    </div>
    <div class="fld" style="margin-top:16px;border-top:1px solid var(--ui-line);padding-top:14px">
      <label style="display:flex;align-items:center;justify-content:space-between">
        <span>أحجام الخطوط</span>
        <button type="button" class="addbtn" style="width:auto;padding:4px 10px;margin:0;font-size:10px" onclick="resetFontScales()">إعادة الكل</button>
      </label>
    </div>
    ${fontSliders}
    <div class="fld"><div class="hint">كل عنصر قابل للتعديل من 50% إلى 160%. خط أصغر = مساحة أكبر للبطاقات = صفحات أقل.</div></div>`;

  const sb = document.getElementById('sidebar');
  const wasSearchFocused = document.activeElement && document.activeElement.id === 'sidebarSearch';
  const searchHTML = `<div class="sb-search"><svg class="sb-search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="search" id="sidebarSearch" placeholder="بحث في الأدوات..." value="${esc(sidebarSearchTerm)}" oninput="onSidebarSearch(this.value)" aria-label="بحث في أدوات اللوحة"></div>`;
  const navChips = SIDEBAR_SECTIONS.map(s=>{
    const cardCount = s.id==='card' && state.cards.length ? `<span class="chip-cnt">${state.cards.length}</span>` : '';
    return `<button type="button" class="sb-nav-chip" data-sec="${s.id}" onclick="jumpToSection('${s.id}')" aria-current="false"><span>${s.label}</span>${cardCount}</button>`;
  }).join('');
  const toolbarHTML = `<div class="sb-actions"><div class="sb-actions-row"><span class="sb-actions-label">أدوات سريعة</span><div class="sb-actions-btns"><button type="button" class="sb-mini" onclick="expandAllSections()" title="فتح كل الأقسام"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/><polyline points="6 4 12 10 18 4" opacity=".5"/></svg><span>فتح الكل</span></button><button type="button" class="sb-mini" onclick="collapseAllSections()" title="طي كل الأقسام"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/><polyline points="18 20 12 14 6 20" opacity=".5"/></svg><span>طي الكل</span></button></div></div><div class="sb-nav" id="sbNav" role="navigation" aria-label="انتقال سريع بين الأقسال">${navChips}</div></div>`;
  sb.innerHTML = searchHTML + toolbarHTML +
    sidebarSection('layout','الأبعاد',icons.theme,layoutHTML) +
    sidebarSection('lang','اللغة / القالب',icons.lang,presetHTML) +
    sidebarSection('color','الألوان',icons.color,colorHTML) +
    sidebarSection('theme','ثيم الخلفية',icons.theme,themeHTML) +
    sidebarSection('font','الخط',icons.font,fontHTML) +
    sidebarSection('bghl','إضاءة الخلفية',icons.bghl,bgHighlightHTML) +
    sidebarSection('title','العنوان والمقدمة',icons.title,titleHTML) +
    sidebarSection('card','البطاقات',icons.card,cardsHTML,s.cards.length) +
    sidebarSection('code','الكود',icons.code,codeHTML) +
    sidebarSection('logo','الشعارات',icons.logo,logoHTML) +
    sidebarSection('foot','الفوتر',icons.foot,footHTML);

  // restore search focus after re-render
  if(wasSearchFocused){
    const si = document.getElementById('sidebarSearch');
    if(si){ si.focus(); const len = si.value.length; si.setSelectionRange(len,len); }
  }
  // re-apply filter after re-render
  applySidebarFilter();

  // ensure open sections fully display their content after re-render
  openSections.forEach(id=>{
    const sec = document.getElementById('sec-'+id);
    if(!sec) return;
    const body = sec.querySelector('.sec-b');
    if(body) body.style.maxHeight = body.scrollHeight + 'px';
  });

  // wire scroll tracking + back-to-top (idempotent)
  setupSidebarScrollTracking();
  updateNavActive();

  // wire dropzones
  ['dropUser','dropTech'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    const key = id==='dropUser'?'userLogo':'techLogo';
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over')});
    el.addEventListener('dragleave',()=>el.classList.remove('over'));
    el.addEventListener('drop',e=>{
      e.preventDefault();el.classList.remove('over');
      const f=e.dataTransfer.files[0]; if(f) readImage(f,key);
    });
  });
}

// re-export so render-sidebar can schedule poster re-render without a cycle
