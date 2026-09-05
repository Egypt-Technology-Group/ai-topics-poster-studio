# تعليمات تصميم بوستر لأداة AI Topics Poster Editor

انسخ هذا الملف كاملًا وأعطِه لأي وكيل ذكاء اصطناعي، ثم اطلب منه تصميم بوستر لموضوعك. سيُخرج JSON تلصقه في زر **«لصق من الوكيل»** داخل الواجهة.

---

أنت تصمّم بوسترًا تقنيًا. أخرج **JSON واحدًا فقط** (بدون أي نص إضافي) يطابق المخطط التالي. كل الحقول اختيارية — الحقول الناقصة تأخذ قيمًا افتراضية — لكن يُنصح بملء الحقول الأساسية.

## المخطط

```json
{
  "lang": "react",
  "theme": "theme-react",
  "badge": "REACT",
  "titleMain": "HOOKS",
  "titleAccent": "DEEP DIVE",
  "subtitle": "STATE & EFFECTS",
  "intro": "مقدمة عربية قصيرة من سطر أو سطرين تمهّد للموضوع.",
  "footer": "@egyitech",
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
      "noteText": "ملاحظة عربية إرشادية قصيرة."
    }
  ]
}
```

## الحقول

| الحقل | الوصف |
|-------|--------|
| `lang` | التقنية: `laravel` `vue` `react` `js` `css` `php` `tailwind` `bootstrap` `flutter` — تضبط الألوان والشعار والثيم تلقائيًا |
| `theme` | الثيم البصري: `theme-laravel` `theme-react` `theme-vue` `theme-js` `theme-css` `theme-php` `theme-tailwind` `theme-bootstrap` `theme-flutter` `theme-dots` `theme-curves` `theme-gradient` `theme-glow` `theme-particles` |
| `badge` | شارة صغيرة أعلى البوستر (بالإنجليزية، أحرف كبيرة) |
| `titleMain` / `titleAccent` | العنوان الرئيسي على سطرين (بالإنجليزية، قصير وقوي) |
| `subtitle` | سطر فرعي إنجليزي قصير |
| `intro` | مقدمة عربية (RTL) — استخدم \n للأسطر |
| `footer` | توقيع أسفل البوستر |
| `colors` | ألوان مخصصة اختيارية: `--bg` `--red` `--red2` `--cyan` `--white` `--muted` `--panel` `--panel2` |

## البطاقات (cards)

- `number`: رقم البطاقة "01"، "02"...
- `title`: عنوان البطاقة بالإنجليزية.
- `ar`: شرح عربي (سطر إلى ثلاثة).
- `type`: `"code"` لبطاقة كود، أو `"tip"` لبطاقة نصيحة نصية بدون كود.
- `codeLang`: لغة التلوين — `laravel` `vue` `react` `js` `jsx` `css` `html` `php` `tailwind` `bootstrap` `flutter` `python` `typescript` `bash` `sql` `json` `markdown`.
- `code`: الكود (استخدم \n للأسطر). التلوين تلقائي.
- `rawCode`: `true` فقط إذا أردت كتابة HTML ملوّن يدويًا بـ `<span>` — اتركها `false` عادةً.
- `noteTitle` / `noteText`: ملاحظة عربية اختيارية أسفل البطاقة.

## قواعد التصميم

1. من 2 إلى 4 بطاقات كحد أقصى — البوستر يطول مع كل بطاقة.
2. العناوين الإنجليزية قصيرة (كلمتان كحد أقصى لكل سطر).
3. المقدمة والشروح والملاحظات بالعربية؛ العناوين والكود والشارة بالإنجليزية.
4. الكود قصير (حتى ~10 أسطر) وواقعي وصحيح نحويًا.
5. نوّع بين بطاقات `code` و`tip` عند الحاجة — استخدم `tip` للنقاط النظرية.
6. اختر `lang` المطابق لموضوع البوستر؛ إن لم يكن له قالب استخدم `colors` مخصصة مع ثيم مناسب.
7. أخرج JSON خامًا صالحًا فقط — بلا شرح، بلا markdown إن أمكن (يُقبل ```json أيضًا).
