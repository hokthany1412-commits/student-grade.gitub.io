// grade6-exam-list.js - Handles Grade 6 Exam Candidates List to Grade 7

// State variables
let studentsData = [];
let currentNumeralMode = 'arabic'; // 'arabic' (1, 2, 3) as per user's template, toggleable to 'khmer'
let docSettings = {
    officeName: 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកសន្ទុក',
    schoolName: 'សាលាបឋមសិក្សា ផ្លុង',
    shortSchoolName: 'បឋម ផ្លុង',
    targetSchool: 'អនុ វិទ្យាល័យ ទីពោ',
    academicYear: '២០២៥-២០២៦',
    provinceName: 'កំពង់ធំ',
    districtName: 'សន្ទុក',
    examDate: new Date().toISOString().split('T')[0],
    lunarDateText: ''
};

// Helper: Get active class ID safely
function getActiveClassId() {
    if (window.classManager && typeof window.classManager.getCurrentClassId === 'function') {
        return window.classManager.getCurrentClassId();
    }
    return localStorage.getItem('activeClassId') || 'class_g6_k';
}

// Helper: Get scoped localStorage key safely
function getScopedKey(baseKey) {
    if (window.classManager && typeof window.classManager.getKey === 'function') {
        return window.classManager.getKey(baseKey);
    }
    if (typeof window.getKey === 'function') {
        return window.getKey(baseKey);
    }
    const cid = getActiveClassId();
    return cid === 'default' ? baseKey : `${baseKey}_${cid}`;
}

// Helper: Convert Arabic number to Khmer number
function toKhmerNum(num) {
    if (num === null || num === undefined || num === '') return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, d => khmerDigits[parseInt(d)]);
}

// Helper: Convert Khmer number to Arabic number
function toArabicNum(num) {
    if (!num) return '';
    const map = { '០':0, '១':1, '២':2, '៣':3, '៤':4, '៥':5, '៦':6, '៧':7, '៨':8, '៩':9 };
    return num.toString().replace(/[០-៩]/g, d => map[d]);
}

// Format number display based on toggle mode
function formatNumDisplay(num) {
    if (num === null || num === undefined || num === '') return '';
    if (currentNumeralMode === 'khmer') {
        return toKhmerNum(num);
    }
    return toArabicNum(num);
}

// Helper: Format Date to DD-MM-YYYY
function formatDateDisplay(dStr) {
    if (!dStr) return '';
    const str = dStr.toString().trim();
    if (!str) return '';

    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
            }
            return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
        }
    }
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
            }
            return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
        }
    }
    return str;
}

// Helper: Format Khmer Month Name
function getKhmerMonthName(monthIndex) {
    const months = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    return months[monthIndex] || '';
}

// Helper: Format Full Lunar Date string from Date object
function calculateLunarDateString(dateObj) {
    if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
        try {
            const lunar = KhmerCalendar.toKhmerLunarDate(dateObj);
            const dayName = lunar.dayOfWeek || '';
            const moonCount = lunar.moonCount ? toKhmerNum(lunar.moonCount) : '';
            const moonStatus = lunar.moonStatus || '';
            const khmerMonth = lunar.khmerMonth || '';
            const animalYear = lunar.animalYear || '';
            const sak = lunar.sak || '';
            const beYear = lunar.beYear ? toKhmerNum(lunar.beYear) : '';

            return `ថ្ងៃ ${dayName} ${moonCount}${moonStatus} ខែ ${khmerMonth} ឆ្នាំ ${animalYear} ${sak} ព.ស ${beYear}`;
        } catch (e) {
            console.warn('Khmer Calendar calculation error:', e);
        }
    }
    return 'ថ្ងៃ ..................... ខែ ............... ឆ្នាំ ............. ព.ស ២៥......';
}

// Helper: Format Full Solar Date string from Date object
function calculateSolarDateString(dateObj) {
    const day = dateObj.getDate();
    const month = getKhmerMonthName(dateObj.getMonth());
    const year = dateObj.getFullYear();

    if (currentNumeralMode === 'khmer') {
        return `ត្រូវនឹងថ្ងៃទី ${toKhmerNum(day.toString().padStart(2, '0'))} ខែ ${month} ឆ្នាំ ${toKhmerNum(year)}`;
    }
    return `ត្រូវនឹងថ្ងៃទី ${day.toString().padStart(2, '0')} ខែ ${month} ឆ្នាំ ${year}`;
}

// Update settings lunar date preview
function updateLunarPreviewFromDate(dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const lunarStr = calculateLunarDateString(dateObj);
    const lunarInput = document.getElementById('cfg-lunar-text');
    if (lunarInput) lunarInput.value = lunarStr;
}

// Load Document Settings from LocalStorage
function loadDocSettings() {
    const saved = localStorage.getItem('grade6_exam_doc_settings');
    if (saved) {
        try {
            docSettings = Object.assign(docSettings, JSON.parse(saved));
        } catch (e) {
            console.error('Error parsing docSettings:', e);
        }
    }

    if (docSettings.schoolName === 'សាលាបឋមសិក្សា ផ្លុង') {
        const latestSchool = JSON.parse(localStorage.getItem('attendance_records') || '{}');
        if (latestSchool.schoolName) {
            let clean = latestSchool.schoolName.trim().replace(/^សាលាបឋមសិក្សា\s*/, '');
            docSettings.schoolName = `សាលាបឋមសិក្សា ${clean}`;
            docSettings.shortSchoolName = `បឋម ${clean}`;
        }
    }

    if (!docSettings.lunarDateText && docSettings.examDate) {
        const parts = docSettings.examDate.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        docSettings.lunarDateText = calculateLunarDateString(dateObj);
    }
}

// Save Document Settings
function saveSettings(e) {
    if (e) e.preventDefault();
    docSettings.officeName = document.getElementById('cfg-office-name').value.trim();
    docSettings.schoolName = document.getElementById('cfg-school-name').value.trim();
    docSettings.shortSchoolName = document.getElementById('cfg-short-school-name').value.trim();
    docSettings.targetSchool = document.getElementById('cfg-target-school').value.trim();
    docSettings.academicYear = document.getElementById('cfg-academic-year').value.trim();
    docSettings.provinceName = document.getElementById('cfg-province-name').value.trim();
    docSettings.districtName = document.getElementById('cfg-district-name').value.trim();
    docSettings.examDate = document.getElementById('cfg-exam-date').value;
    docSettings.lunarDateText = document.getElementById('cfg-lunar-text').value.trim();

    localStorage.setItem('grade6_exam_doc_settings', JSON.stringify(docSettings));
    closeSettingsModal();
    renderAllSheets();
}

function openSettingsModal() {
    document.getElementById('cfg-office-name').value = docSettings.officeName;
    document.getElementById('cfg-school-name').value = docSettings.schoolName;
    document.getElementById('cfg-short-school-name').value = docSettings.shortSchoolName;
    document.getElementById('cfg-target-school').value = docSettings.targetSchool;
    document.getElementById('cfg-academic-year').value = docSettings.academicYear;
    document.getElementById('cfg-province-name').value = docSettings.provinceName;
    document.getElementById('cfg-district-name').value = docSettings.districtName;
    document.getElementById('cfg-exam-date').value = docSettings.examDate;
    document.getElementById('cfg-lunar-text').value = docSettings.lunarDateText;

    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function resetSettingsToDefault() {
    if (confirm('តើអ្នកពិតជាចង់កំណត់ព័ត៌មានដើមឡើងវិញមែនទេ?')) {
        localStorage.removeItem('grade6_exam_doc_settings');
        docSettings = {
            officeName: 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកសន្ទុក',
            schoolName: 'សាលាបឋមសិក្សា ផ្លុង',
            shortSchoolName: 'បឋម ផ្លុង',
            targetSchool: 'អនុ វិទ្យាល័យ ទីពោ',
            academicYear: '២០២៥-២០២៦',
            provinceName: 'កំពង់ធំ',
            districtName: 'សន្ទុក',
            examDate: new Date().toISOString().split('T')[0],
            lunarDateText: ''
        };
        loadDocSettings();
        openSettingsModal();
        renderAllSheets();
    }
}

// Toggle Khmer / Arabic Numerals
function toggleNumerals() {
    currentNumeralMode = currentNumeralMode === 'khmer' ? 'arabic' : 'khmer';
    const textEl = document.getElementById('numeral-mode-text');
    if (textEl) {
        textEl.textContent = currentNumeralMode === 'khmer' ? 'លេខខ្មែរ (១, ២, ៣)' : 'លេខអារ៉ាប់ (1, 2, 3)';
    }
    renderAllSheets();
}

// Exact Official Reference Students Data from User's template
const EXACT_OFFICIAL_STUDENTS = [
    { id: '1312', name: 'កែម សុផាន់ណា', gender: 'ស', dob: '10-03-2016', average: '8.10', school: 'បឋម ផ្លុង', other: 'ក្រ២/០០៦៧/២០២៣' },
    { id: '1314', name: 'កែ សុគាម', gender: 'ប', dob: '10-03-2014', average: '5.23', school: 'បឋម ផ្លុង', other: 'ក្រ២/០២៥៧/២០២៣' },
    { id: '1315', name: 'ខន ប៊ុនថង', gender: 'ប', dob: '16-04-2014', average: '6.54', school: 'បឋម ផ្លុង', other: '០៤៣១/២០២៣' },
    { id: '1316', name: 'ខែត លីនដា', gender: 'ស', dob: '14-12-2015', average: '6.22', school: 'បឋម ផ្លុង', other: '' },
    { id: '1317', name: 'ឃួន ស្រីយួច', gender: 'ស', dob: '18-07-2013', average: '5.65', school: 'បឋម ផ្លុង', other: '០៧១៥/២០២៤' },
    { id: '1318', name: 'ជឿន គីម', gender: 'ស', dob: '14-06-2014', average: '8.09', school: 'បឋម ផ្លុង', other: '០៥២០/២០២២' },
    { id: '1319', name: 'ចំណើន បញ្ញា', gender: 'ស', dob: '09-02-2016', average: '6.68', school: 'បឋម ផ្លុង', other: '' },
    { id: '1320', name: 'ចំណើន សុធារិទ្ធិ', gender: 'ប', dob: '09-12-2016', average: '5.52', school: 'បឋម ផ្លុង', other: 'ក្រ២/០៧២២/២០២៤' },
    { id: '1321', name: 'ផៃនី ធីតា', gender: 'ស', dob: '11-02-2016', average: '6.38', school: 'បឋម ផ្លុង', other: '០៤៥៦/២០២៣' },
    { id: '1322', name: 'ដំ ស្រីនា', gender: 'ស', dob: '12-07-2015', average: '6.21', school: 'បឋម ផ្លុង', other: '០៤៥៨/២០២៣' },
    { id: '1323', name: 'គឿម ប៊ុនតី', gender: 'ប', dob: '21-11-2012', average: '6.17', school: 'បឋម ផ្លុង', other: '' },
    { id: '1324', name: 'នឹម លីម៉េង', gender: 'ប', dob: '10-02-2015', average: '5.64', school: 'បឋម ផ្លុង', other: '០៥៩៨/២០២៣' },
    { id: '1325', name: 'ប៊ុន បូណា', gender: 'ប', dob: '21-06-2014', average: '6.69', school: 'បឋម ផ្លុង', other: '០៧៥៥/២០២៥' },
    { id: '1326', name: 'ប៊ុនធឿន ម៉ីម៉ី', gender: 'ស', dob: '13-03-2013', average: '6.39', school: 'បឋម ផ្លុង', other: '' },
    { id: '1327', name: 'ផាយ ស្រីតា', gender: 'ស', dob: '01-08-2012', average: '5.84', school: 'បឋម ផ្លុង', other: '' },
    { id: '1328', name: 'ជូ ចិន', gender: 'ស', dob: '29-08-2014', average: '6.40', school: 'បឋម ផ្លុង', other: '០៥២២/២០២៣' },
    { id: '1329', name: 'ពក ពេជ្រ', gender: 'ប', dob: '08-04-2009', average: '2.41', school: 'បឋម ផ្លុង', other: '' },
    { id: '1330', name: 'ព្យក សៀងហុង', gender: 'ប', dob: '27-02-2015', average: '5.60', school: 'បឋម ផ្លុង', other: '' },
    { id: '1331', name: 'ពេញ រក្សា', gender: 'ស', dob: '03-05-2015', average: '6.80', school: 'បឋម ផ្លុង', other: '០៧៣៩/២០២៤' },
    { id: '1332', name: 'កាន់ សំភ័ណ្ឌ', gender: 'ប', dob: '02-11-2015', average: '6.17', school: 'បឋម ផ្លុង', other: '០៥៥២/២០២៣' },
    { id: '1333', name: 'ភាព សោភា', gender: 'ប', dob: '11-11-2015', average: '6.05', school: 'បឋម ផ្លុង', other: '' },
    { id: '1334', name: 'ភឿន សាល័យ', gender: 'ស', dob: '15-01-2013', average: '5.53', school: 'បឋម ផ្លុង', other: '' },
    { id: '1335', name: 'ម៉ុច លីហ្សា', gender: 'ស', dob: '05-03-2016', average: '6.29', school: 'បឋម ផ្លុង', other: '០៥៧៩/២០២៣' }
];

// Load Students Data
function loadStudentsData() {
    const activeClassId = getActiveClassId();
    
    // Check if custom edited data exists for this class
    const customKey = `grade6_exam_custom_${activeClassId}`;
    const savedCustom = localStorage.getItem(customKey);
    if (savedCustom) {
        try {
            const parsed = JSON.parse(savedCustom);
            if (Array.isArray(parsed) && parsed.length > 0) {
                studentsData = parsed;
                return;
            }
        } catch (e) {
            console.error('Error loading custom exam students data:', e);
        }
    }

    // Otherwise, generate from student profiles and grades
    const profKey = getScopedKey('studentProfilesData');
    let profiles = JSON.parse(localStorage.getItem(profKey)) || [];

    if (profiles.length === 0 && activeClassId !== 'class_g6_k') {
        profiles = JSON.parse(localStorage.getItem('studentProfilesData_class_g6_k')) || [];
    }
    if (profiles.length === 0) {
        profiles = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
    }

    // Load exam grades to get annual average
    const s1Key = getScopedKey('semester1ExamGrades');
    const s2Key = getScopedKey('semester2ExamGrades');
    let sem1Grades = JSON.parse(localStorage.getItem(s1Key)) || [];
    let sem2Grades = JSON.parse(localStorage.getItem(s2Key)) || [];
    if (sem1Grades.length === 0) {
        sem1Grades = JSON.parse(localStorage.getItem('semester1ExamGrades')) || [];
    }
    if (sem2Grades.length === 0) {
        sem2Grades = JSON.parse(localStorage.getItem('semester2ExamGrades')) || [];
    }

    if (profiles.length > 0) {
        studentsData = profiles.map((p, idx) => {
            const sId = p.id || `STU_${idx + 1}`;
            const name = p.name || p.studentName || `${p.lastName || ''} ${p.firstName || ''}`.trim() || 'គ្មានឈ្មោះ';
            
            let gender = 'ប';
            if (p.gender === 'ស' || p.gender === 'ស្រី' || (p.gender || '').toLowerCase() === 'f') {
                gender = 'ស';
            }

            const dob = formatDateDisplay(p.dob || '');

            // Calculate Average Grade
            const s1 = (Array.isArray(sem1Grades) ? sem1Grades : []).find(s => s.id === sId);
            const s2 = (Array.isArray(sem2Grades) ? sem2Grades : []).find(s => s.id === sId);
            let s1Avg = s1 && s1.sem_avg !== undefined && s1.sem_avg !== null ? parseFloat(s1.sem_avg) : null;
            let s2Avg = s2 && s2.sem_avg !== undefined && s2.sem_avg !== null ? parseFloat(s2.sem_avg) : null;
            
            let avgVal = null;
            if (s1Avg !== null && s2Avg !== null) {
                avgVal = ((s1Avg + s2Avg) / 2).toFixed(2);
            } else if (s1Avg !== null) {
                avgVal = s1Avg.toFixed(2);
            } else if (s2Avg !== null) {
                avgVal = s2Avg.toFixed(2);
            } else if (p.average || p.annualAvg) {
                avgVal = parseFloat(p.average || p.annualAvg).toFixed(2);
            }

            // Match other / poverty card from exact official list if available
            let other = '';
            if (p.equityCardNo && p.equityCardNo !== 'គ្មាន' && p.equityCardNo !== '-') {
                other = p.equityCardNo;
            } else if (p.equityCard && p.equityCard !== 'គ្មាន' && p.equityCard !== '-') {
                other = p.equityCard;
            } else if (p.orphanStatus && p.orphanStatus !== 'មិនកំព្រា' && p.orphanStatus !== 'គ្មាន') {
                other = p.orphanStatus;
            } else if (p.remarks || p.note || p.other) {
                other = p.remarks || p.note || p.other;
            } else if (idx < EXACT_OFFICIAL_STUDENTS.length) {
                other = EXACT_OFFICIAL_STUDENTS[idx].other || '';
            }

            return {
                id: sId,
                name: name,
                gender: gender,
                dob: dob,
                average: avgVal !== null ? avgVal : (idx < EXACT_OFFICIAL_STUDENTS.length ? EXACT_OFFICIAL_STUDENTS[idx].average : '5.00'),
                school: docSettings.shortSchoolName || 'បឋម ផ្លុង',
                other: other
            };
        });
    }

    if (studentsData.length === 0) {
        studentsData = JSON.parse(JSON.stringify(EXACT_OFFICIAL_STUDENTS));
    }
}

// Save Current Custom Students Data
function saveCurrentStudentsData() {
    const activeClassId = getActiveClassId();
    const customKey = `grade6_exam_custom_${activeClassId}`;
    localStorage.setItem(customKey, JSON.stringify(studentsData));
}

// Add New Student Row
function addNewStudentRow() {
    studentsData.push({
        id: `CUSTOM_${Date.now()}`,
        name: 'សិស្សថ្មី',
        gender: 'ប',
        dob: '01-01-2014',
        average: '5.00',
        school: docSettings.shortSchoolName || 'បឋម ផ្លុង',
        other: ''
    });
    saveCurrentStudentsData();
    renderAllSheets();
}

// Delete Student Row
function deleteStudentRow(idx) {
    if (confirm(`តើអ្នកពិតជាចង់លុបសិស្សលេខរៀងទី ${idx + 1} នេះចេញពីបញ្ជីមែនទេ?`)) {
        studentsData.splice(idx, 1);
        saveCurrentStudentsData();
        renderAllSheets();
    }
}

// Reload Default Data
function reloadDefaultSampleData() {
    if (confirm('តើអ្នកចង់ទាញយកទិន្នន័យ និងលេខប័ណ្ណក្រីក្រឡើងវិញមែនទេ?')) {
        const activeClassId = getActiveClassId();
        localStorage.removeItem(`grade6_exam_custom_${activeClassId}`);
        loadStudentsData();
        renderAllSheets();
    }
}

// Update Cell Value on Inline Edit
function updateCellValue(studentIndex, field, element) {
    const val = element.innerText.trim();
    if (studentsData[studentIndex]) {
        if (field === 'average') {
            studentsData[studentIndex][field] = toArabicNum(val);
        } else {
            studentsData[studentIndex][field] = val;
        }
        saveCurrentStudentsData();
        updateHeaderAndFooterStats();
    }
}

// Update Quick Stats in Top Bar and Bottom Stop Line
function updateHeaderAndFooterStats() {
    const total = studentsData.length;
    const female = studentsData.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length;
    const male = total - female;

    const totalEl = document.getElementById('info-total-students');
    const femaleEl = document.getElementById('info-female-students');
    const maleEl = document.getElementById('info-male-students');

    if (totalEl) totalEl.textContent = `${formatNumDisplay(total)} នាក់`;
    if (femaleEl) femaleEl.textContent = `${formatNumDisplay(female)} នាក់`;
    if (maleEl) maleEl.textContent = `${formatNumDisplay(male)} នាក់`;

    const lastStudent = total > 0 ? studentsData[total - 1].name : '...................';
    const totalKhmer = toKhmerNum(total);
    const femaleKhmer = toKhmerNum(female);
    
    const stopLines = document.querySelectorAll('.summary-stop-line');
    stopLines.forEach(el => {
        el.innerHTML = `បានបញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span class="highlight-khmer">${totalKhmer}</span> ត្រង់ឈ្មោះ <span class="highlight-khmer">${lastStudent}</span> សរុប= <span class="highlight-khmer">${totalKhmer}</span> នាក់ ស្រី=<span class="highlight-khmer">${femaleKhmer}</span> នាក់`;
    });
}

// Render All Students in One Continuous Table / Sheet (No page breaks or separated splits)
function renderAllSheets() {
    const container = document.getElementById('a4-pages-container');
    if (!container) return;

    const totalStudents = studentsData.length;
    const examDateParts = (docSettings.examDate || '').split('-');
    const examDateObj = examDateParts.length === 3 
        ? new Date(parseInt(examDateParts[0]), parseInt(examDateParts[1]) - 1, parseInt(examDateParts[2]))
        : new Date();

    const lunarText = docSettings.lunarDateText || calculateLunarDateString(examDateObj);
    const solarText = calculateSolarDateString(examDateObj);

    const totalKhmer = toKhmerNum(totalStudents);
    const femaleKhmer = toKhmerNum(studentsData.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length);
    const lastStudentName = totalStudents > 0 ? studentsData[totalStudents - 1].name : '';

    let rowsHtml = '';
    studentsData.forEach((student, idx) => {
        const numDisplay = formatNumDisplay(idx + 1);
        let avgDisplay = student.average;
        if (avgDisplay) {
            avgDisplay = formatNumDisplay(avgDisplay);
        }

        rowsHtml += `
            <tr>
                <td class="cell-num">${numDisplay}</td>
                <td class="cell-name editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'name', this)" title="ចុចដើម្បីកែឈ្មោះ">${student.name}</td>
                <td class="cell-gender editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'gender', this)" title="ចុចដើម្បីកែភេទ (ប / ស)">${student.gender}</td>
                <td class="cell-dob editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'dob', this)" title="ចុចដើម្បីកែថ្ងៃខែឆ្នាំកំណើត">${student.dob}</td>
                <td class="cell-average editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'average', this)" title="ចុចដើម្បីកែពិន្ទុមធ្យមភាគ">${avgDisplay}</td>
                <td class="cell-school editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'school', this)" title="ចុចដើម្បីកែឈ្មោះសាលា">${student.school || docSettings.shortSchoolName}</td>
                <td class="cell-other editable-cell" contenteditable="true" onblur="updateCellValue(${idx}, 'other', this)" title="ចុចដើម្បីកែកំណត់សម្គាល់ / លេខប័ណ្ណក្រីក្រ">${student.other || ''}</td>
            </tr>
        `;
    });

    const fullHtml = `
        <div class="a4-sheet" id="a4-continuous-sheet">
            <div class="a4-content-top">
                
                <!-- Official Header -->
                <div class="doc-header-block">
                    <div class="kingdom-header">
                        <h2 class="kingdom-title">ព្រះរាជាណាចក្រកម្ពុជា</h2>
                        <h3 class="kingdom-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
                        <svg class="header-divider-line" viewBox="0 0 110 4" fill="none">
                            <path d="M0 2 C 25 0, 35 4, 55 2 C 75 0, 85 4, 110 2" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </div>

                    <div class="admin-org-left">
                        <div class="office-name-text">${docSettings.officeName}</div>
                        <div class="school-name-text">${docSettings.schoolName}</div>
                    </div>

                    <div class="main-exam-title-box">
                        <h1 class="main-exam-title">បញ្ជីឈ្មោះសិស្សថ្នាក់ទី ៦ ដែលត្រូវប្រឡងឡើងថ្នាក់ទី ៧</h1>
                        <div class="target-school-sub">នៅ${docSettings.targetSchool} ក្នុងឆ្នាំសិក្សា ${docSettings.academicYear}</div>
                    </div>
                </div>

                <!-- Exam Table (Continuous All Students) -->
                <div class="exam-table-wrapper">
                    <table class="exam-table">
                        <colgroup>
                            <col style="width: 5.5%;">
                            <col style="width: 22%;">
                            <col style="width: 5.5%;">
                            <col style="width: 16%;">
                            <col style="width: 11%;">
                            <col style="width: 17%;">
                            <col style="width: 23%;">
                        </colgroup>
                        <thead>
                            <tr>
                                <th>ល.រ</th>
                                <th>គោត្តនាម+នាម</th>
                                <th>ភេទ</th>
                                <th>ថ្ងៃខែឆ្នាំកំណើត</th>
                                <th>មធ្យមភាគ</th>
                                <th>មកពីសាលា</th>
                                <th>ផ្សេងៗ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer Section (Directly below table) -->
            <div class="a4-content-bottom">
                <!-- Under-Table Stop Line -->
                <div class="summary-stop-line">
                    បានបញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span class="highlight-khmer">${totalKhmer}</span> ត្រង់ឈ្មោះ <span class="highlight-khmer">${lastStudentName}</span> សរុប= <span class="highlight-khmer">${totalKhmer}</span> នាក់ ស្រី=<span class="highlight-khmer">${femaleKhmer}</span> នាក់
                </div>

                <!-- Dates Section (Right Aligned) -->
                <div class="date-section-right">
                    <div class="lunar-date-text">${lunarText}</div>
                    <div class="solar-date-text">${solarText}</div>
                </div>

                <!-- 3 Signatures Area -->
                <div class="signature-section">
                    <div class="signature-grid-3col">
                        
                        <!-- Left: Provincial Department -->
                        <div class="sign-box">
                            <div class="sign-header-seen">បានឃើញ និងឯកភាព</div>
                            <div class="sign-role-title">ប្រធានមន្ទីរអប់រំខេត្ត${docSettings.provinceName}</div>
                            <div class="sign-name-space">............................................</div>
                        </div>

                        <!-- Middle: District Office -->
                        <div class="sign-box">
                            <div class="sign-header-seen">បានឃើញ និងឯកភាព</div>
                            <div class="sign-role-title">ប្រធានការិយាល័យអប់រំស្រុក${docSettings.districtName}</div>
                            <div class="sign-name-space">............................................</div>
                        </div>

                        <!-- Right: School Principal -->
                        <div class="sign-box">
                            <div class="sign-principal-title">នាយកសាលា</div>
                            <div class="sign-name-space">............................................</div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = fullHtml;
    updateHeaderAndFooterStats();
}

// Export Table Data to Excel (.xlsx) with Full Formatting, Colors, and Clean Borders using xlsx-js-style
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('សូមរង់ចាំបណ្ណាល័យ Excel កំពុងដំណើរការ...');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = {};
    const merges = [];
    const rowHeights = [];

    // Base Styles
    const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
    };

    const headerFill = {
        patternType: 'solid',
        fgColor: { rgb: 'F2F4F7' }
    };

    const styleKingdomTitle = {
        font: { name: 'Khmer OS Muol Light', sz: 12, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleKingdomMotto = {
        font: { name: 'Khmer OS Muol Light', sz: 10.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleOffice = {
        font: { name: 'Khmer OS Muol Light', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' }
    };

    const styleSchool = {
        font: { name: 'Khmer OS Muol Light', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' }
    };

    const styleMainTitle = {
        font: { name: 'Khmer OS Muol Light', sz: 12, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSubTitle = {
        font: { name: 'Khmer OS Muol Light', sz: 10, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleTableHeader = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        fill: headerFill,
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: borderThin
    };

    const styleDataCenter = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderThin
    };

    const styleDataCenterBold = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderThin
    };

    const styleDataName = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: borderThin
    };

    const styleStopLine = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' }
    };

    const styleDate = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, color: { rgb: '000000' } },
        alignment: { horizontal: 'right', vertical: 'center' }
    };

    const styleSignSeen = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSignRole = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSignPrincipal = {
        font: { name: 'Khmer OS Muol Light', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSignDots = {
        font: { name: 'Khmer OS Battambang', sz: 9, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Helper functions to populate worksheet
    function setCell(r, c, val, style, type = 's') {
        const ref = XLSX.utils.encode_cell({ r, c });
        ws[ref] = {
            v: val !== null && val !== undefined ? val : '',
            t: type,
            s: style || {}
        };
    }

    function mergeAndSet(startR, startC, endR, endC, val, style, type = 's') {
        merges.push({ s: { r: startR, c: startC }, e: { r: endR, c: endC } });
        for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
                const cellVal = (r === startR && c === startC) ? val : '';
                setCell(r, c, cellVal, style, type);
            }
        }
    }

    let currentRow = 0;

    // Row 0: Left = Office Name, Right = Kingdom of Cambodia
    mergeAndSet(currentRow, 0, currentRow, 2, docSettings.officeName, styleOffice);
    mergeAndSet(currentRow, 3, currentRow, 6, 'ព្រះរាជាណាចក្រកម្ពុជា', styleKingdomTitle);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    // Row 1: Left = School Name, Right = Nation Religion King
    mergeAndSet(currentRow, 0, currentRow, 2, docSettings.schoolName, styleSchool);
    mergeAndSet(currentRow, 3, currentRow, 6, 'ជាតិ សាសនា ព្រះមហាក្សត្រ', styleKingdomMotto);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    // Row 2: Main Exam Title (Centered across table)
    mergeAndSet(currentRow, 0, currentRow, 6, 'បញ្ជីឈ្មោះសិស្សថ្នាក់ទី ៦ ដែលត្រូវប្រឡងឡើងថ្នាក់ទី ៧', styleMainTitle);
    rowHeights[currentRow] = { hpt: 24 };
    currentRow++;

    // Row 3: Target School & Academic Year Subtitle
    mergeAndSet(currentRow, 0, currentRow, 6, `នៅ${docSettings.targetSchool} ក្នុងឆ្នាំសិក្សា ${docSettings.academicYear}`, styleSubTitle);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    // Row 4: Table Header Row (Directly connects to title, no empty gap)
    const tableHeaders = ['ល.រ', 'គោត្តនាម+នាម', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', 'មធ្យមភាគ', 'មកពីសាលា', 'ផ្សេងៗ'];
    tableHeaders.forEach((h, colIdx) => {
        setCell(currentRow, colIdx, h, styleTableHeader);
    });
    rowHeights[currentRow] = { hpt: 26 };
    currentRow++;

    // Student Data Rows (Continuous without any gaps)
    studentsData.forEach((s, idx) => {
        const numDisplay = formatNumDisplay(idx + 1);
        let avgDisplay = s.average || '';
        if (avgDisplay) {
            avgDisplay = formatNumDisplay(avgDisplay);
        }

        setCell(currentRow, 0, numDisplay, styleDataCenterBold);
        setCell(currentRow, 1, s.name || '', styleDataName);
        setCell(currentRow, 2, s.gender || '', styleDataCenter);
        setCell(currentRow, 3, s.dob || '', styleDataCenter);
        setCell(currentRow, 4, avgDisplay, styleDataCenterBold);
        setCell(currentRow, 5, s.school || docSettings.shortSchoolName || 'បឋម ផ្លុង', styleDataCenter);
        setCell(currentRow, 6, s.other || '', styleDataCenter);

        rowHeights[currentRow] = { hpt: 22 };
        currentRow++;
    });

    const totalStudents = studentsData.length;
    const femaleStudents = studentsData.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length;
    const lastStudent = totalStudents > 0 ? studentsData[totalStudents - 1].name : '';

    const totalKhmer = toKhmerNum(totalStudents);
    const femaleKhmer = toKhmerNum(femaleStudents);

    // Stop Line Row (Immediately follows last student row)
    const stopLineText = `បានបញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី ${totalKhmer} ត្រង់ឈ្មោះ ${lastStudent} សរុប= ${totalKhmer} នាក់ ស្រី=${femaleKhmer} នាក់`;
    mergeAndSet(currentRow, 0, currentRow, 6, stopLineText, styleStopLine);
    rowHeights[currentRow] = { hpt: 22 };
    currentRow++;

    // Date Calculation
    const examDateParts = (docSettings.examDate || '').split('-');
    const examDateObj = examDateParts.length === 3 
        ? new Date(parseInt(examDateParts[0]), parseInt(examDateParts[1]) - 1, parseInt(examDateParts[2]))
        : new Date();

    const lunarText = docSettings.lunarDateText || calculateLunarDateString(examDateObj);
    const solarText = calculateSolarDateString(examDateObj);

    // Lunar Date Row (Directly connects)
    for (let c = 0; c <= 2; c++) setCell(currentRow, c, '', {});
    mergeAndSet(currentRow, 3, currentRow, 6, lunarText, styleDate);
    rowHeights[currentRow] = { hpt: 19 };
    currentRow++;

    // Solar Date Row (Directly connects)
    for (let c = 0; c <= 2; c++) setCell(currentRow, c, '', {});
    mergeAndSet(currentRow, 3, currentRow, 6, solarText, styleDate);
    rowHeights[currentRow] = { hpt: 19 };
    currentRow++;

    // Signatures Row 1: "បានឃើញ និងឯកភាព" / "នាយកសាលា"
    mergeAndSet(currentRow, 0, currentRow, 1, 'បានឃើញ និងឯកភាព', styleSignSeen);
    mergeAndSet(currentRow, 2, currentRow, 4, 'បានឃើញ និងឯកភាព', styleSignSeen);
    mergeAndSet(currentRow, 5, currentRow, 6, 'នាយកសាលា', styleSignPrincipal);
    rowHeights[currentRow] = { hpt: 19 };
    currentRow++;

    // Signatures Row 2: Role Titles
    mergeAndSet(currentRow, 0, currentRow, 1, `ប្រធានមន្ទីរអប់រំខេត្ត${docSettings.provinceName}`, styleSignRole);
    mergeAndSet(currentRow, 2, currentRow, 4, `ប្រធានការិយាល័យអប់រំស្រុក${docSettings.districtName}`, styleSignRole);
    mergeAndSet(currentRow, 5, currentRow, 6, '', styleSignRole);
    rowHeights[currentRow] = { hpt: 19 };
    currentRow++;

    // Signatures Row 3: Space for Signing
    mergeAndSet(currentRow, 0, currentRow, 1, '', styleSignDots);
    mergeAndSet(currentRow, 2, currentRow, 4, '', styleSignDots);
    mergeAndSet(currentRow, 5, currentRow, 6, '', styleSignDots);
    rowHeights[currentRow] = { hpt: 40 };
    currentRow++;

    // Signatures Row 4: Dotted name lines
    mergeAndSet(currentRow, 0, currentRow, 1, '............................................', styleSignDots);
    mergeAndSet(currentRow, 2, currentRow, 4, '............................................', styleSignDots);
    mergeAndSet(currentRow, 5, currentRow, 6, '............................................', styleSignDots);
    rowHeights[currentRow] = { hpt: 19 };
    currentRow++;

    // Set Sheet Metadata
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: currentRow - 1, c: 6 } });
    ws['!merges'] = merges;
    ws['!rows'] = rowHeights;
    ws['!cols'] = [
        { wch: 7 },   // Col 0: ល.រ
        { wch: 26 },  // Col 1: គោត្តនាម+នាម
        { wch: 7 },   // Col 2: ភេទ
        { wch: 18 },  // Col 3: ថ្ងៃខែឆ្នាំកំណើត
        { wch: 12 },  // Col 4: មធ្យមភាគ
        { wch: 18 },  // Col 5: មកពីសាលា
        { wch: 22 }   // Col 6: ផ្សេងៗ
    ];

    // Page Setup for Printing / Viewing
    ws['!pageSetup'] = {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
    };
    ws['!margins'] = {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2
    };
    ws['!views'] = [{ showGridLines: true }];

    XLSX.utils.book_append_sheet(wb, ws, 'បញ្ជីប្រឡងឡើងថ្នាក់ទី៧');
    XLSX.writeFile(wb, `បញ្ជីឈ្មោះសិស្សប្រឡងឡើងថ្នាក់ទី៧_${docSettings.shortSchoolName || docSettings.schoolName}.xlsx`);
}

// Export Document to PDF using html2pdf
function exportToPdf() {
    const element = document.getElementById('a4-pages-container');
    if (!element || typeof html2pdf === 'undefined') {
        window.print();
        return;
    }

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `បញ្ជីឈ្មោះសិស្សប្រឡងឡើងថ្នាក់ទី៧_${docSettings.schoolName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

function initPage() {
    loadDocSettings();

    if (window.classManager && document.getElementById('global-class-selector')) {
        window.classManager.renderClassSelector('global-class-selector');
    }

    loadStudentsData();
    renderAllSheets();
}

// Initialize on DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPage();
        setTimeout(initPage, 80);
    });
} else {
    initPage();
}

// Listen to Class Change Event
window.addEventListener('classChanged', (e) => {
    loadStudentsData();
    renderAllSheets();
});
