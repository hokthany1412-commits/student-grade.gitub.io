// URL Params
const urlParams = new URLSearchParams(window.location.search);
let currentMonth = urlParams.get('month') || 'មេសា'; // default to មេសា
let currentTitle = urlParams.get('title') || currentMonth;
let storageKey = `studentGrades_${currentMonth}`;

// Setup month selector
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        // Find if the currentMonth exists in options
        let optionExists = Array.from(monthSelect.options).some(opt => opt.value === currentMonth);
        if (optionExists) {
            monthSelect.value = currentMonth;
        } else {
            currentMonth = monthSelect.value;
            currentTitle = currentMonth;
            storageKey = `studentGrades_${currentMonth}`;
        }
    }
});

window.changeMonth = function() {
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        window.location.href = `honor-roll.html?month=${monthSelect.value}&title=${monthSelect.value}`;
    }
}

// Update Title
document.getElementById('report-month').textContent = `ប្រចាំខែ ${currentTitle}`;
const praiseBtn = document.getElementById('btn-issue-praise-cert');
if (praiseBtn) {
    praiseBtn.href = `praise-certificate.html?period=monthly&month=${encodeURIComponent(currentMonth)}`;
}

// Load School Info for Header
const schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];
if (schoolRecords.length > 0) {
    const latestSchool = schoolRecords[schoolRecords.length - 1];
    if (latestSchool.districtOffice) {
        let dist = latestSchool.districtOffice.trim();
        if (!dist.includes('ការិយាល័យ') && !dist.includes('មន្ទីរ')) {
            if (dist === 'ស្រុក' || dist === 'ក្រុង' || dist === 'ខណ្ឌ') {
                dist = 'ការិយាល័យអប់រំយុវជន និងកីឡា' + dist;
            } else if (!dist.startsWith('ស្រុក') && !dist.startsWith('ក្រុង') && !dist.startsWith('ខណ្ឌ')) {
                dist = 'ការិយាល័យអប់រំយុវជន និងកីឡាស្រុក ' + dist;
            } else {
                dist = 'ការិយាល័យអប់រំយុវជន និងកីឡា' + dist;
            }
        }
        document.getElementById('header-district').textContent = dist;
    }
    if (latestSchool.schoolCluster) document.getElementById('header-cluster').textContent = `កម្រង ${latestSchool.schoolCluster}`;
    if (latestSchool.schoolName) document.getElementById('header-school').innerHTML = `សាលាបឋមសិក្សា <strong>${latestSchool.schoolName}</strong>`;
}

// Format Number
function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    return parseFloat(num).toFixed(2);
}

// Calculate Grade Helper
function calculateGrade(average) {
    if (average >= 9.0) return 'A';
    if (average >= 8.0) return 'B';
    if (average >= 7.0) return 'C';
    if (average >= 6.0) return 'D';
    if (average >= 5.0) return 'E';
    return 'F';
}

// --- LOAD TEACHER PROFILE, CLASS & ACADEMIC YEAR ---
const teacherProfiles = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
const mainTeacher = teacherProfiles.length > 0 ? teacherProfiles[0] : null;

// Get Active Class Name
let cName = (window.classManager && typeof window.classManager.getCurrentClassName === 'function')
    ? window.classManager.getCurrentClassName()
    : (mainTeacher && mainTeacher.className ? mainTeacher.className : 'ថ្នាក់ទី ៥ ក');
if (!cName.startsWith('ថ្នាក់')) {
    cName = 'ថ្នាក់' + cName;
}

// Get Academic Year dynamically
const academicYearName = (window.classManager && typeof window.classManager.getCurrentAcademicYearName === 'function')
    ? window.classManager.getCurrentAcademicYearName()
    : (localStorage.getItem('academicYear') || localStorage.getItem('schoolYear') || '២០២៥ - ២០២៦');

const classInfoEl = document.getElementById('class-info-display');
if (classInfoEl) {
    classInfoEl.textContent = `${cName} ឆ្នាំសិក្សា ${academicYearName}`;
}

const teacherDisplayEl = document.getElementById('teacher-name-display');
if (teacherDisplayEl) {
    let tName = mainTeacher ? mainTeacher.name : '';
    if (!tName && window.auth && typeof window.auth.getTeacherForClass === 'function') {
        const cId = window.classManager ? window.classManager.getCurrentClassId() : 'default';
        tName = window.auth.getTeacherForClass(cId);
    }
    teacherDisplayEl.textContent = tName || '..................................';
}

// --- LOAD DATE ---
// Set current date manually since we don't have the Chhankitek widget here
const today = new Date();
const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');

const day = toKhmer(today.getDate());
const month = khmerMonths[today.getMonth()];
const year = toKhmer(today.getFullYear());
document.getElementById('solar-date').textContent = `ផ្លុង, ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;

// --- RENDER HONOR ROLL ---
function renderHonorRoll() {
    const allStudents = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
    const savedGrades = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

    // Map grades and preserve all existing data while linking student photos
    let processedStudents = [];
    if (savedGrades.length > 0) {
        processedStudents = savedGrades.map(gradeRecord => {
            const profile = allStudents.find(s => (s.id && gradeRecord.id && String(s.id).trim() === String(gradeRecord.id).trim()) || (s.name && gradeRecord.name && s.name.trim() === gradeRecord.name.trim())) || {};
            return {
                ...profile,
                ...gradeRecord,
                photo: profile.photo || (window.getStudentPhoto ? window.getStudentPhoto(profile.id || gradeRecord.id) : '') || gradeRecord.photo || '',
                average: gradeRecord.average !== undefined ? gradeRecord.average : 0,
                hasGrade: gradeRecord.average !== undefined && gradeRecord.average > 0
            };
        });
    } else {
        processedStudents = allStudents.map(student => {
            const gradeRecord = savedGrades.find(g => String(g.id).trim() === String(student.id).trim());
            return {
                ...student,
                average: gradeRecord ? gradeRecord.average : 0,
                hasGrade: gradeRecord && gradeRecord.average > 0
            };
        });
    }

    // Filter and sort by 2-decimal rounded average
    let rankedStudents = processedStudents
        .filter(s => s.hasGrade)
        .sort((a, b) => {
            const avgA = parseFloat(formatNumber(a.average)) || 0;
            const avgB = parseFloat(formatNumber(b.average)) || 0;
            return avgB - avgA;
        });

    // Assign actual ranks taking ties into account (based on displayed 2-decimal average)
    let currentRank = 1;
    let rankCounter = 1;
    let previousAverage = null;

    rankedStudents.forEach(student => {
        const roundedAvg = parseFloat(formatNumber(student.average)) || 0;
        if (previousAverage !== null && roundedAvg < previousAverage) {
            currentRank = rankCounter;
        }
        student.actualRank = currentRank;
        previousAverage = roundedAvg;
        rankCounter++;
    });

    const topN = parseInt(document.getElementById('top-n-select').value);
    
    // Get students whose rank is <= topN
    const topStudents = rankedStudents.filter(s => s.actualRank <= topN);
    
    const listContainer = document.getElementById('honor-list');
    listContainer.innerHTML = '';

    if (topStudents.length === 0) {
        listContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; font-size: 16pt; font-weight: bold; padding: 40px; border: 2px dashed #cbd5e1; border-radius: 12px; width: 100%;">មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់ខែនេះទេ (សូមបញ្ចូលពិន្ទុជាមុនសិន)</div>`;
        return;
    }

    const rank1 = topStudents.filter(s => s.actualRank === 1);
    const rank2 = topStudents.filter(s => s.actualRank === 2);
    const rank3 = topStudents.filter(s => s.actualRank === 3);
    const rank4 = topStudents.filter(s => s.actualRank === 4);
    const rank5 = topStudents.filter(s => s.actualRank === 5);

    const buildStudentCard = (student) => {
        if (!student) return '';
        let rankClass = `honor-rank-other`;
        if (student.actualRank === 1) rankClass = 'honor-rank-1';
        else if (student.actualRank === 2) rankClass = 'honor-rank-2';
        else if (student.actualRank === 3) rankClass = 'honor-rank-3';
        else if (student.actualRank <= 5) rankClass = `honor-rank-${student.actualRank}`;

        const theme = document.getElementById('theme-select') ? document.getElementById('theme-select').value : 'theme-3';
        let rankBadgeContent = toKhmer(student.actualRank);
        if (theme === 'theme-1') {
            rankBadgeContent = 'លេខ' + rankBadgeContent;
        }

        const photoMarkup = student.photo ? `
            <img src="${student.photo}" alt="${student.name}">
        ` : `
            <div class="student-photo-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
        `;

        return `
            <div class="student-card ${rankClass}">
                <div class="card-box">
                    <div class="honor-card-inner">
                        <div class="student-honor-photo-frame">
                            ${photoMarkup}
                        </div>
                        <div class="student-text-block">
                            <div class="student-name-row">
                                <span class="rank-number-prefix">${rankBadgeContent}.</span>
                                <h3 class="student-name">${student.name}</h3>
                            </div>
                            <div class="student-details">
                                មធ្យមភាគ៖ ${formatNumber(student.average)} (និទ្ទេស ${calculateGrade(student.average)})
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    let leftColHTML = '';
    let centerColHTML = '';
    let rightColHTML = '';

    // Center Column: Rank 1
    rank1.forEach(s => centerColHTML += buildStudentCard(s));

    // Left Column: Rank 2 on top, Rank 4 below
    rank2.forEach(s => leftColHTML += buildStudentCard(s));
    rank4.forEach(s => leftColHTML += buildStudentCard(s));

    // Right Column: Rank 3 on top, Rank 5 below
    rank3.forEach(s => rightColHTML += buildStudentCard(s));
    rank5.forEach(s => rightColHTML += buildStudentCard(s));

    // Remaining (if topN > 5)
    const remaining = topStudents.filter(s => s.actualRank > 5);
    let otherRowsHTML = '';
    if (remaining.length > 0) {
        remaining.forEach(s => otherRowsHTML += buildStudentCard(s));
    }

    let finalHTML = `
        <div class="honor-col-side honor-col-left">${leftColHTML}</div>
        <div class="honor-col-center">${centerColHTML}</div>
        <div class="honor-col-side honor-col-right">${rightColHTML}</div>
    `;
    if (otherRowsHTML) finalHTML += `<div style="width: 100%; display: flex; justify-content: center; gap: 30px; margin-top: 15px;">${otherRowsHTML}</div>`;

    listContainer.innerHTML = finalHTML;
}

// Initial render
renderHonorRoll();

// --- DATE SELECTION LOGIC ---
const lunarPhaseSelect = document.getElementById('lunar-phase');
if (lunarPhaseSelect) {
    // Generate Lunar Phases: 1-15 កើត, 1-14 រោច
    const phases = [];
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    
    for (let i = 1; i <= 15; i++) phases.push(`${toKhmer(i)}កើត`);
    for (let i = 1; i <= 14; i++) phases.push(`${toKhmer(i)}រោច`);
    
    phases.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === '១៤កើត') opt.selected = true;
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
    const lunarEl = document.getElementById('lunar-date') || document.querySelector('.date:not(#solar-date)');
    if (lunarEl) lunarEl.textContent = lunarText;
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
    const solarEl = document.getElementById('solar-date');
    if (solarEl) solarEl.textContent = formatted;
    
    // Auto-update Lunar Date if library is available
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

function triggerSolarUpdate() {
    const picker = document.getElementById('solar-picker');
    if (picker && picker.value) {
        updateSolarDate(picker.value);
    }
}
