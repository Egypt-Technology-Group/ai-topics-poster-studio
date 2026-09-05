# تعليمات تصميم بوستر لأداة AI Topics Poster Editor

انسخ هذا الملف كاملًا وأعطِه لأي وكيل ذكاء اصطناعي، ثم اطلب منه تصميم بوستر لموضوعك. سيُخرج JSON تلصقه في زر **«لصق من الوكيل»** داخل الواجهة.

---

أنت تصمّم بوسترًا تقنيًا. أخرج **JSON واحدًا فقط** (بدون أي نص إضافي) يطابق المخطط التالي. كل الحقول اختيارية — الحقول الناقصة تأخذ قيمًا افتراضية — لكن يُنصح بملء الحقول الأساسية.

## المخطط

```json
{
  "lang": "react",
  "pageSize": "auto",
  "fontScales": { "badge":1, "tips":1, "subtitle":1, "intro":1, "number":1, "cardTitle":1, "cardBody":1, "code":1, "noteTitle":1, "noteText":1, "footer":1 },
  "theme": "theme-react",
  "badge": "REACT",
  "badgeStyle": "rect",
  "titleAlign": "center",
  "titleWeight": 1000,
  "titleSpacing": -5,
  "titleMain": "HOOKS",
  "titleAccent": "DEEP DIVE",
  "subtitle": "STATE & EFFECTS",
  "intro": "مقدمة عربية قصيرة من سطر أو سطرين تمهّد للموضوع.",
  "footer": "@egyitech",
  "footerIcons": true,
  "codeTheme": "dark",
  "codeLineNumbers": false,
  "colors": { "--red": "#61dafb", "--red2": "#2a9ec4" },
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
      "bg": "",
      "bgOpacity": "",
      "borderColor": "",
      "borderWidth": "",
      "radius": ""
    }
  ]
}
```

## الحقول

| الحقل | الوصف |
|-------|--------|
| `lang` | التقنية: `laravel` `vue` `react` `js` `css` `php` `tailwind` `bootstrap` `flutter` — تضبط الألوان والشعار والثيم تلقائيًا |
| `pageSize` | أبعاد الصورة: `auto` (يتمدد) `sq1` (900×900) `portrait45` (900×1125) `tall23` (900×1350) `story916` (900×1600). عند اختيار بُعد ثابت، المحتوى الزائد يُقسَّم تلقائيًا على صفحات متعددة |
| `fontScales` | تحكم منفصل بحجم كل عنصر نصي (من `0.5` إلى `1.6`): `badge` `tips` `subtitle` `intro` `number` `cardTitle` `cardBody` `code` `noteTitle` `noteText` `footer`. خط أصغر = مساحة أكبر للبطاقات = صفحات أقل |
| `theme` | الثيم البصري: `theme-laravel` `theme-react` `theme-vue` `theme-js` `theme-css` `theme-php` `theme-tailwind` `theme-bootstrap` `theme-flutter` `theme-dots` `theme-curves` `theme-gradient` `theme-glow` `theme-particles` `theme-hexagon` `theme-mesh` `theme-aurora` `theme-waves` `theme-minimal` `theme-grid` |
| `badge` | شارة صغيرة أعلى البوستر (بالإنجليزية، أحرف كبيرة) |
| `badgeStyle` | نمط الشارة: `rect` (مستطيل) `pill` (حبة) `bar` (شريط) |
| `titleAlign` | محاذاة العنوان: `center` `left` `right` |
| `titleWeight` | وزن خط العنوان: `400` `700` `900` `1000` |
| `titleSpacing` | تباعد أحرف العنوان بالبكسل (من `-10` إلى `20`) |
| `titleMain` / `titleAccent` | العنوان الرئيسي على سطرين (بالإنجليزية، قصير وقوي) |
| `subtitle` | سطر فرعي إنجليزي قصير |
| `intro` | مقدمة عربية (RTL) — استخدم \n للأسطر |
| `footer` | توقيع أسفل البوستر |
| `footerIcons` | `true` لإظهار أيقونات التواصل بجانب الفوتر، `false` لإخفائها |
| `codeTheme` | ثيم تلوين الكود: `dark` (داكن) `light` (فاتح) `contrast` (تباين عالي) |
| `codeLineNumbers` | `true` لإظهار أرقام الأسطر في كتل الكود |
| `colors` | ألوان مخصصة اختيارية: `--bg` `--red` `--red2` `--cyan` `--white` `--muted` `--panel` `--panel2` |

## البطاقات (cards)

- `number`: رقم البطاقة "01"، "02"...
- `title`: عنوان البطاقة بالإنجليزية.
- `ar`: شرح عربي (سطر إلى ثلاثة).
- `type`: `"code"` لبطاقة كود، `"tip"` لبطاقة نصيحة، `"warning"` لبطاقة تحذير، `"info"` لبطاقة معلومة.
- `codeLang`: لغة التلوين — `laravel` `vue` `react` `js` `jsx` `css` `html` `php` `tailwind` `bootstrap` `flutter` `python` `typescript` `bash` `sql` `json` `markdown`.
- `code`: الكود (استخدم \n للأسطر). التلوين تلقائي.
- `rawCode`: `true` فقط إذا أردت كتابة HTML ملوّن يدويًا بـ `<span>` — اتركها `false` عادةً.
- `noteTitle` / `noteText`: ملاحظة عربية اختيارية أسفل البطاقة.
- `span`: عرض البطاقة — `"auto"` (تلقائي: نصيحة/تحذير/معلومة/بدون كود → نصف، بكود → كامل) `"full"` (كامل العرض) `"half"` (نصف العرض، بطاقتان نصفيتان تُعرضان بجانب بعضهما لتوفير المساحة).
- `compact`: `true` لتصغير الحشو والهوامش وتوفير مساحة رأسية.
- `collapsed`: `true` لطي الكود (يظهر أول ~3 أسطر فقط مع تدرّج) — مفيد للكود الطويل.
- `bg`: لون خلفية مخصص للبطاقة (hex) — فارغ = افتراضي.
- `bgOpacity`: شفافية خلفية البطاقة من `0` إلى `100` (`100` = معتم).
- `borderColor`: لون حدود مخصص للبطاقة (hex) — فارغ = افتراضي.
- `borderWidth`: عرض الحدود بالبكسل (من `0` إلى `6`).
- `radius`: نصف قطر زوايا البطاقة بالبكسل (من `0` إلى `40`).

## قواعد التصميم

1. من 2 إلى 4 بطاقات كحد أقصى — البوستر يطول مع كل بطاقة.
2. العناوين الإنجليزية قصيرة (كلمتان كحد أقصى لكل سطر).
3. المقدمة والشروح والملاحظات بالعربية؛ العناوين والكود والشارة بالإنجليزية.
4. الكود قصير (حتى ~10 أسطر) وواقعي وصحيح نحويًا.
5. نوّع بين بطاقات `code` و`tip` و`warning` و`info` عند الحاجة — استخدم `tip` للنقاط النظرية، `warning` للممارسات الخاطئة، `info` للمعلومات الإضافية.
6. اختر `lang` المطابق لموضوع البوستر؛ إن لم يكن له قالب استخدم `colors` مخصصة مع ثيم مناسب.
7. أخرج JSON خامًا صالحًا فقط — بلا شرح، بلا markdown إن أمكن (يُقبل ```json أيضًا).
