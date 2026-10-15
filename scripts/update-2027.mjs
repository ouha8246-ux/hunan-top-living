import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/update-2027.mjs <source-folder>');
const manifest = path.join(root, 'src/data/catalog.generated.ts');
const text = await readFile(manifest, 'utf8');
const catalog = JSON.parse(text.match(/export const catalog(?:\: readonly Series\[\])? = ([\s\S]*?)(?: as const satisfies readonly Series\[\])?;/)[1]);
async function files(dir) { const result = []; for (const e of await readdir(dir, {withFileTypes:true})) { const p = path.join(dir,e.name); if(e.isDirectory()) result.push(...await files(p)); else if(/\.jpe?g$/i.test(e.name)) result.push(p); } return result; }
function dimensions(buffer) { let i=2; while(i+8<buffer.length) { if(buffer[i]!==255) { i++; continue; } const marker=buffer[i+1]; if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) return {height:buffer.readUInt16BE(i+5),width:buffer.readUInt16BE(i+7)}; i+=buffer.readUInt16BE(i+2)+2; } throw new Error('Invalid JPEG'); }
const inputs = [['christmas-collection','2027新圣诞系列',35],['ocean-collection','2027新海洋系列',5],['coffee-cup-collection','2027新咖啡系列',7]];
const prepared = [];
for (const [slug,folder,count] of inputs) {
 const list = await files(path.join(source,folder));
 list.sort((a,b)=> {a=path.basename(a);b=path.basename(b);return Number(!a.includes('主图'))-Number(!b.includes('主图')) || parseInt(a)-parseInt(b) || (a<b?-1:a>b?1:0);});
 if(list.length!==count || list.filter(p=>p.includes('主图')).length!==1) throw new Error(`Unexpected assets: ${folder}`);
 const images=[];
 for(const [i,file] of list.entries()) { const name=String(i+1).padStart(3,'0')+'.jpg'; const src=`/catalog/${slug}/new-2027/${name}`; const buffer=await readFile(file); images.push({id:`${slug}-new-2027-${i+1}`,src,...dimensions(buffer),sourceName:path.basename(file),isNew:true}); }
 prepared.push({slug,list,images});
}
for(const {slug,list,images} of prepared) {
 const series=catalog.find(s=>s.slug===slug);
 await mkdir(path.join(root,'public/catalog',slug,'new-2027'),{recursive:true});
 for(const [i,file] of list.entries()) await copyFile(file,path.join(root,'public',images[i].src));
 series.types=[{order:1,slug:'new-2027',name:{en:'2027 New Collection',zh:'2027 新品'},cover:images[0],images},...series.types.filter(t=>t.slug!=='new-2027')];
 series.types.forEach((t,i)=>{t.order=i+1;if(/^\d+$/.test(t.name.zh)) t.name={zh:String(i+1),en:`Collection ${i+1}`};});
}
async function importImage(file, src, id) {
 const buffer=await readFile(file);
 const image={id,src,...dimensions(buffer),sourceName:path.basename(file),isNew:true};
 await mkdir(path.dirname(path.join(root,'public',src)),{recursive:true});
 await copyFile(file,path.join(root,'public',src));
 return image;
}
const catFiles=await files(path.join(source,'猫咪系列'));
catFiles.sort((a,b)=>Number(!path.basename(a).includes('主页图'))-Number(!path.basename(b).includes('主页图')) || parseInt(path.basename(a))-parseInt(path.basename(b)));
if(catFiles.length!==26 || path.basename(catFiles[0])!=='01主页图.jpg') throw new Error('Expected cat cover and 25 product images');
const catImages=[];
for(const [i,file] of catFiles.entries()) catImages.push(await importImage(file,'/catalog/cat-collection/new-2027/'+String(i+1).padStart(3,'0')+'.jpg','cat-collection-new-2027-'+(i+1)));
const catSeries={order:4,slug:'cat-collection',name:{en:'Cat Collection',zh:'猫咪系列'},types:[{order:1,slug:'new-2027',name:{en:'2027 New Collection',zh:'2027 新品'},cover:catImages[0],images:catImages}]};
const catIndex=catalog.findIndex(s=>s.slug==='cat-collection');
if(catIndex===-1) catalog.push(catSeries); else catalog[catIndex]=catSeries;
const ocean=catalog.find(s=>s.slug==='ocean-collection').types[0];
const originalOceanCover={...ocean.images[0],id:'ocean-collection-new-2027-original-cover'};
ocean.images[0]=await importImage(path.join(source,'海洋系列主图01.jpg'),'/catalog/ocean-collection/new-2027/cover-v2.jpg',ocean.images[0].id);
ocean.cover=ocean.images[0];
ocean.images.splice(1,0,originalOceanCover);
ocean.images.push(await importImage(path.join(source,'海洋新曾.jpg'),'/catalog/ocean-collection/new-2027/006.jpg','ocean-collection-new-2027-6'));
const easter=catalog.find(s=>s.slug==='easter-autumn').types.find(t=>t.slug==='easter');
const coverFile=path.join(source,'复活节主页图.jpg');
const coverBuffer=await readFile(coverFile);
await copyFile(coverFile,path.join(root,'public/catalog/easter-autumn/easter/cover-2027.jpg'));
easter.cover={...easter.cover,src:'/catalog/easter-autumn/easter/cover-2027.jpg',...dimensions(coverBuffer),sourceName:'复活节主页图.jpg'};
const rank=i=>{const n=parseInt(i.sourceName);return n>=7&&n<=14?n-7:n<=6?n+7:n;};
easter.images.sort((a,b)=>rank(a)-rank(b));
const order=['christmas-collection','easter-autumn','ocean-collection','cat-collection','coffee-cup-collection','single-cup-collection'];
catalog.sort((a,b)=>order.indexOf(a.slug)-order.indexOf(b.slug));catalog.forEach((s,i)=>s.order=i+1);
const count=catalog.reduce((n,s)=>n+s.types.reduce((m,t)=>m+t.images.length,0),0);
const heroImages = JSON.parse(text.match(/export const heroImages = ([\s\S]*?) as const satisfies/)[1]);
const replacements = [[0, catalog.find(s=>s.slug==='ocean-collection').types[0].cover], [2, easter.cover], [3, catImages[0]], [5, catalog.find(s=>s.slug==='christmas-collection').types[0].cover]];
for (const [index, image] of replacements) {
 const {src,width,height,sourceName}=image;
 heroImages[index]={id:heroImages[index].id,src,width,height,sourceName};
}
const updated=text.replace(/export const heroImages = [\s\S]*? as const satisfies readonly HeroImage\[\];/, 'export const heroImages = '+JSON.stringify(heroImages,null,2)+' as const satisfies readonly HeroImage[];').replace(/export const catalog(?:\: readonly Series\[\])? = [\s\S]*?(?: as const satisfies readonly Series\[\])?;/,`export const catalog: readonly Series[] = ${JSON.stringify(catalog,null,2)};`).replace(/export const catalogImageCount = \d+;/,`export const catalogImageCount = ${count};`);
await writeFile(manifest,updated);
console.log(`Updated 2027 collections; ${count} total products.`);

