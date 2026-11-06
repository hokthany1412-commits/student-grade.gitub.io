// URL Params
const urlParams = new URLSearchParams(window.location.search);
const currentMonth = urlParams.get('month') || 'default';
const currentTitle = urlParams.get('title');
const storageKey = `studentGrades_${currentMonth}`;

// Set page title dynamically
if (currentTitle) {
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
        titleElement.innerHTML = `បញ្ជីស្រង់ពិន្ទុ - សម្រាប់ខែ ${currentTitle}`;
    }
}

// Load student profiles
const studentProfiles = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];

// Data Array to hold student grades for this month
let savedGrades = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

// Sync students list with profiles
let students = [];

// Complete Grade Schema for all 19 subject columns
const defaultGradesSchema = {
    kh_1: '', kh_2: '', kh_3: '', kh_4: '',
    ma_1: '', ma_2: '', ma_3: '', ma_4: '', ma_5: '',
    sc_1: '', sc_2: '', sc_3: '', sc_4: '',
    so_1: '', so_2: '', so_3: '', so_4: '',
    sp_1: '', sp_2: '',
    ls_1: '',
    en_1: '',
    abs_1: ''
};

// Fields list to iterate over for calculation and rendering inputs
// Proactively recover storage quota
if (typeof window.pruneStorageQuota === 'function') {
    window.pruneStorageQuota();
}

const fields = [
    'kh_1', 'kh_2', 'kh_3', 'kh_4',
    'ma_1', 'ma_2', 'ma_3', 'ma_4', 'ma_5',
    'sc_1', 'sc_2', 'sc_3', 'sc_4',
    'so_1', 'so_2', 'so_3', 'so_4',
    'sp_1', 'sp_2',
    'ls_1',
    'en_1'
];


// Check if data exists under english alias (october/november/december) if savedGrades is empty
if (savedGrades.length === 0) {
    const monthAliases = {
        'តុលា': 'studentGrades_october',
        'វិច្ឆិកា': 'studentGrades_november',
        'ធ្នូ': 'studentGrades_december'
    };
    if (monthAliases[currentMonth]) {
        try {
            const aliasKey = typeof window.getKey === 'function' ? window.getKey(monthAliases[currentMonth]) : monthAliases[currentMonth];
            const aliasData = localStorage.getItem(aliasKey) || localStorage.getItem(monthAliases[currentMonth]);
            if (aliasData) {
                const parsedAlias = JSON.parse(aliasData);
                if (Array.isArray(parsedAlias) && parsedAlias.length > 0) {
                    savedGrades = parsedAlias;
                }
            }
        } catch (e) {}
    }
}

// Sync students list with profiles
if (studentProfiles.length > 0) {
    students = studentProfiles.map(profile => {
        const existingGrade = savedGrades.find(g => String(g.id).trim() === String(profile.id).trim());
        if (existingGrade) {
            // Safely merge existing grades with full schema - NEVER wipe existing user inputs!
            const mergedGrades = Object.assign({}, defaultGradesSchema, existingGrade.grades || {});
            return {
                ...existingGrade,
                id: profile.id,
                name: profile.name,
                gender: profile.gender === 'ប្រុស' ? 'ប' : (profile.gender === 'ស្រី' ? 'ស' : (profile.gender || 'ប')),
                grades: mergedGrades
            };
        } else {
            return {
                id: profile.id,
                name: profile.name,
                gender: profile.gender === 'ប្រុស' ? 'ប' : (profile.gender === 'ស្រី' ? 'ស' : (profile.gender || 'ប')),
                grades: Object.assign({}, defaultGradesSchema),
                total: 0,
                average: 0,
                rank: 0
            };
        }
    });
} else if (savedGrades.length > 0) {
    // Fallback to savedGrades if profiles are empty
    students = savedGrades.map(g => ({
        ...g,
        grades: Object.assign({}, defaultGradesSchema, g.grades || {})
    }));
}


// Calculate metrics function
function calculateStudentMetrics(student) {
    let total = 0;
    let count = 0;
    
    // Sum official academic subjects from fields array (exclude abs_1)
    fields.forEach(f => {
        if (!student.grades) return;
        const val = student.grades[f];
        if (val !== '' && val !== null && val !== undefined && !isNaN(val)) {
            total += parseFloat(val);
            count++;
        }
    });
    
    student.total = total;
    student.average = count > 0 ? (total / count) : 0;
}

// Recalculate all initially
students.forEach(calculateStudentMetrics);

// Helper Function: Calculate Grade based on average
function calculateGrade(average) {
    if (average >= 9.0) return { letter: 'A', class: 'grade-a' };
    if (average >= 8.0) return { letter: 'B', class: 'grade-b' };
    if (average >= 7.0) return { letter: 'C', class: 'grade-c' };
    if (average >= 6.0) return { letter: 'D', class: 'grade-d' };
    if (average >= 5.0) return { letter: 'E', class: 'grade-e' };
    return { letter: 'F', class: 'grade-f' };
}

// Function to calculate ranks
function calculateRanks() {
    const rankedStudents = students.filter(s => s.average > 0).sort((a, b) => b.average - a.average);
    let currentRank = 1;
    for (let i = 0; i < rankedStudents.length; i++) {
        if (i > 0 && rankedStudents[i].average < rankedStudents[i-1].average) {
            currentRank = i + 1;
        }
        rankedStudents[i].rank = currentRank;
    }
    students.forEach(s => {
        if (s.average === 0) s.rank = 0;
    });
}

// Function to format number to 2 decimal places (robust rounding)
function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    // Use exponential rounding to avoid floating point precision issues with .5
    return Number(Math.round(parseFloat(num) + 'e2') + 'e-2').toFixed(2);
}

// DOM Elements
const tableBody = document.getElementById('table-body');
const clearBtn = document.getElementById('clear-btn');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const tableResponsive = document.querySelector('.official-table-container');


// Render Table
function renderTable(dataToRender = students) {
    tableBody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (tableResponsive) tableResponsive.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    if (tableResponsive) tableResponsive.style.display = 'block';

    // Render statistics footer
    if (typeof renderStatistics === 'function') {
        renderStatistics(dataToRender);
    }

    dataToRender.forEach((student, index) => {
        const gradeInfo = calculateGrade(student.average);
        
        const row = document.createElement('tr');
        
        // Extract Last Name and First Name
        const nameParts = (student.name || '').trim().split(/\s+/);
        const lastName = nameParts[0] || '';
        const firstName = nameParts.slice(1).join(' ') || '';
        
        // Static columns
        let html = `
            <td>${index + 1}</td>
            <td>${student.id}</td>
            <td style="padding: 0; min-width: 180px;">
                <div style="display: flex; width: 100%; height: 100%; align-items: stretch;">
                    <div style="flex: 1; padding: 4px 6px; text-align: left; font-weight: 500; display: flex; align-items: center;">${lastName}</div>
                    <div style="flex: 1; padding: 4px 6px; text-align: left; font-weight: 500; display: flex; align-items: center;">${firstName}</div>
                </div>
            </td>
            <td>${student.gender}</td>
        `;
        
        // Dynamic input columns
        fields.forEach(field => {
            html += `
                <td>
                    <input type="number" 
                           class="inline-input" 
                           data-id="${student.id}" 
                           data-field="${field}" 
                           value="${student.grades[field] !== undefined ? student.grades[field] : ''}" 
                           min="0" max="10" step="0.5">
                </td>
            `;
        });
        
        // Results columns
        html += `
            <td id="total-${student.id}" style="font-weight: bold; color: #334155;">${student.total > 0 ? formatNumber(student.total) : ''}</td>
            <td id="avg-${student.id}" style="font-weight: bold; color: var(--primary);">${student.average > 0 ? formatNumber(student.average) : ''}</td>
            <td id="rank-${student.id}" style="font-weight: bold;">${student.rank > 0 ? student.rank : ''}</td>
            <td id="grade-${student.id}"><span class="grade-badge ${gradeInfo.class}" style="display: ${student.average > 0 ? 'inline-block' : 'none'}">${student.average > 0 ? gradeInfo.letter : ''}</span></td>
            <td></td>
        `;
        
        row.innerHTML = html;
        tableBody.appendChild(row);
    });
    
    attachInputListeners();
}

// Handle Inline Editing
function attachInputListeners() {
    const inputs = document.querySelectorAll('.inline-input');
    inputs.forEach(input => {
        // Handle keyboard navigation (Excel-like)
        input.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
                const currentTd = e.target.closest('td');
                const currentTr = currentTd.closest('tr');
                const tdIndex = Array.from(currentTr.children).indexOf(currentTd);
                
                let nextInput = null;
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevTr = currentTr.previousElementSibling;
                    if (prevTr) {
                        nextInput = prevTr.children[tdIndex].querySelector('input');
                    }
                } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    e.preventDefault();
                    const nextTr = currentTr.nextElementSibling;
                    if (nextTr) {
                        nextInput = nextTr.children[tdIndex].querySelector('input');
                    }
                } else if (e.key === 'ArrowLeft') {
                    const prevTd = currentTd.previousElementSibling;
                    if (prevTd) {
                        nextInput = prevTd.querySelector('input');
                    }
                } else if (e.key === 'ArrowRight') {
                    const nextTd = currentTd.nextElementSibling;
                    if (nextTd) {
                        nextInput = nextTd.querySelector('input');
                    }
                }
                
                if (nextInput) {
                    e.preventDefault(); // Prevent default for left/right to avoid scrolling/cursor moving inside input only when we jump
                    nextInput.focus();
                    nextInput.select(); // Select text so typing overwrites (Excel behavior)
                }
            }
        });

        // Handle input events in real-time
        const handleGradeUpdate = (e) => {
            const studentId = e.target.getAttribute('data-id');
            const field = e.target.getAttribute('data-field');
            let value = e.target.value;
            
            // Limit to 10
            if (value !== '' && parseFloat(value) > 10) {
                value = '10';
                e.target.value = value;
            }
            if (value !== '' && parseFloat(value) < 0) {
                value = '0';
                e.target.value = value;
            }
            
            // Find student
            const studentIndex = students.findIndex(s => String(s.id).trim() === String(studentId).trim());
            if (studentIndex > -1) {
                if (!students[studentIndex].grades) students[studentIndex].grades = {};
                students[studentIndex].grades[field] = value;
                // Recalculate
                calculateStudentMetrics(students[studentIndex]);
                calculateRanks();
                saveData();
                
                // Update DOM for this row and all rank columns
                updateRowDOM(students[studentIndex]);
                updateAllRanksDOM();

                // Update footer stats
                if (typeof renderStatistics === 'function') {
                    renderStatistics(students);
                }
            }
        };

        input.addEventListener('change', handleGradeUpdate);
        input.addEventListener('input', handleGradeUpdate);
    });
}

function updateRowDOM(student) {
    if (!student || !student.id) return;
    const sId = String(student.id).trim();
    const totalEl = document.getElementById(`total-${sId}`);
    const avgEl = document.getElementById(`avg-${sId}`);
    const gradeEl = document.getElementById(`grade-${sId}`);
    
    if (student.total > 0) {
        if (totalEl) totalEl.textContent = formatNumber(student.total);
        if (avgEl) avgEl.textContent = formatNumber(student.average);
        
        if (gradeEl) {
            const gradeInfo = calculateGrade(student.average);
            gradeEl.innerHTML = `<span class="grade-badge ${gradeInfo.class}">${gradeInfo.letter}</span>`;
        }
    } else {
        if (totalEl) totalEl.textContent = '';
        if (avgEl) avgEl.textContent = '';
        if (gradeEl) gradeEl.innerHTML = `<span class="grade-badge" style="display: none"></span>`;
    }
}

function updateAllRanksDOM() {
    students.forEach(student => {
        const rankEl = document.getElementById(`rank-${student.id}`);
        if (rankEl) {
            rankEl.textContent = student.rank > 0 ? student.rank : '';
        }
    });
}

// Save Data to localStorage
function saveData() {
    window._lastLocalGradeSaveTime = Date.now();
    const targetKey = typeof window.getKey === 'function' ? window.getKey(storageKey) : storageKey;
    const jsonStr = JSON.stringify(students);
    try {
        localStorage.setItem(targetKey, jsonStr);
    } catch (err) {
        if (typeof window.pruneStorageQuota === 'function') {
            window.pruneStorageQuota(true);
            localStorage.setItem(targetKey, jsonStr);
        } else {
            throw err;
        }
    }
    if (window.triggerGoogleAutoSync) {
        window.triggerGoogleAutoSync();
    }
}

// Manual Save Function triggered by Save button or Ctrl+S
function manualSaveGrades(showFeedback = true) {
    const saveBtn = document.getElementById('save-grades-btn');
    const origBtnHtml = saveBtn ? saveBtn.innerHTML : '';
    
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spinSave 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
            កំពុងរក្សាទុក...
        `;
    }

    try {
        // 1. Collect all live values from table inputs
        const inputs = document.querySelectorAll('.inline-input');
        inputs.forEach(input => {
            const studentId = input.getAttribute('data-id');
            const field = input.getAttribute('data-field');
            if (!studentId || !field) return;
            let value = input.value.trim();
            
            if (value !== '' && !isNaN(value)) {
                let num = parseFloat(value);
                if (num > 10) num = 10;
                if (num < 0) num = 0;
                value = num.toString();
            }
            
            const student = students.find(s => String(s.id).trim() === String(studentId).trim());
            if (student) {
                if (!student.grades) student.grades = {};
                student.grades[field] = value;
            }
        });

        // 2. Recalculate metrics and ranks for all students
        students.forEach(calculateStudentMetrics);
        calculateRanks();

        // 3. Save to localStorage immediately
        saveData();

        // 4. Update UI for all rows and ranks safely
        students.forEach(student => {
            updateRowDOM(student);
        });
        updateAllRanksDOM();

        // 5. Update footer stats safely
        if (typeof renderStatistics === 'function') {
            try { renderStatistics(students); } catch (eStats) { console.warn('renderStatistics warning:', eStats); }
        }

        // 6. Trigger Firebase Sync if available
        if (window.dbSync && typeof window.dbSync.saveData === 'function') {
            try { window.dbSync.saveData(); } catch (eFb) {}
        }

        // 7. Trigger immediate real-time sync to Google Sheets
        if (typeof window.triggerGoogleAutoSync === 'function') {
            try { window.triggerGoogleAutoSync(true); } catch (eGas) {}
        }

        // 8. Visual button feedback (Shows checkmark on button itself)
        if (saveBtn) {
            saveBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                បានរក្សាទុកជោគជ័យ!
            `;
            saveBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
            setTimeout(() => {
                if (saveBtn) {
                    saveBtn.innerHTML = origBtnHtml;
                    saveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    saveBtn.disabled = false;
                }
            }, 2500);
        }

        // 9. Toast notification
        if (showFeedback) {
            showSaveToast('✅ បានរក្សាទុកពិន្ទុសិស្សដោយជោគជ័យ!');
        }
    } catch (err) {
        console.error('Save grades error:', err);
        const isQuota = err && (
            err.name === 'QuotaExceededError' ||
            (err.message && err.message.toLowerCase().includes('quota'))
        );
        if (isQuota && typeof window.pruneStorageQuota === 'function') {
            try {
                window.pruneStorageQuota(true);
                saveData();
                students.forEach(student => updateRowDOM(student));
                updateAllRanksDOM();
                if (typeof window.triggerGoogleAutoSync === 'function') {
                    try { window.triggerGoogleAutoSync(true); } catch(eGas) {}
                }
                if (saveBtn) {
                    saveBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        បានរក្សាទុកជោគជ័យ!
                    `;
                    saveBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
                    setTimeout(() => {
                        if (saveBtn) {
                            saveBtn.innerHTML = origBtnHtml;
                            saveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                            saveBtn.disabled = false;
                        }
                    }, 2500);
                }
                showSaveToast('✅ បានដោះស្រាយទំហំផ្ទុក និងរក្សាទុកពិន្ទុជោគជ័យ!');
                return;
            } catch (retryErr) {
                console.error('Retry after quota cleanup failed:', retryErr);
            }
        }
        if (saveBtn) {
            saveBtn.innerHTML = origBtnHtml;
            saveBtn.disabled = false;
        }
        alert('⚠️ មានបញ្ហាក្នុងការរក្សាទុក៖ ' + err.message);
    }
}

// Global Ctrl+S shortcut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        manualSaveGrades(true);
    }
});

// Toast Notification
function showSaveToast(msg = '✅ បានរក្សាទុកទិន្នន័យដោយជោគជ័យ!') {
    let toast = document.getElementById('grade-save-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'grade-save-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            padding: 14px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.5);
            font-family: 'Battambang', 'Khmer OS Battambang', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid rgba(255, 255, 255, 0.3);
        `;
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> ${msg}`;
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    if (window._saveToastTimeout) clearTimeout(window._saveToastTimeout);
    window._saveToastTimeout = setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Render Statistics Footer
function renderStatistics(data) {
    const footer = document.getElementById('statistics-footer');
    if (!footer) return;
    
    if (data.length === 0) {
        footer.classList.add('hidden');
        return;
    }
    
    footer.classList.remove('hidden');
    
    let total = data.length;
    let female = data.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length;
    
    const statTotalEl = document.getElementById('stat-total');
    const statFemEl = document.getElementById('stat-female');
    if (statTotalEl) statTotalEl.textContent = total;
    if (statFemEl) statFemEl.textContent = female;
    
    let stats = {
        drop: { tot: 0, fem: 0 },
        range1: { tot: 0, fem: 0 }, // 5.00 - 6.46
        range2: { tot: 0, fem: 0 }, // 6.50 - 7.99
        range3: { tot: 0, fem: 0 }, // 8.00 - 9.49
        range4: { tot: 0, fem: 0 }, // 9.50 - 10.00
        range5: { tot: 0, fem: 0 }  // < 5.00
    };
    
    data.forEach(s => {
        let isFemale = (s.gender === 'ស' || s.gender === 'ស្រី');
        let avg = s.average || 0;
        
        // Define dropouts as students with 0 total (no grades entered)
        if (s.total === 0) {
            stats.drop.tot++;
            if (isFemale) stats.drop.fem++;
        } else if (avg >= 9.50) {
            stats.range4.tot++;
            if (isFemale) stats.range4.fem++;
        } else if (avg >= 8.00) {
            stats.range3.tot++;
            if (isFemale) stats.range3.fem++;
        } else if (avg >= 6.50) {
            stats.range2.tot++;
            if (isFemale) stats.range2.fem++;
        } else if (avg >= 5.00) {
            stats.range1.tot++;
            if (isFemale) stats.range1.fem++;
        } else {
            stats.range5.tot++;
            if (isFemale) stats.range5.fem++;
        }
    });
    
    const updateRow = (idPrefix, statObj) => {
        let elTot = document.getElementById(`stat-${idPrefix}-tot`);
        let elFem = document.getElementById(`stat-${idPrefix}-fem`);
        let elPct = document.getElementById(`stat-${idPrefix}-pct`);
        
        if (elTot) elTot.textContent = statObj.tot;
        if (elFem) elFem.textContent = statObj.fem;
        if (elPct) {
            let pct = total > 0 ? (statObj.tot / total) * 100 : 0;
            elPct.textContent = pct.toFixed(2) + '%';
        }
    };
    
    updateRow('drop', stats.drop);
    updateRow('range1', stats.range1);
    updateRow('range2', stats.range2);
    updateRow('range3', stats.range3);
    updateRow('range4', stats.range4);
    updateRow('range5', stats.range5);
    
    // Update date
    const today = new Date();
    const kmMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    
    // Map khmer numerals
    const toKm = (num) => {
        const kmDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
        return String(num).split('').map(d => kmDigits[parseInt(d)] || d).join('');
    };
    
    const elD = document.getElementById('stat-day');
    const elM = document.getElementById('stat-month');
    const elY = document.getElementById('stat-year');
    if (elD) elD.textContent = toKm(today.getDate());
    if (elM) elM.textContent = kmMonths[today.getMonth()];
    if (elY) elY.textContent = toKm(String(today.getFullYear()).slice(-2));
}

// Clear All Data
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (students.length === 0) return;
        
        if (confirm('តើអ្នកពិតជាចង់លុបពិន្ទុទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) {
            students.forEach(s => {
                for (const key in s.grades) {
                    s.grades[key] = '';
                }
                s.total = 0;
                s.average = 0;
                s.rank = 0;
            });
            saveData();
            renderTable();
        }
    });
}

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) || 
            student.id.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredStudents);
    });
}

// Download Excel Template functionality
function downloadExcelTemplate() {
    if (typeof XLSX === 'undefined') {
        alert('សូមរង់ចាំបន្តិច! ប្រព័ន្ធកំពុងរៀបចំ... (Please wait for library to load)');
        return;
    }
    
    // Create header rows
    const headerRow0 = ['ល.រ', 'អត្តលេខ', 'គោត្តនាម និងនាម', 'ភេទ', 'ភាសាខ្មែរ', '', '', '', 'គណិតវិទ្យា', '', '', '', '', 'វិទ្យាសាស្ត្រ', '', '', '', 'សិក្សាសង្គម', '', '', '', 'កីឡា', '', '', ''];
    const headerRow1 = ['ល.រ', 'អត្តលេខ', 'គោត្តនាម និងនាម', 'ភេទ', 
        'សមត្ថភាពស្តាប់', 'សមត្ថភាពនិយាយ', 'សមត្ថភាពអាន', 'សមត្ថភាពសរសេរ', 
        'ចំនួន', 'រង្វាស់រង្វាល់', 'ធរណីមាត្រ', 'ពិជគណិត', 'ស្ថិតិ', 
        'រូបវិទ្យា', 'គីមីវិទ្យា', 'ជីវវិទ្យា', 'ផែនដី បរិស្ថាន', 
        'សីលធម៌', 'ភូមិវិទ្យា', 'ប្រវត្តិវិទ្យា', 'គេហវិទ្យា', 
        'អប់រំកាយ កីឡា', 'សុខភាព អនាម័យ', 'បំណិនជីវិត', 'ភាសាបរទេស'];

    let aoa = [headerRow0, headerRow1];
    
    // If we have students, pre-fill them
    if (students && students.length > 0) {
        students.forEach((s, idx) => {
            let row = [
                idx + 1,
                s.id,
                s.name,
                s.gender,
                s.grades.kh_1 || '', s.grades.kh_2 || '', s.grades.kh_3 || '', s.grades.kh_4 || '',
                s.grades.ma_1 || '', s.grades.ma_2 || '', s.grades.ma_3 || '', s.grades.ma_4 || '', s.grades.ma_5 || '',
                s.grades.sc_1 || '', s.grades.sc_2 || '', s.grades.sc_3 || '', s.grades.sc_4 || '',
                s.grades.so_1 || '', s.grades.so_2 || '', s.grades.so_3 || '', s.grades.so_4 || '',
                s.grades.sp_1 || '', s.grades.sp_2 || '',
                s.grades.ls_1 || '',
                s.grades.en_1 || ''
            ];
            aoa.push(row);
        });
    } else {
        // Just empty rows as example
        for(let i=1; i<=10; i++) {
            aoa.push([i, '', '', 'ស', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        }
    }
    
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    
    // Add simple merges for the top header (Row 0)
    worksheet['!merges'] = [
        { s: { r: 0, c: 4 }, e: { r: 0, c: 7 } }, // ភាសាខ្មែរ
        { s: { r: 0, c: 8 }, e: { r: 0, c: 12 } }, // គណិត
        { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } }, // វិទ្យាសាស្ត្រ
        { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } }, // សង្គម
        { s: { r: 0, c: 21 }, e: { r: 0, c: 22 } }  // កីឡា (Foreign is 1 col so no merge needed)
    ];
    
    // Set column widths
    const wscols = [
        {wch: 5}, {wch: 8}, {wch: 25}, {wch: 5},
        {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8},
        {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8},
        {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8},
        {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8},
        {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8}
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");
    
    // Generate file name based on current month
    const fileName = "ទម្រង់បញ្ចូលពិន្ទុ_ខែ" + (currentTitle || "បច្ចុប្បន្ន") + ".xlsx";
    
    // Download
    XLSX.writeFile(workbook, fileName);
}

// Excel Import functionality
const excelFileInput = document.getElementById('excel-file-input');
if (excelFileInput) {
    excelFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                let importedCount = 0;
                
                jsonData.forEach(row => {
                    // Check if row has data and looks like a student row (ID in col 1)
                    if (row && row.length >= 15 && row[1]) {
                        const idStr = String(row[1]).trim();
                        
                        // Ignore header rows
                        if (idStr === 'អត្តលេខ' || idStr.toLowerCase() === 'id') return;
                        
                        let studentIndex = students.findIndex(s => String(s.id).trim() === idStr);
                        
                        if (studentIndex === -1) {
                            // Student not found in roster, add them!
                            const newName = (row[2] || 'មិនស្គាល់ឈ្មោះ').toString().trim();
                            const newGender = (row[3] || 'ស').toString().trim();
                            
                            students.push({
                                id: idStr,
                                name: newName,
                                gender: newGender,
                                grades: {
                                    kh_1: '', kh_2: '', kh_3: '', kh_4: '',
                                    ma_1: '', ma_2: '', ma_3: '', ma_4: '', ma_5: '',
                                    sc_1: '', sc_2: '', sc_3: '', sc_4: '',
                                    so_1: '', so_2: '', so_3: '', so_4: '',
                                    sp_1: '', sp_2: '', ls_1: '', en_1: '', abs_1: ''
                                },
                                total: 0,
                                average: 0,
                                rank: 0
                            });
                            
                            // Also update studentProfilesData in localStorage so they show up everywhere
                            studentProfiles.push({ id: idStr, name: newName, gender: newGender });
                            localStorage.setItem(window.getKey('studentProfilesData'), JSON.stringify(studentProfiles));
                            
                            studentIndex = students.length - 1;
                        }
                        
                        if (studentIndex !== -1) {
                            importedCount++;
                            const s = students[studentIndex];
                            
                            // Automatically fix garbled names if Excel provides a proper name
                            const excelName = (row[2] || '').toString().trim();
                            if (excelName && excelName.length > 0 && s.name !== excelName) {
                                s.name = excelName;
                                
                                // Update studentProfilesData with the fixed name
                                let pIndex = studentProfiles.findIndex(p => String(p.id).trim() === idStr);
                                if (pIndex !== -1) {
                                    studentProfiles[pIndex].name = excelName;
                                } else {
                                    studentProfiles.push({ id: idStr, name: excelName, gender: s.gender });
                                }
                                localStorage.setItem(window.getKey('studentProfilesData'), JSON.stringify(studentProfiles));
                            }
                            
                            const parseGrade = (val) => {
                                if (val === undefined || val === null || String(val).trim() === '') return '';
                                const num = parseFloat(String(val).replace(',', '.'));
                                return isNaN(num) ? '' : num;
                            };

                            s.grades.kh_1 = parseGrade(row[4]);
                            s.grades.kh_2 = parseGrade(row[5]);
                            s.grades.kh_3 = parseGrade(row[6]);
                            s.grades.kh_4 = parseGrade(row[7]);
                            
                            s.grades.ma_1 = parseGrade(row[8]);
                            s.grades.ma_2 = parseGrade(row[9]);
                            s.grades.ma_3 = parseGrade(row[10]);
                            s.grades.ma_4 = parseGrade(row[11]);
                            s.grades.ma_5 = parseGrade(row[12]);
                            
                            s.grades.sc_1 = parseGrade(row[13]);
                            s.grades.sc_2 = parseGrade(row[14]);
                            s.grades.sc_3 = parseGrade(row[15]);
                            s.grades.sc_4 = parseGrade(row[16]);
                            
                            s.grades.so_1 = parseGrade(row[17]);
                            s.grades.so_2 = parseGrade(row[18]);
                            s.grades.so_3 = parseGrade(row[19]);
                            s.grades.so_4 = parseGrade(row[20]);
                            
                            s.grades.sp_1 = parseGrade(row[21]);
                            s.grades.sp_2 = parseGrade(row[22]);
                            
                            s.grades.ls_1 = parseGrade(row[23]);
                            
                            s.grades.en_1 = parseGrade(row[24]);
                            
                            calculateStudentMetrics(s);
                        }
                    }
                });

                if (importedCount > 0) {
                    calculateRanks();
                    saveData();
                    renderTable();
                    alert(`បានទាញយកពិន្ទុដោយជោគជ័យសម្រាប់សិស្សចំនួន ${importedCount} នាក់! (Imported ${importedCount} students)`);
                } else {
                    alert('មិនមានទិន្នន័យត្រូវគ្នានឹងអត្តលេខសិស្សទេ។ សូមពិនិត្យមើលឯកសារ Excel ឡើងវិញ។');
                }
            } catch (error) {
                console.error(error);
                alert('មានបញ្ហាក្នុងការអានឯកសារ Excel: ' + error.message);
            }
            // Reset input so the same file can be selected again
            excelFileInput.value = '';
        };
        reader.readAsArrayBuffer(file);
    });
}



// Auto-clean any invalid rows (e.g. from Excel headers)
(function autoClean() {
    let cleaned = false;
    
    // Clean students array
    for (let i = students.length - 1; i >= 0; i--) {
        const id = String(students[i].id).trim().toLowerCase();
        if (id === 'អត្តលេខ' || id === 'id' || id === '' || id === 'undefined') {
            students.splice(i, 1);
            cleaned = true;
        }
    }
    
    // Clean student profiles array
    for (let i = studentProfiles.length - 1; i >= 0; i--) {
        const id = String(studentProfiles[i].id).trim().toLowerCase();
        if (id === 'អត្តលេខ' || id === 'id' || id === '' || id === 'undefined') {
            studentProfiles.splice(i, 1);
            cleaned = true;
        }
    }
    
    if (cleaned) {
        localStorage.setItem(window.getKey('studentProfilesData'), JSON.stringify(studentProfiles));
        saveData();
    }
})();

// Initial Render
calculateRanks();
renderTable();


// Explicitly attach to window for HTML inline onclick handlers
window.manualSaveGrades = manualSaveGrades;
