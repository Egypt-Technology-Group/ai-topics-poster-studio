// ---------- Export PNG ----------
import { POSTER_WIDTH, exportScale } from './constants.js';
import { state } from './state.js';
import { toast } from './utils.js';

function waitForImages(root){
  const images = Array.from(root.querySelectorAll('img'));
  return Promise.all(images.map(img=>{
    if(!img.getAttribute('src')) return Promise.resolve();
    const ready = img.complete
      ? Promise.resolve()
      : new Promise(resolve=>{
          img.addEventListener('load',resolve,{once:true});
          img.addEventListener('error',resolve,{once:true});
        });
    return ready.then(()=> img.decode ? img.decode().catch(()=>{}) : undefined);
  }));
}

async function waitForExportAssets(root){
  const fontLoads = [];
  if(document.fonts){
    ['400','700','900','1000'].forEach(weight=>fontLoads.push(document.fonts.load(`${weight} 40px Inter`)));
    ['400','700','900'].forEach(weight=>fontLoads.push(document.fonts.load(`${weight} 40px Cairo`)));
  }
  await Promise.allSettled(fontLoads);
  await Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), waitForImages(root)]);
}

function blobToDataURL(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error||new Error('تعذر قراءة المورد'));
    reader.readAsDataURL(blob);
  });
}

let exportFontCssPromise=null;
function getExportFontCSS(){
  if(!exportFontCssPromise){
    exportFontCssPromise=(async()=>{
      const link=document.querySelector('link[href*="fonts.googleapis.com/css"]');
      if(!link) return '';
      const response=await fetch(link.href,{mode:'cors'});
      if(!response.ok) throw new Error('تعذر تحميل خطوط التصدير');
      let css=await response.text();
      const urls=[...new Set(Array.from(css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)).map(match=>match[2]))];
      await Promise.all(urls.map(async url=>{
        const fontResponse=await fetch(url,{mode:'cors'});
        if(!fontResponse.ok) throw new Error('تعذر تضمين خط التصدير');
        const dataUrl=await blobToDataURL(await fontResponse.blob());
        css=css.split(url).join(dataUrl);
      }));
      return css;
    })().catch(error=>{
      exportFontCssPromise=null;
      throw error;
    });
  }
  return exportFontCssPromise;
}

async function getExportStyles(){
  let css='';
  for(const sheet of document.styleSheets){
    try{
      css+=Array.from(sheet.cssRules).map(rule=>rule.cssText).join('\n')+'\n';
    }catch(error){
      if(sheet.href && new URL(sheet.href,location.href).origin===location.origin){
        const response=await fetch(sheet.href);
        if(response.ok) css+=await response.text()+'\n';
      }
    }
  }
  return css+'\n'+await getExportFontCSS();
}

async function inlineImagesForExport(root){
  await Promise.all(Array.from(root.querySelectorAll('img')).map(async img=>{
    const src=img.currentSrc||img.src;
    if(!src || src.startsWith('data:')) return;
    const response=await fetch(src,{mode:'cors'});
    if(!response.ok) throw new Error('تعذر تضمين صورة داخل التصدير');
    img.src=await blobToDataURL(await response.blob());
    img.removeAttribute('srcset');
    img.removeAttribute('crossorigin');
  }));
}

function serializePosterForExport(poster,width,height,outputWidth,outputHeight,styles){
  const exportReset=`
    .poster{width:${POSTER_WIDTH}px!important;transform:none!important}
    .poster img{max-width:none!important}
    .poster *{animation:none!important;transition:none!important}
  `;
  const safeStyles=(styles+exportReset).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const markup=new XMLSerializer().serializeToString(poster);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;width:${width}px;height:${height}px;overflow:hidden"><style>${safeStyles}</style>${markup}</div></foreignObject></svg>`;
}

async function rasterizePoster(poster,width,height,scale){
  const styles=await getExportStyles();
  const outputWidth=Math.max(1,Math.round(width*scale));
  const outputHeight=Math.max(1,Math.round(height*scale));
  const svg=serializePosterForExport(poster,width,height,outputWidth,outputHeight,styles);
  const url=await blobToDataURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  const image=await new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('تعذر rasterize البوستر'));
    img.src=url;
  });
  const canvas=document.createElement('canvas');
  canvas.width=outputWidth;
  canvas.height=outputHeight;
  canvas.getContext('2d').drawImage(image,0,0,outputWidth,outputHeight);
  return canvas;
}

export async function renderPosterCanvas(scale=exportScale, sourcePoster){
  if(!sourcePoster) sourcePoster=document.querySelector('#stage > .poster');
  if(!sourcePoster) throw new Error('لا يوجد بوستر');

  const exportStage=document.createElement('div');
  exportStage.className='poster-export-stage';
  exportStage.setAttribute('aria-hidden','true');
  exportStage.style.width=POSTER_WIDTH+'px';

  const exportPoster=sourcePoster.cloneNode(true);
  exportPoster.setAttribute('data-export-poster','true');
  exportStage.appendChild(exportPoster);
  document.body.appendChild(exportStage);

  try{
    await waitForExportAssets(exportPoster);
    await inlineImagesForExport(exportPoster);
    await waitForImages(exportPoster);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

    const bounds=exportPoster.getBoundingClientRect();
    const width=Math.max(1,Math.ceil(bounds.width));
    const height=Math.max(1,Math.ceil(bounds.height));
    exportStage.style.height=height+'px';
    exportPoster.style.width=width+'px';
    exportPoster.style.height=height+'px';

    return await rasterizePoster(exportPoster,width,height,scale);
  }finally{
    exportStage.remove();
  }
}

export async function exportPNG(){
  const posters=document.querySelectorAll('#stage > .poster');
  if(!posters.length){ toast('لا يوجد بوستر'); return; }
  const total=posters.length;
  toast(total>1 ? `جاري تصدير ${total} صفحات...` : 'جاري التصدير...');
  try{
    for(let i=0;i<total;i++){
      const canvas=await renderPosterCanvas(exportScale, posters[i]);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر إنشاء ملف PNG')),'image/png'));
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      const base=`poster-${(state.badge||'ai-topics').toLowerCase().replace(/\s+/g,'-')}`;
      a.download=total>1 ? `${base}-${i+1}.png` : `${base}.png`;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      if(i<total-1) await new Promise(r=>setTimeout(r,300));
    }
    toast(total>1 ? `تم تصدير ${total} صفحات ✓` : 'تم تصدير PNG ✓');
  }catch(e){ console.error(e); toast('فشل التصدير: '+e.message); }
}
