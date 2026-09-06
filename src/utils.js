// ---------- Utils ----------
export function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// Detect base direction of a text from its first strong character (Arabic/Hebrew → rtl)
export function textDir(t){
  const m = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]|[A-Za-z]/.exec(String(t||''));
  if(!m) return 'rtl';
  return /[A-Za-z]/.test(m[0]) ? 'ltr' : 'rtl';
}
export function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200); }
export function hexToRgb(hex){
  const m = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex) || /#?([a-f\d])([a-f\d])([a-f\d])/i.exec(hex);
  if(!m) return null;
  const f = (i)=> parseInt(m[i].length===1 ? m[i]+m[i] : m[i], 16);
  return { r:f(1), g:f(2), b:f(3) };
}
export function hexToRgba(hex, opacity){
  const rgb = hexToRgb(hex);
  if(!rgb) return hex;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
}
