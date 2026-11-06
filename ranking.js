// URL Params
const urlParams = new URLSearchParams(window.location.search);
const currentMonth = urlParams.get('month') || 'មេសា'; // default to មេសា
const currentTitle = urlParams.get('title') || currentMonth;
const storageKey = `studentGrades_${currentMonth}`;

// Setup month selector
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        // Find if the currentMonth exists in options
        let optionExists = Array.from(monthSelect.options).some(opt => opt.value === currentMonth);
        if (optionExists) {
            monthSelect.value = currentMonth;
        }
    }
});

window.changeMonth = function() {
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        window.location.href = `ranking.html?month=${monthSelect.value}&title=${monthSelect.value}`;
    }
}

// Update Title
document.getElementById('report-month').textContent = `ចំណាត់ថ្នាក់ប្រចាំខែ ${currentTitle}`;
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

// Load data
const allStudents = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
const savedGrades = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

// Calculate Grade Helper
function calculateGrade(average) {
    if (average >= 9.0) return 'A';
    if (average >= 8.0) return 'B';
    if (average >= 7.0) return 'C';
    if (average >= 6.0) return 'D';
    if (average >= 5.0) return 'E';
    return 'F';
}

// Format Number
function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    return parseFloat(num).toFixed(2);
}

// Format Name into Two Parts
function formatNameHTML(fullName) {
    if (!fullName) return '';
    let parts = fullName.trim().split(' ');
    let lastName = parts[0];
    let firstName = parts.slice(1).join(' ');
    if (firstName) {
        return `<div style="display: flex;"><span style="width: 45px; flex-shrink: 0;">${lastName}</span><span>${firstName}</span></div>`;
    }
    return lastName;
}

// Map grades back to all students to find missing/dropouts
let processedStudents = allStudents.map(student => {
    const gradeRecord = savedGrades.find(g => g.id === student.id);
    return {
        ...student,
        average: gradeRecord ? gradeRecord.average : 0,
        total: gradeRecord ? gradeRecord.total : 0,
        hasGrade: gradeRecord && gradeRecord.average > 0
    };
});

// Sort by 2-decimal rounded average descending
processedStudents.sort((a, b) => {
    const avgA = parseFloat(formatNumber(a.average)) || 0;
    const avgB = parseFloat(formatNumber(b.average)) || 0;
    return avgB - avgA;
});

// Assign ranks (robust tie handling based on displayed 2-decimal average)
let currentRank = 1;
let rankCounter = 1;
let previousAverage = null;

processedStudents.forEach((student) => {
    if (student.hasGrade) {
        const roundedAvg = parseFloat(formatNumber(student.average)) || 0;
        if (previousAverage !== null && roundedAvg < previousAverage) {
            currentRank = rankCounter;
        }
        student.actualRank = currentRank;
        previousAverage = roundedAvg;
        rankCounter++;
    } else {
        student.actualRank = '-';
    }
});

// --- RENDER TABLE (TWO COLUMNS) ---
const tableBody = document.getElementById('ranking-body');
let halfLength = Math.ceil(processedStudents.length / 2);

if (processedStudents.length === 0 || !processedStudents.some(s => s.hasGrade)) {
    tableBody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: #ef4444; font-size: 14pt; padding: 40px; font-weight: bold; border: 2px dashed #ef4444;">មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់ខែនេះទេ (សូមបញ្ចូលពិន្ទុជាមុនសិន)</td></tr>`;
    halfLength = 0; // Skip the for loop
}

for (let i = 0; i < halfLength; i++) {
    const leftStudent = processedStudents[i];
    const rightStudent = processedStudents[i + halfLength]; // might be undefined

    const row = document.createElement('tr');
    
    // Left side HTML
    let leftHtml = '';
    if (leftStudent) {
        let avgStr = leftStudent.hasGrade ? formatNumber(leftStudent.average) : '';
        let gradeStr = leftStudent.hasGrade ? calculateGrade(leftStudent.average) : '';
        let rankStr = leftStudent.hasGrade ? leftStudent.actualRank : '';
        let leftGenderStr = (leftStudent.gender || '').trim();
        let gender = (leftGenderStr === 'ស្រី' || leftGenderStr === 'ស' || leftGenderStr.toLowerCase() === 'f') ? 'ស' : 'ប';
        
        leftHtml = `
            <td>${i + 1}</td>
            <td style="text-align: left;">${leftStudent.name ? leftStudent.name.split(' ')[0] : ''}</td>
            <td style="text-align: left;">${leftStudent.name ? leftStudent.name.split(' ').slice(1).join(' ') : ''}</td>
            <td>${gender}</td>
            <td>${avgStr}</td>
            <td>${rankStr}</td>
            <td>${gradeStr}</td>
        `;
    } else {
        leftHtml = `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
    }

    // Right side HTML
    let rightHtml = '';
    if (rightStudent) {
        let avgStr = rightStudent.hasGrade ? formatNumber(rightStudent.average) : '';
        let gradeStr = rightStudent.hasGrade ? calculateGrade(rightStudent.average) : '';
        let rankStr = rightStudent.hasGrade ? rightStudent.actualRank : '';
        
        let rightGenderStr = (rightStudent.gender || '').trim();
        let gender = (rightGenderStr === 'ស្រី' || rightGenderStr === 'ស' || rightGenderStr.toLowerCase() === 'f') ? 'ស' : 'ប';
        
        rightHtml = `
            <td>${i + 1 + halfLength}</td>
            <td style="text-align: left;">${rightStudent.name ? rightStudent.name.split(' ')[0] : ''}</td>
            <td style="text-align: left;">${rightStudent.name ? rightStudent.name.split(' ').slice(1).join(' ') : ''}</td>
            <td>${gender}</td>
            <td>${avgStr}</td>
            <td>${rankStr}</td>
            <td>${gradeStr}</td>
        `;
    } else {
        rightHtml = `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
    }

    row.innerHTML = leftHtml + rightHtml;
    tableBody.appendChild(row);
}

// Helper to check if female
const isFemale = (gender) => {
    const g = (gender || '').trim();
    return g === 'ស្រី' || g === 'ស' || g.toLowerCase() === 'f';
};

// --- CALCULATE STATISTICS ---
const totalStudents = processedStudents.length;
const totalFemale = processedStudents.filter(s => isFemale(s.gender)).length;

const passedStudents = processedStudents.filter(s => s.average >= 5.0);
const passedFemale = passedStudents.filter(s => isFemale(s.gender)).length;

const failedStudents = processedStudents.filter(s => s.hasGrade && s.average < 5.0);
const failedFemale = failedStudents.filter(s => isFemale(s.gender)).length;

const dropoutStudents = processedStudents.filter(s => !s.hasGrade);
const dropoutFemale = dropoutStudents.filter(s => isFemale(s.gender)).length;

// Helper to calc percentage
function calcPct(part, whole) {
    if (whole === 0) return "0.00";
    return ((part / whole) * 100).toFixed(2);
}

// Update DOM for Statistics
const ls = `<span style="display:inline-block; width:125px; white-space:nowrap;">`;
const rs = `</span>`;

document.getElementById('stat-total').innerHTML = `${ls}សិស្សដើមឆ្នាំសរុប${rs} = ${totalStudents} នាក់`;
document.getElementById('stat-total-f').textContent = `/ស្រី = ${totalFemale} នាក់`;

document.getElementById('stat-passed').innerHTML = `${ls}សិស្សជាប់មធ្យមភាគ${rs} = ${passedStudents.length} នាក់`;
document.getElementById('stat-passed-pct').textContent = `= ${calcPct(passedStudents.length, totalStudents)}%`;
document.getElementById('stat-passed-f').textContent = `/ស្រី = ${passedFemale} នាក់`;
document.getElementById('stat-passed-f-pct').textContent = `= ${calcPct(passedFemale, totalFemale)}%`;

document.getElementById('stat-failed').innerHTML = `${ls}សិស្សធ្លាក់សរុប${rs} = ${failedStudents.length} នាក់`;
document.getElementById('stat-failed-pct').textContent = `= ${calcPct(failedStudents.length, totalStudents)}%`;
document.getElementById('stat-failed-f').textContent = `/ស្រី = ${failedFemale} នាក់`;
document.getElementById('stat-failed-f-pct').textContent = `= ${calcPct(failedFemale, totalFemale)}%`;

document.getElementById('stat-dropout').innerHTML = `${ls}សិស្សបោះបង់សរុប${rs} = ${dropoutStudents.length} នាក់`;
document.getElementById('stat-dropout-pct').textContent = `= ${calcPct(dropoutStudents.length, totalStudents)}%`;
document.getElementById('stat-dropout-f').textContent = `/ស្រី = ${dropoutFemale} នាក់`;
document.getElementById('stat-dropout-f-pct').textContent = `= ${calcPct(dropoutFemale, totalFemale)}%`;

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
    document.getElementById('lunar-date').textContent = lunarText;
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
    document.getElementById('solar-date').textContent = formatted;
    
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
    if (picker.value) {
        updateSolarDate(picker.value);
    }
}

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
