(function(root){
'use strict';
const LAST=32;
function clamp(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(LAST,Math.trunc(n))):0;}
function visible(page,single){page=clamp(page);if(single)return [page];if(page===0)return [null,0];const left=page%2?page:page-1;return [left,left+1];}
function next(page,direction,single){page=clamp(page);if(single)return clamp(page+Math.sign(direction));const spread=visible(page,false);if(direction>0)return page===0?1:clamp(spread[0]+2);return page<=2?0:spread[0]-2;}
root.ComicModel={LAST,clamp,visible,next};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ComicModel;
})(globalThis);

