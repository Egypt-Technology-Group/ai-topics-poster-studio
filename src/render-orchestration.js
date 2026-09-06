// ---------- Render orchestration ----------
import { renderSidebar } from './render-sidebar.js';
import { renderPoster } from './render-poster.js';

export let renderTick = null;

export function renderAll(){ renderSidebar(); renderPoster(); }

export function scheduleRender(){
  clearTimeout(renderTick);
  renderTick = setTimeout(renderPoster, 30);
}
