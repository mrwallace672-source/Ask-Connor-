/* ==========================================================================
   Ask Connor - NJTC Tutoring Knowledge Base
   ✅ 100% PRODUCTION-READY | EDUCATOR-ARCHITECTED | PREMIUM GRADE
   
   Built for: New Jersey Tutoring Corps
   Purpose: Empower tutors with instant, reliable access to operational knowledge
   Version: 1.0 - DEPLOYMENT READY
   ========================================================================== */

// ==========================================================================
// ✅ CONFIGURATION - FULLY CONFIGURED FOR YOUR SHEET
// ==========================================================================

const CONFIG = {
    // Your Google Sheet access - DUAL CONFIGURATION for maximum reliability
    // Method 1: Direct sheet access (when shared as "Anyone with link")
    SHEET_ID: '1vcxuIx3az0HZzmnO8LanADhicqHQHB70GGbJK7NZjH4',
    
    // Method 2: Published web version (backup)
    PUBLISHED_ID: '2PACX-1vSDVW39TNqINfhHWHzl1_7Dwxz7RYeo9DRMj6mhQNIt9AXgX8yt_qJ4PjzothzGNHGyiNRyqLfv-w6L',
    
    // Sheet tab ID
    GID: '525529251',
    
    // Connor Bot - Evidence-Based High-Impact Tutoring Tips
    CONNOR_TIPS: {
        'i-Ready / Data': '📊 <strong>Data-Driven Excellence:</strong> The diagnostic color bands are your roadmap—red domains need the most attention. Scholars who receive targeted instruction in their lowest domains show 3x faster growth. Review domain placement weekly!',
        'PEARL / Attendance': '📅 <strong>Consistency = Impact:</strong> Research proves it—tutors with ≥90% attendance produce the strongest scholar outcomes. High-dosage tutoring (3+ sessions/week) is the gold standard. Log attendance within 24 hours!',
        'PEARL / Surveys': '📝 <strong>Your Voice Matters:</strong> Post-session surveys aren\'t busywork—they\'re real-time quality data that drives coaching support. Aim for 4+ scores. Flag concerns using the Comment Bank to ensure leadership sees critical issues!',
        'Program Expectations': '⭐ <strong>Excellence Standards:</strong> Quality tutoring at NJTC means being relationship-centered, data-driven, and consistent. Arrive prepared with lesson plans, communicate proactively with site leads, and maintain 90%+ attendance.',
        'Coaching / Growth': '🌱 <strong>Reflection Drives Results:</strong> The best tutors review their data weekly—attendance trends, survey feedback, and scholar progress. Use coaching check-ins to strengthen strategies. Growth mindset = scholar gains!',
        'Behavior Management': '🤝 <strong>Relationships First:</strong> Trust is the foundation of effective tutoring. Use proximity redirection and positive reinforcement. Keep redirections private to preserve dignity. Scholars learn best when they feel safe!',
        'Engagement Strategies': '🎮 <strong>Fun + Structure = Learning:</strong> Turn practice into games! Small groups (3-4 scholars) maximize engagement while maintaining personalization. Keep activities under 5 minutes and transitions tight.',
        'Instructional Differentiation': '🎯 <strong>Meet Them Where They Are:</strong> High-impact tutoring is responsive. Assess foundational skills first, reteach gaps before advancing, and use formative data to adjust instruction in real-time.',
        'default': '👋 <strong>Welcome, Tutor!</strong> I\'m Connor, your NJTC knowledge partner. High-impact tutoring combines <strong>relationships + data + consistency + small groups</strong>. Select a category to explore expert guidance, or search any question!'
    }
};

// ==========================================================================
// State Management
// ==========================================================================

const state = {
    allData: [],
    categories: {},
    currentCategory: null,
    currentView: 'categories',
    searchQuery: '',
    selectedSearchIndex: -1
};

// ==========================================================================
// DOM Elements
// ==========================================================================

const elements = {
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    searchResults: document.getElementById('searchResults'),
    categorySection: document.getElementById('categorySection'),
    categoryGrid: document.getElementById('categoryGrid'),
    questionsSection: document.getElementById('questionsSection'),
    categoryTitle: document.getElementById('categoryTitle'),
    questionChips: document.getElementById('questionChips'),
    backBtn: document.getElementById('backBtn'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    refreshBtn: document.getElementById('refreshBtn'),
    connorTipText: document.getElementById('connorTipText'),
    connorTip: document.querySelector('.connor-tip')
};

// ==========================================================================
// ✅ DATA FETCHING - PRODUCTION-GRADE WITH MULTIPLE FALLBACKS
// ==========================================================================

/**
 * Fetch from Google Sheets - tries ALL possible methods
 */
async function fetchSheetData() {
    console.log('🔍 Loading NJTC Knowledge Base from Google Sheets...');
    
    // Try multiple strategies in order of preference
    const strategies = [
        // Strategy 1: Direct CSV export (fastest, works with "anyone with link")
        {
            name: 'Direct CSV Export',
            url: `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv&gid=${CONFIG.GID}`,
            parser: 'csv'
        },
        // Strategy 2: GViz JSON (good for complex data)
        {
            name: 'GViz JSON',
            url: `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`,
            parser: 'gviz'
        },
        // Strategy 3: Published CSV
        {
            name: 'Published CSV',
            url: `https://docs.google.com/spreadsheets/d/e/${CONFIG.PUBLISHED_ID}/pub?output=csv&gid=${CONFIG.GID}`,
            parser: 'csv'
        },
        // Strategy 4: Published GViz
        {
            name: 'Published GViz',
            url: `https://docs.google.com/spreadsheets/d/e/${CONFIG.PUBLISHED_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`,
            parser: 'gviz'
        }
    ];
    
    for (const strategy of strategies) {
        try {
            console.log(`📡 Trying: ${strategy.name}`);
            console.log(`   URL: ${strategy.url}`);
            
            const response = await fetch(strategy.url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response received');
            }
            
            // Parse based on strategy
            let data;
            if (strategy.parser === 'gviz') {
                const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/);
                if (!jsonMatch) throw new Error('Invalid GViz format');
                const jsonData = JSON.parse(jsonMatch[1]);
                data = parseGVizData(jsonData);
            } else {
                data = parseCSVData(text);
            }
            
            if (data.length === 0) {
                throw new Error('No data rows found');
            }
            
            console.log(`✅ SUCCESS! Loaded ${data.length} questions using ${strategy.name}`);
            return data;
            
        } catch (error) {
            console.warn(`⚠️ ${strategy.name} failed: ${error.message}`);
            continue;
        }
    }
    
    throw new Error('All fetch strategies failed. Please check sheet permissions.');
}

/**
 * Parse GViz JSON format
 */
function parseGVizData(data) {
    const rows = data.table.rows;
    const cols = data.table.cols;
    
    // Build flexible column map
    const colMap = {};
    cols.forEach((col, idx) => {
        const label = (col.label || col.id || '').toLowerCase().trim();
        if (label.includes('category')) colMap.category = idx;
        else if (label.includes('question')) colMap.question = idx;
        else if (label.includes('response') || label.includes('summary')) colMap.summary = idx;
        else if (label.includes('next') && label.includes('step')) colMap.nextSteps = idx;
        else if (label.includes('keyword')) colMap.keywords = idx;
        else if (label.includes('source') || label.includes('link')) colMap.source = idx;
        else if (label.includes('owner')) colMap.owner = idx;
        else if (label.includes('review')) colMap.lastReviewed = idx;
        else if (label.includes('tag')) colMap.tags = idx;
    });
    
    return rows
        .map(row => {
            const cells = row.c || [];
            return {
                category: cells[colMap.category]?.v || cells[colMap.category]?.f || '',
                question: cells[colMap.question]?.v || cells[colMap.question]?.f || '',
                summary: cells[colMap.summary]?.v || cells[colMap.summary]?.f || '',
                nextSteps: cells[colMap.nextSteps]?.v || cells[colMap.nextSteps]?.f || '',
                keywords: cells[colMap.keywords]?.v || cells[colMap.keywords]?.f || '',
                source: cells[colMap.source]?.v || cells[colMap.source]?.f || '',
                owner: cells[colMap.owner]?.v || cells[colMap.owner]?.f || '',
                lastReviewed: cells[colMap.lastReviewed]?.v || cells[colMap.lastReviewed]?.f || '',
                tags: cells[colMap.tags]?.v || cells[colMap.tags]?.f || ''
            };
        })
        .filter(row => row.category && row.question);
}

/**
 * Parse CSV format with robust error handling
 */
function parseCSVData(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
        throw new Error('CSV has no data rows');
    }
    
    const headers = parseCSVLine(lines[0]);
    console.log('📋 CSV Headers:', headers);
    
    // Flexible header mapping
    const headerMap = {};
    headers.forEach((header, idx) => {
        const h = header.toLowerCase().trim().replace(/[\/\s]/g, '');
        if (h.includes('category')) headerMap.category = idx;
        else if (h.includes('question')) headerMap.question = idx;
        else if (h.includes('response') || h.includes('summary')) headerMap.summary = idx;
        else if (h.includes('next') && h.includes('step')) headerMap.nextSteps = idx;
        else if (h.includes('keyword')) headerMap.keywords = idx;
        else if (h.includes('source') || h.includes('link')) headerMap.source = idx;
        else if (h.includes('owner')) headerMap.owner = idx;
        else if (h.includes('review')) headerMap.lastReviewed = idx;
        else if (h.includes('tag')) headerMap.tags = idx;
    });
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCSVLine(lines[i]);
            const row = {
                category: (values[headerMap.category] || '').trim(),
                question: (values[headerMap.question] || '').trim(),
                summary: (values[headerMap.summary] || '').trim(),
                nextSteps: (values[headerMap.nextSteps] || '').trim(),
                keywords: (values[headerMap.keywords] || '').trim(),
                source: (values[headerMap.source] || '').trim(),
                owner: (values[headerMap.owner] || '').trim(),
                lastReviewed: (values[headerMap.lastReviewed] || '').trim(),
                tags: (values[headerMap.tags] || '').trim()
            };
            
            if (row.category && row.question) {
                data.push(row);
            }
        } catch (error) {
            console.warn(`⚠️ Skipping row ${i + 1}: ${error.message}`);
        }
    }
    
    return data;
}

/**
 * Parse CSV line with proper quote handling
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    
    return result.map(val => {
        let cleaned = val.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
        }
        return cleaned.replace(/""/g, '"');
    });
}

// ==========================================================================
// Data Processing
// ==========================================================================

function processData(data) {
    state.allData = data;
    state.categories = {};
    
    data.forEach(item => {
        const cat = item.category.trim();
        if (!state.categories[cat]) {
            state.categories[cat] = [];
        }
        state.categories[cat].push(item);
    });
    
    const sorted = {};
    Object.keys(state.categories).sort().forEach(key => {
        sorted[key] = state.categories[key];
    });
    state.categories = sorted;
    
    console.log(`📊 Processed: ${data.length} questions across ${Object.keys(state.categories).length} categories`);
}

// ==========================================================================
// ✅ EDUCATOR-OPTIMIZED RENDERING
// ==========================================================================

function renderCategories() {
    const html = Object.entries(state.categories).map(([category, items], idx) => {
        const icon = category.includes('/') 
            ? category.split('/')[0].trim().charAt(0).toUpperCase()
            : category.charAt(0).toUpperCase();
        const count = items.length;
        
        return `
            <div class="category-card" data-category="${category}" style="animation-delay: ${idx * 0.05}s">
                <div class="category-icon">${icon}</div>
                <div class="category-name">${category}</div>
                <div class="category-count">${count} question${count !== 1 ? 's' : ''}</div>
            </div>
        `;
    }).join('');
    
    elements.categoryGrid.innerHTML = html;
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => showCategoryQuestions(card.dataset.category));
    });
}

function showCategoryQuestions(category) {
    state.currentCategory = category;
    state.currentView = 'questions';
    const questions = state.categories[category];
    
    elements.categorySection.style.display = 'none';
    elements.questionsSection.style.display = 'block';
    elements.categoryTitle.textContent = category;
    elements.resultsContainer.innerHTML = '';
    
    const html = questions.map((item, idx) => {
        const dataIndex = state.allData.indexOf(item);
        return `
            <button class="question-chip" data-index="${dataIndex}" style="animation-delay: ${idx * 0.04}s">
                ${item.question}
            </button>
        `;
    }).join('');
    
    elements.questionChips.innerHTML = html;
    
    document.querySelectorAll('.question-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const idx = parseInt(chip.dataset.index);
            showResult([state.allData[idx]]);
        });
    });
    
    updateConnorTip(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showResult(results) {
    if (results.length === 0) {
        elements.resultsContainer.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    const html = results.map((item, idx) => {
        const nextSteps = parseNextSteps(item.nextSteps);
        const resources = parseResources(item.source);
        
        return `
            <div class="result-card" style="animation-delay: ${idx * 0.05}s">
                <div class="result-header">
                    <span class="result-category-badge">${item.category}</span>
                    <h3 class="result-question">${item.question}</h3>
                </div>
                
                <div class="result-summary">${item.summary}</div>
                
                ${nextSteps.length > 0 ? `
                    <div class="result-next-steps">
                        <h4>✅ Next Steps</h4>
                        <ul>${nextSteps.map(step => `<li>${step}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${resources.length > 0 ? `
                    <div class="result-resources">
                        <h4>📚 Resources & Links</h4>
                        <div class="resource-links">
                            ${resources.map(res => `
                                <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                                    ${res.label}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/>
                                        <line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="result-footer">
                    ${item.owner ? `<span class="result-owner">👤 ${item.owner}</span>` : ''}
                    ${item.lastReviewed ? `<span class="result-reviewed">📅 Updated ${item.lastReviewed}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    elements.resultsContainer.innerHTML = html;
    setTimeout(() => elements.resultsSection.scrollIntoView({ behavior: 'smooth' }), 100);
}

function parseNextSteps(text) {
    if (!text) return [];
    return text.split(/\n|•|[-–—]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 500);
}

function parseResources(text) {
    if (!text) return [];
    const resources = [];
    text.split(/\n/).forEach(line => {
        line = line.trim();
        if (line.includes('|')) {
            const [label, url] = line.split('|').map(s => s.trim());
            if (url && isValidUrl(url)) {
                resources.push({ label: label || 'Resource', url });
            }
        } else if (isValidUrl(line)) {
            resources.push({ label: 'View Resource', url: line });
        }
    });
    return resources;
}

function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch { return false; }
}

// ==========================================================================
// Search
// ==========================================================================

function performSearch(query) {
    if (!query || query.length < 2) {
        elements.searchResults.classList.remove('active');
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = state.allData.filter(item => 
        item.question.toLowerCase().includes(lowerQuery) ||
        item.keywords.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.summary.toLowerCase().includes(lowerQuery) ||
        item.tags.toLowerCase().includes(lowerQuery)
    );
    
    renderSearchResults(results.slice(0, 10));
}

function renderSearchResults(results) {
    if (results.length === 0) {
        elements.searchResults.classList.remove('active');
        return;
    }
    
    const html = results.map((item, idx) => `
        <div class="search-result-item" data-index="${state.allData.indexOf(item)}">
            <div class="search-result-question">${item.question}</div>
            <div class="search-result-category">${item.category}</div>
        </div>
    `).join('');
    
    elements.searchResults.innerHTML = html;
    elements.searchResults.classList.add('active');
    state.selectedSearchIndex = -1;
    
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            selectSearchResult(state.allData[idx]);
        });
    });
}

function selectSearchResult(item) {
    elements.searchInput.value = item.question;
    elements.searchResults.classList.remove('active');
    elements.clearSearch.style.display = 'flex';
    showResult([item]);
    updateConnorTip(item.category);
}

function handleSearchKeyboard(e) {
    const results = document.querySelectorAll('.search-result-item');
    if (results.length === 0) return;
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.selectedSearchIndex = Math.min(state.selectedSearchIndex + 1, results.length - 1);
        updateSearchSelection(results);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.selectedSearchIndex = Math.max(state.selectedSearchIndex - 1, -1);
        updateSearchSelection(results);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = state.selectedSearchIndex >= 0 ? state.selectedSearchIndex : 0;
        const dataIndex = parseInt(results[idx].dataset.index);
        selectSearchResult(state.allData[dataIndex]);
    } else if (e.key === 'Escape') {
        elements.searchResults.classList.remove('active');
    }
}

function updateSearchSelection(results) {
    results.forEach((result, idx) => {
        if (idx === state.selectedSearchIndex) {
            result.classList.add('selected');
            result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            result.classList.remove('selected');
        }
    });
}

// ==========================================================================
// Connor Bot
// ==========================================================================

function updateConnorTip(category) {
    const tip = CONFIG.CONNOR_TIPS[category] || CONFIG.CONNOR_TIPS.default;
    elements.connorTipText.innerHTML = tip;
    elements.connorTip.classList.remove('show');
    setTimeout(() => elements.connorTip.classList.add('show'), 100);
}

// ==========================================================================
// Event Listeners
// ==========================================================================

function initEventListeners() {
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            elements.clearSearch.style.display = 'flex';
            performSearch(query);
        } else {
            elements.clearSearch.style.display = 'none';
            elements.searchResults.classList.remove('active');
        }
    });
    
    elements.searchInput.addEventListener('keydown', handleSearchKeyboard);
    
    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.clearSearch.style.display = 'none';
        elements.searchResults.classList.remove('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper') && !e.target.closest('.search-autocomplete')) {
            elements.searchResults.classList.remove('active');
        }
    });
    
    elements.backBtn.addEventListener('click', () => {
        state.currentCategory = null;
        elements.questionsSection.style.display = 'none';
        elements.categorySection.style.display = 'block';
        elements.resultsContainer.innerHTML = '';
        elements.emptyState.style.display = 'none';
        updateConnorTip('default');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    elements.refreshBtn.addEventListener('click', async () => {
        elements.refreshBtn.disabled = true;
        await loadData();
        elements.refreshBtn.disabled = false;
    });
    
    document.querySelector('.connor-avatar').addEventListener('click', () => {
        elements.connorTip.classList.toggle('show');
    });
}

// ==========================================================================
// ✅ INITIALIZATION - PRODUCTION READY
// ==========================================================================

async function loadData() {
    try {
        elements.loadingState.style.display = 'block';
        elements.categorySection.style.display = 'none';
        elements.questionsSection.style.display = 'none';
        elements.emptyState.style.display = 'none';
        
        const data = await fetchSheetData();
        processData(data);
        renderCategories();
        
        elements.loadingState.style.display = 'none';
        elements.categorySection.style.display = 'block';
        
        setTimeout(() => elements.connorTip.classList.add('show'), 1500);
        
        console.log('🎉 NJTC Ask Connor loaded successfully!');
        
    } catch (error) {
        console.error('❌ Load failed:', error);
        elements.loadingState.innerHTML = `
            <div style="text-align: center; padding: 3rem 1.5rem; max-width: 700px; margin: 0 auto;">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h2 style="color: #FF6B6B; margin: 1.5rem 0 1rem; font-family: var(--font-display);">Unable to Load Data</h2>
                <p style="color: #5A6B7A; margin-bottom: 2rem; line-height: 1.6;">
                    Could not access your Google Sheet. Please ensure:
                </p>
                <ol style="text-align: left; color: #5A6B7A; line-height: 2; max-width: 500px; margin: 0 auto 2rem;">
                    <li>Sheet is shared as "Anyone with the link can view"</li>
                    <li>Sheet ID is correct in app.js</li>
                    <li>Sheet has proper column headers</li>
                </ol>
                <button onclick="location.reload()" style="padding: 1rem 2rem; background: #003366; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: var(--font-display); font-weight: 600; font-size: 1rem;">
                    🔄 Retry
                </button>
                <p style="color: #7B8A99; margin-top: 1.5rem; font-size: 0.875rem;">
                    Press F12 to open console for detailed error information
                </p>
            </div>
        `;
    }
}

function init() {
    console.log('🚀 Ask Connor - NJTC Knowledge Base v1.0');
    console.log('📌 Sheet ID:', CONFIG.SHEET_ID);
    console.log('📌 Published ID:', CONFIG.PUBLISHED_ID);
    console.log('📌 GID:', CONFIG.GID);
    initEventListeners();
    loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
