(function(){
'use strict';
const M=ComicModel, data=COMIC_DATA, $=id=>document.getElementById(id);
const book=$('book'),left=$('left'),right=$('right'),back=$('previous'),forward=$('next');
const narrow=matchMedia('(max-width:760px), (max-height:500px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
let page=0, preference=null, busy=false;
try{page=M.clamp(localStorage.getItem('unclaimed.page'));const v=localStorage.getItem('unclaimed.view');if(v==='single'||v==='spread')preference=v;}catch{}
const single=()=>narrow.matches||preference==='single';
const src=n=>'assets/page-'+String(n).padStart(2,'0')+'.png';
const title=n=>n===0?'Cover':data[n-1][0];
const cache=new Map();
function preload(n){
 if(n===null)return Promise.resolve();
 if(cache.has(n))return cache.get(n);
 const promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve();im.onerror=()=>reject(new Error('Page '+n+' could not load. Check your connection and try again.'));im.src=src(n);});
 cache.set(n,promise);promise.catch(()=>cache.delete(n));return promise;
}
function persist(){try{localStorage.setItem('unclaimed.page',String(page));if(preference)localStorage.setItem('unclaimed.view',preference);}catch{}}
function message(t){$('message').textContent=t;}
function fill(el,n){
 el.replaceChildren();el.classList.toggle('empty',n===null);el.removeAttribute('data-page');
 if(n===null){
  const intro=document.createElement('div');intro.className='intro';
  intro.innerHTML='<span class="eyebrow">A COMPLETE ONE-SHOT<br>32 PAGES · 96 PANELS</span><h1>Some prisons<br>have no outside.</h1><p>A grieving sister. A stolen soul. A god who refuses to become a master.</p><button class="open-book">OPEN THE COVER →</button><span class="intro-foot">SPAWN vs. CENOBITES<br>THE UNCLAIMED</span>';
  intro.querySelector('button').onclick=()=>turn(1);el.append(intro);return;
 }
 el.dataset.page=n;
 const im=document.createElement('img');im.src=src(n);im.width=1024;im.height=1536;im.alt=n===0?'The Unclaimed cover: Spawn faces Pinhead above a brass puzzle cube.':'Page '+n+': '+title(n)+'. Read the transcript below for panel descriptions and dialogue.';im.draggable=false;im.decoding='async';
 im.onerror=()=>message('An illustration could not load. Check your connection, then turn back to retry.');
 el.append(im);
}
function visible(){return M.visible(page,single());}
function renderTranscript(){
 const dest=$('transcript-content');dest.replaceChildren();
 for(const n of visible().filter(v=>v!==null)){
  const h=document.createElement('h3');h.textContent=n===0?'Cover':'Page '+n+' — '+title(n);dest.append(h);
  if(n===0){const p=document.createElement('p');p.textContent='Spawn vs. Cenobites: The Unclaimed. Spawn faces Pinhead above a brass puzzle cube, with Leviathan looming over the Labyrinth. An unofficial fan comic.';dest.append(p);continue;}
  data[n-1][1].forEach(([direction,words],i)=>{
   const d=document.createElement('p');d.className='direction';d.textContent='Panel '+(i+1)+'. '+direction;dest.append(d);
   const p=document.createElement('p');p.textContent=words.replaceAll('FOOTER: ','').replaceAll('CAPTION: ','Narration: ');dest.append(p);
  });
 }
}
function controls(){
 const s=single(),v=visible(),shown=v.filter(n=>n!==null);
 back.disabled=busy||M.next(page,-1,s)===page;forward.disabled=busy||M.next(page,1,s)===page;
 $('mode').disabled=busy||narrow.matches;$('progress').disabled=busy;
 $('mode').setAttribute('aria-pressed',String(s));$('mode').title=s?'Switch to two-page spreads':'Switch to single-page view';
 $('mode').querySelector('span').textContent=s?'Spread view':'Single page';
 const label=page===0?'Cover':shown.length===1?'Page '+page+' / 32':'Pages '+shown.join('–')+' / 32';
 $('page-label').textContent=label;$('chapter-label').textContent=page===0?'The Unclaimed':title(shown[0]);
 $('progress').value=page;$('progress').setAttribute('aria-valuetext',label);
 book.setAttribute('aria-label',label+'. Use left and right arrow keys to turn pages.');
}
function render(){
 page=single()?M.clamp(page):M.visible(page,false).filter(n=>n!==null)[0];
 book.classList.toggle('single',single());
 const v=visible();if(single()){left.replaceChildren();fill(right,v[0]);}else{fill(left,v[0]);fill(right,v[1]);}
 controls();renderTranscript();persist();
 const ahead=M.visible(M.next(page,1,single()),single());
 ahead.forEach(n=>preload(n).catch(()=>{}));
}
async function turn(direction){
 if(busy)return;
 const target=M.next(page,direction,single());if(target===page){message(direction>0?'You’ve reached the end of The Unclaimed.':'You’re at the cover.');return;}
 busy=true;message('');controls();
 let leaf=null;
 try{
  const old=visible(),dest=M.visible(target,single());
  let timer;
  await Promise.race([
   Promise.all(dest.map(preload)),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('The next page is taking too long to load. Try again.')),20000);})
  ]).finally(()=>clearTimeout(timer));
  if(!reduced.matches&&typeof book.animate==='function'){
   leaf=document.createElement('div');leaf.className='leaf '+(direction>0?'forward':'backward');leaf.setAttribute('aria-hidden','true');
   const front=document.createElement('div'),reverse=document.createElement('div');front.className='face front';reverse.className='face back';
   if(single()){
    fill(front,old[0]);fill(reverse,dest[0]);fill(right,dest[0]);
   }else if(direction>0){
    fill(front,old[1]);fill(reverse,dest[0]);fill(right,dest[1]);
   }else{
    fill(front,old[0]);fill(reverse,dest[1]);fill(left,dest[0]);
   }
   leaf.append(front,reverse);book.append(leaf);
   const degrees=direction>0?-180:180;
   await leaf.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:'rotateY('+degrees/2+'deg)',filter:'brightness(.66)',offset:.5},{transform:'rotateY('+degrees+'deg)',filter:'brightness(1)'}],{duration:780,easing:'cubic-bezier(.32,.05,.25,1)',fill:'forwards'}).finished;
  }
  page=target;message(page>=31?'The end. Thank you for reading.':'');
 }catch(e){message(e.message||'Could not turn the page. Please try again.');}
 finally{if(leaf)leaf.remove();busy=false;render();}
}
function go(n){if(busy)return;page=M.clamp(n);message('');render();}
back.onclick=()=>turn(-1);forward.onclick=()=>turn(1);
$('home').onclick=e=>{e.preventDefault();go(0);};$('restart').onclick=()=>go(0);
$('progress').oninput=e=>{const n=M.clamp(e.target.value);$('progress').setAttribute('aria-valuetext',n===0?'Cover':'Page '+n);};
$('progress').onchange=e=>go(e.target.value);
$('mode').onclick=()=>{preference=single()?'spread':'single';render();};
narrow.addEventListener('change',()=>{if(busy)return;render();});
let lastSwipeTime=-Infinity;
book.addEventListener('click',e=>{
 if(e.target.closest('button')||busy||performance.now()-lastSwipeTime<500)return;
 const r=book.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;
 if(x<.16)turn(-1);else if(x>.84)turn(1);
});
book.addEventListener('dblclick',e=>{if(busy||e.target.closest('button'))return;const el=e.target.closest('[data-page]');if(el)openZoom(Number(el.dataset.page));});
let touch=null;
book.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;},{passive:true});
book.addEventListener('touchmove',e=>{if(e.touches.length!==1)touch=null;},{passive:true});
book.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
book.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length||e.touches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){lastSwipeTime=performance.now();turn(dx<0?1:-1);}},{passive:true});
function openDialog(dialog){if(!dialog.open)dialog.showModal();}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();}));
const grid=$('page-grid');
for(let n=0;n<=32;n++){
 const b=document.createElement('button');b.className='thumbnail';b.dataset.page=n;
 const im=document.createElement('img');im.src=src(n);im.alt='';im.loading='lazy';im.width=1024;im.height=1536;
 const caption=document.createElement('span');caption.textContent=n===0?'Cover':String(n).padStart(2,'0')+' · '+title(n);
 b.setAttribute('aria-label',n===0?'Open cover':'Open page '+n+': '+title(n));b.append(im,caption);b.onclick=()=>{if(busy)return;go(n);$('page-dialog').close();book.focus({preventScroll:true});};grid.append(b);
}
$('pages').onclick=()=>{
 grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(visible().includes(Number(b.dataset.page)))));
 openDialog($('page-dialog'));
};
function setZoom(n){$('zoom-title').textContent=n===0?'Cover':'Page '+n+' — '+title(n);$('zoom-image').src=src(n);$('zoom-image').alt=n===0?'The Unclaimed cover':'Full resolution page '+n+': '+title(n);$('zoom-dialog').querySelector('.zoom-scroll').scrollTo(0,0);$('zoom-actions').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.page)===n)));}
function openZoom(n){
 if(busy)return;
 const ns=visible().filter(v=>v!==null);const buttons=$('zoom-actions');buttons.replaceChildren();
 ns.forEach(p=>{const b=document.createElement('button');b.dataset.page=p;b.textContent=p===0?'Cover':'Page '+p;b.onclick=()=>setZoom(p);buttons.append(b);});
 $('zoom-dialog').classList.remove('actual-size');$('zoom-scale').textContent='100%';$('zoom-scale').setAttribute('aria-pressed','false');
 setZoom(n??ns[0]);openDialog($('zoom-dialog'));
}
$('zoom-scale').onclick=()=>{const actual=$('zoom-dialog').classList.toggle('actual-size');$('zoom-scale').textContent=actual?'Fit page':'100%';$('zoom-scale').setAttribute('aria-pressed',String(actual));$('zoom-dialog').querySelector('.zoom-scroll').scrollTo(0,0);};
$('zoom').onclick=()=>openZoom();
$('help').onclick=$('credits').onclick=()=>openDialog($('guide-dialog'));
$('fullscreen').onclick=async()=>{
 try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else message('Fullscreen isn’t supported by this browser. You can still zoom any page.');}catch{message('Fullscreen could not open. Try your browser’s fullscreen control.');}
};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').querySelector('span').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';$('fullscreen').title=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';});
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='ArrowRight'){e.preventDefault();turn(1);}
 else if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}
 else if(e.key==='Home'){e.preventDefault();go(0);}
 else if(e.key==='End'){e.preventDefault();go(32);}
 else if(e.key.toLowerCase()==='z'){e.preventDefault();openZoom();}
});
render();
})();

