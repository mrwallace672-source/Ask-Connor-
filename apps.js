/* ==========================================================================
   Ask Connor - Application Logic
   Premium NJTC Tutoring Knowledge Base
   ========================================================================== */

// ==========================================================================
// Configuration
// ==========================================================================

const CONFIG = {
    // ============================================================================
    // GOOGLE SHEET CONFIGURATION
    // ============================================================================
    // To get your Published ID:
    // 1. Open your Google Sheet
    // 2. File → Share → Publish to web
    // 3. Choose "Entire Document" or specific sheet
    // 4. Publish as "Web page"
    // 5. Copy the long ID from the published URL (between /d/ and /pub)
    // 
    // IMPORTANT: You need the ORIGINAL Sheet ID, not the published ID
    // Find it in your sheet URL: https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
    // ============================================================================
    
    SHEET_ID: '2PACX-1vSDVW39TNqINfhHWHzl1_7Dwxz7RYeo9DRMj6mhQNIt9AXgX8yt_qJ4PjzothzGNHGyiNRyqLfv-w6L',
    GID: '525529251',
    
    // Set to true to use sample data if sheet fails to load (for testing)
    USE_SAMPLE_DATA_ON_ERROR: true,
    
    // High-Impact Tutoring Tips by Category
    CONNOR_TIPS: {
        'i-Ready / Data': '<strong>High-Impact Tip:</strong> Use diagnostic data to drive instruction! Focus on the lowest domains first and track scholar progress through each diagnostic cycle. Data-driven tutoring produces 3x typical growth rates.',
        'PEARL / Attendance': '<strong>High-Impact Tip:</strong> Consistency is key! High-dosage tutoring (≥90% attendance, 3+ sessions/week) shows the strongest impact. Log attendance within 24 hours and flag chronic absenteeism early.',
        'PEARL / Surveys': '<strong>High-Impact Tip:</strong> Surveys capture real-time quality data. Complete them after every session to help coaches support you. Aim for survey scores of 4+ on a 5-point scale.',
        'Program Expectations': '<strong>High-Impact Tip:</strong> Quality tutoring is relationship-centered and data-driven. Arrive prepared, communicate proactively with site leads, and maintain professional standards.',
        'Coaching / Growth': '<strong>High-Impact Tip:</strong> Reflection drives improvement! Review your attendance, survey feedback, and scholar growth data weekly. Use coaching sessions to strengthen instructional strategies.',
        'Behavior Management': '<strong>High-Impact Tip:</strong> Build relationships first! Use proximity redirection and positive reinforcement. Keep redirections private to preserve scholar dignity and rapport.',
        'Engagement Strategies': '<strong>High-Impact Tip:</strong> Make learning fun and interactive! Use games, movement, and real-world connections. Small-group settings (3-4 students) maximize engagement.',
        'Instructional Differentiation': '<strong>High-Impact Tip:</strong> Meet scholars where they are. Identify skill gaps early and reteach foundational concepts before advancing. Differentiation = targeted support.',
        'Behavior': '<strong>High-Impact Tip:</strong> Build strong relationships first. Research shows tutoring is most effective when students feel safe and supported. Use consistent routines and positive reinforcement.',
        'Engagement': '<strong>High-Impact Tip:</strong> Keep sessions interactive! Studies show small-group settings (3-4 students) maximize engagement while maintaining personalization. Use hands-on activities.',
        'Differentiation': '<strong>High-Impact Tip:</strong> Meet students where they are. Use formative assessment data to tailor instruction. High-dosage tutoring works best when content is just above current skill level.',
        'Data': '<strong>High-Impact Tip:</strong> Track progress consistently. Research shows data-driven tutoring (regular assessment + targeted intervention) produces gains up to 3x typical growth rates.',
        'Assessment': '<strong>High-Impact Tip:</strong> Assess early and often. Use quick checks (exit tickets, thumbs up/down) to adjust instruction in real-time. High-impact tutoring is responsive to student needs.',
        'Curriculum': '<strong>High-Impact Tip:</strong> Align with school curriculum. Tutoring is most effective when it reinforces classroom learning. Coordinate with teachers on priority skills and standards.',
        'Communication': '<strong>High-Impact Tip:</strong> Partner with families and teachers. Regular communication about student progress strengthens the tutoring ecosystem and ensures alignment across settings.',
        'Resources': '<strong>High-Impact Tip:</strong> Use evidence-based materials. High-quality tutoring programs use structured curricula with proven effectiveness. Prioritize resources with strong research backing.',
        'Training': '<strong>High-Impact Tip:</strong> Invest in tutor development. Well-trained tutors with ongoing coaching produce significantly better outcomes. Practice makes progress!',
        'Scheduling': '<strong>High-Impact Tip:</strong> Consistency matters! High-dosage tutoring (3+ sessions per week) shows strongest impact. Build predictable schedules that students can count on.',
        'default': 'Hi! I'm Connor, your tutoring guide. High-impact tutoring combines <strong>strong relationships, small groups, data-driven instruction,</strong> and <strong>consistent scheduling</strong>. Select a category to get started!'
    },
    
    // Sample data for testing (based on NJTC Knowledge Base PDF)
    SAMPLE_DATA: [
        {
            category: 'i-Ready / Data',
            question: 'How do I read the i-Ready diagnostic report?',
            summary: 'The i-Ready Diagnostic shows each scholar\'s performance across Reading or Math domains. Focus on the color bands (red = significantly below grade level, yellow = one level below, green = on or above). Hover over each domain to see placement level and scale score.',
            nextSteps: 'Identify lowest domains to prioritize instruction\nUse the "Individual Student Report" to track growth\nAlign tutoring sessions with domain needs',
            keywords: 'diagnostic, report, placement, i-Ready',
            source: 'i-Ready 5 Level Placement | https://drive.google.com/file/d/1bXbRnxcLw3Sl_ya7C9e3dUGXH0NPYdc_/view?usp=drive_link',
            owner: 'Evaluation and Impact',
            lastReviewed: '10/2025',
            tags: 'how-to'
        },
        {
            category: 'PEARL / Attendance',
            question: 'How do I log attendance and surveys?',
            summary: 'Go to Sessions → Select the scheduled session → Actions → Attendance. Mark each scholar as Present or Absent. If absent, specify the appropriate reason for the absence. Ensure the post-session survey is completed.',
            nextSteps: 'Log attendance after every session\nComplete survey before closing PEARL tab\nConfirm the session shows as "Completed"',
            keywords: 'attendance, surveys, PEARL, session log',
            source: 'PEARL Guide | https://tutorwithpearl.my.site.com/customers/s/article/View-Sessions-Complete-Post-Session-Reports-as-anInstructor#Mark_Attendance',
            owner: 'Program Operations',
            lastReviewed: '10/2025',
            tags: 'how-to'
        },
        {
            category: 'PEARL / Attendance',
            question: 'What happens if I don\'t capture surveys or attendance?',
            summary: 'Missing attendance or surveys leads to data gaps that affect accountability, growth tracking, and funding.',
            nextSteps: 'Complete within 24 hours\nContact site lead if missing link\nKeep consistent tracking for all sessions',
            keywords: 'attendance, survey, missing, compliance',
            source: 'Pearl Operations Procedure',
            owner: 'Evaluation and Impact',
            lastReviewed: '10/2025',
            tags: 'policy'
        },
        {
            category: 'Program Expectations',
            question: 'What\'s the NJTC attendance benchmark for tutors?',
            summary: 'Tutors are expected to maintain ≥90% attendance to ensure consistent dosage and scholar growth.',
            nextSteps: 'Monitor your attendance weekly\nCommunicate any absences proactively\nReview your rate monthly with site lead',
            keywords: 'attendance, benchmark, consistency, dosage',
            source: 'Benchmark Documentation',
            owner: 'Evaluation and Impact',
            lastReviewed: '10/2025',
            tags: 'policy'
        },
        {
            category: 'Behavior Management',
            question: 'How should I respond when scholars talk during instruction?',
            summary: 'Quietly redirect off-task scholars through proximity and positive reinforcement.',
            nextSteps: 'Move closer (proximity redirection)\nReinforce positive behavior ("I like how Jordan is focused.")',
            keywords: 'talkative, behavior, behavioral, support',
            source: 'Behavior Management Guide | https://www.youtube.com/watch?v=K3yELj1W_IA',
            owner: 'Program Operations',
            lastReviewed: '10/2025',
            tags: 'Behavior'
        },
        {
            category: 'Engagement Strategies',
            question: 'How do I make lessons fun while staying on task?',
            summary: 'Add fun competition or games to sustain focus without losing structure.',
            nextSteps: 'Turn practice into games or challenges\nKeep transitions short and rules simple',
            keywords: 'engagement, engaging, fun, activity, planning, math, reading, english, ela, literacy, lesson planning, support',
            source: 'Activity Guide | https://drive.google.com/file/d/1JuszYLqp6j7xmNvrJ9k2W5giavd1HmYk/view?usp=drive_link',
            owner: 'Training and Development',
            lastReviewed: '10/2025',
            tags: 'Activities'
        },
        {
            category: 'Coaching / Growth',
            question: 'How do I use data to reflect on my performance?',
            summary: 'Review your attendance, survey feedback, and scholar progress data regularly. These indicators show your consistency, effectiveness, and instructional impact.',
            nextSteps: 'Review data dashboards weekly\nIdentify patterns or growth areas\nDiscuss insights with your coach',
            keywords: 'reflection, data, self-evaluation, performance',
            source: '',
            owner: 'Evaluation and Impact',
            lastReviewed: '10/2025',
            tags: 'reflection'
        },
        {
            category: 'Instructional Differentiation',
            question: 'What should I do if my scholars are missing foundational skills?',
            summary: 'Identify skill gaps early and reteach key concepts before advancing new material.',
            nextSteps: 'Start with a 5-minute reteach or model lesson\nAddress missing steps before moving to new content',
            keywords: 'foundational skills, math, reading, english, ela, literacy, lesson planning, support',
            source: 'IES Practice Guide | https://ies.ed.gov/ncee/wwc/PracticeGuide/21',
            owner: 'Training and Development',
            lastReviewed: '10/2025',
            tags: 'Foundational'
        }
    ]
};

// ==========================================================================
// State Management
// ==========================================================================

const state = {
    allData: [],
    filteredData: [],
    categories: {},
    currentCategory: null,
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
// Data Fetching
// ==========================================================================

/**
 * Fetch data from Google Sheets using GViz JSON endpoint (primary)
 * Falls back to CSV if GViz fails
 */
async function fetchSheetData() {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/e/${CONFIG.SHEET_ID}/gviz/tq?gid=${CONFIG.GID}&tqx=out:json`;
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${CONFIG.SHEET_ID}/pub?output=csv&gid=${CONFIG.GID}`;
    
    try {
        // Try GViz JSON first (cleaner parsing)
        const response = await fetch(gvizUrl);
        const text = await response.text();
        
        // GViz returns JSONP, extract JSON
        const jsonString = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/)?.[1];
        if (!jsonString) throw new Error('Invalid GViz response');
        
        const data = JSON.parse(jsonString);
        return parseGVizData(data);
    } catch (error) {
        console.warn('GViz fetch failed, falling back to CSV:', error);
        
        // Fallback to CSV
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            return parseCSVData(text);
        } catch (csvError) {
            console.error('Both fetch methods failed:', csvError);
            throw new Error('Unable to load data from Google Sheets');
        }
    }
}

/**
 * Parse GViz JSON format
 */
function parseGVizData(data) {
    const rows = data.table.rows;
    const cols = data.table.cols;
    
    // Map column labels to indices
    const colMap = {};
    cols.forEach((col, idx) => {
        colMap[col.label || `col${idx}`] = idx;
    });
    
    return rows.map(row => {
        const cells = row.c;
        return {
            category: cells[colMap['Category']]?.v || '',
            question: cells[colMap['Question']]?.v || '',
            summary: cells[colMap['Response Summary']]?.v || '',
            nextSteps: cells[colMap['Next Steps']]?.v || '',
            keywords: cells[colMap['Keywords']]?.v || '',
            source: cells[colMap['Source/Link']]?.v || '',
            owner: cells[colMap['Owner']]?.v || '',
            lastReviewed: cells[colMap['Last Reviewed']]?.v || '',
            tags: cells[colMap['Tags']]?.v || ''
        };
    }).filter(row => row.category && row.question); // Filter out empty rows
}

/**
 * Parse CSV format
 */
function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = parseCSVLine(line);
            const row = {};
            
            headers.forEach((header, idx) => {
                const key = header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');
                row[key] = values[idx]?.replace(/"/g, '') || '';
            });
            
            return {
                category: row.category || '',
                question: row.question || '',
                summary: row.responsesummary || '',
                nextSteps: row.nextsteps || '',
                keywords: row.keywords || '',
                source: row.sourcelink || '',
                owner: row.owner || '',
                lastReviewed: row.lastreviewed || '',
                tags: row.tags || ''
            };
        })
        .filter(row => row.category && row.question);
}

/**
 * Parse CSV line handling quoted commas
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// ==========================================================================
// Data Processing
// ==========================================================================

/**
 * Process fetched data into categories
 */
function processData(data) {
    state.allData = data;
    state.categories = {};
    
    // Group by category
    data.forEach(item => {
        const category = item.category.trim();
        if (!state.categories[category]) {
            state.categories[category] = [];
        }
        state.categories[category].push(item);
    });
    
    // Sort categories alphabetically
    const sortedCategories = {};
    Object.keys(state.categories).sort().forEach(key => {
        sortedCategories[key] = state.categories[key];
    });
    state.categories = sortedCategories;
}

// ==========================================================================
// Rendering Functions
// ==========================================================================

/**
 * Render category grid
 */
function renderCategories() {
    const html = Object.keys(state.categories).map((category, idx) => {
        const count = state.categories[category].length;
        const icon = category.charAt(0).toUpperCase();
        
        return `
            <div class="category-card" data-category="${category}" style="animation-delay: ${idx * 0.05}s">
                <div class="category-icon">${icon}</div>
                <div class="category-name">${category}</div>
                <div class="category-count">${count} question${count !== 1 ? 's' : ''}</div>
            </div>
        `;
    }).join('');
    
    elements.categoryGrid.innerHTML = html;
    
    // Add click listeners
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showCategoryQuestions(category);
        });
    });
}

/**
 * Show questions for selected category
 */
function showCategoryQuestions(category) {
    state.currentCategory = category;
    const questions = state.categories[category];
    
    // Update UI
    elements.categorySection.style.display = 'none';
    elements.questionsSection.style.display = 'block';
    elements.categoryTitle.textContent = category;
    
    // Render top questions (limit to 10)
    const html = questions.slice(0, 10).map((item, idx) => {
        return `
            <button class="question-chip" data-index="${state.allData.indexOf(item)}" style="animation-delay: ${idx * 0.05}s">
                ${item.question}
            </button>
        `;
    }).join('');
    
    elements.questionChips.innerHTML = html;
    
    // Add click listeners
    document.querySelectorAll('.question-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const index = parseInt(chip.dataset.index);
            showResult([state.allData[index]]);
        });
    });
    
    // Update Connor tip
    updateConnorTip(category);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show result cards
 */
function showResult(results) {
    state.filteredData = results;
    
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
                
                <div class="result-summary">
                    ${item.summary}
                </div>
                
                ${nextSteps.length > 0 ? `
                    <div class="result-next-steps">
                        <h4>Next Steps</h4>
                        <ul>
                            ${nextSteps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${resources.length > 0 ? `
                    <div class="result-resources">
                        <h4>Resources</h4>
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
                    ${item.owner ? `<span class="result-owner">Owner: ${item.owner}</span>` : ''}
                    ${item.lastReviewed ? `<span class="result-reviewed">Last reviewed: ${item.lastReviewed}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    elements.resultsContainer.innerHTML = html;
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Parse next steps (split by newline or bullet points)
 */
function parseNextSteps(text) {
    if (!text) return [];
    
    return text
        .split(/\n|•|[-–—]/)
        .map(step => step.trim())
        .filter(step => step.length > 0);
}

/**
 * Parse resources (support "Label | URL" or just URLs)
 */
function parseResources(text) {
    if (!text) return [];
    
    const resources = [];
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l);
    
    lines.forEach(line => {
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

/**
 * Validate URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// ==========================================================================
// Search Functionality
// ==========================================================================

/**
 * Search across questions, keywords, and categories
 */
function performSearch(query) {
    if (!query || query.length < 2) {
        elements.searchResults.classList.remove('active');
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = state.allData.filter(item => {
        return (
            item.question.toLowerCase().includes(lowerQuery) ||
            item.keywords.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery) ||
            item.summary.toLowerCase().includes(lowerQuery) ||
            item.tags.toLowerCase().includes(lowerQuery)
        );
    });
    
    renderSearchResults(results.slice(0, 8)); // Limit to 8 results
}

/**
 * Render search autocomplete results
 */
function renderSearchResults(results) {
    if (results.length === 0) {
        elements.searchResults.classList.remove('active');
        return;
    }
    
    const html = results.map((item, idx) => {
        return `
            <div class="search-result-item" data-index="${state.allData.indexOf(item)}" data-result-idx="${idx}">
                <div class="search-result-question">${item.question}</div>
                <div class="search-result-category">${item.category}</div>
            </div>
        `;
    }).join('');
    
    elements.searchResults.innerHTML = html;
    elements.searchResults.classList.add('active');
    state.selectedSearchIndex = -1;
    
    // Add click listeners
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            selectSearchResult(state.allData[index]);
        });
    });
}

/**
 * Select a search result
 */
function selectSearchResult(item) {
    elements.searchInput.value = item.question;
    elements.searchResults.classList.remove('active');
    elements.clearSearch.style.display = 'flex';
    showResult([item]);
    
    // Update Connor tip based on category
    updateConnorTip(item.category);
}

/**
 * Handle keyboard navigation in search
 */
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
        if (state.selectedSearchIndex >= 0) {
            const index = parseInt(results[state.selectedSearchIndex].dataset.index);
            selectSearchResult(state.allData[index]);
        } else if (results.length > 0) {
            const index = parseInt(results[0].dataset.index);
            selectSearchResult(state.allData[index]);
        }
    } else if (e.key === 'Escape') {
        elements.searchResults.classList.remove('active');
        state.selectedSearchIndex = -1;
    }
}

/**
 * Update search selection styling
 */
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
// Connor Bot Intelligence
// ==========================================================================

/**
 * Update Connor's tip based on category
 */
function updateConnorTip(category) {
    const tip = CONFIG.CONNOR_TIPS[category] || CONFIG.CONNOR_TIPS.default;
    elements.connorTipText.innerHTML = tip;
    
    // Show tip with animation
    elements.connorTip.classList.remove('show');
    setTimeout(() => {
        elements.connorTip.classList.add('show');
    }, 100);
}

// ==========================================================================
// Event Listeners
// ==========================================================================

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        state.searchQuery = query;
        
        if (query) {
            elements.clearSearch.style.display = 'flex';
            performSearch(query);
        } else {
            elements.clearSearch.style.display = 'none';
            elements.searchResults.classList.remove('active');
        }
    });
    
    // Search keyboard navigation
    elements.searchInput.addEventListener('keydown', handleSearchKeyboard);
    
    // Clear search
    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.clearSearch.style.display = 'none';
        elements.searchResults.classList.remove('active');
        state.searchQuery = '';
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper') && !e.target.closest('.search-autocomplete')) {
            elements.searchResults.classList.remove('active');
        }
    });
    
    // Back to categories button
    elements.backBtn.addEventListener('click', () => {
        state.currentCategory = null;
        elements.questionsSection.style.display = 'none';
        elements.categorySection.style.display = 'block';
        elements.resultsContainer.innerHTML = '';
        elements.emptyState.style.display = 'none';
        
        // Reset Connor tip
        updateConnorTip('default');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Refresh button
    elements.refreshBtn.addEventListener('click', async () => {
        elements.refreshBtn.disabled = true;
        await loadData();
        elements.refreshBtn.disabled = false;
    });
    
    // Connor bot avatar click (show/hide tip)
    const connorAvatar = document.querySelector('.connor-avatar');
    connorAvatar.addEventListener('click', () => {
        elements.connorTip.classList.toggle('show');
    });
}

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Load data and initialize app
 */
async function loadData() {
    try {
        elements.loadingState.style.display = 'block';
        elements.categorySection.style.display = 'none';
        elements.questionsSection.style.display = 'none';
        elements.emptyState.style.display = 'none';
        
        let data;
        try {
            data = await fetchSheetData();
            console.log('✅ Successfully loaded data from Google Sheets', data);
        } catch (error) {
            console.warn('⚠️ Google Sheets fetch failed, using sample data:', error);
            
            if (CONFIG.USE_SAMPLE_DATA_ON_ERROR) {
                data = CONFIG.SAMPLE_DATA;
                
                // Show warning banner
                const warningBanner = document.createElement('div');
                warningBanner.style.cssText = `
                    background: linear-gradient(135deg, #FFB81C 0%, #FFD466 100%);
                    color: #003366;
                    padding: 1rem;
                    text-align: center;
                    font-family: var(--font-display);
                    font-weight: 600;
                    border-bottom: 3px solid #003366;
                    position: sticky;
                    top: 0;
                    z-index: 200;
                    animation: slideDown 0.5s ease-out;
                `;
                warningBanner.innerHTML = `
                    ⚠️ Demo Mode: Using sample data. To connect your Google Sheet, see setup instructions below.
                    <button onclick="this.parentElement.remove()" style="margin-left: 1rem; padding: 0.25rem 0.75rem; background: #003366; color: white; border: none; border-radius: 4px; cursor: pointer;">Dismiss</button>
                `;
                document.body.insertBefore(warningBanner, document.body.firstChild);
            } else {
                throw error;
            }
        }
        
        processData(data);
        renderCategories();
        
        elements.loadingState.style.display = 'none';
        elements.categorySection.style.display = 'block';
        
        // Show Connor tip after load
        setTimeout(() => {
            elements.connorTip.classList.add('show');
        }, 1500);
        
    } catch (error) {
        console.error('❌ Failed to load data:', error);
        elements.loadingState.innerHTML = `
            <div style="text-align: center; padding: 2rem; max-width: 600px; margin: 0 auto;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2" style="margin-bottom: 1rem;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 style="color: #FF6B6B; margin-bottom: 1rem;">Unable to Load Knowledge Base</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">Please check your Google Sheet setup and try again.</p>
                
                <div style="background: #F8FAFB; padding: 1.5rem; border-radius: 12px; text-align: left; margin-bottom: 1.5rem;">
                    <h4 style="color: #003366; margin-bottom: 1rem; font-family: var(--font-display);">Setup Instructions:</h4>
                    <ol style="color: #5A6B7A; line-height: 1.8; padding-left: 1.5rem;">
                        <li><strong>Open your Google Sheet</strong></li>
                        <li>Go to <strong>File → Share → Publish to web</strong></li>
                        <li>Choose your sheet and publish as <strong>"Web page"</strong></li>
                        <li><strong>Copy the Sheet ID</strong> from your sheet URL:<br>
                            <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; display: inline-block; margin-top: 0.5rem;">
                                docs.google.com/spreadsheets/d/<strong style="color: #FFB81C;">[THIS_PART]</strong>/edit
                            </code>
                        </li>
                        <li>Paste the ID in <strong>app.js</strong> at line 14</li>
                        <li>Set <code>USE_SAMPLE_DATA_ON_ERROR: false</code> in app.js</li>
                    </ol>
                </div>
                
                <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #003366; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: var(--font-display); font-weight: 600; font-size: 1rem;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

/**
 * Initialize application
 */
function init() {
    initEventListeners();
    loadData();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
