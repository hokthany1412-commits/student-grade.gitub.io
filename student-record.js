document.addEventListener('DOMContentLoaded', () => {
    loadClassInfo();
    loadStudentSelector();
    
    // Set default month to current month based on query param or default to មេសា
    const urlParams = new URLSearchParams(window.location.search);
    const m = urlParams.get('month');
    if (m) {
        const ms = document.getElementById('month-selector');
        if (ms) ms.value = m;
    }
});

window.updatePrintSide = function(skipDoubleRender = false) {
    const side = document.getElementById('print-side-selector').value;
    const leftPane = document.getElementById('left-pane');
    const rightPane = document.getElementById('right-pane');
    
    if (!leftPane || !rightPane) return;
    
    if (window.originalLeftPaneContent && side !== 'double-grades') {
        leftPane.innerHTML = window.originalLeftPaneContent;
        window.originalLeftPaneContent = null;
    }
    
    const label1 = document.getElementById('month-label-1');
    const selector2 = document.getElementById('month-selector-2');
    const label2 = document.getElementById('month-label-2');
    const dateBtn2 = document.getElementById('date-btn-2');

    if (side === 'double-grades') {
        if (label1) label1.innerText = 'ខែ (ឆ្វេង)៖';
        if (selector2) selector2.style.display = 'inline-block';
        if (label2) label2.style.display = 'inline-block';
        if (dateBtn2) dateBtn2.style.display = 'inline-block';
    } else {
        if (label1) label1.innerText = 'ជ្រើសរើសខែ៖';
        if (selector2) selector2.style.display = 'none';
        if (label2) label2.style.display = 'none';
        if (dateBtn2) dateBtn2.style.display = 'none';
    }

    if (side === 'both') {
        leftPane.style.visibility = 'visible';
        rightPane.style.visibility = 'visible';
    } else if (side === 'left') {
        leftPane.style.visibility = 'visible';
        rightPane.style.visibility = 'hidden';
    } else if (side === 'right') {
        leftPane.style.visibility = 'hidden';
    } else if (side === 'double-grades' && !skipDoubleRender) {
        const month1 = document.getElementById('month-selector').value;
        const month2 = document.getElementById('month-selector-2').value;
        
        if (!window.originalLeftPaneContent) {
            window.originalLeftPaneContent = leftPane.innerHTML;
        } else {
            // Restore left pane to original profile to prevent duplicate IDs before rendering
            leftPane.innerHTML = window.originalLeftPaneContent;
        }
        
        window.isDoubleRendering = true;
        
        // Render month 1
        document.getElementById('month-selector').value = month1;
        window.renderRecordBook(true);
        const leftGradesHTML = rightPane.innerHTML;
        
        // Render month 2
        document.getElementById('month-selector').value = month2;
        window.renderRecordBook(true);
        
        // Apply left month HTML to left pane
        leftPane.innerHTML = leftGradesHTML;
        
        // Reset the primary selector purely for UI
        document.getElementById('month-selector').value = month1;
        
        leftPane.style.visibility = 'visible';
        rightPane.style.visibility = 'visible';
        
        window.isDoubleRendering = false;
    }
};

// Load Class Info
function loadClassInfo() {
    const classInfo = JSON.parse(localStorage.getItem(window.classManager.getKey('classInfo'))) || {};
    let classNameStr = classInfo.className || '';
    
    // Fallback to teacher's class if Settings class is empty, and populate teacher signature
    const teachers = JSON.parse(localStorage.getItem(window.classManager.getKey('teacherProfiles'))) || [];
    if (teachers.length > 0) {
        if (!classNameStr && teachers[0].className) {
            classNameStr = teachers[0].className;
        }
        document.getElementById('sig-teacher').textContent = teachers[0].name;
    }
    
    if (classNameStr) {
        document.getElementById('st-class').textContent = classNameStr;
    }
    
    const schoolRecords = JSON.parse(localStorage.getItem(window.classManager.getKey('schoolRecords'))) || [];
    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        if (latestSchool.schoolName) {
            document.getElementById('st-school').textContent = latestSchool.schoolName;
            document.getElementById('sig-location').textContent = latestSchool.schoolName.trim();
        }
        if (latestSchool.schoolCluster) {
            document.getElementById('st-cluster').textContent = latestSchool.schoolCluster;
        }
    }
}

// Load Students into selector
function loadStudentSelector() {
    const students = JSON.parse(localStorage.getItem(window.classManager.getKey('studentProfilesData'))) || [];
    const selector = document.getElementById('student-selector');
    
    // Sort students by ID or Name safely
    students.sort((a, b) => {
        if (!a) return 1;
        if (!b) return -1;
        let aId = a.id || '';
        let bId = b.id || '';
        let aNum = parseInt(aId);
        let bNum = parseInt(bId);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        let aName = a.name || '';
        let bName = b.name || '';
        return aName.localeCompare(bName, 'km');
    });

    students.forEach(student => {
        if (!student) return;
        const opt = document.createElement('option');
        opt.value = student.id; // Unique identifier
        opt.textContent = `${student.id || '-'} - ${student.name || '-'} (${student.gender || '-'}) `;
        selector.appendChild(opt);
    });
}

function formatKhmerNumber(num) {
    if (num === null || num === undefined || num === '') return '';
    const khmerNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(d => khmerNums[d] || d).join('');
}

function getGradeLetter(avg) {
    if (avg >= 9.0) return 'A';
    if (avg >= 8.0) return 'B';
    if (avg >= 7.0) return 'C';
    if (avg >= 6.0) return 'D';
    if (avg >= 5.0) return 'E';
    if (avg > 0) return 'F';
    return '';
}

function getTickColumn(score) {
    if (score === null || score === undefined || score === '' || isNaN(score)) return -1;
    const val = parseFloat(score);
    if (val >= 8.0) return 0; // ល្អ
    if (val >= 6.5) return 1; // ល្អបង្គួរ
    if (val >= 5.0) return 2; // មធ្យម
    return 3; // ខ្សោយ
}

// Main render function when student/month is selected
window.renderRecordBook = function(skipPrintSideUpdate = false) {
    const leftPane = document.getElementById('left-pane');
    
    if (leftPane && window.originalLeftPaneContent && !window.isDoubleRendering) {
        leftPane.innerHTML = window.originalLeftPaneContent;
        window.originalLeftPaneContent = null;
    }

    const studentId = document.getElementById('student-selector').value;
    const month = document.getElementById('month-selector').value;
    const contentBox = document.getElementById('record-book-content');
    
    if (!studentId || !month) {
        contentBox.style.display = 'none';
        return;
    }
    
    contentBox.style.display = 'grid'; // Grid for A4 Landscape

    // Render left pane
    const allStudents = JSON.parse(localStorage.getItem(window.classManager.getKey('studentProfilesData'))) || [];
    const studentInfo = allStudents.find(s => s.id === studentId);

    if (studentInfo) {
        if (studentInfo.id) {
            document.getElementById('st-id-container').style.display = 'inline';
            document.getElementById('st-id').textContent = formatKhmerNumber(studentInfo.id);
        } else {
            document.getElementById('st-id-container').style.display = 'none';
            document.getElementById('st-id').textContent = '';
        }
        document.getElementById('st-name').textContent = studentInfo.name || '';
        document.getElementById('st-gender').textContent = studentInfo.gender || '';
        document.getElementById('st-dob').textContent = formatKhmerNumber(studentInfo.dob) || '';
        
        const fatherEl = document.getElementById('st-father');
        if (fatherEl) fatherEl.textContent = studentInfo.fatherName || '';
        const fatherJobEl = document.getElementById('st-father-job');
        if (fatherJobEl) fatherJobEl.textContent = studentInfo.fatherJob || '';
        
        const motherEl = document.getElementById('st-mother');
        if (motherEl) motherEl.textContent = studentInfo.motherName || '';
        const motherJobEl = document.getElementById('st-mother-job');
        if (motherJobEl) motherJobEl.textContent = studentInfo.motherJob || '';
        
        const guardianEl = document.getElementById('st-guardian');
        if (guardianEl) guardianEl.textContent = studentInfo.guardianName || '';
        const guardianJobEl = document.getElementById('st-guardian-job');
        if (guardianJobEl) guardianJobEl.textContent = studentInfo.guardianJob || '';
        
        const pobVillageEl = document.getElementById('st-pob-village');
        if (pobVillageEl) pobVillageEl.textContent = studentInfo.pobVillage || '';
        const pobCommuneEl = document.getElementById('st-pob-commune');
        if (pobCommuneEl) pobCommuneEl.textContent = studentInfo.pobCommune || '';
        
        const pobDistrictEl = document.getElementById('st-pob-district');
        if (pobDistrictEl) pobDistrictEl.textContent = studentInfo.pobDistrict || '';
        const pobProvinceEl = document.getElementById('st-pob-province');
        // Fallback to old 'pob' for legacy data compatibility
        if (pobProvinceEl) pobProvinceEl.textContent = studentInfo.pobProvince || studentInfo.pob || '';
        
        const currHouseEl = document.getElementById('st-curr-house');
        if (currHouseEl) currHouseEl.textContent = studentInfo.currHouse || '';
        const currVillageEl = document.getElementById('st-curr-village');
        if (currVillageEl) currVillageEl.textContent = studentInfo.currVillage || '';
        const currCommuneEl = document.getElementById('st-curr-commune');
        if (currCommuneEl) currCommuneEl.textContent = studentInfo.currCommune || '';
        const currDistrictEl = document.getElementById('st-curr-district');
        if (currDistrictEl) currDistrictEl.textContent = studentInfo.currDistrict || '';
        const currProvinceEl = document.getElementById('st-curr-province');
        if (currProvinceEl) currProvinceEl.textContent = studentInfo.currProvince || '';
    }

    const rightPane = document.getElementById('right-pane');
    
    document.getElementById('display-month').textContent = month;

    const customDateRaw = localStorage.getItem(window.classManager.getKey(`recordBook_datePicker_${month}`));
    const sigDateNode = rightPane.querySelector('#sig-date-full');
    if (sigDateNode) {
        if (customDateRaw) {
            sigDateNode.textContent = formatKhmerDateText(customDateRaw);
        } else {
            sigDateNode.innerHTML = `ថ្ងៃទី.......ខែ ${month} ឆ្នាំ២០២...`;
        }
    }

    const storageKey = `studentGrades_${month}`;
    const savedGrades = JSON.parse(localStorage.getItem(window.classManager.getKey(storageKey))) || [];
    
    const khmerMonths = ["", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const monthNum = khmerMonths.indexOf(month);
    let yearForAttendance = new Date().getFullYear();
    if (customDateRaw) {
        yearForAttendance = parseInt(customDateRaw.split('-')[0], 10) || yearForAttendance;
    }
    
    // Fallback logic to find attendance data even if saved without class scoping or in an adjacent year
    const getAttendanceData = () => {
        const tryKeys = (y) => {
            const scopedKey = window.classManager.getKey(`attendance_${y}_${monthNum}`);
            const legacyKey = `attendance_${y}_${monthNum}`;
            
            let scopedData = JSON.parse(localStorage.getItem(scopedKey));
            let legacyData = JSON.parse(localStorage.getItem(legacyKey));
            
            // Check if any student actually has marked absences (not just an empty object)
            const hasStudentData = (d) => {
                if (!d) return false;
                return Object.keys(d).some(k => k !== 'holidays' && Object.keys(d[k] || {}).length > 0);
            };
            
            if (hasStudentData(scopedData)) return scopedData;
            if (hasStudentData(legacyData)) return legacyData;
            
            if (scopedData && Object.keys(scopedData).length > 0) return scopedData;
            if (legacyData && Object.keys(legacyData).length > 0) return legacyData;
            
            return null;
        };
        
        let d = tryKeys(yearForAttendance);
        if (d) return d;
        d = tryKeys(yearForAttendance - 1);
        if (d) return d;
        d = tryKeys(yearForAttendance + 1);
        if (d) return d;
        return {};
    };
    
    const attendanceData = getAttendanceData();

    // Rank calculation
    let processedStudents = allStudents.map(s => {
        const gRecord = savedGrades.find(g => g.id === s.id);
        const sAttendance = attendanceData[s.id] || {};
        let absP = 0;
        let absA = 0;
        for (let day in sAttendance) {
            if (day === 'holidays') continue;
            const status = sAttendance[day];
            if (status === 'ច' || status === 'P' || status === 'p' || status === 'C' || status === 'c' || status === 'ច្បាប់') absP++;
            else if (status === 'អ' || status === 'A' || status === 'a' || status === 'ឥតច្បាប់') absA++;
        }
        
        return {
            id: s.id,
            average: gRecord && gRecord.average > 0 ? gRecord.average : 0,
            grades: gRecord ? gRecord.grades : {},
            abs_p: absP,
            abs_a: absA
        };
    }).filter(s => s.average > 0);
    
    processedStudents.sort((a, b) => b.average - a.average);
    let rankCounter = 1;
    processedStudents.forEach((s, idx) => {
        if (idx > 0 && s.average < processedStudents[idx - 1].average) {
            rankCounter = idx + 1;
        }
        s.rank = rankCounter;
    });

    const studentRecord = processedStudents.find(s => s.id === studentId);
    
    // Default empty rows
    const subjectsList = [
        { label: 'រៀនអាន', map: 'kh_3', group: 'kh' },
        { label: 'តែងសេចក្តី', map: 'kh_4', group: 'kh' },
        { label: 'សរសេរតាមអាន', map: 'kh_4', group: 'kh' },
        { label: 'មេសូត្រ', map: 'kh_1', group: 'kh' },
        { label: 'អក្ខរាវិរុទ្ធ', map: 'kh_4', group: 'kh' },
        { label: 'គណិតវិទ្យា', map: 'ma', group: 'ma' },
        { label: 'វិទ្យាសាស្ត្រ', map: 'sc', group: 'sc' },
        { label: 'ប្រវត្តិវិទ្យា', map: 'so_3' },
        { label: 'ភូមិវិទ្យា', map: 'so_2' },
        { label: 'សីលធម៌-ពលរដ្ឋវិជ្ជា', map: 'so_1' },
        { label: 'គំនូរ', map: 'ls_1' },
        { label: 'អង់គ្លេស', map: 'en_1' },
        { label: 'ហត្ថកម្ម', map: 'so_4' },
        { label: 'អប់រំកាយ-កីឡា', map: 'sp_1' },
        { label: 'សិល្បៈទស្សនីយភាព', map: 'sp_2' },
        { label: 'សុខភាព-អនាម័យ', map: 'so_4' }
    ];

    const tbody = document.getElementById('subjects-tbody');
    tbody.innerHTML = '';

    const grades = studentRecord ? studentRecord.grades : {};

    // Helper to get score based on mapping
    const getScore = (subj) => {
        if (subj.group === 'kh') {
            const ks = ['kh_1', 'kh_2', 'kh_3', 'kh_4'].map(k => parseFloat(grades[k])).filter(n => !isNaN(n));
            return ks.length ? ks.reduce((a,b)=>a+b,0)/ks.length : null;
        }
        if (subj.group === 'ma') {
            const ms = ['ma_1', 'ma_2', 'ma_3', 'ma_4', 'ma_5'].map(k => parseFloat(grades[k])).filter(n => !isNaN(n));
            return ms.length ? ms.reduce((a,b)=>a+b,0)/ms.length : null;
        }
        if (subj.group === 'sc') {
            const ss = ['sc_1', 'sc_2', 'sc_3', 'sc_4'].map(k => parseFloat(grades[k])).filter(n => !isNaN(n));
            return ss.length ? ss.reduce((a,b)=>a+b,0)/ss.length : null;
        }
        if (grades[subj.map] !== undefined && grades[subj.map] !== '') {
            return parseFloat(grades[subj.map]);
        }
        return null;
    };

    subjectsList.forEach(subj => {
        const score = getScore(subj);
        const tickCol = getTickColumn(score);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="subject-col">${subj.label}</td>
            <td class="tick">${tickCol === 0 ? '✓' : ''}</td>
            <td class="tick">${tickCol === 1 ? '✓' : ''}</td>
            <td class="tick">${tickCol === 2 ? '✓' : ''}</td>
            <td class="tick">${tickCol === 3 ? '✓' : ''}</td>
            <td></td>
        `;
        tbody.appendChild(tr);
    });

    let currentStudentAbsP = 0;
    let currentStudentAbsA = 0;
    const currentStudentAttendance = attendanceData[studentId] || {};
    for (let day in currentStudentAttendance) {
        if (day === 'holidays') continue;
        let status = currentStudentAttendance[day];
        if (typeof status === 'string') status = status.trim().toUpperCase();
        
        if (status === 'ច' || status === 'P' || status === 'C' || status === 'ច្បាប់') currentStudentAbsP++;
        else if (status === 'អ' || status === 'A' || status === 'ឥតច្បាប់') currentStudentAbsA++;
    }

    if (studentRecord) {
        const avgNode = rightPane.querySelector('#stat-avg');
        if (avgNode) avgNode.textContent = Number(Math.round(studentRecord.average + 'e2') + 'e-2').toFixed(2);
        
        const rankNode = rightPane.querySelector('#stat-rank');
        if (rankNode) {
            const totalStudents = allStudents.length;
            rankNode.textContent = `${studentRecord.rank}/${totalStudents}`;
        }
        
        const gradeNode = rightPane.querySelector('#stat-grade');
        if (gradeNode) gradeNode.textContent = getGradeLetter(studentRecord.average);
    } else {
        const avgNode = rightPane.querySelector('#stat-avg');
        if (avgNode) avgNode.textContent = '...';
        
        const rankNode = rightPane.querySelector('#stat-rank');
        if (rankNode) rankNode.textContent = '...';
        
        const gradeNode = rightPane.querySelector('#stat-grade');
        if (gradeNode) gradeNode.textContent = '...';
    }
    
    const absPNode = rightPane.querySelector('#stat-abs-p');
    if (absPNode) absPNode.textContent = currentStudentAbsP;
    
    const absANode = rightPane.querySelector('#stat-abs-a');
    if (absANode) absANode.textContent = currentStudentAbsA;

    if (window.updatePrintSide && !skipPrintSideUpdate) {
        window.updatePrintSide();
    }
}

// Helper to format YYYY-MM-DD to Khmer Date text
function formatKhmerDateText(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parts[2];
    const khmerMonths = ["", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    return `ថ្ងៃទី${formatKhmerNumber(parseInt(day, 10))} ខែ${khmerMonths[month]} ឆ្នាំ${formatKhmerNumber(year)}`;
}

// Date Settings Logic
let currentSettingPane = 1;
function openDateSettings(paneIndex = 1) {
    currentSettingPane = paneIndex;
    const selectorId = paneIndex === 1 ? 'month-selector' : 'month-selector-2';
    const month = document.getElementById(selectorId).value;
    if (!month) {
        alert('សូមជ្រើសរើសខែជាមុនសិន!');
        return;
    }
    document.getElementById('modal-month-name').textContent = month;
    const savedDate = localStorage.getItem(window.classManager.getKey(`recordBook_datePicker_${month}`)) || '';
    document.getElementById('custom-date-picker').value = savedDate;
    document.getElementById('date-modal').style.display = 'flex';
}

function closeDateSettings() {
    document.getElementById('date-modal').style.display = 'none';
}

function saveDateSettings() {
    const selectorId = currentSettingPane === 1 ? 'month-selector' : 'month-selector-2';
    const month = document.getElementById(selectorId).value;
    const dateStr = document.getElementById('custom-date-picker').value;
    if (dateStr) {
        localStorage.setItem(window.classManager.getKey(`recordBook_datePicker_${month}`), dateStr);
    } else {
        localStorage.removeItem(window.classManager.getKey(`recordBook_datePicker_${month}`));
    }
    closeDateSettings();
    renderRecordBook();
}
