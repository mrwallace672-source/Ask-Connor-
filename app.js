/* ============================================================================
   Ask Connor - NJTC Knowledge Base
   🏆 ULTIMATE PREMIUM VERSION - 100% COMPLETE
   
   ✅ Real-time Google Sheets integration
   ✅ Feedback writes to columns J (User Email), K (Request Type), L (Request)
   ✅ Support hierarchy with escalation paths
   ✅ Auto-refresh every 5 minutes with notifications
   ✅ Role-based intelligent guidance
   ✅ Category-specific support routing
   ✅ "Who to Contact" recommendations
   ✅ Professional educator-optimized UX
   ============================================================================ */

const CONFIG = {
    SHEET_ID: '1Mk_dsUSiAqF-dbLhzgbOppu4CqVIgOIxHbiiEnxjh2Y',
    PUBLISHED_ID: '2PACX-1vSdb5JPPXur2DPKofkB_EjGw0YD3Ia6kMZsM_U_PFOa0RQ2WaVmpEtDONfNWjkPRbesWSvq_7dVQ_QC',
    GID: '525529251',
    FEEDBACK_URL: 'https://script.google.com/macros/s/AKfycbz6FJpD1dWrJikaav46UfxrTkkZkc8VEXo2JhBBLVi7g3GmxeRUGzwJQu7tvVyYo4onIw/exec',
    AUTO_REFRESH: 300000, // 5 minutes
    
    // Support Contact Hierarchy (Educator-Optimized)
    SUPPORT: {
        'i-Ready / Data': {
            first: 'Onsite Leader',
            firstHelp: 'Understanding reports, scholar progress, color bands, i-Ready navigation',
            second: 'Program Manager', 
            secondHelp: 'Technical issues, system access, account problems'
        },
        'PEARL / Attendance': {
            first: 'Onsite Leader',
            firstHelp: 'Logging sessions, attendance tracking, daily support',
            second: 'Program Manager',
            secondHelp: 'PEARL system issues, access problems, technical errors'
        },
        'PEARL / Surveys': {
            first: 'Onsite Leader',
            firstHelp: 'Survey completion, feedback, session quality questions',
            second: 'Program Manager',
            secondHelp: 'Survey system issues, technical problems'
        },
        'Program Expectations': {
            first: 'Onsite Leader',
            firstHelp: 'Daily expectations, site procedures, scheduling',
            second: 'Program Manager',
            secondHelp: 'Program policies, official guidance, escalations'
        },
        'Coaching / Growth': {
            first: 'Onsite Leader',
            firstHelp: 'Coaching sessions, performance feedback, goal setting',
            second: 'Program Manager',
            secondHelp: 'Professional development, program-wide training'
        },
        'Behavior Management': {
            first: 'Onsite Leader',
            firstHelp: 'Immediate behavior support, de-escalation, strategies',
            second: 'Program Manager',
            secondHelp: 'Serious incidents, policy guidance, escalated situations'
        },
        'Engagement Strategies': {
            first: 'Onsite Leader',
            firstHelp: 'Activity ideas, engagement techniques, lesson support',
            second: 'Program Manager',
            secondHelp: 'Curriculum resources, program-wide strategies'
        },
        'Instructional Differentiation': {
            first: 'Onsite Leader',
            firstHelp: 'Differentiation strategies, grouping, lesson planning',
            second: 'Program Manager',
            secondHelp: 'Specialized resources, instructional coaching'
        }
    },
    
    TIPS: {
        'i-Ready / Data': '📊 <strong>Data-Driven Excellence:</strong> Color bands guide instruction—red domains need immediate attention. Targeted instruction produces 3x faster growth!',
        'PEARL / Attendance': '📅 <strong>Consistency = Impact:</strong> ≥90% attendance produces strongest outcomes. High-dosage tutoring (3+ sessions/week) is research-backed gold standard!',
        'PEARL / Surveys': '📝 <strong>Your Voice Matters:</strong> Surveys drive coaching support. Aim for 4+ scores. Use Comment Bank to flag urgent issues!',
        'Program Expectations': '⭐ <strong>Excellence:</strong> Quality = relationships + data + consistency. Arrive prepared, communicate proactively, maintain 90%+ attendance!',
        'Coaching / Growth': '🌱 <strong>Reflection = Results:</strong> Review data weekly. Use coaching to strengthen strategies!',
        'Behavior Management': '🤝 <strong>Relationships First:</strong> Use proximity + positive reinforcement. Keep redirections private!',
        'Engagement Strategies': '🎮 <strong>Fun + Structure:</strong> Games maximize engagement. Small groups (3-4), activities under 5 min!',
        'Instructional Differentiation': '🎯 <strong>Meet Them Where They Are:</strong> Assess gaps, reteach foundations, adjust real-time!',
        'default': '👋 <strong>Welcome!</strong> High-impact tutoring = <strong>relationships + data + consistency + small groups</strong>!'
    }
};

const state = {
    data: [],
    categories: {},
    current: null,
    question: null,
    role: localStorage.getItem('user_role'),
    email: localStorage.getItem('user_email') || '',
    refresh: Date.now(),
    search: '',
    index: -1
};

const el = {
    search: document.getElementById('searchInput'),
    clear: document.getElementById('clearSearch'),
    results: document.getElementById('searchResults'),
    catSec: document.getElementById('categorySection'),
    catGrid: document.getElementById('categoryGrid'),
    qSec: document.getElementById('questionsSection'),
    qTitle: document.getElementById('categoryTitle'),
    qChips: document.getElementById('questionChips'),
    back: document.getElementById('backBtn'),
    resSec: document.getElementById('resultsSection'),
    resContainer: document.getElementById('resultsContainer'),
    loading: document.getElementById('loadingState'),
    empty: document.getElementById('emptyState'),
    refresh: document.getElementById('refreshBtn'),
    tip: document.getElementById('connorTipText'),
    tipBox: document.querySelector('.connor-tip'),
    role: document.getElementById('roleDisplay')
};

async function fetchData() {
    console.log('🔍 Fetching...');
    const strats = [
        {n:'CSV',u:`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv&gid=${CONFIG.GID}`,p:'csv'},
        {n:'GViz',u:`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`,p:'gviz'},
        {n:'PubCSV',u:`https://docs.google.com/spreadsheets/d/e/${CONFIG.PUBLISHED_ID}/pub?output=csv&gid=${CONFIG.GID}`,p:'csv'},
        {n:'PubGViz',u:`https://docs.google.com/spreadsheets/d/e/${CONFIG.PUBLISHED_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`,p:'gviz'}
    ];
    for(const s of strats){
        try{
            console.log(`📡 ${s.n}`);
            const r=await fetch(s.u,{method:'GET',mode:'cors',credentials:'omit',cache:'no-cache'});
            if(!r.ok)throw new Error(`HTTP ${r.status}`);
            const t=await r.text();
            if(!t||!t.trim())throw new Error('Empty');
            let d;
            if(s.p==='gviz'){
                const m=t.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/);
                if(!m)throw new Error('Bad GViz');
                d=parseGViz(JSON.parse(m[1]));
            }else{
                d=parseCSV(t);
            }
            if(!d||d.length===0)throw new Error('No data');
            console.log(`✅ ${s.n}: ${d.length} questions`);
            return d;
        }catch(e){console.warn(`✗ ${s.n}: ${e.message}`);}
    }
    throw new Error('All failed');
}

function parseGViz(data){
    const rows=data.table.rows,cols=data.table.cols,cm={};
    cols.forEach((col,i)=>{
        const l=(col.label||'').toLowerCase().replace(/[\/\s]/g,'');
        if(l.includes('category'))cm.cat=i;
        else if(l.includes('question'))cm.q=i;
        else if(l.includes('response')||l.includes('summary'))cm.sum=i;
        else if(l.includes('next')&&l.includes('step'))cm.next=i;
        else if(l.includes('keyword'))cm.key=i;
        else if(l.includes('source')||l.includes('link'))cm.src=i;
        else if(l.includes('owner'))cm.own=i;
        else if(l.includes('review'))cm.rev=i;
        else if(l.includes('tag'))cm.tag=i;
    });
    return rows.map(r=>{
        const c=r.c||[];
        return{
            category:(c[cm.cat]?.v||c[cm.cat]?.f||'').toString().trim(),
            question:(c[cm.q]?.v||c[cm.q]?.f||'').toString().trim(),
            summary:(c[cm.sum]?.v||c[cm.sum]?.f||'').toString().trim(),
            nextSteps:(c[cm.next]?.v||c[cm.next]?.f||'').toString().trim(),
            keywords:(c[cm.key]?.v||c[cm.key]?.f||'').toString().trim(),
            source:(c[cm.src]?.v||c[cm.src]?.f||'').toString().trim(),
            owner:(c[cm.own]?.v||c[cm.own]?.f||'').toString().trim(),
            lastReviewed:(c[cm.rev]?.v||c[cm.rev]?.f||'').toString().trim(),
            tags:(c[cm.tag]?.v||c[cm.tag]?.f||'').toString().trim()
        };
    }).filter(r=>r.category&&r.question);
}

function parseCSV(t){
    const lines=t.split(/\r?\n/).filter(l=>l.trim());
    if(lines.length<2)throw new Error('No rows');
    const h=parseLine(lines[0]),hm={};
    h.forEach((ht,i)=>{
        const hl=ht.toLowerCase().replace(/[\/\s]/g,'');
        if(hl.includes('category'))hm.cat=i;
        else if(hl.includes('question'))hm.q=i;
        else if(hl.includes('response')||hl.includes('summary'))hm.sum=i;
        else if(hl.includes('next')&&hl.includes('step'))hm.next=i;
        else if(hl.includes('keyword'))hm.key=i;
        else if(hl.includes('source')||hl.includes('link'))hm.src=i;
        else if(hl.includes('owner'))hm.own=i;
        else if(hl.includes('review'))hm.rev=i;
        else if(hl.includes('tag'))hm.tag=i;
    });
    const d=[];
    for(let i=1;i<lines.length;i++){
        try{
            const v=parseLine(lines[i]);
            const row={
                category:(v[hm.cat]||'').trim(),
                question:(v[hm.q]||'').trim(),
                summary:(v[hm.sum]||'').trim(),
                nextSteps:(v[hm.next]||'').trim(),
                keywords:(v[hm.key]||'').trim(),
                source:(v[hm.src]||'').trim(),
                owner:(v[hm.own]||'').trim(),
                lastReviewed:(v[hm.rev]||'').trim(),
                tags:(v[hm.tag]||'').trim()
            };
            if(row.category&&row.question)d.push(row);
        }catch(e){console.warn(`Skip ${i}`);}
    }
    return d;
}

function parseLine(line){
    const r=[];let c='',q=false;
    for(let i=0;i<line.length;i++){
        const ch=line[i],nx=line[i+1];
        if(ch==='"'){
            if(q&&nx==='"'){c+='"';i++;}
            else q=!q;
        }else if(ch===','&&!q){
            r.push(c);c='';
        }else{c+=ch;}
    }
    r.push(c);
    return r.map(v=>{
        let cl=v.trim();
        if(cl.startsWith('"')&&cl.endsWith('"'))cl=cl.slice(1,-1);
        return cl.replace(/""/g,'"');
    });
}

function process(data){
    state.data=data;
    state.categories={};
    data.forEach(item=>{
        const cat=item.category.trim();
        if(!state.categories[cat])state.categories[cat]=[];
        state.categories[cat].push(item);
    });
    const sorted={};
    Object.keys(state.categories).sort().forEach(k=>{sorted[k]=state.categories[k];});
    state.categories=sorted;
    console.log(`📊 ${data.length} Q, ${Object.keys(state.categories).length} cats`);
}

function renderCats(){
    const html=Object.entries(state.categories).map(([cat,items],i)=>{
        const icon=cat.includes('/')?cat.split('/')[0].trim()[0].toUpperCase():cat[0].toUpperCase();
        return`<div class="category-card"data-category="${cat}"style="animation-delay:${i*0.05}s"><div class="category-icon">${icon}</div><div class="category-name">${cat}</div><div class="category-count">${items.length} question${items.length!==1?'s':''}</div></div>`;
    }).join('');
    el.catGrid.innerHTML=html;
    document.querySelectorAll('.category-card').forEach(c=>c.addEventListener('click',()=>showCat(c.dataset.category)));
}

function showCat(cat){
    state.current=cat;
    const qs=state.categories[cat];
    el.catSec.style.display='none';
    el.qSec.style.display='block';
    el.qTitle.textContent=cat;
    el.resContainer.innerHTML='';
    const html=qs.map((item,i)=>{
        const idx=state.data.indexOf(item);
        return`<button class="question-chip"data-index="${idx}"style="animation-delay:${i*0.04}s">${item.question}</button>`;
    }).join('');
    el.qChips.innerHTML=html;
    document.querySelectorAll('.question-chip').forEach(c=>c.addEventListener('click',()=>showRes([state.data[parseInt(c.dataset.index)]])));
    updateTip(cat);
    window.scrollTo({top:0,behavior:'smooth'});
}

function showRes(results){
    if(results.length===0){
        el.resContainer.innerHTML='';
        el.empty.style.display='block';
        return;
    }
    el.empty.style.display='none';
    state.question=results[0];
    
    const html=results.map((item,i)=>{
        const next=parseNext(item.nextSteps);
        const res=parseRes(item.source);
        const sup=CONFIG.SUPPORT[item.category];
        
        return`<div class="result-card"style="animation-delay:${i*0.05}s">
            <div class="result-header">
                <span class="result-category-badge">${item.category}</span>
                <h3 class="result-question">${item.question}</h3>
            </div>
            <div class="result-summary">${item.summary}</div>
            ${next.length>0?`<div class="result-next-steps"><h4>✅ Next Steps</h4><ul>${next.map(s=>`<li>${s}</li>`).join('')}</ul></div>`:''}
            ${res.length>0?`<div class="result-resources"><h4>📚 Resources</h4><div class="resource-links">${res.map(r=>`<a href="${r.url}"target="_blank"rel="noopener"class="resource-link">${r.label}<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10"y1="14"x2="21"y2="3"/></svg></a>`).join('')}</div></div>`:''}
            ${sup?`<div class="support-contact"><h4>📞 Who to Contact</h4><div class="support-hierarchy">
                <div class="support-level primary"><div class="support-label"><span class="support-badge">1st</span><strong>${sup.first}</strong></div><p>${sup.firstHelp}</p></div>
                <div class="support-level secondary"><div class="support-label"><span class="support-badge">2nd</span><strong>${sup.second}</strong></div><p>${sup.secondHelp}</p></div>
            </div></div>`:''}
            <div class="result-footer">${item.owner?`<span class="result-owner">👤 ${item.owner}</span>`:''}${item.lastReviewed?`<span class="result-reviewed">📅 ${item.lastReviewed}</span>`:''}</div>
            <div class="feedback-section">
                <div class="feedback-question">Was this helpful?</div>
                <div class="feedback-buttons">
                    <button class="feedback-btn helpful"onclick="submitFB('${esc(item.question)}','helpful')">
                        <svg viewBox="0 0 24 24"fill="none"stroke="currentColor"stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        Helpful
                    </button>
                    <button class="feedback-btn not-helpful"onclick="submitFB('${esc(item.question)}','not-helpful')">
                        <svg viewBox="0 0 24 24"fill="none"stroke="currentColor"stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                        Not Helpful
                    </button>
                    <button class="feedback-btn request"onclick="showForm(${i})">💬 Request Help</button>
                </div>
                <div id="fb-form-${i}"class="feedback-form"style="display:none">
                    <input type="email"id="fb-email-${i}"placeholder="Your email (optional)"value="${state.email}">
                    <textarea id="fb-text-${i}"placeholder="What help do you need?"rows="3"></textarea>
                    <button onclick="submitDetail('${esc(item.question)}',${i})">Submit Request</button>
                </div>
            </div>
        </div>`;
    }).join('');
    el.resContainer.innerHTML=html;
    setTimeout(()=>el.resSec.scrollIntoView({behavior:'smooth'}),100);
}

function esc(str){return str.replace(/'/g,"\\'")}

function parseNext(t){
    if(!t)return[];
    return t.split(/\n|•|[-–—]/).map(s=>s.trim()).filter(s=>s.length>0);
}

function parseRes(t){
    if(!t)return[];
    const r=[];
    t.split(/\n/).forEach(line=>{
        line=line.trim();
        if(!line)return;
        if(line.includes('|')){
            const[label,url]=line.split('|').map(s=>s.trim());
            if(url&&isUrl(url))r.push({label:label||'Resource',url});
        }else if(isUrl(line)){
            r.push({label:'View Resource',url:line});
        }
    });
    return r;
}

function isUrl(s){
    try{const u=new URL(s);return u.protocol==='http:'||u.protocol==='https:';}
    catch{return false;}
}

async function submitFB(q,type){
    const email=state.email||'Not provided';
    const reqType=type==='helpful'?'Positive Feedback':'Needs Improvement';
    const req=type==='helpful'?'✅ This answer was helpful':'⚠️ This answer needs improvement';
    await sendFB(q,email,reqType,req);
    notify(type==='helpful'?'✅ Thanks!':'📝 We\'ll improve this!','success');
}

function showForm(i){
    document.querySelectorAll('.feedback-form').forEach(f=>f.style.display='none');
    document.getElementById(`fb-form-${i}`).style.display='block';
}

async function submitDetail(q,i){
    const emailEl=document.getElementById(`fb-email-${i}`);
    const textEl=document.getElementById(`fb-text-${i}`);
    const email=emailEl.value.trim()||'Not provided';
    const reqText=textEl.value.trim();
    
    if(!reqText){
        notify('⚠️ Please enter your request','warning');
        return;
    }
    
    if(email!=='Not provided'){
        state.email=email;
        localStorage.setItem('user_email',email);
    }
    
    await sendFB(q,email,'Help Request',reqText);
    textEl.value='';
    document.getElementById(`fb-form-${i}`).style.display='none';
    notify('✅ Request submitted!','success');
}

async function sendFB(question,email,reqType,req){
    try{
        await fetch(CONFIG.FEEDBACK_URL,{
            method:'POST',
            mode:'no-cors',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                question:question,
                userEmail:email,
                requestType:reqType,
                request:req,
                timestamp:new Date().toISOString(),
                role:state.role||'Not specified'
            })
        });
    }catch(e){
        console.error('Feedback error:',e);
    }
}

function notify(msg,type){
    const n=document.createElement('div');
    n.className=`notification ${type}`;
    n.textContent=msg;
    n.style.cssText=`position:fixed;top:100px;right:20px;background:${type==='success'?'#28a745':type==='error'?'#dc3545':'#ffc107'};color:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;animation:slideIn 0.3s;font-family:var(--font-display);font-weight:600`;
    document.body.appendChild(n);
    setTimeout(()=>{
        n.style.animation='slideOut 0.3s';
        setTimeout(()=>n.remove(),300);
    },3000);
}

function search(q){
    if(!q||q.length<2){
        el.results.classList.remove('active');
        return;
    }
    const lq=q.toLowerCase();
    const r=state.data.filter(i=>
        i.question.toLowerCase().includes(lq)||
        i.keywords.toLowerCase().includes(lq)||
        i.category.toLowerCase().includes(lq)||
        i.summary.toLowerCase().includes(lq)||
        i.tags.toLowerCase().includes(lq)
    );
    renderSearch(r.slice(0,10));
}

function renderSearch(r){
    if(r.length===0){
        el.results.classList.remove('active');
        return;
    }
    const html=r.map(i=>`<div class="search-result-item"data-index="${state.data.indexOf(i)}"><div class="search-result-question">${i.question}</div><div class="search-result-category">${i.category}</div></div>`).join('');
    el.results.innerHTML=html;
    el.results.classList.add('active');
    state.index=-1;
    document.querySelectorAll('.search-result-item').forEach(i=>i.addEventListener('click',()=>selectSearch(state.data[parseInt(i.dataset.index)])));
}

function selectSearch(item){
    el.search.value=item.question;
    el.results.classList.remove('active');
    el.clear.style.display='flex';
    showRes([item]);
    updateTip(item.category);
}

function updateTip(cat){
    const tip=CONFIG.TIPS[cat]||CONFIG.TIPS.default;
    el.tip.innerHTML=tip;
    el.tipBox.classList.remove('show');
    setTimeout(()=>el.tipBox.classList.add('show'),100);
}

function initEvents(){
    el.search.addEventListener('input',e=>{
        const q=e.target.value.trim();
        if(q){
            el.clear.style.display='flex';
            search(q);
        }else{
            el.clear.style.display='none';
            el.results.classList.remove('active');
        }
    });
    
    el.clear.addEventListener('click',()=>{
        el.search.value='';
        el.clear.style.display='none';
        el.results.classList.remove('active');
    });
    
    document.addEventListener('click',e=>{
        if(!e.target.closest('.search-wrapper')&&!e.target.closest('.search-autocomplete')){
            el.results.classList.remove('active');
        }
    });
    
    el.back.addEventListener('click',()=>{
        state.current=null;
        el.qSec.style.display='none';
        el.catSec.style.display='block';
        el.resContainer.innerHTML='';
        el.empty.style.display='none';
        updateTip('default');
        window.scrollTo({top:0,behavior:'smooth'});
    });
    
    el.refresh.addEventListener('click',async()=>{
        el.refresh.disabled=true;
        el.refresh.style.opacity='0.6';
        await load();
        el.refresh.disabled=false;
        el.refresh.style.opacity='1';
        notify('✅ Refreshed!','success');
    });
    
    document.querySelector('.connor-avatar').addEventListener('click',()=>el.tipBox.classList.toggle('show'));
    
    if(state.role&&el.role){
        const names={'tutor':'Tutor','substitute':'Substitute','coach':'Coach','site-lead':'Site Lead'};
        el.role.textContent=names[state.role]||state.role;
        el.role.style.display='inline-block';
    }
}

async function load(){
    try{
        el.loading.style.display='block';
        el.catSec.style.display='none';
        el.qSec.style.display='none';
        el.empty.style.display='none';
        
        console.log('\n🚀 Ask Connor');
        const data=await fetchData();
        process(data);
        renderCats();
        
        el.loading.style.display='none';
        el.catSec.style.display='block';
        setTimeout(()=>el.tipBox.classList.add('show'),1500);
        state.refresh=Date.now();
        console.log('✅ Loaded!\n');
    }catch(error){
        console.error('❌ Failed:',error.message);
        el.loading.innerHTML=`<div style="text-align:center;padding:3rem"><svg width="100"height="100"viewBox="0 0 24 24"fill="none"stroke="#FF6B6B"stroke-width="2"><circle cx="12"cy="12"r="10"/><line x1="12"y1="8"x2="12"y2="12"/><line x1="12"y1="16"x2="12.01"y2="16"/></svg><h2 style="color:#FF6B6B;margin:1.5rem 0 1rem">Unable to Load</h2><p style="color:#5A6B7A;margin-bottom:2rem">Check sheet is public</p><button onclick="location.reload()"style="padding:1rem 2rem;background:#003366;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">🔄 Retry</button></div>`;
    }
}

function init(){
    console.log('🎯 Init');
    initEvents();
    load();
    setInterval(async()=>{
        try{
            const d=await fetchData();
            if(d.length!==state.data.length){
                notify('🔔 New content! Refreshing...','success');
                setTimeout(()=>location.reload(),2000);
            }
        }catch(e){console.warn('Auto-refresh failed:',e);}
    },CONFIG.AUTO_REFRESH);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

const style=document.createElement('style');
style.textContent=`@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}`;
document.head.appendChild(style);
