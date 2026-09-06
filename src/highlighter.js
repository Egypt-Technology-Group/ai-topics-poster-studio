// ---------- Code highlighter ----------
import { esc } from './utils.js';

const KW = {
  php:['use','function','return','if','else','elseif','foreach','for','while','class','public','private','protected','static','new','try','catch','throw','namespace','as','null','true','false','echo','print','isset','unset','require','require_once','include','extends','implements','interface','abstract','final','const','global','array','int','string','bool','float','void','self','parent','this'],
  js:['const','let','var','function','return','if','else','for','while','class','new','try','catch','throw','async','await','import','export','from','default','null','true','false','undefined','typeof','instanceof','this','yield','switch','case','break','continue','do','in','of','delete','void','static','extends','super'],
  jsx:['const','let','var','function','return','if','else','for','while','class','new','try','catch','throw','async','await','import','export','from','default','null','true','false','undefined','typeof','this','yield','switch','case','break','continue','useState','useEffect','useRef','useMemo','useCallback','useContext','do','in','of','extends','super'],
  vue:['const','let','ref','reactive','computed','watch','watchEffect','function','return','if','else','import','export','from','default','null','true','false','this','async','await','defineProps','defineEmits','defineExpose','template','script','setup','onMounted','onUnmounted','do','for','while','class'],
  css:[], html:[], bash:['const','let','function','return','if','then','fi','for','do','done','echo','export','sudo','npm','php','artisan','composer'],
};
export function highlightCode(code, lang){
  if(code==null) return '';
  // raw HTML mode
  if(typeof code==='string' && /<span\s/i.test(code)) return code;
  const src = String(code);
  const K = KW[lang] || KW.js;
  const re = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\$\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
  let out='', m;
  while((m=re.exec(src))){
    const t=m[0];
    if(m[1]) out+='<span class="comment">'+esc(t)+'</span>';
    else if(m[2]) out+='<span class="str">'+esc(t)+'</span>';
    else if(m[3]) out+='<span class="var">'+esc(t)+'</span>';
    else if(m[4]) out+='<span class="cyan">'+esc(t)+'</span>';
    else if(m[5]){
      const nxt=src[re.lastIndex];
      if(K.includes(t)) out+='<span class="k">'+esc(t)+'</span>';
      else if(nxt==='(') out+='<span class="fn">'+esc(t)+'</span>';
      else if(/^[A-Z]/.test(t)) out+='<span class="red">'+esc(t)+'</span>';
      else out+='<span class="var">'+esc(t)+'</span>';
    }
    else out+=esc(t);
  }
  return out;
}
// Wrap each source line in a .ln-line span for CSS line-number counters
export function highlightCodeLines(code, lang){
  const src = String(code==null?'':code);
  if(/<span\s/i.test(src)) return src; // raw HTML mode — skip line wrapping
  return src.split('\n').map(line=>`<span class="ln-line">${highlightCode(line, lang)}</span>`).join('\n');
}
