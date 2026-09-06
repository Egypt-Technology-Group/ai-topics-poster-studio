// ---------- Save / Load ----------
import { state, setState, pushHistory, defaultState, clearDirtyStatus, history, future, updateHistBtns } from './state.js';
import { PRESETS, TECH_LOGOS, FONT_KEYS, defaultFontScales } from './constants.js';
import { toast } from './utils.js';
import { renderAll } from './render-orchestration.js';

export function saveJSON(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`poster-${(state.badge||'ai-topics').toLowerCase().replace(/\s+/g,'-')}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('تم حفظ المشروع');
  clearDirtyStatus();
}

export function applyLoadedState(loaded){
  pushHistory();
  const d=defaultState();
  // 'lang' applies the matching preset as base defaults — explicit JSON fields still win
  if(loaded.lang && PRESETS[loaded.lang]){
    const p=PRESETS[loaded.lang];
    d.theme=p.theme; d.badge=p.badge; d.techLogo=TECH_LOGOS[p.tech];
    d.colors['--red']=p.red; d.colors['--red2']=p.red2;
    d.logoHighlight.color=p.red; d.bgHighlight.color=p.red;
  }
  // capture preset-aware nested defaults before Object.assign replaces references
  const baseColors=Object.assign({},d.colors);
  const baseFontScales=Object.assign({},d.fontScales);
  const baseLH=Object.assign({},d.logoHighlight);
  const baseBH=Object.assign({},d.bgHighlight);
  const merged=Object.assign(d,loaded);
  // deep-merge nested objects so partial JSON keeps defaults
  merged.colors=Object.assign(baseColors, loaded.colors||{});
  merged.fontScales=Object.assign(baseFontScales, loaded.fontScales||{});
  merged.userLogoPos=Object.assign({pos:"auto-tl",size:210,dx:0,dy:0}, loaded.userLogoPos||{});
  merged.techLogoPos=Object.assign({pos:"tr",size:230,dx:45,dy:50}, loaded.techLogoPos||{});
  merged.logoHighlight=Object.assign(baseLH, loaded.logoHighlight||{});
  merged.bgHighlight=Object.assign(baseBH, loaded.bgHighlight||{});
  // backfill fields for older projects
  if(!merged.fontFamily) merged.fontFamily='Inter';
  (merged.cards||[]).forEach(c=>{
    if(!c.type) c.type='code';
    if(!c.span) c.span='auto';
    if(c.compact==null) c.compact=false;
    if(c.collapsed==null) c.collapsed=false;
    if(c.bg==null) c.bg='';
    if(c.bgOpacity==null) c.bgOpacity='';
    if(c.borderColor==null) c.borderColor='';
    if(c.borderWidth==null) c.borderWidth='';
    if(c.radius==null) c.radius='';
  });
  // backfill page size + font scale for old projects
  if(!merged.pageSize) merged.pageSize='auto';
  if(!merged.fontScales) merged.fontScales=defaultFontScales();
  // backfill title/badge customization for old projects
  if(!merged.titleAlign) merged.titleAlign='center';
  if(!merged.badgeStyle) merged.badgeStyle='rect';
  if(merged.titleWeight==null) merged.titleWeight=1000;
  if(merged.titleSpacing==null) merged.titleSpacing=0;
  if(merged.titleSpacing < 0) merged.titleSpacing = 0;
  // backfill code/footer customization for old projects
  if(!merged.codeTheme) merged.codeTheme='dark';
  if(merged.codeLineNumbers==null) merged.codeLineNumbers=false;
  if(merged.footerIcons==null) merged.footerIcons=true;
  if(merged.fontScale!=null && !merged.fontScales){ // migrate old single-scale
    merged.fontScales=defaultFontScales();
    FONT_KEYS.forEach(f=>merged.fontScales[f.k]=merged.fontScale);
  }
  setState(merged);
  renderAll();
}

export function loadJSON(file){
  const r=new FileReader();
  r.onload=()=>{ try{
    applyLoadedState(JSON.parse(r.result));
    toast('تم تحميل المشروع');
    clearDirtyStatus();
  }catch(e){ toast('ملف غير صالح'); } };
  r.readAsText(file);
}

export function newProject(){
  if(confirm('بدء مشروع جديد؟ سيتم فقدان التعديلات غير المحفوظة.')){
    pushHistory();
    setState(defaultState());
    history.length=0; future.length=0;
    renderAll();
    updateHistBtns();
    clearDirtyStatus();
    toast('مشروع جديد');
  }
}
