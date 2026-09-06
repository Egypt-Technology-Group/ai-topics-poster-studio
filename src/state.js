// ---------- State ----------
import { DEFAULT_USER_LOGO } from './default-logo.js';
import { TECH_LOGOS, defaultFontScales } from './constants.js';

export function defaultState(){
  return {
    lang:"react",
    layout:"classic",
    pageSize:"auto",
    fontScales:defaultFontScales(),
    colors:{ "--bg":"#050811","--red":"#61dafb","--red2":"#2a9ec4","--cyan":"#35d6df","--white":"#f4f5f7","--muted":"#b9bec9","--panel":"#0b101a","--panel2":"#101722" },
    theme:"theme-react",
    fontFamily:"Inter",
    badge:"REACT",
    titleMain:"RACE",
    titleAccent:"CONDITIONS",
    subtitle:"CONCURRENCY & LOCKS",
    intro:"في المشاريع الكبيرة، الطلبات المتزامنة قد تسبب خصمًا مكررًا،\nبيع مخزون أكثر من المتاح، أو تنفيذ نفس العملية أكثر من مرة.",
    userLogo: DEFAULT_USER_LOGO,
    techLogo: TECH_LOGOS.react,
    userLogoPos:{ pos:"auto-tl", size:210, dx:0, dy:0 },
    techLogoPos:{ pos:"tr", size:230, dx:45, dy:50 },
    logoHighlight:{ enabled:true, color:"#61dafb", blur:25, opacity:0.35, x:0, y:0 },
    bgHighlight:{ enabled:true, color:"#61dafb", opacity:0.38, x:85, y:0, size:30 },
    footer:"@egyitech",
    titleAlign:"center",
    badgeStyle:"rect",
    titleWeight:1000,
    titleSpacing:0,
    codeTheme:"dark",
    codeLineNumbers:false,
    footerIcons:true,
    cards:[
      { number:"01", title:"Functional Updates", ar:"استخدم التحديث الدالي لمنع التضارب عند عدة تحديثات متتالية للحالة.",
        type:"code", codeLang:"JSX", code:"const [count, setCount] = useState(0);\n\n// Always use the functional form\nsetCount(c => c + 1);", rawCode:false,
        noteTitle:"متى تستخدمه؟", noteText:"معالجة المدفوعات، تنفيذ الطلبات، Webhooks، ومنع العمليات المكررة." }
    ]
  };
}

// `state` is a live binding — reassignments must go through setState()
// so all importers see the new value.
export let state = defaultState();
export function setState(v){ state = v; }

export const history = [];
export const future = [];

export function snapshot(){
  return JSON.stringify(state);
}
export function pushHistory(){
  history.push(snapshot());
  if(history.length>60) history.shift();
  future.length = 0;
  updateHistBtns();
}
export function updateHistBtns(){
  document.getElementById('btnUndo').disabled = history.length<1;
  document.getElementById('btnRedo').disabled = future.length<1;
  updateDirtyStatus();
}
export function updateDirtyStatus(){
  const el = document.getElementById('brandStatus');
  if(!el) return;
  const dirty = history.length > 0 || future.length > 0;
  el.classList.toggle('dirty', dirty);
  el.title = dirty ? 'توجد تغييرات غير محفوظة' : 'لا توجد تغييرات غير محفوظة';
}
export function clearDirtyStatus(){
  const el = document.getElementById('brandStatus');
  if(el){ el.classList.remove('dirty'); el.title='لا توجد تغييرات غير محفوظة'; }
}
export function undo(){
  if(!history.length) return;
  future.push(snapshot());
  setState(JSON.parse(history.pop()));
  renderAll(); updateHistBtns();
}
export function redo(){
  if(!future.length) return;
  history.push(snapshot());
  setState(JSON.parse(future.pop()));
  renderAll(); updateHistBtns();
}

// Set by init.js to break the circular dependency.
let renderAll = ()=>{};
export function setRenderAll(fn){ renderAll = fn; }
