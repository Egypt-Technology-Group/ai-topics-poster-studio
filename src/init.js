// ---------- Init ----------
import { setRenderAll, undo, redo, updateHistBtns, clearDirtyStatus, history, future } from './state.js';
import { renderAll } from './render-orchestration.js';
import { renderSidebar } from './render-sidebar.js';
import {
  toggleSec, onSidebarSearch, expandAllSections, collapseAllSections,
  jumpToSection,
} from './render-sidebar.js';
import {
  applyPreset, randomPalette, setColor, setTheme, setFontFamily, setPageSize,
  setExportScale, setFontScale, resetFontScales, setField, setCard, toggleCardProp,
  resetCardStyle, addCard, delCard, moveCard, duplicateCard, addCardFromTemplate,
  toggleCard, clearLogo, setLogoPos, resetLogoPos, setLogoHighlight, setBgHighlight,
  pickFile,
} from './mutations.js';
import { saveJSON, loadJSON, newProject } from './save-load.js';
import {
  openAgentModal, closeAgentModal, applyAgentJSON, copyAgentSpec,
} from './agent.js';
import { exportPNG } from './export-png.js';

// Wire the renderAll callback used by state.js (undo/redo)
setRenderAll(renderAll);

// Expose all functions referenced by inline HTML handlers to the global scope.
// ES modules have their own scope; inline onclick="fn()" handlers need these on window.
function expose(name, fn){ window[name] = fn; }

expose('toggleSec', toggleSec);
expose('onSidebarSearch', onSidebarSearch);
expose('expandAllSections', expandAllSections);
expose('collapseAllSections', collapseAllSections);
expose('jumpToSection', jumpToSection);
expose('renderSidebar', renderSidebar);
expose('applyPreset', applyPreset);
expose('randomPalette', randomPalette);
expose('setColor', setColor);
expose('setTheme', setTheme);
expose('setFontFamily', setFontFamily);
expose('setPageSize', setPageSize);
expose('setExportScale', setExportScale);
expose('setFontScale', setFontScale);
expose('resetFontScales', resetFontScales);
expose('setField', setField);
expose('setCard', setCard);
expose('toggleCardProp', toggleCardProp);
expose('resetCardStyle', resetCardStyle);
expose('addCard', addCard);
expose('delCard', delCard);
expose('moveCard', moveCard);
expose('duplicateCard', duplicateCard);
expose('addCardFromTemplate', addCardFromTemplate);
expose('toggleCard', toggleCard);
expose('clearLogo', clearLogo);
expose('setLogoPos', setLogoPos);
expose('resetLogoPos', resetLogoPos);
expose('setLogoHighlight', setLogoHighlight);
expose('setBgHighlight', setBgHighlight);
expose('pickFile', pickFile);

export function init(){
  renderAll();
  updateHistBtns();

  document.getElementById('btnUndo').onclick=undo;
  document.getElementById('btnRedo').onclick=redo;
  document.getElementById('btnNew').onclick=newProject;
  document.getElementById('btnSave').onclick=saveJSON;
  document.getElementById('btnLoad').onclick=()=>document.getElementById('fileLoad').click();
  document.getElementById('fileLoad').onchange=e=>{ if(e.target.files[0]) loadJSON(e.target.files[0]); e.target.value=''; };
  document.getElementById('btnExport').onclick=exportPNG;
  document.getElementById('btnAgent').onclick=openAgentModal;
  document.getElementById('btnAgentClose').onclick=closeAgentModal;
  document.getElementById('btnAgentApply').onclick=applyAgentJSON;
  document.getElementById('btnAgentCopySpec').onclick=copyAgentSpec;
  document.getElementById('agentModal').addEventListener('click',e=>{ if(e.target.id==='agentModal') closeAgentModal(); });

  const zoom=document.getElementById('zoom'), zv=document.getElementById('zoomVal'), stage=document.getElementById('stage');
  function applyZoom(){ const z=zoom.value; zv.textContent=z+'%'; stage.style.zoom=z+'%'; }
  zoom.oninput=applyZoom; applyZoom();

  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); if(e.shiftKey) redo(); else undo(); }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){ e.preventDefault(); redo(); }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){ e.preventDefault(); saveJSON(); }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='e'){ e.preventDefault(); exportPNG(); }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); document.getElementById('sidebarSearch').focus(); }
    if(e.key==='Escape'&&!document.getElementById('agentModal').hidden) closeAgentModal();
  });
}

init();
