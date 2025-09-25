<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="algolia-site-verification" content="EEC3EBA57BFE40B9" />

        <title>FB AIO Extension</title>

        <link rel="icon" href="./assets/logo-BgUNo_GL.png" />

        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
        />

        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0MQRTEC81L"></script>
        <script>
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());

            gtag('config', 'G-0MQRTEC81L');
        </script>
        <script>
            // Enhanced Export: when user exports JSON, also offer Download (media + HTML)
            (function(){
                const hasFS = !!window.showDirectoryPicker;
                const pad = (x)=>String(x).padStart(2,'0');
                const tsName = (p,ext)=>{ const d=new Date(); return `${p}_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}.${ext}`; };
                const guessUrls = (post)=>{
                    const urls=new Set();
                    const visit=(v)=>{
                        if(!v) return; const t=typeof v;
                        if(t==='string'){
                            const s=String(v);
                            if(/\.(jpg|jpeg|png|gif|webp|mp4|mov|m4v|webm)(\?|$)/i.test(s) || /fbcdn|cdn|video|image/.test(s)) urls.add(s);
                        } else if(Array.isArray(v)) v.forEach(visit); else if(t==='object') Object.values(v).forEach(visit);
                    };
                    visit(post); return Array.from(urls);
                };
                async function writeFileHandle(dirHandle, pathParts, content){
                    let parent=dirHandle;
                    for(let i=0;i<pathParts.length-1;i++) parent=await parent.getDirectoryHandle(pathParts[i],{create:true});
                    const fileHandle=await parent.getFileHandle(pathParts[pathParts.length-1],{create:true});
                    const w=await fileHandle.createWritable(); await w.write(content); await w.close();
                }
                async function exportMediaHTML(posts){
                    try{
                        if(!posts || !posts.length) return;
                        // Build media map
                        const items=[]; const mediaList=[]; let idx=1;
                        for(const p of posts){
                            const urls=guessUrls(p); const refs=[];
                            for(const u of urls){ const e=(u.split('?')[0].split('.').pop()||'bin').toLowerCase().slice(0,4); const name=`media_${String(idx++).padStart(4,'0')}.${e}`; refs.push({url:u,name}); mediaList.push({url:u,name}); }
                            items.push({post:p,media:refs});
                        }
                        const esc = (s)=>String(s||'').replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
                        const html=[
                            '<!DOCTYPE html><html><head><meta charset="utf-8"/>',
                            '<title>FB AIO Export</title>',
                            '<style>body{font-family:Arial,sans-serif;background:#111;color:#eee} .card{border:1px solid #333;padding:12px;margin:12px;border-radius:8px} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px} img,video{max-width:100%;height:auto;border:1px solid #333;border-radius:6px}</style>',
                            '</head><body><h1>FB AIO Export</h1>'
                        ];
                        items.forEach((it,i)=>{
                            html.push('<div class="card">');
                            html.push(`<h3>Post #${i+1}</h3>`);
                            const p=it.post;
                            if(p && p.permalink) html.push(`<div><a href="${p.permalink}" target="_blank">Open on Facebook</a></div>`);
                            if(p && (p.message||p.caption)) html.push(`<pre>${esc(p.message||p.caption)}</pre>`);
                            if(it.media.length){
                                html.push('<div class="grid">');
                                for(const m of it.media){
                                    if(/\.(mp4|webm|mov|m4v)$/i.test(m.name)) html.push(`<video controls src="media/${m.name}"></video>`);
                                    else html.push(`<img src="media/${m.name}"/>`);
                                }
                                html.push('</div>');
                            }
                            html.push('</div>');
                        });
                        html.push('</body></html>');
                        const htmlBlob=new Blob([html.join('')],{type:'text/html'});

                        if(hasFS){
                            let dir; try{ dir=await window.showDirectoryPicker({id:'fbaio_posts_export'});}catch(e){return}
                            await writeFileHandle(dir,[tsName('posts','json')], new Blob([JSON.stringify(posts,null,2)],{type:'application/json'}));
                            for(const m of mediaList){ try{ const res=await fetch(m.url,{credentials:'include'}); const buf=await res.arrayBuffer(); await writeFileHandle(dir,['media',m.name], new Blob([buf])); }catch(e){} }
                            await writeFileHandle(dir,[tsName('index','html')], htmlBlob);
                            alert('Exported to selected folder');
                            return;
                        }
                        // Fallback ZIP
                        const {default:JSZip} = await import('./assets/jszip.min-BE4ZPCso.js');
                        const zip=new JSZip();
                        zip.file('posts.json', JSON.stringify(posts,null,2));
                        const media=zip.folder('media');
                        for(const m of mediaList){ try{ const res=await fetch(m.url,{credentials:'include'}); const buf=await res.arrayBuffer(); media.file(m.name, buf);}catch(e){} }
                        zip.file('index.html', await htmlBlob.text());
                        const blob=await zip.generateAsync({type:'blob'});
                        const fn=tsName('posts_export','zip');
                        const mod=await import('./assets/file-download-pLw6ZM0z.js').then(m=>m);
                        (mod.f||mod.default)(blob, fn);
                    }catch(e){console.error('Enhanced export failed',e)}
                }
                // Intercept clicks on downloads of JSON to chain media export
                document.addEventListener('click', async (ev)=>{
                    const a = ev.target && (ev.target.closest && ev.target.closest('a[download]'));
                    if(!a) return;
                    const name=(a.getAttribute('download')||'').toLowerCase();
                    if(!name.endsWith('.json')) return;
                    try{
                        // Fetch the JSON blob behind the blob URL
                        const href=a.getAttribute('href')||'';
                        if(!href.startsWith('blob:')) return; // only intercept app-generated JSON
                        ev.preventDefault(); ev.stopImmediatePropagation();
                        const res=await fetch(href); const text=await res.text();
                        let posts; try{ posts=JSON.parse(text);}catch(e){ posts=null; }
                        if(!posts || !Array.isArray(posts)){
                            // If content is not an array, allow default download
                            a.click(); return;
                        }
                        await exportMediaHTML(posts);
                        // Still allow saving original JSON if desired:
                        try{ const blob=new Blob([text],{type:'application/json'}); const url=URL.createObjectURL(blob); const tmp=document.createElement('a'); tmp.href=url; tmp.download=name||tsName('posts','json'); document.body.appendChild(tmp); tmp.click(); setTimeout(()=>{ URL.revokeObjectURL(url); tmp.remove(); }, 1000);}catch(e){}
                    }catch(e){ console.error('Intercept export error',e); }
                }, true);
            })();
        </script>

        <!-- Google adsense -->
        <!-- <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3880569561595847"
            crossorigin="anonymous"
        ></script> -->

        <!-- Datafast -->
        <!-- <script
            defer
            data-website-id="687a236d403a53da966232c8"
            data-domain="fb-aio.github.io"
            src="https://datafa.st/js/script.js"
        ></script> -->

        <style>
            ._init_loading {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                width: 100vw;
                margin: 0;
                padding: 0;
                color: #999;
            }
            /* Non-destructive hide to avoid interfering with framework's VDOM */
            .fbaio-hide { display: none !important; }
            /* Hide the legacy extension-required banner if present */
            .fbaio-ext-required { display: none !important; }
        </style>
        <script>
            // Hide VIP/Checkout UI and redirect their routes to home
            (function () {
                function guardRoute() {
                    if (/^#\/(vip|checkout)/i.test(location.hash)) {
                        location.hash = '#/';
                    }
                }
                function hideVIPUI(root) {
                    const container = root || document;
                    // Hide links to /vip or /checkout
                    container.querySelectorAll('a[href*="/vip"], a[href*="/checkout"]').forEach(el => {
                        if (el.closest('.swal2-container')) return; // do not touch SweetAlert dialogs
                        const item = el.closest('li, .menu-item, .ant-menu-item, .ant-list-item, .ant-card, .ant-col, .ant-row') || el;
                        item.classList?.add('fbaio-hide');
                        item.setAttribute?.('data-fbaio','hidden');
                    });
                    // Hide buttons or spans containing VIP/Checkout text
                    const matchText = (el) => /\b(vip|checkout)\b/i.test(el.textContent || '');
                    container.querySelectorAll('button, span, div').forEach(el => {
                        if (matchText(el) && !el.closest('#root ._init_loading') && !el.closest('.swal2-container')) {
                            const item = el.closest('li, .menu-item, .ant-menu-item, .ant-list-item, .ant-card, .ant-col, .ant-row') || el;
                            item.classList?.add('fbaio-hide');
                            item.setAttribute?.('data-fbaio','hidden');
                        }
                    });
                }
                // Initial
                guardRoute();
                hideVIPUI();
                window.addEventListener('hashchange', guardRoute);
                // Observe dynamic UI
                const mo = new MutationObserver((muts) => {
                    for (const m of muts) {
                        m.addedNodes && m.addedNodes.forEach(n => {
                            if (n.nodeType === 1) hideVIPUI(n);
                        });
                    }
                });
                mo.observe(document.documentElement, { childList: true, subtree: true });
            })();
        </script>
        <script>
            // Neutralize any remaining VIP prompts/modals (e.g., SweetAlert VIP forms)
            (function(){
                function hideVipModals(root){
                    const c = root || document;
                    c.querySelectorAll('.swal2-container, .swal2-popup').forEach(el => {
                        const txt = (el.textContent || '').toLowerCase();
                        if (/(unlock\s+vip|see\s+pricing|pricing|buy\s+vip|vip\s+expired|renew\s+vip)/i.test(txt)){
                            // Hide dialog non-destructively
                            el.style.display = 'none';
                            el.classList.add('fbaio-hide');
                        }
                    });
                    // Disable any button that would open VIP/pricing
                    c.querySelectorAll('a,button').forEach(btn => {
                        const label = (btn.textContent || '').toLowerCase();
                        if (/(see\s+pricing|pricing|unlock\s+vip|buy\s+vip|renew\s+vip)/i.test(label)){
                            btn.addEventListener('click', e => { e.stopImmediatePropagation(); e.preventDefault(); }, {capture:true});
                            btn.classList.add('fbaio-hide');
                        }
                    });
                }
                // Initial and observe changes
                hideVipModals();
                const mo = new MutationObserver(muts => {
                    for (const m of muts){
                        if (m.addedNodes) m.addedNodes.forEach(n => { if (n.nodeType === 1) hideVipModals(n); });
                    }
                });
                mo.observe(document.documentElement, {childList:true, subtree:true});
            })();
        </script>
        <script>
            // Completely block calls to the disable-devtool remote URL and freeze the global
            (function(){
                const BLOCK_HOST = 'theajack.github.io';
                const shouldBlock = (url) => {
                    try { const u = new URL(url, location.href); return u.host === BLOCK_HOST; } catch(e) { return false; }
                };
                // Block fetch
                if (window.fetch) {
                    const origFetch = window.fetch.bind(window);
                    window.fetch = function(input, init){
                        const url = typeof input === 'string' ? input : (input?.url || '');
                        if (shouldBlock(url)) return Promise.resolve(new Response('', {status: 204}))
                        return origFetch(input, init);
                    };
                }
                // Block XHR
                (function(){
                    const OrigXHR = window.XMLHttpRequest;
                    function Wrapped(){ const xhr = new OrigXHR();
                        const open = xhr.open; xhr.open = function(method, url, ...rest){
                            if (shouldBlock(url)) { this.__blocked = true; }
                            return open.call(this, method, url, ...rest);
                        };
                        const send = xhr.send; xhr.send = function(...args){
                            if (this.__blocked) { try { this.abort(); } catch(e){} return; }
                            return send.apply(this, args);
                        };
                        return xhr;
                    }
                    window.XMLHttpRequest = Wrapped;
                })();
                // Block window.open to that host
                if (window.open) {
                    const origOpen = window.open.bind(window);
                    window.open = function(url, ...rest){
                        if (shouldBlock(url)) return null;
                        return origOpen(url, ...rest);
                    };
                }
                // Freeze DisableDevtool global
                try {
                    Object.defineProperty(window, 'DisableDevtool', {value: {start(){}, stop(){}}, configurable: false, writable: false});
                } catch(e) {}
            })();
        </script>
        <script>
            // Re-enable DevTools and context menu (neutralize disable-devtool)
            (function(){
                function allowContextMenu(){
                    try { document.oncontextmenu = null; } catch(e){}
                    // Stop other handlers from cancelling
                    const allow = (e)=>{ e.stopImmediatePropagation(); /* do not preventDefault to allow menu */ };
                    document.addEventListener('contextmenu', allow, true);
                    window.addEventListener('contextmenu', allow, true);
                }
                function allowDevToolsShortcuts(){
                    const allow = (e)=>{
                        const k = (e.key||'').toUpperCase();
                        if (k === 'F12' || (e.ctrlKey && e.shiftKey && (k==='I' || k==='J' || k==='C'))) {
                            // Stop other listeners that would block these shortcuts
                            e.stopImmediatePropagation();
                        }
                    };
                    document.addEventListener('keydown', allow, true);
                    window.addEventListener('keydown', allow, true);
                }
                function stopDisableDevtool(){
                    try {
                        if (window.DisableDevtool && typeof window.DisableDevtool.stop === 'function') {
                            window.DisableDevtool.stop();
                        }
                        // Replace with no-op to prevent re-start
                        window.DisableDevtool = window.DisableDevtool || {};
                        window.DisableDevtool.start = function(){};
                        window.DisableDevtool.stop = function(){};
                    } catch(e){}
                }
                // Run now and after load
                allowContextMenu();
                allowDevToolsShortcuts();
                stopDisableDevtool();
                window.addEventListener('load', ()=>{
                    allowContextMenu();
                    allowDevToolsShortcuts();
                    stopDisableDevtool();
                });
                // Also observe DOM in case the library re-attaches handlers later
                const mo = new MutationObserver(()=>{
                    allowContextMenu();
                    allowDevToolsShortcuts();
                    stopDisableDevtool();
                });
                mo.observe(document.documentElement, {childList:true, subtree:true});
            })();
        </script>
        <script>
            // Redirect any chrome.runtime messaging targeting the old extension ID to the new one
            (function(){
                const OLD_ID = 'ncncagnhhigemlgiflfgdhcdpipadmmm';
                const NEW_ID = 'ekkpkjmmohjeokgndlanlnpnifaenlpd';
                if (window.chrome && chrome.runtime) {
                    try {
                        const origSend = chrome.runtime.sendMessage?.bind(chrome.runtime);
                        if (origSend) {
                            chrome.runtime.sendMessage = function(targetOrMessage, ...rest) {
                                try {
                                    if (typeof targetOrMessage === 'string' && targetOrMessage === OLD_ID) {
                                        const [message, responseCallback] = rest;
                                        return origSend(NEW_ID, message, responseCallback);
                                    }
                                } catch (e) {}
                                return origSend(targetOrMessage, ...rest);
                            };
                        }
                        const origConnect = chrome.runtime.connect?.bind(chrome.runtime);
                        if (origConnect) {
                            chrome.runtime.connect = function(targetExtensionId, connectInfo) {
                                try {
                                    if (targetExtensionId === OLD_ID) {
                                        return origConnect(NEW_ID, connectInfo);
                                    }
                                } catch (e) {}
                                return origConnect(targetExtensionId, connectInfo);
                            };
                        }
                    } catch (e) {}
                }
            })();
        </script>
        <script>
            // Remove "Coming soon" badges and enable AutoRun toggles
            (function(){
                function stripComingSoon(root){
                    const c = root || document;
                    // Hide tags/badges with text 'Coming soon'
                    c.querySelectorAll('span, div, i').forEach(el => {
                        if (el.closest('.swal2-container')) return; // skip SweetAlert
                        const txt = (el.textContent || '').trim();
                        if (/^coming\s+soon$/i.test(txt)){
                            el.style.display = 'none';
                            el.classList?.add('fbaio-hide');
                        }
                    });
                    // Enable checkboxes/toggles that might be disabled
                    c.querySelectorAll('input[type="checkbox"][disabled], button[disabled]').forEach(el => {
                        el.removeAttribute('disabled');
                        el.classList?.remove('disabled');
                        el.setAttribute?.('aria-disabled','false');
                    });
                }
                // Initial
                stripComingSoon();
                // Observe dynamic changes
                const mo = new MutationObserver((muts) => {
                    for (const m of muts){
                        if (m.addedNodes) m.addedNodes.forEach(n => { if (n.nodeType === 1) stripComingSoon(n); });
                    }
                });
                mo.observe(document.documentElement, { childList: true, subtree: true });
            })();
        </script>
        <script>
            // Handle legacy "This feature requires FB AIO extension" banner
            (function(){
                const NEW_EXT_URL = 'https://tika1996.github.io/facebook.tika.aio/'; // fallback info page
                const OLD_EXT_ID = 'ncncagnhhigemlgiflfgdhcdpipadmmm';
                const CWS_HOST = 'chromewebstore.google.com';
                function fixBanner(root){
                    const c = root || document;
                    // Find banners by text
                    c.querySelectorAll('div,section,article').forEach(el => {
                        if (el.closest('.swal2-container')) return; // skip SweetAlert
                        const txt = (el.textContent || '').trim();
                        if (/this feature requires\s*fb aio extension/i.test(txt)){
                            // Try to retarget the CTA button
                            const btn = el.querySelector('a,button');
                            if (btn && btn.tagName === 'A'){
                                try { btn.href = NEW_EXT_URL; btn.target = '_blank'; } catch(e){}
                            }
                            // Also hide the legacy banner if desired
                            el.classList.add('fbaio-ext-required');
                        }
                    });
                    // Rewrite any anchors pointing to Chrome Web Store / old extension ID
                    c.querySelectorAll('a[href]').forEach(a => {
                        try {
                            const url = new URL(a.href, location.href);
                            if (url.host.includes(CWS_HOST) || url.href.includes(OLD_EXT_ID)){
                                a.href = NEW_EXT_URL;
                                a.target = '_blank';
                                a.rel = 'noopener noreferrer';
                            }
                        } catch(e){}
                        // Retarget any button-like anchor with label 'Install now'
                        const label = (a.textContent || '').trim();
                        if (/^install now$/i.test(label)){
                            a.href = NEW_EXT_URL;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                        }
                    });
                }
                // Initial
                fixBanner();
                // Observe
                const mo2 = new MutationObserver((muts) => {
                    for (const m of muts) {
                        m.addedNodes && m.addedNodes.forEach(n => { if (n.nodeType === 1) fixBanner(n); });
                    }
                });
                mo2.observe(document.documentElement, { childList: true, subtree: true });
            })();
        </script>
      <script type="module" crossorigin src="./assets/index-DZEcYG8Q.js"></script>
      <link rel="stylesheet" crossorigin href="./assets/index-C6k8ZUm0.css">
    </head>

    <body style="margin: 0; padding: 0">
        <!--[if IE]>
            <p class="browserupgrade">
                You are using an <strong>outdated</strong> browser. Please
                <a href="https://browsehappy.com/">upgrade your browser</a> to improve your
                experience and security.
            </p>
        <![endif]-->

        <div id="root" style="margin: 0; padding: 0">
            <div class="_init_loading">
                <h1>🚀 Getting ready...</h1>
            </div>
        </div>
    </body>
</html>
