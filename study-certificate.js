// study-certificate.js - Logic for School Study Certificate (លិខិតបញ្ជាក់ការសិក្សា)

let currentStudentsList = [];
let currentStudentIndex = 0;
let annualResultsMap = {};

const KHMER_NUMS = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
const KHMER_MONTHS_NAMES = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

function toKhmerNum(num) {
    if (num === null || num === undefined || num === '') return '';
    return num.toString().split('').map(d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d).join('');
}

function calculateGradeMention(avg) {
    const val = parseFloat(avg);
    if (isNaN(val) || val <= 0) return 'E';
    if (val >= 8.5) return 'A';
    if (val >= 7.0) return 'B';
    if (val >= 6.0) return 'C';
    if (val >= 5.0) return 'D';
    if (val >= 4.0) return 'E';
    return 'F';
}

document.addEventListener('DOMContentLoaded', () => {
    // Render Class Selector if available
    if (window.classManager && document.getElementById('global-class-selector')) {
        window.classManager.renderClassSelector('global-class-selector');
    }

    loadAnnualResults();
    loadClassStudents();
    initSchoolAndDates();

    // Check if a specific student is passed in URL
    const urlParams = new URLSearchParams(window.location.search);
    const targetStudentId = urlParams.get('studentId');
    if (targetStudentId && currentStudentsList.length > 0) {
        const foundIdx = currentStudentsList.findIndex(s => s.id === targetStudentId);
        if (foundIdx !== -1) {
            currentStudentIndex = foundIdx;
        }
    }

    renderCurrentStudent();
    setupInputAutoResize();

    // Listen for class changes
    if (window.classManager) {
        window.classManager.onClassChange(() => {
            currentStudentIndex = 0;
            loadAnnualResults();
            loadClassStudents();
            initSchoolAndDates();
            renderCurrentStudent();
        });
    }
});

// Load annual exam grades & rank map
function loadAnnualResults() {
    annualResultsMap = {};
    const key = window.getKey ? window.getKey('annualExamGrades') : 'annualExamGrades';
    const saved = JSON.parse(localStorage.getItem(key)) || JSON.parse(localStorage.getItem('annualExamGrades')) || {};
    
    if (Array.isArray(saved)) {
        saved.forEach(s => {
            if (s.id) annualResultsMap[s.id] = s;
        });
    } else if (typeof saved === 'object' && saved !== null) {
        annualResultsMap = saved;
    }

    // If still empty, compute from semester 1 and 2
    if (Object.keys(annualResultsMap).length === 0) {
        try {
            const sem1Key = window.getKey ? window.getKey('semester1ExamGrades') : 'semester1ExamGrades';
            const sem2Key = window.getKey ? window.getKey('semester2ExamGrades') : 'semester2ExamGrades';
            const sem1 = JSON.parse(localStorage.getItem(sem1Key)) || JSON.parse(localStorage.getItem('semester1ExamGrades')) || [];
            const sem2 = JSON.parse(localStorage.getItem(sem2Key)) || JSON.parse(localStorage.getItem('semester2ExamGrades')) || [];
            const s1List = Array.isArray(sem1) ? sem1 : Object.values(sem1);
            const s2List = Array.isArray(sem2) ? sem2 : Object.values(sem2);

            const profiles = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData')) || [];
            profiles.forEach(student => {
                const s1 = s1List.find(s => s.id === student.id || s.name === student.name);
                const s2 = s2List.find(s => s.id === student.id || s.name === student.name);
                let s1Avg = s1 && s1.sem_avg !== undefined ? parseFloat(s1.sem_avg) : (s1 && s1.average ? parseFloat(s1.average) : null);
                let s2Avg = s2 && s2.sem_avg !== undefined ? parseFloat(s2.sem_avg) : (s2 && s2.average ? parseFloat(s2.average) : null);
                let annualAvg = null;
                if (s1Avg !== null && s2Avg !== null) {
                    annualAvg = (s1Avg + s2Avg) / 2;
                } else if (s1Avg !== null) {
                    annualAvg = s1Avg;
                } else if (s2Avg !== null) {
                    annualAvg = s2Avg;
                }
                if (annualAvg !== null) {
                    annualResultsMap[student.id] = {
                        annualAvg: annualAvg.toFixed(2),
                        avg: annualAvg.toFixed(2),
                        grade: calculateGradeMention(annualAvg)
                    };
                }
            });
        } catch (e) {
            console.warn('Fallback dynamic compute annual in study certificate failed', e);
        }
    }
}

// Load active class students
function loadClassStudents() {
    const storageKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
    currentStudentsList = JSON.parse(localStorage.getItem(storageKey)) || [];

    const picker = document.getElementById('student-picker');
    if (!picker) return;
    picker.innerHTML = '';

    if (currentStudentsList.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = '-- គ្មានទិន្នន័យសិស្ស --';
        picker.appendChild(opt);
        return;
    }

    currentStudentsList.forEach((student, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        const g = (student.gender === 'ស' || student.gender === 'ស្រី') ? 'ស្រី' : 'ប្រុស';
        opt.textContent = `${idx + 1}. ${student.name} (${g}) - ${student.id || ''}`;
        picker.appendChild(opt);
    });

    picker.value = currentStudentIndex;
}

// Format Date to Khmer Day, Month, Year
function parseDateToKhmerParts(dobStr) {
    if (!dobStr) return { day: '', month: '', year: '' };
    
    let d, m, y;
    if (dobStr.includes('-')) {
        const parts = dobStr.split('-');
        if (parts[0].length === 4) {
            y = parts[0];
            m = parseInt(parts[1], 10);
            d = parseInt(parts[2], 10);
        } else {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parts[2];
        }
    } else if (dobStr.includes('/')) {
        const parts = dobStr.split('/');
        if (parts.length === 3) {
            if (parts[2].length === 4) {
                d = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                y = parts[2];
            } else {
                d = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                y = '20' + parts[2];
            }
        }
    }

    if (!y || isNaN(m) || isNaN(d)) return { day: '', month: '', year: '' };

    return {
        day: toKhmerNum(d.toString().padStart(2, '0')),
        month: KHMER_MONTHS_NAMES[m - 1] || '',
        year: toKhmerNum(y)
    };
}

// Populate UI with Selected Student Data
function renderCurrentStudent() {
    if (currentStudentsList.length === 0) return;

    const student = currentStudentsList[currentStudentIndex] || currentStudentsList[0];
    if (!student) return;

    const picker = document.getElementById('student-picker');
    if (picker) picker.value = currentStudentIndex;

    // Student Name & Gender
    setVal('cert-student-name', student.name || 'កែម សុផាន់ណា');
    const isFem = (student.gender === 'ស' || student.gender === 'ស្រី');
    setVal('cert-gender', isFem ? 'ស្រី' : 'ប្រុស');

    // DOB
    const dobParts = parseDateToKhmerParts(student.dob);
    setVal('cert-dob-day', dobParts.day || '១០');
    setVal('cert-dob-month', dobParts.month || 'មីនា');
    setVal('cert-dob-year', dobParts.year || '២០១៦');

    // Place of Birth (POB)
    let pobStr = '';
    const v = (student.pobVillage || '').trim();
    const c = (student.pobCommune || '').trim();
    const d = (student.pobDistrict || '').trim();
    const p = (student.pobProvince || student.pob || '').trim();

    if (v || c || d || p) {
        let parts = [];
        if (v) parts.push(v.startsWith('ភូមិ') ? v : `ភូមិ ${v}`);
        if (c) parts.push(c.startsWith('ឃុំ') || c.startsWith('សង្កាត់') ? c : `ឃុំ ${c}`);
        if (d) parts.push(d.startsWith('ស្រុក') || d.startsWith('ខណ្ឌ') ? d : `ស្រុក ${d}`);
        if (p) parts.push(p.startsWith('ខេត្ត') || p.startsWith('រាជធានី') ? p : `ខេត្ត ${p}`);
        pobStr = parts.join(' ');
    } else {
        pobStr = 'ភូមិ ផ្លុង ឃុំ ទីពោ ស្រុក សន្ទុក ខេត្ត កំពង់ធំ';
    }
    setVal('cert-pob', pobStr);

    // Parents Info
    let fatherName = student.fatherName || '';
    let motherName = student.motherName || '';
    if (!fatherName && !motherName && student.guardian) {
        if (student.guardian.includes(' / ')) {
            const spl = student.guardian.split(' / ');
            fatherName = spl[0];
            motherName = spl[1];
        } else {
            fatherName = student.guardian;
        }
    }

    setVal('cert-father-name', fatherName || 'អូន កែម');
    setVal('cert-father-age', student.fatherAge ? toKhmerNum(student.fatherAge) : '៣៣');
    setVal('cert-father-job', student.fatherJob || 'កសិករ');

    setVal('cert-mother-name', motherName || 'ថន យៀក');
    setVal('cert-mother-age', student.motherAge ? toKhmerNum(student.motherAge) : '៤៧');
    setVal('cert-mother-job', student.motherJob || 'កសិករ');

    // Current Address
    let currStr = '';
    const cv = (student.currVillage || '').trim();
    const cc = (student.currCommune || '').trim();
    const cd = (student.currDistrict || '').trim();
    const cp = (student.currProvince || '').trim();

    if (cv || cc || cd || cp) {
        let parts = [];
        if (cv) parts.push(cv.startsWith('ភូមិ') ? cv : `ភូមិ ${cv}`);
        if (cc) parts.push(cc.startsWith('ឃុំ') || cc.startsWith('សង្កាត់') ? c : `ឃុំ ${cc}`);
        if (cd) parts.push(cd.startsWith('ស្រុក') || cd.startsWith('ខណ្ឌ') ? d : `ស្រុក ${cd}`);
        if (cp) parts.push(cp.startsWith('ខេត្ត') || cp.startsWith('រាជធានី') ? p : `ខេត្ត ${cp}`);
        currStr = parts.join(' ');
    } else {
        currStr = pobStr; // Default to POB
    }
    setVal('cert-current-address', currStr);

    // Academic Details
    let activeClassName = '៥ ក';
    if (window.classManager && window.classManager.getActiveClass) {
        const cl = window.classManager.getActiveClass();
        if (cl && cl.name) {
            activeClassName = cl.name.replace(/ថ្នាក់ទី\s*/g, '').replace(/ថ្នាក់\s*/g, '').trim();
        }
    }
    setVal('cert-class-grade', activeClassName || '៥ ក');

    // Academic Year
    const rawRecords = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('schoolRecords') : 'schoolRecords')) || [];
    let records = {};
    if (Array.isArray(rawRecords) && rawRecords.length > 0) {
        records = rawRecords[rawRecords.length - 1];
    } else if (typeof rawRecords === 'object' && !Array.isArray(rawRecords)) {
        records = rawRecords;
    }
    
    setVal('cert-academic-year', records.academicYear || '២០២៥-២០២៦');

    // Annual Result (Score, Rank, Grade)
    const annualData = annualResultsMap[student.id] || {};
    let avg = annualData.annualAvg || annualData.avg || '8.10';
    let rank = annualData.rank || annualData._tempRank || (currentStudentIndex + 1);
    let totCount = currentStudentsList.length || 48;
    let rankStr = `${toKhmerNum(rank.toString().padStart(2, '0'))}/${toKhmerNum(totCount)}`;
    let gradeMention = annualData.grade || calculateGradeMention(avg);

    setVal('cert-annual-avg', toKhmerNum(avg));
    setVal('cert-annual-rank', rankStr);
    setVal('cert-annual-grade', gradeMention);

    // School Info
    const schoolName = records.schoolName || 'ផ្លុង';
    setVal('cert-school-name-text', schoolName);
    setVal('cert-school-director-display', schoolName);
    setVal('cert-school-name', schoolName);

    const schoolLoc = records.schoolLocation || 'ភូមិ ផ្លុង ឃុំ ទីពោ ស្រុក សន្ទុក ខេត្ត កំពង់ធំ';
    setVal('cert-school-location', schoolLoc);

    // Auto-adjust width of all text inputs
    autoAdjustInputWidths();
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        el.value = val;
    } else {
        el.textContent = val;
    }
}

// Initialise School info & Lunar date
function initSchoolAndDates() {
    const rawRecords = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('schoolRecords') : 'schoolRecords')) || [];
    let records = {};
    if (Array.isArray(rawRecords) && rawRecords.length > 0) {
        records = rawRecords[rawRecords.length - 1];
    } else if (typeof rawRecords === 'object' && !Array.isArray(rawRecords)) {
        records = rawRecords;
    }
    
    if (records.districtName) {
        setVal('cert-district-name', records.districtName.startsWith('ស្រុក') ? records.districtName : `ស្រុក${records.districtName}`);
    } else if (records.districtOffice) {
        let dist = records.districtOffice.trim();
        setVal('cert-district-name', dist.startsWith('ស្រុក') ? dist : `ស្រុក${dist}`);
    } else {
        setVal('cert-district-name', 'ស្រុកសន្ទុក');
    }

    const sName = records.schoolName || 'ផ្លុង';
    setVal('cert-school-name', sName);
    setVal('cert-school-director-display', sName);
    setVal('cert-school-name-text', sName);
    setVal('cert-issue-place', sName);

    if (records.directorName) {
        setVal('cert-director-name', records.directorName);
    }

    // Solar Date (Today)
    const today = new Date();
    setVal('cert-issue-day', toKhmerNum(today.getDate().toString().padStart(2, '0')));
    setVal('cert-issue-month', KHMER_MONTHS_NAMES[today.getMonth()]);
    setVal('cert-issue-year', toKhmerNum(today.getFullYear()));

    // Set solar picker to today's date
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePicker = document.getElementById('solar-picker');
    if (datePicker) {
        datePicker.value = `${yyyy}-${mm}-${dd}`;
    }

    // Lunar Date via KhmerCalendar / chhankitek
    updateLunarDateFromCurrentDate(today);

    // Setup sync listener for school names and issue place
    setupSchoolNameSync();
}

function updateSolarDate(dateVal) {
    if (!dateVal) return;
    const parts = dateVal.split('-');
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    // Update solar date inputs in certificate
    setVal('cert-issue-day', toKhmerNum(day.toString().padStart(2, '0')));
    setVal('cert-issue-month', KHMER_MONTHS_NAMES[month]);
    setVal('cert-issue-year', toKhmerNum(year));

    // Update lunar date
    updateLunarDateFromCurrentDate(dateObj);

    // Auto-adjust input widths
    autoAdjustInputWidths();
}

function updateLunarDateFromCurrentDate(dateObj) {
    if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
        try {
            const lunar = KhmerCalendar.toKhmerLunarDate(dateObj);
            if (lunar) {
                const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
                const dayName = days[dateObj.getDay()] || 'អាទិត្យ';
                const moonDay = lunar.day || lunar.moonDay || 12;
                const moonStatus = lunar.moonStatus || (lunar.isWaxing ? 'កើត' : 'រោច');
                const moonStr = `${toKhmerNum(moonDay)}${moonStatus}`;
                const mName = lunar.month || lunar.khmerMonth || 'ខែអាសាឍ';
                const animal = lunar.animalYear || 'មមី';
                const sak = lunar.sak || 'អដ្ឋស័ក';
                const beYear = toKhmerNum(lunar.buddhistYear || 2570);
                
                const fullLunar = `ថ្ងៃ${dayName} ${moonStr} ${mName.startsWith('ខែ') ? mName : 'ខែ' + mName} ${animal.startsWith('ឆ្នាំ') ? animal : animal} ${sak} ព.ស ${beYear}`;
                setVal('cert-lunar-date', fullLunar);
            }
        } catch (e) {
            console.error('Error generating lunar date', e);
        }
    }
}

function setupSchoolNameSync() {
    const schoolInputs = ['cert-school-name', 'cert-school-director-display', 'cert-school-name-text', 'cert-issue-place'];
    schoolInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                const val = e.target.value;
                schoolInputs.forEach(targetId => {
                    if (targetId !== id) {
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                            targetEl.value = val;
                        }
                    }
                });
                autoAdjustInputWidths();
            });
        }
    });
}

// Student Navigator
function onStudentSelectChange(val) {
    currentStudentIndex = parseInt(val, 10) || 0;
    renderCurrentStudent();
}

function navigateStudent(direction) {
    if (currentStudentsList.length === 0) return;
    currentStudentIndex += direction;
    if (currentStudentIndex < 0) currentStudentIndex = currentStudentsList.length - 1;
    if (currentStudentIndex >= currentStudentsList.length) currentStudentIndex = 0;
    renderCurrentStudent();
}

let measureSpan = null;
function getExactTextWidth(text, isMoul, customFontSize) {
    if (!measureSpan) {
        measureSpan = document.createElement('span');
        measureSpan.style.position = 'absolute';
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.whiteSpace = 'nowrap';
        measureSpan.style.top = '-9999px';
        measureSpan.style.left = '-9999px';
        document.body.appendChild(measureSpan);
    }
    measureSpan.style.fontFamily = isMoul ? "'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', cursive, serif" : "'Khmer OS Siemreap', 'Siemreap', 'Kantumruy Pro', sans-serif";
    measureSpan.style.fontSize = customFontSize || (isMoul ? "10.5pt" : "11.5pt");
    measureSpan.style.fontWeight = "normal";
    measureSpan.textContent = text;
    return measureSpan.getBoundingClientRect().width;
}

// Auto-adjust width of inputs based on text length
function autoAdjustInputWidths() {
    document.querySelectorAll('.editable-line-input').forEach(input => {
        if (input.id === 'cert-lunar-date') {
            return;
        }
        const text = input.value || input.placeholder || '';
        if (!text) {
            input.style.width = '28px';
            return;
        }
        const isMoul = input.classList.contains('moul-font') || input.classList.contains('admin-label');
        const customSize = input.id === 'cert-school-director-display' ? '12.5pt' : null;
        const exactWidth = getExactTextWidth(text, isMoul, customSize);
        input.style.width = Math.max(28, Math.ceil(exactWidth + 12)) + 'px';
    });
}

function setupInputAutoResize() {
    document.querySelectorAll('.editable-line-input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.id === 'cert-lunar-date') {
                return;
            }
            const text = input.value || input.placeholder || '';
            const isMoul = input.classList.contains('moul-font') || input.classList.contains('admin-label');
            const customSize = input.id === 'cert-school-director-display' ? '12.5pt' : null;
            const exactWidth = getExactTextWidth(text, isMoul, customSize);
            input.style.width = Math.max(28, Math.ceil(exactWidth + 12)) + 'px';
        });
    });
}

// Single Certificate Print
function printSingleCertificate() {
    document.body.classList.remove('is-batch-printing');
    window.print();
}

// Batch Print All Students
function printBatchCertificates() {
    if (!currentStudentsList || currentStudentsList.length === 0) {
        alert('មិនមានទិន្នន័យសិស្សសម្រាប់បោះពុម្ពទេ!');
        return;
    }

    const wrapper = document.getElementById('batch-print-wrapper');
    wrapper.innerHTML = '';

    // Read current form values for school & dates so user edits are respected
    const schoolInfo = {
        districtName: document.getElementById('cert-district-name').value || 'ស្រុកសន្ទុក',
        schoolName: document.getElementById('cert-school-name').value || 'ផ្លុង',
        letterNo: document.getElementById('cert-letter-no').value || '០០៩',
        letterYear: document.getElementById('cert-letter-year').value || '២០២៦',
        letterSuffix: document.getElementById('cert-letter-suffix').value || 'សអជ',
        schoolDirectorDisplay: document.getElementById('cert-school-director-display').value || 'ផ្លុង',
        academicYear: document.getElementById('cert-academic-year').value || '២០២៥-២០២៦',
        classGrade: document.getElementById('cert-class-grade').value || '៥ ក',
        schoolNameText: document.getElementById('cert-school-name-text').value || 'ផ្លុង',
        schoolLocation: (document.getElementById('cert-school-location').textContent || document.getElementById('cert-school-location').value || 'ភូមិ ផ្លុង ឃុំ ទីពោ ស្រុក សន្ទុក ខេត្ត កំពង់ធំ').trim(),
        lunarDate: document.getElementById('cert-lunar-date').value || '',
        issuePlace: document.getElementById('cert-issue-place').value || 'ផ្លុង',
        issueDay: document.getElementById('cert-issue-day').value || '៣០',
        issueMonth: document.getElementById('cert-issue-month').value || 'សីហា',
        issueYear: document.getElementById('cert-issue-year').value || '២០២៦',
        directorName: document.getElementById('cert-director-name').value || ''
    };

    currentStudentsList.forEach((student, idx) => {
        const pageHtml = generateCertificateHTMLForStudent(student, idx, schoolInfo);
        wrapper.insertAdjacentHTML('beforeend', pageHtml);
    });

    document.body.classList.add('is-batch-printing');
    
    setTimeout(() => {
        window.print();
    }, 200);
}

window.addEventListener('afterprint', () => {
    document.body.classList.remove('is-batch-printing');
    const wrapper = document.getElementById('batch-print-wrapper');
    if (wrapper) wrapper.innerHTML = '';
});

function generateCertificateHTMLForStudent(student, idx, schoolInfo) {
    const studentName = student.name || '';
    const gender = student.gender || 'ប្រុស';

    // DOB
    let dobDay = '១០', dobMonth = 'មីនា', dobYear = '២០១៦';
    if (student.dob) {
        const parts = student.dob.split('-');
        if (parts.length === 3) {
            dobYear = toKhmerNum(parts[0]);
            const mIdx = parseInt(parts[1], 10) - 1;
            dobMonth = KHMER_MONTHS_NAMES[mIdx] || 'មីនា';
            dobDay = toKhmerNum(parseInt(parts[2], 10).toString().padStart(2, '0'));
        }
    }

    // POB
    let pobStr = '';
    const v = (student.village || '').trim();
    const c = (student.commune || '').trim();
    const d = (student.district || '').trim();
    const p = (student.province || '').trim();
    if (v || c || d || p) {
        let parts = [];
        if (v) parts.push(v.startsWith('ភូមិ') ? v : `ភូមិ ${v}`);
        if (c) parts.push(c.startsWith('ឃុំ') || c.startsWith('សង្កាត់') ? c : `ឃុំ ${c}`);
        if (d) parts.push(d.startsWith('ស្រុក') || d.startsWith('ខណ្ឌ') ? d : `ស្រុក ${d}`);
        if (p) parts.push(p.startsWith('ខេត្ត') || p.startsWith('រាជធានី') ? p : `ខេត្ត ${p}`);
        pobStr = parts.join(' ');
    } else {
        pobStr = 'ភូមិ ផ្លុង ឃុំ ទីពោ ស្រុក សន្ទុក ខេត្ត កំពង់ធំ';
    }

    // Parents
    let fatherName = student.fatherName || '';
    if (!fatherName && student.father) fatherName = student.father;
    let motherName = student.motherName || '';
    if (!motherName && student.mother) motherName = student.mother;
    if (!fatherName && !motherName && student.guardian) {
        fatherName = student.guardian;
    }
    const fatherAge = student.fatherAge ? toKhmerNum(student.fatherAge) : '៣៣';
    const fatherJob = student.fatherJob || 'កសិករ';
    const motherAge = student.motherAge ? toKhmerNum(student.motherAge) : '៤៧';
    const motherJob = student.motherJob || 'កសិករ';

    // Current Address
    let currStr = '';
    const cv = (student.currVillage || '').trim();
    const cc = (student.currCommune || '').trim();
    const cd = (student.currDistrict || '').trim();
    const cp = (student.currProvince || '').trim();
    if (cv || cc || cd || cp) {
        let parts = [];
        if (cv) parts.push(cv.startsWith('ភូមិ') ? cv : `ភូមិ ${cv}`);
        if (cc) parts.push(cc.startsWith('ឃុំ') || cc.startsWith('សង្កាត់') ? c : `ឃុំ ${cc}`);
        if (cd) parts.push(cd.startsWith('ស្រុក') || cd.startsWith('ខណ្ឌ') ? d : `ស្រុក ${cd}`);
        if (cp) parts.push(cp.startsWith('ខេត្ត') || cp.startsWith('រាជធានី') ? p : `ខេត្ត ${cp}`);
        currStr = parts.join(' ');
    } else {
        currStr = pobStr;
    }

    // Rank & Scores
    const annualData = annualResultsMap[student.id] || {};
    let avg = annualData.annualAvg || annualData.avg || '8.10';
    let rank = annualData.rank || annualData._tempRank || (idx + 1);
    let totCount = currentStudentsList.length || 48;
    let rankStr = `${toKhmerNum(rank.toString().padStart(2, '0'))}/${toKhmerNum(totCount)}`;
    let gradeMention = annualData.grade || calculateGradeMention(avg);

    return `
    <div class="certificate-sheet-container">
        <div class="certificate-frame">
            <div>
                <div class="national-motto-block">
                    <div class="national-title-1">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div class="national-title-2">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <img src="header-divider.png" alt="divider" class="motto-divider">
                </div>

                <div class="admin-info-block">
                    <div class="admin-line">
                        <span class="admin-label">ការិយាល័យអប់រំយុវជន និងកីឡា</span>
                        <span class="admin-label moul-font">${schoolInfo.districtName}</span>
                    </div>
                    <div class="admin-line">
                        <span class="admin-label">សាលាបឋមសិក្សា</span>
                        <span class="admin-label moul-font">${schoolInfo.schoolName}</span>
                    </div>
                    <div class="admin-letter-num">
                        <span>លេខ:</span>
                        <span class="moul-font">${schoolInfo.letterNo}</span>
                        <span>/</span>
                        <span class="moul-font">${schoolInfo.letterYear}</span>
                        <span class="moul-font">${schoolInfo.letterSuffix}</span>
                    </div>
                </div>

                <div class="certificate-main-title">
                    <h1>លិខិតបញ្ជាក់ការសិក្សា</h1>
                    <div class="cert-statement-director">
                        <span>នាយកសាលាបឋមសិក្សា</span>
                        <span class="moul-font" style="font-size: 12.5pt;">${schoolInfo.schoolDirectorDisplay}</span>
                    </div>
                </div>
            </div>

            <div class="cert-body-content">
                <div class="cert-first-paragraph">
                    <span>សូមបញ្ជាក់ថា :</span>
                    <span style="margin-left: 2px;">- សិស្សឈ្មោះ :</span>
                    <span class="moul-font" style="padding: 0 3px;">${studentName}</span>
                    <span style="margin-left: 3px;">ភេទ</span>
                    <span class="moul-font" style="padding: 0 3px;">${gender}</span>
                    <span style="margin-left: 3px;">កើតថ្ងៃទី</span>
                    <span class="moul-font" style="padding: 0 3px;">${dobDay}</span>
                    <span>ខែ</span>
                    <span class="moul-font" style="padding: 0 3px;">${dobMonth}</span>
                    <span>ឆ្នាំ</span>
                    <span class="moul-font" style="padding: 0 3px;">${dobYear}</span>
                </div>

                <div class="cert-indented-line">
                    <span>- ទីកន្លែងកំណើត :</span>
                    <span class="moul-font" style="padding: 0 3px;">${pobStr}</span>
                    <span style="white-space: nowrap;">។</span>
                </div>

                <div class="cert-indented-line">
                    <span>- ឪពុកឈ្មោះ :</span>
                    <span class="moul-font" style="padding: 0 3px;">${fatherName || 'អូន កែម'}</span>
                    <span style="margin-left: 3px;">អាយុ</span>
                    <span class="moul-font" style="padding: 0 3px;">${fatherAge}</span>
                    <span>ឆ្នាំ</span>
                    <span style="margin-left: 6px;">មុខរបរ</span>
                    <span class="moul-font" style="padding: 0 3px;">${fatherJob}</span>
                </div>

                <div class="cert-indented-line">
                    <span>- និងម្តាយឈ្មោះ :</span>
                    <span class="moul-font" style="padding: 0 3px;">${motherName || 'ថន យៀក'}</span>
                    <span style="margin-left: 3px;">អាយុ</span>
                    <span class="moul-font" style="padding: 0 3px;">${motherAge}</span>
                    <span>ឆ្នាំ</span>
                    <span style="margin-left: 6px;">មុខរបរ</span>
                    <span class="moul-font" style="padding: 0 3px;">${motherJob}</span>
                    <span style="white-space: nowrap;">។</span>
                </div>

                <div class="cert-address-line">
                    <span>ទីលំនៅបច្ចុប្បន្ន :</span>
                    <span class="moul-font" style="padding: 0 3px;">${currStr}</span>
                    <span style="white-space: nowrap;">។</span>
                </div>

                <div class="cert-paragraph">
                    <span>ពិតជាសិស្សដែលបានរៀននៅថ្នាក់ទី</span>
                    <span class="moul-font" style="padding: 0 3px;">${schoolInfo.classGrade}</span>
                    <span>ឆ្នាំសិក្សា</span>
                    <span class="moul-font" style="padding: 0 3px;">${schoolInfo.academicYear}</span>
                    <span>មានលទ្ធផលការប្រឡងថ្នាក់</span>
                    <span class="moul-font" style="padding: 0 3px;">${toKhmerNum(avg)}</span>
                    <span>ចំណាត់ថ្នាក់លេខ</span>
                    <span class="moul-font" style="padding: 0 3px;">${rankStr}</span>
                    <span>និទ្ទេស</span>
                    <span class="moul-font" style="padding: 0 3px; text-transform: uppercase;">${gradeMention}</span>
                    <span>នៃសាលាបឋមសិក្សា</span>
                    <span class="moul-font" style="padding: 0 3px;">${schoolInfo.schoolNameText}</span>
                    <span>ស្ថិតនៅ</span>
                    <span class="moul-font" style="padding: 0 3px;">${schoolInfo.schoolLocation}</span>
                    <span style="white-space: nowrap;">ប្រាកដមែន។</span>
                </div>

                <div class="cert-paragraph" style="margin-top: 10px;">
                    <span>លិខិតបញ្ជាក់ការសិក្សានេះ:ចេញជូនសាមីជនសម្រាប់យកទៅប្រើប្រាស់តាមការដែលអាចប្រើបាន។</span>
                </div>
            </div>

            <div class="signatures-section">
                <div class="signature-inner-box">
                    <div class="signature-date-row">
                        <span>${schoolInfo.lunarDate}</span>
                    </div>
                    <div class="signature-date-row" style="margin-top: 4px;">
                        <span>ធ្វើនៅ</span>
                        <span style="padding: 0 3px;">${schoolInfo.issuePlace}</span>
                        <span>ថ្ងៃទី</span>
                        <span style="padding: 0 3px;">${schoolInfo.issueDay}</span>
                        <span>ខែ</span>
                        <span style="padding: 0 3px;">${schoolInfo.issueMonth}</span>
                        <span>ឆ្នាំ</span>
                        <span style="padding: 0 3px;">${schoolInfo.issueYear}</span>
                    </div>
                    <div class="director-title-bold moul-font">នាយកសាលា</div>
                    <div class="director-name-val moul-font">${schoolInfo.directorName}</div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Export to PDF
function exportPDF() {
    const student = currentStudentsList[currentStudentIndex];
    const studentName = student ? (student.name || 'សិស្ស') : 'សិស្ស';
    const element = document.getElementById('certificate-page-node');

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `លិខិតបញ្ជាក់ការសិក្សា_${studentName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

window.navigateStudent = navigateStudent;
window.onStudentSelectChange = onStudentSelectChange;
window.printSingleCertificate = printSingleCertificate;
window.printBatchCertificates = printBatchCertificates;
window.exportPDF = exportPDF;
