
let currentMode = 'exam'; // 'exam' or 'sem'
const urlParams = new URLSearchParams(window.location.search);
const sem = urlParams.get('sem') || '1';
const storageKey = sem === '2' ? 'semester2ExamGrades' : 'semester1ExamGrades';

document.addEventListener('DOMContentLoaded', () => {
    const praiseBtn = document.getElementById('btn-issue-praise-cert');
    if (praiseBtn) {
        praiseBtn.href = `praise-certificate.html?period=${sem === '2' ? 'semester2' : 'semester1'}`;
    }
    if (sem === '2') {
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = 'តារាងចំណាត់ថ្នាក់ប្រចាំឆមាសទី២';
        
        document.querySelectorAll('h2, th, td, p, span, div').forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                if (el.textContent.includes('ឆមាសទី១')) {
                    el.textContent = el.textContent.replace(/ឆមាសទី១/g, 'ឆមាសទី២');
                }
            }
        });
    }
});let rawExamStudents = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];
const profilesData = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];

let students = [];
if (profilesData.length > 0) {
    students = profilesData.map(p => {
        const s = (Array.isArray(rawExamStudents) ? rawExamStudents : []).find(g => String(g.id).trim() === String(p.id).trim()) || {};
        return {
            ...s,
            id: p.id,
            name: p.name,
            gender: (p.gender === 'ប្រុស' || p.gender === 'ប') ? 'ប' : 'ស',
            dob: p.dob,
            grades: s.grades || {}
        };
    });
} else {
    students = Array.isArray(rawExamStudents) ? rawExamStudents : [];
}

// Force recalculation if averages are missing
const examFields = [
    's_kh1', 's_kh2', 's_kh3', 's_kh4', 
    's_ma', 's_sc', 's_so1', 's_es', 's_so2', 
    's_ls', 's_pe', 's_art', 's_en'
];

// Function to format number to 2 decimal places (robust rounding)
function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    return Number(Math.round(parseFloat(num) + 'e2') + 'e-2').toFixed(2);
}

function calculateMonthlyAverage(studentId) {
    const months = sem === '2' 
        ? ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា'] 
        : ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា']; // Hardcoded to these 4 months specifically to ignore test data in Oct/Nov
    let totalMonthlyAvg = 0;
    let monthsCount = 0;
    
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
                totalMonthlyAvg += parseFloat(formatNumber(rawAvg));
                monthsCount++;
            }
        }
    });
    
    if (monthsCount === 0) return 0;
    return (totalMonthlyAvg / monthsCount);
}

function ensureAverages() {
    let globalMaxCount = 0;
    students.forEach(student => {
        if (!student.grades) student.grades = {};
        let count = 0;
        examFields.forEach(key => {
            const val = student.grades[key];
            if (val !== '' && val !== null && !isNaN(val)) count++;
        });
        if (count > globalMaxCount) globalMaxCount = count;
        student.monthly_avg = calculateMonthlyAverage(student.id);
    });
    
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
        
        if (student.exam_avg > 0 && student.monthly_avg > 0) {
            student.sem_avg = (student.exam_avg + student.monthly_avg) / 2;
        } else if (student.exam_avg > 0) {
            student.sem_avg = student.exam_avg;
        } else if (student.monthly_avg > 0) {
            student.sem_avg = student.monthly_avg;
        } else {
            student.sem_avg = 0;
        }
    });
}
ensureAverages();


// Calculate rankings based on mode
function calculateRanks() {
    // Filter out students without average > 0
    let validStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val > 0;
    });
    
    // Sort descending by 2-decimal rounded average
    validStudents.sort((a, b) => {
        const valA = parseFloat(formatNumber(currentMode === 'exam' ? a.exam_avg : a.sem_avg)) || 0;
        const valB = parseFloat(formatNumber(currentMode === 'exam' ? b.exam_avg : b.sem_avg)) || 0;
        return valB - valA;
    });
    
    let currentRank = 1;
    let previousVal = null;
    let tieCount = 0;
    
    validStudents.forEach((student, index) => {
        const val = parseFloat(formatNumber(currentMode === 'exam' ? student.exam_avg : student.sem_avg)) || 0;
        if (previousVal !== null && val === previousVal) {
            tieCount++;
        } else {
            currentRank = index + 1;
            tieCount = 0;
        }
        student._tempRank = currentRank;
        previousVal = val;
    });
    
    return validStudents;
}



// Render Table
function renderRanking() {
    document.getElementById('report-month').innerHTML = currentMode === 'exam' ? 'ចំណាត់ថ្នាក់ប្រឡងឆមាសទី១' : 'ចំណាត់ថ្នាក់ប្រចាំឆមាសទី១';
    
    const tableBody = document.getElementById('ranking-body');
    tableBody.innerHTML = '';
    
    const rankedStudents = calculateRanks();
    
    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }
    
    const halfLength = Math.ceil(rankedStudents.length / 2);
    
    const buildCols = (student) => {
        if (!student) return '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        let bg = '';
        if (student._tempRank === 1) bg = 'background-color: #fef08a;';
        else if (student._tempRank === 2) bg = 'background-color: #e2e8f0;';
        else if (student._tempRank === 3) bg = 'background-color: #fed7aa;';
        
        let displayGrade = '';
        if (avg >= 9.0) displayGrade = 'A';
        else if (avg >= 8.0) displayGrade = 'B';
        else if (avg >= 7.0) displayGrade = 'C';
        else if (avg >= 6.0) displayGrade = 'D';
        else if (avg >= 5.0) displayGrade = 'E';
        else if (avg > 0) displayGrade = 'F';
        
        return `
            <td style="text-align: center; font-weight: bold; ${bg}">${student._tempRank}</td>
            <td style="text-align: left; padding-left: 5px; ${bg}">${student.name ? student.name.split(' ')[0] : ''}</td>
            <td style="text-align: left; padding-left: 5px; ${bg}">${student.name ? student.name.split(' ').slice(1).join(' ') : ''}</td>
            <td style="text-align: center; ${bg}">${student.gender}</td>
            <td style="text-align: center; font-weight: bold; ${bg}">${avg ? formatNumber(avg) : '0.00'}</td>
            <td style="text-align: center; ${bg}">${student._tempRank}</td>
            <td style="text-align: center; ${bg}">${displayGrade}</td>
        `;
    };
    
    for (let i = 0; i < halfLength; i++) {
        const leftStudent = rankedStudents[i];
        const rightStudent = rankedStudents[i + halfLength];
        
        const tr = document.createElement('tr');
        tr.innerHTML = buildCols(leftStudent) + buildCols(rightStudent);
        tableBody.appendChild(tr);
    }
    
    // Update button styles
    const btnExam = document.getElementById('btn-rank-exam');
    const btnSem = document.getElementById('btn-rank-sem');
    if (btnExam && btnSem) {
        if (currentMode === 'exam') {
            btnExam.style.backgroundColor = '#3b82f6';
            btnExam.style.color = 'white';
            btnSem.style.backgroundColor = '#cbd5e1';
            btnSem.style.color = 'black';
        } else {
            btnSem.style.backgroundColor = '#3b82f6';
            btnSem.style.color = 'white';
            btnExam.style.backgroundColor = '#cbd5e1';
            btnExam.style.color = 'black';
        }
    }
    
    // Also update statistics!
    const totalStudents = students.length;
    const isFemale = (g) => { const x = (g||'').trim(); return x==='ស្រី' || x==='ស' || x.toLowerCase()==='f'; };
    const totalFemale = students.filter(s => isFemale(s.gender)).length;
    
    const passedStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val >= 5.0;
    });
    const passedFemale = passedStudents.filter(s => isFemale(s.gender)).length;

    const failedStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val > 0 && val < 5.0;
    });
    const failedFemale = failedStudents.filter(s => isFemale(s.gender)).length;

    const dropoutStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return !val || val === 0;
    });
    const dropoutFemale = dropoutStudents.filter(s => isFemale(s.gender)).length;

    function calcPct(part, whole) {
        if (whole === 0) return "0.00";
        return ((part / whole) * 100).toFixed(2);
    }
    
    const ls = `<span style="display:inline-block; width:125px; white-space:nowrap;">`;
    const rs = `</span>`;
    
    let elTotal = document.getElementById('stat-total');
    if (elTotal) elTotal.innerHTML = `${ls}សិស្សដើមឆ្នាំសរុប${rs} = ${totalStudents} នាក់`;
    let elTotalF = document.getElementById('stat-total-f');
    if (elTotalF) elTotalF.textContent = `/ស្រី = ${totalFemale} នាក់`;

    let elPass = document.getElementById('stat-passed');
    if (elPass) elPass.innerHTML = `${ls}សិស្សជាប់មធ្យមភាគ${rs} = ${passedStudents.length} នាក់`;
    let elPassPct = document.getElementById('stat-passed-pct');
    if (elPassPct) elPassPct.textContent = `= ${calcPct(passedStudents.length, totalStudents)}%`;
    let elPassF = document.getElementById('stat-passed-f');
    if (elPassF) elPassF.textContent = `/ស្រី = ${passedFemale} នាក់`;
    let elPassFPct = document.getElementById('stat-passed-f-pct');
    if (elPassFPct) elPassFPct.textContent = `= ${calcPct(passedFemale, totalFemale)}%`;

    let elFail = document.getElementById('stat-failed');
    if (elFail) elFail.innerHTML = `${ls}សិស្សធ្លាក់សរុប${rs} = ${failedStudents.length} នាក់`;
    let elFailPct = document.getElementById('stat-failed-pct');
    if (elFailPct) elFailPct.textContent = `= ${calcPct(failedStudents.length, totalStudents)}%`;
    let elFailF = document.getElementById('stat-failed-f');
    if (elFailF) elFailF.textContent = `/ស្រី = ${failedFemale} នាក់`;
    let elFailFPct = document.getElementById('stat-failed-f-pct');
    if (elFailFPct) elFailFPct.textContent = `= ${calcPct(failedFemale, totalFemale)}%`;

    let elDrop = document.getElementById('stat-dropout');
    if (elDrop) elDrop.innerHTML = `${ls}សិស្សបោះបង់សរុប${rs} = ${dropoutStudents.length} នាក់`;
    let elDropPct = document.getElementById('stat-dropout-pct');
    if (elDropPct) elDropPct.textContent = `= ${calcPct(dropoutStudents.length, totalStudents)}%`;
    let elDropF = document.getElementById('stat-dropout-f');
    if (elDropF) elDropF.textContent = `/ស្រី = ${dropoutFemale} នាក់`;
    let elDropFPct = document.getElementById('stat-dropout-f-pct');
    if (elDropFPct) elDropFPct.textContent = `= ${calcPct(dropoutFemale, totalFemale)}%`;
}
// Event Listeners
document.getElementById('btn-rank-exam').addEventListener('click', () => {
    currentMode = 'exam';
    renderRanking();
});
document.getElementById('btn-rank-sem').addEventListener('click', () => {
    currentMode = 'sem';
    renderRanking();
});

// Setup metadata
document.addEventListener('DOMContentLoaded', () => {
    const records = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || {};
    const t = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    const teacher = t.length > 0 ? t[0] : null;
    
    let schoolEl = document.getElementById('header-school');
    if (schoolEl) schoolEl.innerHTML = `សាលាបឋមសិក្សា <strong>${records.schoolName || 'ផ្លុង'}</strong>`;
    
    let districtEl = document.getElementById('header-district');
    if (districtEl) districtEl.textContent = `ការិយាល័យអប់រំយុវជន និងកីឡាស្រុក ${records.districtName || 'សន្ទុក'}`;
    
    let clusterEl = document.getElementById('header-cluster');
    if (clusterEl) {
        clusterEl.style.display = 'block';
        clusterEl.textContent = `កម្រង ${records.clusterName || 'ទីពោ'}`;
    }
    
    let classEl = document.getElementById('class-info-display');
    let cName = window.classManager ? window.classManager.getActiveClass().name : (records.className || 'ថ្នាក់ទី ៥ ក');
    const academicYearName = (window.classManager && typeof window.classManager.getCurrentAcademicYearName === 'function')
        ? window.classManager.getCurrentAcademicYearName()
        : (localStorage.getItem('academicYear') || localStorage.getItem('schoolYear') || '២០២៥ - ២០២៦');
    if (classEl) classEl.textContent = `${cName.includes('ថ្នាក់') ? cName : 'ថ្នាក់' + cName} ឆ្នាំសិក្សា ${academicYearName}`;
    
    let teacherEl = document.getElementById('teacher-name-display');
    let tName = teacher ? teacher.name : '';
    if (!tName && window.auth && typeof window.auth.getTeacherForClass === 'function') {
        const cId = window.classManager ? window.classManager.getCurrentClassId() : 'default';
        tName = window.auth.getTeacherForClass(cId);
    }
    if (teacherEl) teacherEl.textContent = tName || '..................................';
    
    renderRanking();
});

// --- DATE SELECTION LOGIC ---
const lunarPhaseSelect = document.getElementById('lunar-phase');
if (lunarPhaseSelect) {
    const phases = [];
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    
    for (let i = 1; i <= 15; i++) phases.push(`${toKhmer(i)}កើត`);
    for (let i = 1; i <= 14; i++) phases.push(`${toKhmer(i)}រោច`);
    
    phases.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === '១៥កើត') opt.selected = true;
        lunarPhaseSelect.appendChild(opt);
    });
}

function updateLunar() {
    const day = document.getElementById('lunar-day-week').value;
    const phase = document.getElementById('lunar-phase').value;
    const month = document.getElementById('lunar-month').value;
    const zodiac = document.getElementById('lunar-zodiac').value;
    const era = document.getElementById('lunar-era').value;
    const be = document.getElementById('lunar-be').value;
    
    const lunarText = `ថ្ងៃ${day} ${phase} ខែ${month} ឆ្នាំ${zodiac} ${era} ${be}`;
    const el = document.getElementById('lunar-date');
    if (el) el.textContent = lunarText;
}

function updateSolarDate(dateString) {
    if (!dateString) return;
    const dateObj = new Date(dateString);
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    
    const day = toKhmer(dateObj.getDate());
    const month = khmerMonths[dateObj.getMonth()];
    const year = toKhmer(dateObj.getFullYear());
    
    const location = document.getElementById('solar-location').value;
    const formatted = `${location}, ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
    const el = document.getElementById('solar-date');
    if (el) el.textContent = formatted;
    
    if (window.KhmerCalendar && window.KhmerCalendar.toKhmerLunarDate) {
        try {
            const lunarData = window.KhmerCalendar.toKhmerLunarDate(dateObj);
            document.getElementById('lunar-day-week').value = lunarData.dayOfWeek;
            document.getElementById('lunar-phase').value = lunarData.moonDayKhmer + lunarData.moonStatus;
            document.getElementById('lunar-month').value = lunarData.khmerMonth;
            document.getElementById('lunar-zodiac').value = lunarData.animalYear;
            document.getElementById('lunar-era').value = lunarData.sak;
            document.getElementById('lunar-be').value = "ព.ស" + lunarData.buddhistEraYearKhmer;
            updateLunar();
        } catch (e) {
            console.error("Error generating lunar date", e);
        }
    }
}

window.updateLunar = updateLunar;
window.updateSolarDate = updateSolarDate;
window.triggerSolarUpdate = function() {
    const picker = document.getElementById('solar-picker');
    if (picker && picker.value) {
        updateSolarDate(picker.value);
    }
};


// --- AUTO-ADJUST LAYOUT TO FIT A4 ---
function adjustLayoutToFitA4() {
    const container = document.querySelector('.a4-container');
    const tbody = document.getElementById('ranking-body');
    const footer = document.querySelector('.footer-table');
    if (!container || !tbody || !footer) return;
    
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) return;

    // Reset heights
    rows.forEach(row => {
        row.style.height = '';
        Array.from(row.children).forEach(td => {
            td.style.height = '';
            td.style.fontSize = '';
            const spans = td.querySelectorAll('span');
            spans.forEach(span => span.style.fontSize = '');
        });
    });

    const mmNode = document.createElement('div');
    mmNode.style.height = '10mm';
    mmNode.style.position = 'absolute';
    document.body.appendChild(mmNode);
    const pxPerMm = mmNode.getBoundingClientRect().height / 10;
    document.body.removeChild(mmNode);

    const containerRect = container.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    
    // We want a very small gap to satisfy "តែ 1cm តែប៉ុណ្ណោះ". Let's set it to exactly 10mm.
    const currentBottomGap = containerRect.bottom - footerRect.bottom;
    const targetBottomGap = 10 * pxPerMm; 

    if (currentBottomGap > targetBottomGap) {
        const extraSpace = currentBottomGap - targetBottomGap;
        const tbodyHeight = tbody.getBoundingClientRect().height;
        const targetTbodyHeight = tbodyHeight + extraSpace;
        const targetRowHeight = targetTbodyHeight / rows.length;

        // Allow row height to grow as much as needed (removed the 60px max limit)
        const finalRowHeight = Math.max(20, targetRowHeight); 
        
        let fontSizePt = (finalRowHeight / 26) * 10;
        fontSizePt = Math.max(9, Math.min(fontSizePt, 11)); // Capped at 11pt to prevent horizontal overflow during print

        rows.forEach(row => {
            row.style.height = finalRowHeight + 'px';
            Array.from(row.children).forEach(td => {
                td.style.height = finalRowHeight + 'px';
                td.style.fontSize = fontSizePt + 'pt';
                const spans = td.querySelectorAll('span');
                spans.forEach(span => span.style.fontSize = fontSizePt + 'pt');
            });
        });
    }
}

function runAdjustment() {
    adjustLayoutToFitA4();
    setTimeout(adjustLayoutToFitA4, 500);
    setTimeout(adjustLayoutToFitA4, 1500);
}

if (document.readyState === 'complete') {
    runAdjustment();
} else {
    window.addEventListener('load', runAdjustment);
}
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(runAdjustment);
}
window.addEventListener('resize', runAdjustment);
