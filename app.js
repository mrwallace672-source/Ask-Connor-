/* ============================================================================
   Ask Connor - ABSOLUTE FINAL FIX
   🎯 USES GOOGLE VISUALIZATION API - NO CSV PARSING ISSUES
   
   Switches from CSV export to Google Visualization JSON API
   This handles multi-line cells correctly!
   ============================================================================ */

const CONFIG = {
    SHEET_ID: '1Mk_dsUSiAqF-dbLhzgbOppu4CqVIgOIxHbiiEnxjh2Y',
    GID: '525529251',
    FEEDBACK_URL: 'https://script.google.com/macros/s/AKfycbz6FJpD1dWrJikaav46UfxrTkkZkc8VEXo2JhBBLVi7g3GmxeRUGzwJQu7tvVyYo4onIw/exec',
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
    role: localStorage.getItem('user_role'),
    email: localStorage.getItem('user_email') || '',
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
    analyticsBtn: document.getElementById('analyticsBtn'),
    analyticsModal: document.getElementById('analyticsModal'),
    totalViews: document.getElementById('totalViews'),
    topCategory: document.getElementById('topCategory'),
    chartBody: document.getElementById('chartBody')
};

async function fetchData() {
    console.log('🔍 Fetching using Google Visualization API...');
    
    // USE GVIZ API - handles multi-line cells correctly!
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`;
    
    try {
        const r = await fetch(url, {method:'GET', mode:'cors', cache:'no-cache'});
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        
        // Parse GVIZ JSON response
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
    const cols = table.cols;
    const rows = table.rows;
    
    const data = [];
    
    // Process each row (skip header row 0)
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.c || [];
        
        // Extract values from cells
        // GVIZ format: each cell is {v: value, f: formatted}
        const getValue = (cell) => {
            if (!cell) return '';
            return (cell.v || cell.f || '').toString().trim();
        };
        
        const category = getValue(cells[0]);      // Column A
        const question = getValue(cells[1]);      // Column B
        
        // STOP if no category
        if (!category) {
            console.log(`⏹️ Stopped at row ${i+2} - no category`);
            break;
        }
        
        // Skip if no question
        if (!question) {
            console.log(`⚠️ Skipped row ${i+2} - category "${category}" but no question`);
            continue;
        }
        
        // Build complete row object
        data.push({
            category: category,
            question: question,
            summary: getValue(cells[2]),       // Column C
            nextSteps: getValue(cells[3]),     // Column D
            keywords: getValue(cells[4]),      // Column E
            source: getValue(cells[5]),        // Column F
            owner: getValue(cells[6]),         // Column G
            lastReviewed: getValue(cells[7]),  // Column H
            tags: getValue(cells[8])           // Column I
        });
    }
    
    return data;
}

function process(data) {
    state.data = data;
    state.categories = {};
    
    // Group by Category
    data.forEach(item => {
        const cat = item.category.trim();
        if (!state.categories[cat]) {
            state.categories[cat] = [];
        }
        state.categories[cat].push(item);
    });
    
    // Sort categories
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
    state.question = results[0];
    
    const html = results.map((item, i) => {
        const next = parseNext(item.nextSteps);
        const resources = parseResources(item.source);
        const sup = CONFIG.SUPPORT[item.category];
        
        return `<div class="result-card" style="animation-delay:${i*0.05}s">
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
            
            <div class="feedback-section">
                <div class="feedback-question">Was this helpful?</div>
                <div class="feedback-buttons">
                    <button class="feedback-btn helpful" data-question="${esc(item.question)}" data-helpful="yes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        👍 Helpful
                    </button>
                    <button class="feedback-btn not-helpful" data-question="${esc(item.question)}" data-helpful="no">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                        👎 Not Helpful
                    </button>
                    <button class="feedback-btn request" data-index="${i}">💬 Request Help</button>
                </div>
                <div id="fb-form-${i}" class="feedback-form" style="display:none">
                    <input type="email" id="fb-email-${i}" placeholder="Your email (optional)" value="${state.email}">
                    <textarea id="fb-text-${i}" placeholder="What help do you need?" rows="3"></textarea>
                    <button class="submit-feedback" data-question="${esc(item.question)}" data-index="${i}">Submit Request</button>
                </div>
            </div>
        </div>`;
    }).join('');
    
    el.resContainer.innerHTML = html;
    
    document.querySelectorAll('.feedback-btn.helpful, .feedback-btn.not-helpful').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const question = btn.dataset.question;
            const helpful = btn.dataset.helpful;
            submitHelpful(question, helpful === 'yes');
        });
    });
    
    document.querySelectorAll('.feedback-btn.request').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const i = btn.dataset.index;
            showForm(i);
        });
    });
    
    document.querySelectorAll('.submit-feedback').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const question = btn.dataset.question;
            const i = btn.dataset.index;
            submitDetail(question, i);
        });
    });
    
    setTimeout(() => el.resSec.scrollIntoView({behavior: 'smooth'}), 100);
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

async function submitHelpful(question, helpful) {
    const helpfulText = helpful ? 'Yes' : 'No';
    const feedbackType = helpful ? 'Positive Feedback' : 'Negative Feedback';
    
    if (helpful) {
        state.analytics.feedback.positive++;
    } else {
        state.analytics.feedback.negative++;
    }
    localStorage.setItem('ask_connor_analytics', JSON.stringify(state.analytics));
    
    await sendFeedback(question, state.email || 'Not provided', feedbackType, helpful ? '✅ Helpful' : '⚠️ Needs improvement', helpfulText);
    notify(helpful ? '✅ Thanks!' : '📝 We\'ll improve!', 'success');
}

function showForm(i) {
    document.querySelectorAll('.feedback-form').forEach(f => f.style.display = 'none');
    document.getElementById(`fb-form-${i}`).style.display = 'block';
}

async function submitDetail(question, i) {
    const emailEl = document.getElementById(`fb-email-${i}`);
    const textEl = document.getElementById(`fb-text-${i}`);
    const email = emailEl.value.trim() || 'Not provided';
    const reqText = textEl.value.trim();
    
    if (!reqText) {
        notify('⚠️ Please enter your request', 'warning');
        return;
    }
    
    if (email !== 'Not provided') {
        state.email = email;
        localStorage.setItem('user_email', email);
    }
    
    await sendFeedback(question, email, 'Help Request', reqText, '');
    textEl.value = '';
    document.getElementById(`fb-form-${i}`).style.display = 'none';
    notify('✅ Request submitted!', 'success');
}

async function sendFeedback(question, email, reqType, req, helpful) {
    try {
        const payload = {
            question: question,
            userEmail: email,
            requestType: reqType,
            request: req,
            helpful: helpful,
            timestamp: new Date().toISOString(),
            role: state.role || 'Not specified',
            category: state.current || ''
        };
        
        console.log('📤 Sending feedback:', payload);
        
        await fetch(CONFIG.FEEDBACK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        console.log('✅ Feedback sent');
    } catch (e) {
        console.error('❌ Feedback error:', e);
    }
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
            <h3>💬 Feedback Summary</h3>
            <div class="feedback-summary">
                <div class="feedback-stat positive">
                    <div class="feedback-icon">👍</div>
                    <div class="feedback-count">${state.analytics.feedback.positive}</div>
                    <div class="feedback-label">Helpful</div>
                </div>
                <div class="feedback-stat negative">
                    <div class="feedback-icon">👎</div>
                    <div class="feedback-count">${state.analytics.feedback.negative}</div>
                    <div class="feedback-label">Not Helpful</div>
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
