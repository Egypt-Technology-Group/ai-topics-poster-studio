// ---------- Agent paste (AI-generated designs) ----------
import { toast } from './utils.js';
import { clearDirtyStatus } from './state.js';
import { applyLoadedState } from './save-load.js';

export const AGENT_SPEC = `# تعليمات تصميم بوستر — AI Topics Poster Editor

## الدور

أنت مصمّم بوستر تقني. مهمتك الوحيدة: إخراج **كائن JSON واحد صالح** يطابق المخطط أدناه.

## قاعدة الإخراج (إلزامية)

- أخرج **JSON خامًا فقط** — بلا شرح، بلا مقدمة، بلا خاتمة.
- يُقبَل لفّه بـ \`\`\`json ... \`\`\` لكن دون أي نص خارج اللفّ.
- لا تخرج Markdown آخر، ولا تعليقات، ولا نصًا عربيًا حول الكود.
- كل الحقول اختيارية؛ الحقول الناقصة تأخذ قيمًا افتراضية. لكن يُنصح بملء الحقول الأساسية الموسومة بـ★.

## المخطط المرجعي

\`\`\`json
{
  "lang": "react",
  "pageSize": "auto",
  "fontFamily": "Inter",
  "fontScales": { "badge":1, "tips":1, "subtitle":1, "intro":1, "number":1, "cardTitle":1, "cardBody":1, "code":1, "noteTitle":1, "noteText":1, "footer":1 },
  "theme": "theme-react",
  "badge": "REACT",
  "badgeStyle": "rect",
  "titleAlign": "center",
  "titleWeight": 1000,
  "titleSpacing": 0,
  "titleMain": "HOOKS",
  "titleAccent": "DEEP DIVE",
  "subtitle": "STATE & EFFECTS",
  "intro": "مقدمة عربية قصيرة من سطر أو سطرين تمهّد للموضوع.",
  "footer": "@egyitech",
  "footerIcons": true,
  "codeTheme": "dark",
  "codeLineNumbers": false,
  "colors": { "--red": "#61dafb", "--red2": "#2a9ec4" },
  "techLogo": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "userLogo": "",
  "userLogoPos": { "pos": "auto-tl", "size": 210, "dx": 0, "dy": 0 },
  "techLogoPos": { "pos": "tr", "size": 230, "dx": 45, "dy": 50 },
  "logoHighlight": { "enabled": true, "color": "#61dafb", "blur": 25, "opacity": 0.35, "x": 0, "y": 0 },
  "bgHighlight": { "enabled": true, "color": "#61dafb", "opacity": 0.38, "x": 85, "y": 0, "size": 30 },
  "cards": [
    {
      "number": "01",
      "title": "Card Title (English)",
      "ar": "شرح عربي موجز للنقطة.",
      "type": "code",
      "codeLang": "jsx",
      "code": "const x = 1;",
      "rawCode": false,
      "noteTitle": "متى تستخدمه؟",
      "noteText": "ملاحظة عربية إرشادية قصيرة.",
      "span": "auto",
      "compact": false,
      "collapsed": false,
      "bg": "",
      "bgOpacity": "",
      "borderColor": "",
      "borderWidth": "",
      "radius": ""
    }
  ]
}
\`\`\`

## الحقول العلوية

|| الحقل | النوع | الوصف |
||-------|------|--------|
|| ★ \`lang\` | string | قالب التقنية: \`laravel\` \`vue\` \`react\` \`js\` \`css\` \`php\` \`tailwind\` \`bootstrap\` \`flutter\`. يضبط الثيم واللونين الأساسيين (\`--red\`/\`--red2\`) والشارة وشعار التقنية تلقائيًا. أي حقل تكتبه صراحةً يتغلب على القالب. |
|| \`pageSize\` | string | أبعاد الصورة: \`auto\` (يتمدد) \`sq1\` (900×900) \`portrait45\` (900×1125) \`tall23\` (900×1350) \`story916\` (900×1600) \`ig\` (Instagram feed 4:5). عند بُعد ثابت، المحتوى الزائد يُقسَّم تلقائيًا على صفحات متعددة. |
|| \`fontFamily\` | string | خط البوستر: \`Inter\` \`Cairo\` \`Oswald\` \`Bebas Neue\` \`Playfair Display\` \`Orbitron\`. الافتراضي \`Inter\`. |
|| \`fontScales\` | object | تحكم منفصل بحجم كل عنصر نصي (من \`0.5\` إلى \`1.6\`). المفاتيح: \`badge\` \`tips\` \`subtitle\` \`intro\` \`number\` \`cardTitle\` \`cardBody\` \`code\` \`noteTitle\` \`noteText\` \`footer\`. مفتاح \`tips\` = العنوان الرئيسي. خط أصغر = مساحة أكبر للبطاقات = صفحات أقل. |
|| \`theme\` | string | الثيم البصري: \`theme-laravel\` \`theme-react\` \`theme-vue\` \`theme-js\` \`theme-css\` \`theme-php\` \`theme-tailwind\` \`theme-bootstrap\` \`theme-flutter\` \`theme-dots\` \`theme-curves\` \`theme-gradient\` \`theme-glow\` \`theme-particles\` \`theme-hexagon\` \`theme-mesh\` \`theme-aurora\` \`theme-waves\` \`theme-minimal\` \`theme-grid\`. |
|| ★ \`badge\` | string | شارة صغيرة أعلى البوستر (بالإنجليزية، أحرف كبيرة). |
|| \`badgeStyle\` | string | نمط الشارة: \`rect\` (مستطيل) \`pill\` (حبة) \`bar\` (شريط). |
|| \`titleAlign\` | string | محاذاة العنوان: \`center\` \`left\` \`right\`. |
|| \`titleWeight\` | number | وزن خط العنوان: \`400\` \`700\` \`900\` \`1000\`. |
|| \`titleSpacing\` | number | تباعد أحرف العنوان بالبكسل (من \`0\` إلى \`20\`). القيم السالبة تُقطَع إلى \`0\`. |
|| ★ \`titleMain\` / \`titleAccent\` | string | العنوان الرئيسي على سطرين (بالإنجليزية، قصير وقوي). |
|| \`subtitle\` | string | سطر فرعي إنجليزي قصير. |
|| ★ \`intro\` | string | مقدمة عربية (RTL) — استخدم \\n للأسطر. |
|| \`footer\` | string | توقيع أسفل البوستر. |
|| \`footerIcons\` | boolean | \`true\` لإظهار أيقونات التواصل بجانب الفوتر. |
|| \`codeTheme\` | string | ثيم تلوين الكود: \`dark\` \`light\` \`contrast\`. |
|| \`codeLineNumbers\` | boolean | \`true\` لإظهار أرقام الأسطر في كتل الكود. |
|| \`colors\` | object | ألوان مخصصة اختيارية — اكتب فقط ما تريد تغييره (تُدمج مع الافتراضيات): \`--bg\` \`--red\` \`--red2\` \`--cyan\` \`--white\` \`--muted\` \`--panel\` \`--panel2\`. |
|| \`techLogo\` | string | رابط شعار التقنية (URL أو data-URI). يُشتق تلقائيًا من \`lang\`؛ اكتبه فقط لشعار مخصص. |
|| \`userLogo\` | string | شعار الحساب/القناة (URL أو data-URI). اتركه فارغًا/خارج JSON ليُستخدم الشعار الافتراضي. |
|| \`userLogoPos\` | object | موضع شعار المستخدم: \`pos\` = \`auto-tl\` (أعلى اليسار ضمن التدفق — الطبيعي) أو زاوية مطلقة \`tl\` \`tr\` \`bl\` \`br\`؛ \`size\` بالبكسل (60–400)؛ \`dx\` \`dy\` إزاحة بالبكسل. |
|| \`techLogoPos\` | object | موضع شعار التقنية: \`pos\` = \`tr\` (أعلى يمين — الافتراضي) أو \`tl\` \`bl\` \`br\`؛ \`size\` بالبكسل (60–400)؛ \`dx\` \`dy\` إزاحة بالبكسل. |
|| \`logoHighlight\` | object | توهج خلف شعار التقنية: \`enabled\` \`color\` (hex) \`blur\` (0–80px) \`opacity\` (0–1) \`x\` \`y\` (إزاحة بالبكسل). |
|| \`bgHighlight\` | object | إضاءة زاوية خلفية البوستر: \`enabled\` \`color\` (hex) \`opacity\` (0–1) \`x\` \`y\` (موضع 0–100%) \`size\` (انتشار 0–100%). |

## البطاقات (cards)

### الحقول المشتركة لكل بطاقة

- \`number\`: رقم البطاقة "01"، "02"... (يظهر فقط في نوع \`code\`).
- \`title\`: عنوان البطاقة — إنجليزي أو عربي. اتجاه الكرت يُضبط تلقائيًا حسب أول حرف: عربي → RTL، إنجليزي → LTR. لا حقل اتجاه مطلوب.
- \`ar\`: شرح عربي (سطر إلى ثلاثة). استخدم \\n للأسطر.
- \`type\`: نوع البطاقة — انظر الجدول أدناه. الافتراضي \`code\`.
- \`codeLang\`: لغة التلوين — \`laravel\` \`vue\` \`react\` \`js\` \`jsx\` \`css\` \`html\` \`php\` \`tailwind\` \`bootstrap\` \`flutter\` \`python\` \`typescript\` \`bash\` \`sql\` \`json\` \`markdown\`.
- \`code\`: الكود (استخدم \\n للأسطر). التلوين تلقائي.
- \`rawCode\`: \`true\` فقط لكتابة HTML ملوّن يدويًا بـ \`<span>\`. اتركه \`false\`.
- \`noteTitle\` / \`noteText\`: ملاحظة عربية اختيارية أسفل البطاقة.
- \`span\`: عرض البطاقة: \`auto\` (تلقائي) \`full\` (كامل العرض) \`half\` (نصف — بطاقتان نصفيتان بجانب بعضهما).
- \`compact\`: \`true\` لتصغير الحشو والهوامش وتوفير مساحة رأسية.
- \`collapsed\`: \`true\` لطي الكود (يظهر أول ~3 أسطر مع تدرّج) — مفيد للكود الطويل.
- \`bg\`: لون خلفية مخصص للبطاقة (hex). فارغ = افتراضي.
- \`bgOpacity\`: شفافية الخلفية من \`0\` إلى \`100\` (\`100\` = معتم).
- \`borderColor\`: لون حدود مخصص (hex). فارغ = افتراضي.
- \`borderWidth\`: عرض الحدود بالبكسل (من \`0\` إلى \`6\`).
- \`radius\`: نصف قطر الزوايا بالبكسل (من \`0\` إلى \`40\`).

### أنواع البطاقات (\`type\`)

| \`type\` | المحتوى المعروض | العرض الافتراضي | الاستخدام |
|--------|------------------|------------------|-----------|
| \`code\` | رقم + عنوان + شرح عربي + كود + ملاحظة | \`full\` | البطاقة الرئيسية مع كود. |
| \`tip\` | أيقونة مصباح + عنوان + شرح عربي + ملاحظة | \`half\` | نقطة نظرية أو نصيحة موجزة. |
| \`warning\` | أيقونة تحذير + عنوان + شرح عربي + ملاحظة | \`half\` | ممارسة خاطئة أو فخ شائع. |
| \`info\` | أيقونة معلومة + عنوان + شرح عربي + ملاحظة | \`half\` | معلومة إضافية أو سياق. |
| \`minimal\` | عنوان + شرح عربي + ملاحظة (بلا رقم/أيقونة) | \`half\` | نقطة نظيفة بلا زخرفة. |
| \`minicode\` | عنوان اختياري + كود + ملاحظة (بلا رقم) | \`half\` | مقطع كود قصير بلا شرح عربي. |
| \`text\` | شرح عربي فقط | \`half\` | فقرة نصية حرّة. |
| \`heading\` | عنوان اختياري + شرح عربي اختياري | \`half\` | فاصل/عنوان فرعي. |

> ملاحظة: عند \`span: "auto"\`، الأنواع \`tip\`/\`warning\`/\`info\`/\`minimal\`/\`minicode\`/\`text\`/\`heading\` والبطاقات بلا كود → نصف عرض. نوع \`code\` بكود → كامل عرض.

## قواعد التصميم

1. **عدد البطاقات**: من 2 إلى 4 كحد أقصى — البوستر يطول مع كل بطاقة.
2. **العناوين الإنجليزية**: قصيرة (كلمتان كحد أقصى لكل سطر).
3. **اللغة والاتجاه**: المقدمة (\`intro\`) ونصوص البطاقات (\`ar\`) والملاحظات (\`noteTitle\`/\`noteText\`) **بالعربية دائمًا** (RTL). العناوين والكود والشارة بالإنجليزية غالبًا — يجوز عنوان عربي والاتجاه يُضبط تلقائيًا. الكود يبقى LTR دائمًا.
4. **الكود**: قصير (حتى ~10 أسطر)، واقعي، وصحيح نحويًا.
5. **تنويع البطاقات**: استخدم \`tip\` للنقاط النظرية، \`warning\` للممارسات الخاطئة، \`info\` للمعلومات الإضافية، \`minimal\`/\`text\`/\`heading\` للتنظيم البصري، \`minicode\` لمقاطع الكود القصيرة.
6. **اختيار \`lang\`**: اختر القالب المطابق لموضوع البوستر؛ إن لم يكن له قالب استخدم \`colors\` مخصصة مع ثيم مناسب.
7. **الإخراج**: JSON خام صالح فقط — بلا شرح، بلا markdown إضافي (يُقبَل \`\`\`json فقط).
`;

export function openAgentModal(){
  const m=document.getElementById('agentModal');
  m.hidden=false;
  document.getElementById('agentError').hidden=true;
  document.getElementById('agentInput').focus();
}
export function closeAgentModal(){ document.getElementById('agentModal').hidden=true; }
export function applyAgentJSON(){
  const errEl=document.getElementById('agentError');
  let raw=document.getElementById('agentInput').value.trim();
  if(!raw){ errEl.textContent='الصق كود JSON أولًا'; errEl.hidden=false; return; }
  const fence=/^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(raw);
  if(fence) raw=fence[1];
  let loaded;
  try{ loaded=JSON.parse(raw); }
  catch(e){ errEl.textContent='JSON غير صالح: '+e.message; errEl.hidden=false; return; }
  if(!loaded||typeof loaded!=='object'||Array.isArray(loaded)){ errEl.textContent='يجب أن يكون المحتوى كائن JSON'; errEl.hidden=false; return; }
  applyLoadedState(loaded);
  closeAgentModal();
  toast('تم تطبيق تصميم الوكيل');
  clearDirtyStatus();
}
export function copyAgentSpec(){
  const done=()=>toast('تم نسخ التعليمات — أعطها للوكيل');
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(AGENT_SPEC).then(done).catch(()=>fallbackCopySpec(done));
  } else fallbackCopySpec(done);
}
export function fallbackCopySpec(done){
  const t=document.createElement('textarea');
  t.value=AGENT_SPEC; t.style.position='fixed'; t.style.opacity='0';
  document.body.appendChild(t); t.select();
  try{ document.execCommand('copy'); done(); }catch(e){ toast('تعذّر النسخ'); }
  document.body.removeChild(t);
}
