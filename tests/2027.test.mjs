import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, access } from 'node:fs/promises';

const file='src/data/catalog.generated.ts';
const load=async()=>JSON.parse((await readFile(file,'utf8')).match(/export const catalog: readonly Series\[\] = ([\s\S]*?);/)[1]);
test('2027 catalog preserves existing products and orders all series',async()=>{
 const catalog=await load();
 assert.deepEqual(catalog.map(s=>s.slug),['christmas-collection','easter-autumn','ocean-collection','coffee-cup-collection','single-cup-collection']);
 const oldCounts={'christmas-collection':[15,11,15,15,21,7],'ocean-collection':[20,13],'coffee-cup-collection':[19],'easter-autumn':[19,5],'single-cup-collection':[32,10,12,15]};
 const newCounts={'christmas-collection':35,'ocean-collection':5,'coffee-cup-collection':7};
 const ids=[];
 for(const [si,s] of catalog.entries()){
  assert.equal(s.order,si+1);
  assert.deepEqual(s.types.filter(t=>t.slug!=='new-2027').map(t=>t.images.length),oldCounts[s.slug]);
  if(newCounts[s.slug]) {const t=s.types[0];assert.equal(t.slug,'new-2027');assert.equal(t.images.length,newCounts[s.slug]);assert.match(t.images[0].sourceName,/01主图/);assert.deepEqual(t.cover,t.images[0]);assert.ok(t.images.every(i=>i.isNew));}
  for(const [ti,t] of s.types.entries()){assert.equal(t.order,ti+1);for(const image of t.images){ids.push(image.id);await access('public'+image.src);if(t.slug!=='new-2027')assert.ok(!image.isNew);}await access('public'+t.cover.src);}
 }
 assert.equal(ids.length,276);assert.equal(new Set(ids).size,276);
 const easter=catalog[1].types[0];assert.deepEqual(easter.images.map(i=>parseInt(i.sourceName)),[7,8,9,10,11,12,13,14,1,2,3,4,5,6,15,16,17,18,19]);assert.match(easter.cover.src,/cover-2027.jpg$/);
});


test('homepage hero replacements preserve positions and unchanged slides', async()=>{
 const source=await readFile(file,'utf8');
 const heroes=JSON.parse(source.match(/export const heroImages = ([\s\S]*?) as const satisfies/)[1]);
 const catalog=await load();
 assert.equal(heroes.length,6);
 const expected=[[0,catalog.find(s=>s.slug==='ocean-collection').types[0].cover],[2,catalog.find(s=>s.slug==='easter-autumn').types[0].cover],[5,catalog.find(s=>s.slug==='christmas-collection').types[0].cover]];
 for(const [i,cover] of expected){assert.equal(heroes[i].src,cover.src);assert.equal(heroes[i].width,cover.width);assert.equal(heroes[i].height,cover.height);assert.ok(!heroes[i].isNew);}
 for(const i of [1,3,4]) assert.equal(heroes[i].src,`/home-hero/${String(i+1).padStart(3,'0')}.jpg`);
 heroes.forEach((h,i)=>assert.equal(h.id,`hero-${i+1}`));
});
