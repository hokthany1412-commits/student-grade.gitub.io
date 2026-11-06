const urlParams = new URLSearchParams(window.location.search);
const sem = urlParams.get('sem') || '1';

const storageKey = sem === '2' ? 'semester2ExamGrades' : 'semester1ExamGrades';

document.addEventListener('DOMContentLoaded', () => {
    if (sem === '2') {
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = 'តារាងពិន្ទុប្រចាំឆមាសទី២';
        
        document.querySelectorAll('h2, th, td, p, span, div').forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                if (el.textContent.includes('ឆមាសទី១')) {
                    el.textContent = el.textContent.replace(/ឆមាសទី១/g, 'ឆមាសទី២');
                }
            }
        });
        
        const honorBtn = document.querySelector('[onclick*="semester-honor-roll.html"]');
        if (honorBtn) honorBtn.setAttribute('onclick', "window.location.href='semester-honor-roll.html?sem=2'");
        
        const rankBtn = document.querySelector('[onclick*="semester-ranking.html"]');
        if (rankBtn) rankBtn.setAttribute('onclick', "window.location.href='semester-ranking.html?sem=2'");
    }
});
const studentProfiles = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
let savedGrades = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

// 12 subjects for exam
const examFields = [
    's_kh1', 's_kh2', 's_kh3', 's_kh4', 
    's_ma', 's_sc', 's_so1', 's_es', 's_so2', 
    's_ls', 's_pe', 's_art', 's_en'
];
// 3 evaluation fields
const evalFields = ['eval_knowledge', 'eval_moral', 'eval_attitude'];

let students = [];

if (studentProfiles.length > 0) {
    students = studentProfiles.map(profile => {
        const existingGrade = savedGrades.find(g => g.id === profile.id);
        if (existingGrade) {
            return {
                ...existingGrade,
                name: profile.name,
                gender: profile.gender === 'ប្រុស' ? 'ប' : (profile.gender === 'ស្រី' ? 'ស' : (profile.gender || 'ប')),
                dob: profile.dob
            };
        } else {
            let initialGrades = {};
            examFields.forEach(f => initialGrades[f] = '');
            evalFields.forEach(f => initialGrades[f] = '');
            return {
                ...profile,
                gender: profile.gender === 'ប្រុស' ? 'ប' : (profile.gender === 'ស្រី' ? 'ស' : (profile.gender || 'ប')),
                grades: initialGrades,
                exam_avg: 0,
                monthly_avg: 0,
                sem_avg: 0,
                rank: 0,
                grade: 'F'
            };
        }
    });
}

const tableBody = document.getElementById('table-body');
const emptyState = document.getElementById('empty-state');
const tableContainer = document.querySelector('.official-table-container');

// Helper to determine letter grade
function getLetterGrade(average) {
    if (average >= 9.0) return 'A';
    if (average >= 8.0) return 'B';
    if (average >= 7.0) return 'C';
    if (average >= 6.0) return 'D';
    if (average >= 5.0) return 'E';
    return 'F';
}

function getLetterColor(grade) {
    switch (grade) {
        case 'A': return '#22c55e'; // Green
        case 'B': return '#3b82f6'; // Blue
        case 'C': return '#f59e0b'; // Orange
        case 'D': return '#f97316'; // Dark orange
        case 'E': return '#64748b'; // Slate
        default: return '#ef4444'; // Red
    }
}

// Function to format number to 2 decimal places (robust rounding)
function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    return Number(Math.round(parseFloat(num) + 'e2') + 'e-2').toFixed(2);
}

function calculateMonthlyAverage(student) {
    const studentId = student.id;
    const months = sem === '2' 
        ? ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា'] 
        : ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា']; // Hardcoded to these 4 months specifically to ignore test data in Oct/Nov
    let totalMonthlyAvg = 0;
    let monthsCount = 0;
    let debugStr = [];
    
    months.forEach(month => {
        const key = window.getKey(`studentGrades_${month}`);
        const monthlyData = JSON.parse(localStorage.getItem(key)) || [];
        const studentRecord = monthlyData.find(s => String(s.id).trim() === String(studentId).trim());
        
        if (studentRecord && studentRecord.grades) {
            let sum = 0;
            let count = 0;
            for (const k in studentRecord.grades) {
                const gradeVal = studentRecord.grades[k];
                if (gradeVal !== '' && gradeVal !== null && String(gradeVal).trim() !== '' && !isNaN(gradeVal)) {
                    sum += parseFloat(gradeVal);
                    count++;
                }
            }
            
            if (count > 0) {
                const rawAvg = sum / count;
                // Round to 2 decimal places to match Casio calculator exactly
                const val = parseFloat(formatNumber(rawAvg));
                totalMonthlyAvg += val;
                monthsCount++;
                debugStr.push(`${month}=${val}`);
            }
        }
    });
    
    if (monthsCount === 0) {
        student._debugMath = 'គ្មានទិន្នន័យ';
        return 0;
    }
    const result = (totalMonthlyAvg / monthsCount);
    student._debugMath = `(${debugStr.join(' + ')}) / ${monthsCount} = ${formatNumber(result)}`;
    return result;
}

// Calculate Global Metrics and Ranks
function calculateGlobalMetricsAndRanks() {
    let globalMaxCount = 0;
    
    // Pass 1: find max count of exam subjects taken
    students.forEach(student => {
        let count = 0;
        examFields.forEach(key => {
            const val = student.grades[key];
            if (val !== '' && val !== null && !isNaN(val)) count++;
        });
        if (count > globalMaxCount) globalMaxCount = count;
        
        // Calculate and cache monthly average
        student.monthly_avg = calculateMonthlyAverage(student);
    });
    
    // Pass 2: compute averages
    const divisor = globalMaxCount > 0 ? globalMaxCount : 1;
    
    students.forEach(student => {
        let total = 0;
        examFields.forEach(key => {
            const val = student.grades[key];
            if (val !== '' && val !== null && !isNaN(val)) {
                total += parseFloat(val);
            }
        });
        
        student.exam_avg = total / divisor;
        
        // Semester Avg = (Exam Avg + Monthly Avg) / 2
        if (student.exam_avg > 0 && student.monthly_avg > 0) {
            student.sem_avg = (student.exam_avg + student.monthly_avg) / 2;
        } else if (student.exam_avg > 0) {
            student.sem_avg = student.exam_avg; // If no monthly data yet
        } else if (student.monthly_avg > 0) {
            student.sem_avg = student.monthly_avg; // If no exam data yet
        } else {
            student.sem_avg = 0;
        }
        
        student.grade = getLetterGrade(student.sem_avg);
    });
    
    // Pass 3: Rankings
    const sorted = [...students]
        .filter(s => s.sem_avg > 0)
        .sort((a, b) => b.sem_avg - a.sem_avg);
        
    let currentRank = 1;
    let previousAvg = null;
    let tieCount = 0;

    sorted.forEach((student, index) => {
        if (student.sem_avg === previousAvg) {
            tieCount++;
        } else {
            currentRank = index + 1;
            tieCount = 0;
        }
        student.rank = currentRank;
        previousAvg = student.sem_avg;
    });

    students.forEach(student => {
        if (student.sem_avg === 0) {
            student.rank = 0;
            student.grade = '';
        }
    });
}

function renderTable(dataToRender = students) {
    tableBody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        emptyState.classList.remove('hidden');
        tableContainer.style.display = 'none';
        return;
    }
    
    emptyState.classList.add('hidden');
    tableContainer.style.display = 'block';
    
    calculateGlobalMetricsAndRanks();
    // Save the newly calculated averages so other pages (Ranking/Honor Roll) can read them
    saveData();
    
    dataToRender.forEach((student, index) => {
        const tr = document.createElement('tr');
        
        // Helper to generate inputs
        const generateInput = (key) => `
            <td style="padding: 0;">
                <input type="${evalFields.includes(key) ? 'text' : 'number'}" 
                       class="grade-input" 
                       data-id="${student.id}" 
                       data-key="${key}" 
                       value="${student.grades[key] !== undefined ? student.grades[key] : ''}"
                       ${!evalFields.includes(key) ? 'min="0" max="10" step="0.25"' : ''}
                       style="width: 100%; height: 100%; border: none; text-align: center; background: transparent; outline: none; padding: 12px 4px;">
            </td>
        `;
        
        let html = `
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center; font-family: monospace;">${student.id}</td>
            <td style="text-align: left; padding-left: 10px; white-space: nowrap;">${student.name}</td>
            <td style="text-align: center;">${student.gender}</td>
        `;
        
        // 13 Exam Fields
        examFields.forEach(f => html += generateInput(f));
        
        // 5 Result Fields
        html += `
            <td style="text-align: center; font-weight: 600; background-color: #f1f5f9;">${student.exam_avg ? formatNumber(student.exam_avg) : ''}</td>
            <td style="text-align: center; font-weight: 600; background-color: #f1f5f9;">${student.monthly_avg ? formatNumber(student.monthly_avg) : ''}</td>
            <td style="text-align: center; font-weight: 700; background-color: #e2e8f0; color: #0f172a;">${student.sem_avg ? formatNumber(student.sem_avg) : ''}</td>
            <td style="text-align: center; font-weight: 700; font-size: 1.1rem;">${student.rank || ''}</td>
            <td style="text-align: center; font-weight: 700; font-size: 1.1rem; color: ${getLetterColor(student.grade)}">${student.grade}</td>
        `;
        
        // 3 Eval Fields
        evalFields.forEach(f => html += generateInput(f));
        
        tr.innerHTML = html;
        tableBody.appendChild(tr);
    });

    // Add event listeners
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const key = e.target.getAttribute('data-key');
            let val = e.target.value;
            
            if (!evalFields.includes(key)) {
                let num = parseFloat(val);
                if (num > 10) num = 10;
                if (num < 0) num = 0;
                if (!isNaN(num)) {
                    val = num;
                    e.target.value = val;
                } else {
                    val = '';
                    e.target.value = '';
                }
            }
            
            const sIndex = students.findIndex(s => s.id === id);
            if (sIndex > -1) {
                students[sIndex].grades[key] = val;
                // Render table will recalculate averages and then call saveData()
                renderTable();
                
                // Refocus input after re-render
                setTimeout(() => {
                    const nextInput = document.querySelector(`.grade-input[data-id="${id}"][data-key="${key}"]`);
                    if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                    }
                }, 10);
            }
        });
    });
}

function saveData() {
    localStorage.setItem(window.getKey(storageKey), JSON.stringify(students));
}

// Manual Save for Semester Grades
function manualSaveSemesterGrades(showFeedback = true) {
    // Collect live values from table inputs
    document.querySelectorAll('.grade-input').forEach(input => {
        const id = input.getAttribute('data-id');
        const key = input.getAttribute('data-key');
        let val = input.value.trim();
        
        if (!evalFields.includes(key) && val !== '' && !isNaN(val)) {
            let num = parseFloat(val);
            if (num > 10) num = 10;
            if (num < 0) num = 0;
            val = num.toString();
        }
        
        const student = students.find(s => s.id === id);
        if (student && student.grades) {
            student.grades[key] = val;
        }
    });

    calculateGlobalMetricsAndRanks();
    saveData();
    renderTable();

    if (window.dbSync && typeof window.dbSync.saveData === 'function') {
        window.dbSync.saveData();
    }

    if (showFeedback) {
        showSemSaveToast('✅ បានរក្សាទុកពិន្ទុឆមាសដោយជោគជ័យ!');
    }
}

// Ctrl+S shortcut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        manualSaveSemesterGrades(true);
    }
});

// Toast notification
function showSemSaveToast(msg = '✅ បានរក្សាទុកទិន្នន័យដោយជោគជ័យ!') {
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

// Search
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.id.toLowerCase().includes(term)
    );
    renderTable(filtered);
});

// Excel Export/Import
function downloadSemesterExcelTemplate() {
    if (students.length === 0) {
        alert("សូមបញ្ចូលប្រវត្តិរូបសិស្សជាមុនសិន!");
        return;
    }
    
    const headerRow0 = [
        'ល.រ', 'អត្តលេខ', 'គោត្តនាម និងនាម', 'ភេទ',
        'ពិន្ទុប្រឡងឆមាសទី១', '', '', '', '', '', '', '', '', '', '', '', '',
        'លទ្ធផលប្រចាំឆមាសទី១', '', '', '', '',
        'និទ្ទេសតាមផ្នែក', '', ''
    ];
    
    const headerRow1 = [
        '', '', '', '',
        'អំណាន', 'ស្តាប់ និង និយាយ', 'សរសេរតាមអាន', 'តែងសេចក្តី',
        'គណិតវិទ្យា', 'វិទ្យាសាស្ត្រ', 'សីលធម៌ ពលរដ្ឋវិជ្ជា', 'ផែនដីវិទ្យា', 'ប្រវត្តិវិទ្យា',
        'គេហវិទ្យា បំណិន', 'អប់រំកាយ កីឡា', 'អប់រំសិល្បៈ', 'ភាសាបរទេស',
        'មធ្យមភាគប្រឡងឆមាស', 'មធ្យមភាគប្រចាំខែ', 'មធ្យមភាគប្រចាំឆមាស', 'ចំណាត់ថ្នាក់', 'ចំណាត់ថ្នាក់និទ្ទេស',
        'បំណិន ចំណេះដឹង', 'កាយ សីលធម៌', 'មនោសញ្ចេតនា កាយវិការ'
    ];

    let aoa = [headerRow0, headerRow1];
    
    students.forEach((s, i) => {
        let row = [
            i + 1,
            s.id,
            s.name,
            s.gender,
            s.grades.s_kh1 || '', s.grades.s_kh2 || '', s.grades.s_kh3 || '', s.grades.s_kh4 || '',
            s.grades.s_ma || '', s.grades.s_sc || '', s.grades.s_so1 || '', s.grades.s_es || '', s.grades.s_so2 || '',
            s.grades.s_ls || '', s.grades.s_pe || '', s.grades.s_art || '', s.grades.s_en || '',
            s.exam_avg ? formatNumber(s.exam_avg) : '',
            s.monthly_avg ? formatNumber(s.monthly_avg) : '',
            s.sem_avg ? formatNumber(s.sem_avg) : '',
            s.rank || '',
            s.grade || '',
            s.grades.eval_knowledge || '', s.grades.eval_moral || '', s.grades.eval_attitude || ''
        ];
        aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge logic
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(
        {s: {r: 0, c: 0}, e: {r: 1, c: 0}},
        {s: {r: 0, c: 1}, e: {r: 1, c: 1}},
        {s: {r: 0, c: 2}, e: {r: 1, c: 2}},
        {s: {r: 0, c: 3}, e: {r: 1, c: 3}},
        {s: {r: 0, c: 4}, e: {r: 0, c: 16}}, // Exam 13 cols
        {s: {r: 0, c: 17}, e: {r: 0, c: 21}}, // Results 5 cols
        {s: {r: 0, c: 22}, e: {r: 0, c: 24}}  // Eval 3 cols
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ពិន្ទុឆមាសទី១");
    XLSX.writeFile(wb, "Semester1_Grades.xlsx");
}

document.getElementById('excel-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        if (jsonData.length > 2) {
            let importCount = 0;
            
            for (let i = 2; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0 || !row[1]) continue;
                
                const id = row[1].toString();
                const s = students.find(st => st.id === id);
                
                if (s) {
                    const parseGrade = (val) => {
                        if (val === undefined || val === null || val === '') return '';
                        let num = parseFloat(val);
                        return (!isNaN(num) && num >= 0 && num <= 10) ? num : '';
                    };
                    
                    const parseEval = (val) => val === undefined || val === null ? '' : val.toString();
                    
                    s.grades.s_kh1 = parseGrade(row[4]);
                    s.grades.s_kh2 = parseGrade(row[5]);
                    s.grades.s_kh3 = parseGrade(row[6]);
                    s.grades.s_kh4 = parseGrade(row[7]);
                    s.grades.s_ma  = parseGrade(row[8]);
                    s.grades.s_sc  = parseGrade(row[9]);
                    s.grades.s_so1 = parseGrade(row[10]);
                    s.grades.s_es  = parseGrade(row[11]);
                    s.grades.s_so2 = parseGrade(row[12]);
                    s.grades.s_ls  = parseGrade(row[13]);
                    s.grades.s_pe  = parseGrade(row[14]);
                    s.grades.s_art = parseGrade(row[15]);
                    s.grades.s_en  = parseGrade(row[16]);
                    
                    s.grades.eval_knowledge = parseEval(row[22]);
                    s.grades.eval_moral = parseEval(row[23]);
                    s.grades.eval_attitude = parseEval(row[24]);
                    
                    importCount++;
                }
            }
            
            if (importCount > 0) {
                saveData();
                renderTable();
                alert(`នាំចូលទិន្នន័យបានសម្រេចសម្រាប់សិស្ស ${importCount} នាក់!`);
            } else {
                alert("រកមិនឃើញអត្តលេខសិស្សដែលត្រូវគ្នាឡើយ។");
            }
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset
});

document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យពិន្ទុឆមាសទាំងអស់មែនទេ? (ទិន្នន័យសិស្សនៅរក្សាដដែល)")) {
        students.forEach(s => {
            examFields.forEach(f => s.grades[f] = '');
            evalFields.forEach(f => s.grades[f] = '');
            s.exam_avg = 0;
            s.sem_avg = 0;
            s.rank = 0;
            s.grade = '';
        });
        saveData();
        renderTable();
    }
});

// Initial render
renderTable();

