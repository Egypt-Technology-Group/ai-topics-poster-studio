// ---------- Mutations ----------
import { state, pushHistory } from './state.js';
import { PRESETS, TECH_LOGOS, defaultFontScales, setExportScaleValue } from './constants.js';
import { toast } from './utils.js';
import { renderAll, scheduleRender } from './render-orchestration.js';

export function applyPreset(key){
  const p = PRESETS[key];
  pushHistory();
  state.lang = key;
  state.colors['--red'] = p.red;
  state.colors['--red2'] = p.red2;
  state.theme = p.theme;
  state.badge = p.badge;
  state.techLogo = TECH_LOGOS[p.tech];
  state.logoHighlight = Object.assign({enabled:true,color:p.red,blur:25,opacity:0.35,x:0,y:0}, state.logoHighlight||{}, {enabled:true,color:p.red});
  state.bgHighlight = Object.assign({enabled:true,color:p.red,opacity:0.38,x:85,y:0,size:30}, state.bgHighlight||{}, {enabled:true,color:p.red});
  renderAll();
  toast('تم تطبيق قالب '+p.label);
}

// HSL → HEX helper
export function hslToHex(h,s,l){
  s/=100; l/=100;
  const k=n=>(n+h/30)%12;
  const a=s*Math.min(l,1-l);
  const f=n=>{const v=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return Math.round(255*v)};
  const toHex=x=>x.toString(16).padStart(2,'0');
  return '#'+toHex(f(0))+toHex(f(8))+toHex(f(4));
}

// Generate a harmonious palette from a random base hue
export function randomPalette(){
  pushHistory();
  const h = Math.floor(Math.random()*360);
  const base = hslToHex(h, 70, 60);
  const accent = hslToHex((h+30)%360, 65, 55);
  const cyan = hslToHex((h+180)%360, 60, 65);
  state.colors['--red'] = base;
  state.colors['--red2'] = accent;
  state.colors['--cyan'] = cyan;
  // sync highlight colors
  if(state.logoHighlight) state.logoHighlight.color = base;
  if(state.bgHighlight) state.bgHighlight.color = base;
  renderAll();
  toast('تم توليد لوحة ألوان جديدة');
}

export function setColor(k,v){
  if(!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return;
  state.colors[k]=v;
  // sync both inputs
  document.querySelectorAll(`[data-cv="${k}"]`).forEach(el=>{if(el.value.toLowerCase()!==v.toLowerCase())el.value=v});
  document.querySelectorAll(`[data-cvh="${k}"]`).forEach(el=>{if(el.value.toLowerCase()!==v.toLowerCase())el.value=v});
  scheduleRender();
}

export function setTheme(t){ pushHistory(); state.theme=t; renderAll(); }
export function setLayout(v){ pushHistory(); state.layout=v; renderAll(); }
export function setFontFamily(v){ pushHistory(); state.fontFamily=v; renderAll(); }
export function setPageSize(v){ pushHistory(); state.pageSize=v; renderAll(); }
export function setExportScale(v){ setExportScaleValue(v); toast('جودة التصدير: '+v+'x'); }

export function setFontScale(key,v){
  if(!state.fontScales) state.fontScales=defaultFontScales();
  state.fontScales[key]=+v;
  scheduleRender();
}

export function resetFontScales(){ pushHistory(); state.fontScales=defaultFontScales(); renderAll(); toast('تم إعادة أحجام الخطوط الافتراضية'); }

export function setField(k,v){ state[k]=v; scheduleRender(); }
export function setCard(i,k,v){ state.cards[i][k]=v; scheduleRender(); if(k==='number'||k==='title') refreshCardHeader(i); }
export function toggleCardProp(i,k){ state.cards[i][k]=!state.cards[i][k]; scheduleRender(); }

export function resetCardStyle(i){ pushHistory(); ['bg','bgOpacity','borderColor','borderWidth','radius'].forEach(k=>state.cards[i][k]=''); renderAll(); toast('تم إعادة مظهر البطاقة'); }

export function refreshCardHeader(i){ const ci=document.getElementById('ci-'+i); if(!ci)return; ci.querySelector('.num').textContent=state.cards[i].number||'?'; ci.querySelector('.tt').textContent=state.cards[i].title||'بدون عنوان'; }

export function addCard(){ pushHistory(); state.cards.push({number:String(state.cards.length+1).padStart(2,'0'),title:'New Card',type:'code',ar:'',codeLang:'JSX',code:'',rawCode:false,noteTitle:'',noteText:'',span:'auto',compact:false,collapsed:false,bg:'',bgOpacity:'',borderColor:'',borderWidth:'',radius:''}); renderAll(); }
export function delCard(i){ pushHistory(); state.cards.splice(i,1); renderAll(); }
export function moveCard(i,dir){ const j=i+dir; if(j<0||j>=state.cards.length)return; pushHistory(); const a=state.cards; [a[i],a[j]]=[a[j],a[i]]; renderAll(); }
export function duplicateCard(i){ pushHistory(); const c=state.cards[i]; const copy=JSON.parse(JSON.stringify(c)); copy.number=String(state.cards.length+1).padStart(2,'0'); state.cards.splice(i+1,0,copy); renderAll(); toast('تم تكرار البطاقة'); }

// Ready-made card templates
export const CARD_TEMPLATES = {
  code: { number:'01', title:'New Code Card', type:'code', ar:'', codeLang:'JSX', code:'', rawCode:false, noteTitle:'متى تستخدمه؟', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  tip: { number:'01', title:'New Tip', type:'tip', ar:'', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  warning: { number:'01', title:'تحذير', type:'warning', ar:'تنبيه على ممارسة خاطئة أو فخ شائع.', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  info: { number:'01', title:'معلومة', type:'info', ar:'معلومة إضافية أو سياق مهم.', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  compare: { number:'01', title:'Comparison', type:'code', ar:'مقارنة بين نهجين.', codeLang:'JSX', code:'// Approach A\nconst a = ...\n\n// Approach B\nconst b = ...', rawCode:false, noteTitle:'أيهما أفضل؟', noteText:'استخدم A في الحالة X، و B في الحالة Y.', span:'full', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  minimal: { number:'01', title:'New Mini', type:'minimal', ar:'نص مختصر.', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  minicode: { number:'01', title:'Mini Code', type:'minicode', ar:'', codeLang:'JSX', code:'// small snippet', rawCode:false, noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  text: { number:'01', title:'', type:'text', ar:'نص مختصر بدون عنوان.', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
  heading: { number:'01', title:'Heading', type:'heading', ar:'شرح مختصر تحت العنوان.', noteTitle:'', noteText:'', span:'auto', compact:false, collapsed:false, bg:'', bgOpacity:'', borderColor:'', borderWidth:'', radius:'' },
};

export function addCardFromTemplate(key){
  const tpl = CARD_TEMPLATES[key];
  if(!tpl) return;
  pushHistory();
  const copy = JSON.parse(JSON.stringify(tpl));
  copy.number = String(state.cards.length+1).padStart(2,'0');
  state.cards.push(copy);
  renderAll();
  toast('تمت إضافة بطاقة ' + (key==='code'?'كود':key==='tip'?'نصيحة':key==='warning'?'تحذير':key==='info'?'معلومة':key==='minimal'?'بسيطة':key==='minicode'?'كود بسيط':key==='text'?'نص فقط':key==='heading'?'عنوان + نص':'مقارنة'));
}

export function toggleCard(i){ const ci=document.getElementById('ci-'+i); if(ci) ci.classList.toggle('collapsed'); }
export function clearLogo(k){ pushHistory(); state[k]=''; renderAll(); }

export function setLogoPos(key, field, val){
  if(!state[key]) state[key]={pos:field==='pos'?val:'auto-tl',size:210,dx:0,dy:0};
  state[key][field]=val;
  scheduleRender();
}

export function resetLogoPos(key){
  pushHistory();
  state[key] = key==='userLogoPos'
    ? {pos:"auto-tl",size:210,dx:0,dy:0}
    : {pos:"tr",size:230,dx:45,dy:50};
  renderAll();
  toast('تم إعادة الموضع الافتراضي');
}

export function setLogoHighlight(k,v){
  if(!state.logoHighlight) state.logoHighlight = { enabled:true, color:'#61dafb', blur:25, opacity:0.35, x:0, y:0 };
  if(k==='enabled') state.logoHighlight.enabled = !!v;
  else if(k==='blur') state.logoHighlight.blur = +v;
  else if(k==='opacity') state.logoHighlight.opacity = +v;
  else if(k==='color'){
    let c = (v||'').trim().toLowerCase();
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(c);
    const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    if(short) c='#'+short[1]+short[1]+short[2]+short[2]+short[3]+short[3];
    else if(full) c='#'+full[1]+full[2]+full[3];
    state.logoHighlight.color = c;
  }
  else state.logoHighlight[k] = v;
  scheduleRender();
  // sync color inputs in sidebar without full re-render
  if(k==='color'){
    const cell = document.querySelector('.color-cell.hl-color');
    const c = state.logoHighlight.color;
    if(cell){ cell.querySelector('input[type=color]').value=c; cell.querySelector('.hex').value=c; }
  }
}

export function setBgHighlight(k,v){
  if(!state.bgHighlight) state.bgHighlight = { enabled:true, color:'#61dafb', opacity:0.38, x:85, y:0, size:30 };
  if(k==='enabled') state.bgHighlight.enabled = !!v;
  else if(k==='color'){
    let c = (v||'').trim().toLowerCase();
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(c);
    const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    if(short) c='#'+short[1]+short[1]+short[2]+short[2]+short[3]+short[3];
    else if(full) c='#'+full[1]+full[2]+full[3];
    state.bgHighlight.color = c;
  }
  else state.bgHighlight[k] = +v;
  scheduleRender();
  if(k==='color'){
    const cell = document.querySelector('.color-cell.bg-hl-color');
    const c = state.bgHighlight.color;
    if(cell){ cell.querySelector('input[type=color]').value=c; cell.querySelector('.hex').value=c; }
  }
}

export function pickFile(key){ const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.onchange=()=>{ if(inp.files[0]) readImage(inp.files[0],key); }; inp.click(); }
export function readImage(file,key){
  const r=new FileReader();
  r.onload=()=>{ pushHistory(); state[key]=r.result; renderAll(); toast('تم رفع الصورة'); };
  r.readAsDataURL(file);
}
