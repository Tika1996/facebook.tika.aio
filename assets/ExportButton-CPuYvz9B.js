const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./file-download-pLw6ZM0z.js","./index-DZEcYG8Q.js","./index-C6k8ZUm0.css"])))=>i.map(i=>d[i]);
import{a$ as i,b1 as o,b5 as e,aY as t}from"./index-DZEcYG8Q.js";import{u as l,t as n}from"./MyApp-DRRa55Bd.js";import{D as a}from"./index-KPoWFIyW.js";import"./sweetalert2.esm.all-BZxvatOx.js";import"./getIds-BE6G2xp0.js";import"./index-B87p3I4c.js";import"./Input-LTpJ6AuY.js";import"./EyeOutlined-BBPXKIU8.js";import"./SearchOutlined-Bh66KhXc.js";import"./index-CiDxWY8X.js";import"./Dropdown-BgvXKd3u.js";import"./dropdown-BoVCRztz.js";import"./PurePanel-Beni9Vkb.js";import"./move-Bzyc79vL.js";
async function __buildZip(data){
  const { default: fileDownload } = await import('./file-download-pLw6ZM0z.js').then(m=>({default:m.f}));
  const mod = await import('./jszip.min-BE4ZPCso.js');
  const candidates = [
    mod?.JSZip,
    mod?.default?.JSZip,
    mod?.j?.JSZip,
    mod?.default,
    mod?.j,
    mod,
    (typeof window!=='undefined'&&window.JSZip)
  ];
  let zip = null;
  for (const cand of candidates){
    if (!cand) continue;
    try {
      if (typeof cand === 'function') {
        try { zip = new cand(); } catch { zip = cand(); }
      } else if (typeof cand.JSZip === 'function') {
        try { zip = new cand.JSZip(); } catch { zip = cand.JSZip(); }
      } else if (cand.file && cand.generateAsync) {
        zip = cand; // already an instance
      }
    } catch {}
    if (zip && typeof zip.file === 'function' && typeof zip.generateAsync === 'function') break;
    else zip = null;
  }
  if (!zip) throw new TypeError('JSZip instance could not be created');
  // Fallback via CDN if still not available
  if (!zip) {
    await new Promise((res, rej)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      s.onload=()=>res(); s.onerror=()=>rej(new Error('CDN JSZip load failed'));
      document.head.appendChild(s);
    });
    if (window.JSZip) zip = new window.JSZip();
  }
  // Add JSON
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  zip.file('posts.json', jsonStr);
  // Build simple HTML viewer
  const escape = s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const urls = Array.from(new Set((jsonStr.match(/https?:[^"'\s)]+/g)||[])))
    .filter(u=>/\.(jpe?g|png|gif|webp|mp4|webm)(\?|$)/i.test(u));
  let mediaMap = new Map();
  let idx = 1;
  for (const u of urls){
    const ext = (u.split('?')[0].match(/\.(\w+)$/)||['','.bin'])[1];
    const name = `media/${idx}.${ext}`;
    try {
      const res = await fetch(u, {credentials:'include'});
      if (res.ok){
        const blob = await res.blob();
        zip.file(name, blob);
        mediaMap.set(u, name);
        idx++;
      }
    } catch(e){}
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>FB AIO Export</title><style>body{font-family:system-ui,Segoe UI,Arial;padding:16px;background:#0b0b0b;color:#ddd}a{color:#4ea3ff}img,video{max-width:100%;height:auto;margin:8px 0;border:1px solid #333;border-radius:6px}</style></head><body><h1>FB AIO Export</h1><p>${urls.length} media found. JSON included as posts.json</p><div id="list"></div><script>const urls=${JSON.stringify(urls)};const map=${JSON.stringify(Object.fromEntries(mediaMap))};const root=document.getElementById('list');urls.forEach(u=>{const local=map[u];let el;if(/\.(mp4|webm)(\?|$)/i.test(u)){el=document.createElement('video');el.controls=true;el.src=local||u;}else{el=document.createElement('img');el.src=local||u;}const p=document.createElement('p');p.textContent=u;root.appendChild(el);root.appendChild(p);});</script></body></html>`;
  zip.file('index.html', html);
  const blob = await zip.generateAsync({type:'blob'});
  fileDownload(blob, `export_${Date.now()}.zip`);
}
function s({data:s,children:p,options:d,title:m={en:"Export",vi:"Xuất"}}){
  const {message:u}=i.useApp(),{ti:c}=l();
  // Ensure options array exists
  d = Array.isArray(d)? d.slice() : [];
  // Append our ZIP option
  d.push({ key:'zip_all', label: c({en:'Export ZIP', vi:'Xuất ZIP'})});
  const f=d.map(({key:i,label:o})=>({key:i,label:o}));
  const dropdown = o.jsx(a,{menu:{items:f,onClick:i=>(async key=>{var o; if(!(null==s?void 0:s.length)) return u.error(c({en:'No data to export',vi:'Không có dữ liệu'}));
        if (key==='zip_all') { n('onClickExport:'+key); await __buildZip(s); return; }
        const e=d.find(o=>o.key==key);
        if('function'==typeof(null==e?void 0:e.onClick)) n('onClickExport:'+key+'onClick'), null==e||e.onClick(s);
        else { const l=null==(o=null==e?void 0:e.prepareData)?void 0:o.call(e,s); (null==l?void 0:l.data)&&(n('onClickExport:'+key+':'+l.fileName), t((()=>import('./file-download-pLw6ZM0z.js').then(i=>i.f)),__vite__mapDeps([0,1,2]),import.meta.url).then(i=>i.default(l.data,l.fileName))); }
      })(i.key)},children:p||o.jsx(e,{type:'primary',icon:o.jsx('i',{className:'fa-solid fa-download'}),children:c(m)+" "+((null==s?void 0:s.length)||0)})});
  const zipBtn = o.jsx(e,{type:'default',style:{marginLeft:'8px'},onClick:async()=>{ if(!(null==s?void 0:s.length)) return u.error(c({en:'No data to export',vi:'Không có dữ liệu'})); n('onClickExport:zip_button'); await __buildZip(s); },children:c({en:'Export ZIP',vi:'Xuất ZIP'})});
  return o.jsxs('span',{children:[dropdown, zipBtn]});
}
export{s as default};
