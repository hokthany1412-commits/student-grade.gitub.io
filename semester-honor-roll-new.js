
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
        if (titleEl) titleEl.textContent = 'តារាងកិត្តិយសប្រចាំឆមាសទី២';
        
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
        const s = (Array.isArray(rawExamStudents) ? rawExamStudents : []).find(g => (g.id && p.id && String(g.id).trim() === String(p.id).trim()) || (g.name && p.name && g.name.trim() === p.name.trim())) || {};
        return {
            ...s,
            id: p.id,
            name: p.name,
            gender: (p.gender === 'ប្រុស' || p.gender === 'ប') ? 'ប' : 'ស',
            dob: p.dob,
            photo: p.photo || s.photo || s.photoUrl || '',
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


// Render Honor Roll
function renderHonorRoll() {
    document.getElementById('report-month').innerHTML = currentMode === 'exam' ? 'ប្រឡងឆមាសទី១' : 'ប្រចាំឆមាសទី១';
    
    // Filter and sort
    let validStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val > 0;
    });
    
    validStudents.sort((a, b) => {
        const valA = parseFloat(formatNumber(currentMode === 'exam' ? a.exam_avg : a.sem_avg)) || 0;
        const valB = parseFloat(formatNumber(currentMode === 'exam' ? b.exam_avg : b.sem_avg)) || 0;
        return valB - valA;
    });
    
    // Calculate ranks with exact 2-decimal rounded tie handling
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
    
    // Get top 5 ranks
    const topStudents = validStudents.filter(s => s._tempRank <= 5);
    const container = document.getElementById('honor-list');
    container.innerHTML = '';
    
    if (topStudents.length === 0) {
        container.innerHTML = '<div style="width: 100%; text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</div>';
        return;
    }
    
    // 1st place in middle (order: 2, 1, 3 for top 3)
    const rank1 = topStudents.filter(s => s._tempRank === 1);
    const rank2 = topStudents.filter(s => s._tempRank === 2);
    const rank3 = topStudents.filter(s => s._tempRank === 3);
    const rank4 = topStudents.filter(s => s._tempRank === 4);
    const rank5 = topStudents.filter(s => s._tempRank === 5);
    
    // Display layout: row 1 (2, 1, 3), row 2 (4, 5)
    let topRowHTML = '';
    let bottomRowHTML = '';
    
    const buildCard = (student, rankNum, color) => {
        if (!student) return '';
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        
        const theme = document.getElementById('theme-select') ? document.getElementById('theme-select').value : 'theme-3';
        const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
        const khmerRankNum = rankNum.toString().split('').map(d => khmerNums[d] || d).join('');
        const prefix = theme === 'theme-1' ? 'លេខ' : '';
        const rankText = prefix + khmerRankNum;

        return `
            <div class="honor-card ${rankNum === 1 ? 'rank-1' : ''}" style="border: 3px solid ${color};">
                <div class="rank-badge" style="background-color: ${color};">${rankText}</div>
                <div class="student-photo">
                    <img src="${student.photo || student.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.name) + '&background=random'}" alt="${student.name}">
                </div>
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-score">មធ្យមភាគ៖ ${avg ? formatNumber(avg) : '0.00'}</div>
                </div>
            </div>
        `;
    };
    
    // Row 1
    rank2.forEach(s => topRowHTML += buildCard(s, 2, '#94a3b8')); // Silver
    rank1.forEach(s => topRowHTML += buildCard(s, 1, '#eab308')); // Gold
    rank3.forEach(s => topRowHTML += buildCard(s, 3, '#cd7f32')); // Bronze
    
    // Row 2
    rank4.forEach(s => bottomRowHTML += buildCard(s, 4, '#3b82f6')); // Blue
    rank5.forEach(s => bottomRowHTML += buildCard(s, 5, '#8b5cf6')); // Purple
    
    if (topRowHTML) container.innerHTML += `<div class="honor-row">${topRowHTML}</div>`;
    if (bottomRowHTML) container.innerHTML += `<div class="honor-row">${bottomRowHTML}</div>`;
    
    // Update button styles
    const btnExam = document.getElementById('btn-hr-exam');
    const btnSem = document.getElementById('btn-hr-sem');
    if (currentMode === 'exam') {
        btnExam.style.backgroundColor = '#eab308';
        btnExam.style.color = 'black';
        btnSem.style.backgroundColor = '#cbd5e1';
        btnSem.style.color = 'black';
    } else {
        btnSem.style.backgroundColor = '#eab308';
        btnSem.style.color = 'black';
        btnExam.style.backgroundColor = '#cbd5e1';
        btnExam.style.color = 'black';
    }
}

// Event Listeners
document.getElementById('btn-hr-exam').addEventListener('click', () => {
    currentMode = 'exam';
    renderHonorRoll();
});
document.getElementById('btn-hr-sem').addEventListener('click', () => {
    currentMode = 'sem';
    renderHonorRoll();
});

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
    
    renderHonorRoll();
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
    const el = document.getElementById('lunar-date') || document.querySelector('.date:not(#solar-date)');
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
