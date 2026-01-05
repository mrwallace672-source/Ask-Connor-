/* ============================================================================
   Ask Connor - ULTIMATE FINAL VERSION
   🏆 PREMIUM GRADE - 100% COMPLETE
   
   Features:
   - Google Visualization API (handles multi-line cells)
   - Google Form feedback integration
   - Home button to change roles
   - Premium analytics
   - Auto-refresh
   ============================================================================ */

const CONFIG = {
    SHEET_ID: '1Mk_dsUSiAqF-dbLhzgbOppu4CqVIgOIxHbiiEnxjh2Y',
    GID: '525529251',
    
    // GOOGLE FORM CONFIGURATION
    FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdnatcn2uwZw2X3qDTYIcFeIgjZLfdR-vwv4wugxRMLGhSZSg/formResponse',
    FORM_FIELDS: {
        name: 'entry.1663372378',
        helpful: 'entry.102807475',
        question: 'entry.648254265',
        successful: 'entry.2005782204',
        immediate: 'entry.687299986',
        improvement: 'entry.351588659',
        onsite: 'entry.1948222890'
    },
    
    AUTO_REFRESH: 300000,
    
    SUPPORT: {
        'i-Ready / Data': {first: 'Onsite Leader',firstHelp: 'Reports, progress, color bands',second: 'Program Manager',secondHelp: 'Technical issues'},
        'PEARL / Attendance': {first: 'Onsite Leader',firstHelp: 'Logging, tracking',second: 'Program Manager',secondHelp: 'System issues'},
        'PEARL / Surveys': {first: 'Onsite Leader',firstHelp: 'Survey completion',second: 'Program Manager',secondHelp: 'Technical problems'},
        'Program Expectations': {first: 'Onsite Leader',firstHelp: 'Daily expectations',second: 'Program Manager',secondHelp: 'Policy guidance'},
        'Coaching / Growth': {first: 'Onsite Leader',firstHelp: 'Coaching sessions',second: 'Program Manager',secondHelp: 'Professional development'},
        'Behavior Management': {first: 'Onsite Leader',firstHelp: 'Behavior support',second: 'Program Manager',secondHelp: 'Escalated situations'},
        'Engagement Strategies': {first: 'Onsite Leader',firstHelp: 'Activity ideas',second: 'Program Manager',secondHelp: 'Curriculum resources'},
        'Instructional Differentiation': {first: 'Onsite Leader',firstHelp: 'Differentiation strategies',second: 'Program Manager',secondHelp: 'Specialized resources'}
    },
    
    TIPS: {
        'i-Ready / Data': '📊 <strong>Data-Driven Excellence:</strong> Color bands guide instruction!',
        'PEARL / Attendance': '📅 <strong>Consistency = Impact:</strong> ≥90% attendance!',
        'PEARL / Surveys': '📝 <strong>Your Voice Matters:</strong> Surveys drive support!',
        'Program Expectations': '⭐ <strong>Excellence:</strong> Quality = relationships + data!',
        'Coaching / Growth': '🌱 <strong>Reflection = Results:</strong> Review data weekly!',
        'Behavior Management': '🤝 <strong>Relationships First:</strong> Proximity + positive!',
        'Engagement Strategies': '🎮 <strong>Fun + Structure:</strong> Games maximize engagement!',
        'Instructional Differentiation': '🎯 <strong>Meet Them Where They Are:</strong> Assess gaps!',
        'default': '👋 <strong>Welcome!</strong> High-impact tutoring!'
    }
};

const state = {
    data: [],
    categories: {},
    current: null,
    question: null,
    currentQuestion: '',
    role: localStorage.getItem('user_role'),
    userName: localStorage.getItem('user_name') || '',
    analytics: JSON.parse(localStorage.getItem('ask_connor_analytics') || '{"categoryViews":{},"questionViews":{},"totalViews":0,"feedback":{"positive":0,"negative":0}}')
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
    role: document.getElementById('roleDisplay'),
    homeBtn: document.getElementById('homeBtn'),
    analyticsBtn: document.getElementById('analyticsBtn'),
    analyticsModal: document.getElementById('analyticsModal'),
    totalViews: document.getElementById('totalViews'),
    topCategory: document.getElementById('topCategory'),
    chartBody: document.getElementById('chartBody')
};

async function fetchData() {
    console.log('🔍 Fetching using Google Visualization API...');
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`;
    
    try {
        const r = await fetch(url, {method:'GET', mode:'cors', cache:'no-cache'});
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/);
        if (!match) throw new Error('Invalid GVIZ response');
        const json = JSON.parse(match[1]);
        const data = parseGViz(json);
        console.log(`✅ Loaded ${data.length} valid questions`);
        return data;
    } catch (e) {
        console.error('❌ Fetch failed:', e);
        throw e;
    }
}

function parseGViz(jsonData) {
    const table = jsonData.table;
    const rows = table.rows;
    const data = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.c || [];
        const getValue = (cell) => {
            if (!cell) return '';
            return (cell.v || cell.f || '').toString().trim();
        };
        
        const category = getValue(cells[0]);
        const question = getValue(cells[1]);
        
        if (!category) {
            console.log(`⏹️ Stopped at row ${i+2} - no category`);
            break;
        }
        
        if (!question) {
            console.log(`⚠️ Skipped row ${i+2} - category "${category}" but no question`);
            continue;
        }
        
        data.push({
            category: category,
            question: question,
            summary: getValue(cells[2]),
            nextSteps: getValue(cells[3]),
            keywords: getValue(cells[4]),
            source: getValue(cells[5]),
            owner: getValue(cells[6]),
            lastReviewed: getValue(cells[7]),
            tags: getValue(cells[8])
        });
    }
    
    return data;
}

function process(data) {
    state.data = data;
    state.categories = {};
    
    data.forEach(item => {
        const cat = item.category.trim();
        if (!state.categories[cat]) {
            state.categories[cat] = [];
        }
        state.categories[cat].push(item);
    });
    
    const sorted = {};
    Object.keys(state.categories).sort().forEach(k => {
        sorted[k] = state.categories[k];
    });
    state.categories = sorted;
    
    console.log(`📊 Categories: ${Object.keys(state.categories).join(', ')}`);
    console.log(`📊 Total questions: ${data.length}`);
}

function trackCategoryView(cat) {
    if (!state.analytics.categoryViews[cat]) state.analytics.categoryViews[cat] = 0;
    state.analytics.categoryViews[cat]++;
    state.analytics.totalViews++;
    localStorage.setItem('ask_connor_analytics', JSON.stringify(state.analytics));
    updateAnalyticsDashboard();
}

function trackQuestionView(q) {
    if (!state.analytics.questionViews[q]) state.analytics.questionViews[q] = 0;
    state.analytics.questionViews[q]++;
    localStorage.setItem('ask_connor_analytics', JSON.stringify(state.analytics));
}

function updateAnalyticsDashboard() {
    if (el.totalViews) el.totalViews.textContent = state.analytics.totalViews;
    const topCat = Object.entries(state.analytics.categoryViews).sort((a,b) => b[1] - a[1])[0];
    if (el.topCategory && topCat) el.topCategory.textContent = topCat[0];
}

function renderCats() {
    const html = Object.entries(state.categories).map(([cat, items], i) => {
        const icon = cat.includes('/') ? cat.split('/')[0].trim()[0].toUpperCase() : cat[0].toUpperCase();
        const views = state.analytics.categoryViews[cat] || 0;
        return `<div class="category-card" data-category="${esc(cat)}" style="animation-delay:${i*0.05}s">
            <div class="category-icon">${icon}</div>
            <div class="category-name">${cat}</div>
            <div class="category-count">${items.length} question${items.length !== 1 ? 's' : ''}</div>
            ${views > 0 ? `<div class="category-views">👁️ ${views} views</div>` : ''}
        </div>`;
    }).join('');
    
    el.catGrid.innerHTML = html;
    
    document.querySelectorAll('.category-card').forEach(c => {
        c.addEventListener('click', () => {
            const cat = c.dataset.category;
            trackCategoryView(cat);
            showCat(cat);
        });
    });
}

function showCat(cat) {
    state.current = cat;
    const qs = state.categories[cat];
    
    el.catSec.style.display = 'none';
    el.qSec.style.display = 'block';
    el.qTitle.textContent = cat;
    el.resContainer.innerHTML = '';
    
    const html = qs.map((item, i) => {
        const idx = state.data.indexOf(item);
        const views = state.analytics.questionViews[item.question] || 0;
        return `<button class="question-chip" data-index="${idx}" style="animation-delay:${i*0.04}s">
            ${item.question}
            ${views > 0 ? `<span class="question-views">👁️ ${views}</span>` : ''}
        </button>`;
    }).join('');
    
    el.qChips.innerHTML = html;
    
    document.querySelectorAll('.question-chip').forEach(c => {
        c.addEventListener('click', () => {
            const idx = parseInt(c.dataset.index);
            trackQuestionView(state.data[idx].question);
            showRes([state.data[idx]]);
        });
    });
    
    updateTip(cat);
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function showRes(results) {
    if (results.length === 0) {
        el.resContainer.innerHTML = '';
        el.empty.style.display = 'block';
        return;
    }
    
    el.empty.style.display = 'none';
    const item = results[0];
    state.currentQuestion = item.question;
    
    const next = parseNext(item.nextSteps);
    const resources = parseResources(item.source);
    const sup = CONFIG.SUPPORT[item.category];
    
    const html = `<div class="result-card">
        <div class="result-header">
            <span class="result-category-badge">${item.category}</span>
            <h3 class="result-question">${item.question}</h3>
        </div>
        <div class="result-summary">${item.summary}</div>
        
        ${next.length > 0 ? `<div class="result-next-steps">
            <h4>✅ Next Steps</h4>
            <ul>${next.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>` : ''}
        
        ${resources.length > 0 ? `<div class="result-resources">
            <h4>📚 Resources</h4>
            <div class="resource-links">${resources.map(r => `
                <a href="${r.url}" target="_blank" rel="noopener" class="resource-link">
                    ${r.label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>
            `).join('')}</div>
        </div>` : ''}
        
        ${sup ? `<div class="support-contact">
            <h4>📞 Who to Contact</h4>
            <div class="support-hierarchy">
                <div class="support-level primary">
                    <div class="support-label">
                        <span class="support-badge">1st</span>
                        <strong>${sup.first}</strong>
                    </div>
                    <p>${sup.firstHelp}</p>
                </div>
                <div class="support-level secondary">
                    <div class="support-label">
                        <span class="support-badge">2nd</span>
                        <strong>${sup.second}</strong>
                    </div>
                    <p>${sup.secondHelp}</p>
                </div>
            </div>
        </div>` : ''}
        
        <div class="result-footer">
            ${item.owner ? `<span class="result-owner">👤 ${item.owner}</span>` : ''}
            ${item.lastReviewed ? `<span class="result-reviewed">📅 ${item.lastReviewed}</span>` : ''}
        </div>
        
        <div class="feedback-section-premium">
            <div class="feedback-header">
                <h4>💬 Help Us Improve</h4>
                <p>Your feedback makes Connor better for everyone!</p>
            </div>
            <button class="feedback-btn-premium" onclick="openFeedbackForm()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Share Feedback
            </button>
        </div>
    </div>`;
    
    el.resContainer.innerHTML = html;
    setTimeout(() => el.resSec.scrollIntoView({behavior: 'smooth'}), 100);
}

function openFeedbackForm() {
    const userName = state.userName || prompt('What is your name?') || 'Anonymous';
    if (!state.userName && userName !== 'Anonymous') {
        state.userName = userName;
        localStorage.setItem('user_name', userName);
    }
    
    const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdnatcn2uwZw2X3qDTYIcFeIgjZLfdR-vwv4wugxRMLGhSZSg/viewform?${CONFIG.FORM_FIELDS.name}=${encodeURIComponent(userName)}&${CONFIG.FORM_FIELDS.question}=${encodeURIComponent(state.currentQuestion)}`;
    
    window.open(formUrl, '_blank', 'width=700,height=800');
    notify('✅ Feedback form opened!', 'success');
}

function esc(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function parseNext(text) {
    if (!text) return [];
    return text.split(/\n|•|[-–—]/).map(s => s.trim()).filter(s => s.length > 0);
}

function parseResources(text) {
    if (!text) return [];
    const resources = [];
    text.split(/\n/).forEach(line => {
        line = line.trim();
        if (!line) return;
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            const url = urlMatch[0];
            const label = line.replace(url, '').trim() || 'View Resource';
            resources.push({label, url});
        }
    });
    return resources;
}

function notify(msg, type) {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = msg;
    n.style.cssText = `position:fixed;top:100px;right:20px;background:${type==='success'?'#28a745':type==='error'?'#dc3545':'#ffc107'};color:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;animation:slideIn 0.3s;font-family:var(--font-display);font-weight:600`;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.animation = 'slideOut 0.3s';
        setTimeout(() => n.remove(), 300);
    }, 3000);
}

function showAnalytics() {
    if (!el.analyticsModal) return;
    el.analyticsModal.style.display = 'flex';
    renderCharts();
}

function hideAnalytics() {
    if (el.analyticsModal) el.analyticsModal.style.display = 'none';
}

function renderCharts() {
    if (!el.chartBody) return;
    
    const catData = Object.entries(state.analytics.categoryViews).sort((a,b) => b[1] - a[1]);
    const qData = Object.entries(state.analytics.questionViews).sort((a,b) => b[1] - a[1]).slice(0, 10);
    
    const catHTML = catData.map(([cat, views]) => {
        const max = Math.max(...catData.map(c => c[1]));
        const pct = (views / max) * 100;
        return `<div class="chart-bar">
            <div class="chart-bar-label"><span>${cat}</span><span>${views}</span></div>
            <div class="chart-bar-fill" style="width:${pct}%"></div>
        </div>`;
    }).join('');
    
    const qHTML = qData.map(([q, views]) => {
        const max = Math.max(...qData.map(c => c[1]));
        const pct = (views / max) * 100;
        return `<div class="chart-bar">
            <div class="chart-bar-label"><span>${q.slice(0, 40)}...</span><span>${views}</span></div>
            <div class="chart-bar-fill" style="width:${pct}%"></div>
        </div>`;
    }).join('');
    
    el.chartBody.innerHTML = `
        <div class="chart-section">
            <h3>📊 Category Views</h3>
            ${catHTML || '<p>No data yet</p>'}
        </div>
        <div class="chart-section">
            <h3>🔥 Top Questions</h3>
            ${qHTML || '<p>No data yet</p>'}
        </div>
        <div class="chart-section">
            <h3>💬 Total Views</h3>
            <div class="feedback-summary">
                <div class="feedback-stat positive">
                    <div class="feedback-icon">👁️</div>
                    <div class="feedback-count">${state.analytics.totalViews}</div>
                    <div class="feedback-label">Page Views</div>
                </div>
            </div>
        </div>
    `;
}

function search(q) {
    if (!q || q.length < 2) {
        el.results.classList.remove('active');
        return;
    }
    
    const lq = q.toLowerCase();
    const r = state.data.filter(i =>
        i.question.toLowerCase().includes(lq) ||
        i.keywords.toLowerCase().includes(lq) ||
        i.category.toLowerCase().includes(lq) ||
        i.summary.toLowerCase().includes(lq) ||
        i.tags.toLowerCase().includes(lq)
    );
    
    renderSearch(r.slice(0, 10));
}

function renderSearch(r) {
    if (r.length === 0) {
        el.results.classList.remove('active');
        return;
    }
    
    const html = r.map(i => `<div class="search-result-item" data-index="${state.data.indexOf(i)}">
        <div class="search-result-question">${i.question}</div>
        <div class="search-result-category">${i.category}</div>
    </div>`).join('');
    
    el.results.innerHTML = html;
    el.results.classList.add('active');
    
    document.querySelectorAll('.search-result-item').forEach(i => {
        i.addEventListener('click', () => {
            const item = state.data[parseInt(i.dataset.index)];
            trackQuestionView(item.question);
            selectSearch(item);
        });
    });
}

function selectSearch(item) {
    el.search.value = item.question;
    el.results.classList.remove('active');
    el.clear.style.display = 'flex';
    showRes([item]);
    updateTip(item.category);
}

function updateTip(cat) {
    const tip = CONFIG.TIPS[cat] || CONFIG.TIPS.default;
    el.tip.innerHTML = tip;
    el.tipBox.classList.remove('show');
    setTimeout(() => el.tipBox.classList.add('show'), 100);
}

function goHome() {
    if (confirm('Return to role selection? This will reload the page.')) {
        localStorage.removeItem('user_role');
        window.location.href = 'welcome.html';
    }
}

function initEvents() {
    el.search.addEventListener('input', e => {
        const q = e.target.value.trim();
        if (q) {
            el.clear.style.display = 'flex';
            search(q);
        } else {
            el.clear.style.display = 'none';
            el.results.classList.remove('active');
        }
    });
    
    el.clear.addEventListener('click', () => {
        el.search.value = '';
        el.clear.style.display = 'none';
        el.results.classList.remove('active');
    });
    
    document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrapper') && !e.target.closest('.search-autocomplete')) {
            el.results.classList.remove('active');
        }
    });
    
    el.back.addEventListener('click', () => {
        state.current = null;
        el.qSec.style.display = 'none';
        el.catSec.style.display = 'block';
        el.resContainer.innerHTML = '';
        el.empty.style.display = 'none';
        updateTip('default');
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
    
    el.refresh.addEventListener('click', async () => {
        el.refresh.disabled = true;
        el.refresh.style.opacity = '0.6';
        await load();
        el.refresh.disabled = false;
        el.refresh.style.opacity = '1';
        notify('✅ Refreshed!', 'success');
    });
    
    if (el.homeBtn) {
        el.homeBtn.addEventListener('click', goHome);
    }
    
    if (document.querySelector('.connor-avatar')) {
        document.querySelector('.connor-avatar').addEventListener('click', () => el.tipBox.classList.toggle('show'));
    }
    
    if (el.analyticsBtn) {
        el.analyticsBtn.addEventListener('click', showAnalytics);
    }
    
    if (el.analyticsModal) {
        el.analyticsModal.addEventListener('click', e => {
            if (e.target === el.analyticsModal) hideAnalytics();
        });
    }
    
    if (state.role && el.role) {
        const names = {'tutor':'Tutor','substitute':'Substitute','coach':'Coach','site-lead':'Site Lead'};
        el.role.textContent = names[state.role] || state.role;
        el.role.style.display = 'inline-block';
    }
}

async function load() {
    try {
        el.loading.style.display = 'block';
        el.catSec.style.display = 'none';
        el.qSec.style.display = 'none';
        el.empty.style.display = 'none';
        
        console.log('\n🚀 Ask Connor - Loading...');
        const data = await fetchData();
        process(data);
        renderCats();
        updateAnalyticsDashboard();
        
        el.loading.style.display = 'none';
        el.catSec.style.display = 'block';
        setTimeout(() => el.tipBox.classList.add('show'), 1500);
        console.log('✅ Ready!\n');
    } catch (error) {
        console.error('❌ Failed:', error);
        el.loading.innerHTML = `<div style="text-align:center;padding:3rem">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2 style="color:#FF6B6B;margin:1.5rem 0 1rem">Unable to Load</h2>
            <p style="color:#5A6B7A;margin-bottom:2rem">Check sheet is public</p>
            <button onclick="location.reload()" style="padding:1rem 2rem;background:#003366;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">🔄 Retry</button>
        </div>`;
    }
}

function init() {
    console.log('🎯 Initializing Ask Connor');
    initEvents();
    load();
    
    setInterval(async () => {
        try {
            const d = await fetchData();
            if (d.length !== state.data.length) {
                notify('🔔 New content! Refreshing...', 'success');
                setTimeout(() => location.reload(), 2000);
            }
        } catch (e) {
            console.warn('Auto-refresh failed:', e);
        }
    }, CONFIG.AUTO_REFRESH);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const style = document.createElement('style');
style.textContent = `
@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}
.category-views,.question-views{font-size:0.75rem;color:var(--gray-600);margin-top:0.5rem;display:block;}
`;
document.head.appendChild(style);
