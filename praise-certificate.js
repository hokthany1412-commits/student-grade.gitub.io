// praise-certificate.js - Logic for Official Primary School Praise Certificate (បណ្ណសរសើរ)

let currentStudentsList = [];
let currentStudentIndex = 0;
let currentCertStyle = 1;
let currentPeriodType = 'annual'; // 'annual', 'semester1', 'semester2', 'monthly'
let currentMonth = 'មករា';
let is3LineHeader = false;
let showPhotoBox = false;

const KHMER_NUMS = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
const KHMER_MONTHS_NAMES = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

function toKhmerNum(num) {
    if (num === null || num === undefined) return '';
    return num.toString().split('').map(d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d).join('');
}

function convertStringToKhmerDigits(str) {
    if (!str) return '';
    return str.toString().replace(/[0-9]/g, d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d);
}

// Convert Gregorian Date to Buddhist Lunar Date String using KhmerCalendar
function calculateKhmerLunarDate(dateObj) {
    try {
        if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
            const lunar = KhmerCalendar.toKhmerLunarDate(dateObj);
            if (lunar) {
                // If full lunarDateText exists, format and return it cleanly
                if (lunar.lunarDateText) {
                    let str = lunar.lunarDateText.replace(/ពុទ្ធសករាជ\\s*/g, 'ព.ស.');
                    if (!str.startsWith('ថ្ងៃ')) {
                        str = 'ថ្ងៃ' + str;
                    }
                    // Ensure spacing between digits and moon status (e.g. ៩ កើត)
                    str = str.replace(/([០-៩]+)(កើត|រោច)/g, '$1 $2');
                    return str.replace(/\\s+/g, ' ').trim();
                }

                let dayName = lunar.dayOfWeek || (KhmerCalendar.DAYS_OF_WEEK_KM ? KhmerCalendar.DAYS_OF_WEEK_KM[dateObj.getDay()] : '');
                if (dayName && !dayName.startsWith('ថ្ងៃ')) {
                    dayName = 'ថ្ងៃ' + dayName;
                }
                if (!dayName) {
                    const dayNames = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
                    dayName = dayNames[dateObj.getDay()] || 'ថ្ងៃ';
                }
                const moonStatus = lunar.moonStatus || ''; // កើត / រោច
                const moonDay = toKhmerNum(lunar.moonDay || lunar.day || '១');
                const lunarMonth = lunar.khmerMonth || lunar.month || 'ភទ្របទ';
                const animalYear = lunar.animalYear || '';
                const sak = lunar.sak || '';
                const beYear = toKhmerNum(lunar.buddhistEraYear || lunar.beYear || (dateObj.getFullYear() + 543));

                let str = `${dayName} ${moonDay} ${moonStatus} ខែ${lunarMonth} ឆ្នាំ${animalYear} ${sak} ព.ស.${beYear}`;
                return str.replace(/\\s+/g, ' ').trim();
            }
        }
    } catch (err) {
        console.warn('Lunar date calculation fallback', err);
    }
    
    // Fallback if calendar fails
    const dayNames = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
    const dName = dayNames[dateObj.getDay()] || 'ថ្ងៃ';
    const beYear = toKhmerNum(dateObj.getFullYear() + 543);
    return `${dName} ៩ កើត ខែភទ្របទ ឆ្នាំម្សាញ់ អដ្ឋស័ក ព.ស.${beYear}`;
}

// Grade & Class Formatting Helpers
function getActiveClassGrade() {
    let raw = '';
    if (window.classManager && typeof window.classManager.getActiveClass === 'function') {
        const activeClass = window.classManager.getActiveClass();
        if (activeClass && activeClass.name) {
            raw = activeClass.name;
        }
    }
    if (!raw) {
        raw = localStorage.getItem('selectedClass') || localStorage.getItem('currentClass') || '';
    }
    if (!raw) {
        try {
            const teacherKey = window.getKey ? window.getKey('teacherProfiles') : 'teacherProfiles';
            let tRecords = JSON.parse(localStorage.getItem(teacherKey)) || JSON.parse(localStorage.getItem('teacherProfiles'));
            if (tRecords) {
                let mainTeacher = Array.isArray(tRecords) ? tRecords[0] : tRecords;
                if (mainTeacher && mainTeacher.className) {
                    raw = mainTeacher.className;
                }
            }
        } catch (e) {}
    }
    return raw || '៥';
}

function formatGradeText(gradeRaw) {
    if (!gradeRaw && gradeRaw !== 0) return '៥';
    let str = gradeRaw.toString().trim();
    // Remove "ថ្នាក់ទី ", "ថ្នាក់ ", "ទី "
    str = str.replace(/^ថ្នាក់ទី\\s*/i, '').replace(/^ថ្នាក់\\s*/i, '').replace(/^ទី\\s*/i, '').trim();
    return convertStringToKhmerDigits(str) || '៥';
}

function updateGradeFromInput(val) {
    const elGrade = document.getElementById('cert-display-grade');
    if (elGrade) elGrade.textContent = convertStringToKhmerDigits(val);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (window.classManager && document.getElementById('global-class-selector')) {
        window.classManager.renderClassSelector('global-class-selector');
    }
    loadClassStudents();
    loadSchoolAndTeacherInfo();
    initCurrentDateAndCalendar();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const targetStudentId = urlParams.get('studentId');
    const targetPeriod = urlParams.get('period');
    const targetMonth = urlParams.get('month');
    const targetRank = urlParams.get('rank');

    if (targetPeriod) {
        currentPeriodType = targetPeriod;
        const pSelect = document.getElementById('period-type-select');
        if (pSelect) pSelect.value = targetPeriod;
        if (targetPeriod === 'monthly' && targetMonth) {
            currentMonth = targetMonth;
            const mSelect = document.getElementById('month-select');
            if (mSelect) mSelect.value = targetMonth;
        }
    }

    if (targetStudentId && currentStudentsList.length > 0) {
        const fIdx = currentStudentsList.findIndex(s => s.id === targetStudentId);
        if (fIdx !== -1) currentStudentIndex = fIdx;
    }

    onPeriodTypeChange();
    setCertStyle(1);
    renderCurrentStudent();
});

let currentStudentFilterMode = 'all'; // 'all', 'top5', 'top10'

// Calculate Complete Rank Map for Current Evaluation Period
function calculateStudentRankMap() {
    const rankMap = new Map();
    const storageKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
    const profiles = JSON.parse(localStorage.getItem(storageKey)) || JSON.parse(localStorage.getItem('studentProfilesData')) || JSON.parse(localStorage.getItem('students')) || [];

    try {
        if (currentPeriodType === 'annual') {
            const annualKey = window.getKey ? window.getKey('annualExamGrades') : 'annualExamGrades';
            let annualGrades = JSON.parse(localStorage.getItem(annualKey)) || JSON.parse(localStorage.getItem('annualExamGrades')) || JSON.parse(localStorage.getItem('annualGrades'));

            if (annualGrades && typeof annualGrades === 'object' && Object.keys(annualGrades).length > 0) {
                if (Array.isArray(annualGrades)) {
                    annualGrades.forEach(s => {
                        const r = parseInt(s.rank || s.ranking || 0, 10);
                        if (r > 0) {
                            if (s.id) rankMap.set(s.id.toString().trim(), r);
                            if (s.name) rankMap.set(s.name.trim(), r);
                        }
                    });
                } else {
                    Object.keys(annualGrades).forEach(id => {
                        const entry = annualGrades[id];
                        const r = parseInt(entry.rank || 0, 10);
                        if (r > 0) {
                            rankMap.set(id.toString().trim(), r);
                            if (entry.name) rankMap.set(entry.name.trim(), r);
                        }
                    });
                }
            } else {
                // Compute annual grades dynamically from semester 1 and 2
                const sem1Key = window.getKey ? window.getKey('semester1ExamGrades') : 'semester1ExamGrades';
                const sem2Key = window.getKey ? window.getKey('semester2ExamGrades') : 'semester2ExamGrades';
                const sem1 = JSON.parse(localStorage.getItem(sem1Key)) || JSON.parse(localStorage.getItem('semester1ExamGrades')) || [];
                const sem2 = JSON.parse(localStorage.getItem(sem2Key)) || JSON.parse(localStorage.getItem('semester2ExamGrades')) || [];
                
                const s1List = Array.isArray(sem1) ? sem1 : Object.values(sem1);
                const s2List = Array.isArray(sem2) ? sem2 : Object.values(sem2);

                const computedList = [];
                profiles.forEach(student => {
                    const s1 = s1List.find(s => s.id === student.id || s.name === student.name);
                    const s2 = s2List.find(s => s.id === student.id || s.name === student.name);
                    
                    let s1Avg = s1 && s1.sem_avg !== undefined && s1.sem_avg !== null ? parseFloat(s1.sem_avg) : (s1 && s1.average ? parseFloat(s1.average) : null);
                    let s2Avg = s2 && s2.sem_avg !== undefined && s2.sem_avg !== null ? parseFloat(s2.sem_avg) : (s2 && s2.average ? parseFloat(s2.average) : null);
                    
                    let annualAvg = null;
                    if (s1Avg !== null && s2Avg !== null) {
                        annualAvg = (s1Avg + s2Avg) / 2;
                    } else if (s1Avg !== null) {
                        annualAvg = s1Avg;
                    } else if (s2Avg !== null) {
                        annualAvg = s2Avg;
                    }
                    
                    if (annualAvg !== null) {
                        computedList.push({
                            id: (student.id || '').toString().trim(),
                            name: (student.name || '').toString().trim(),
                            avg: parseFloat(annualAvg.toFixed(2))
                        });
                    }
                });

                if (computedList.length > 0) {
                    computedList.sort((a, b) => b.avg - a.avg);
                    let curRank = 1;
                    let curAvg = -1;
                    let tie = 0;
                    computedList.forEach((s, idx) => {
                        if (s.avg === curAvg) {
                            s.rank = curRank;
                            tie++;
                        } else {
                            curRank = curRank + tie;
                            if (idx === 0) curRank = 1;
                            s.rank = curRank;
                            curAvg = s.avg;
                            tie = 1;
                        }
                        if (s.id) rankMap.set(s.id, s.rank);
                        if (s.name) rankMap.set(s.name, s.rank);
                    });
                }
            }
        } else if (currentPeriodType === 'semester1' || currentPeriodType === 'semester2') {
            const semKeyName = currentPeriodType === 'semester1' ? 'semester1ExamGrades' : 'semester2ExamGrades';
            const semKey = window.getKey ? window.getKey(semKeyName) : semKeyName;
            let semGrades = JSON.parse(localStorage.getItem(semKey)) || JSON.parse(localStorage.getItem(semKeyName)) || [];
            let semList = Array.isArray(semGrades) ? semGrades : Object.values(semGrades);

            if (semList.length > 0) {
                const valid = semList.map(s => ({
                    id: (s.id || '').toString().trim(),
                    name: (s.name || '').toString().trim(),
                    avg: parseFloat(s.sem_avg || s.average || 0),
                    explicitRank: parseInt(s.rank || 0, 10)
                })).filter(s => s.avg > 0);
                
                valid.sort((a, b) => b.avg - a.avg);
                let curRank = 1;
                let curAvg = -1;
                let tie = 0;
                valid.forEach((s, idx) => {
                    if (s.explicitRank > 0) {
                        s.rank = s.explicitRank;
                    } else if (s.avg === curAvg) {
                        s.rank = curRank;
                        tie++;
                    } else {
                        curRank = curRank + tie;
                        if (idx === 0) curRank = 1;
                        s.rank = curRank;
                        curAvg = s.avg;
                        tie = 1;
                    }
                    if (s.id) rankMap.set(s.id, s.rank);
                    if (s.name) rankMap.set(s.name, s.rank);
                });
            }
        } else if (currentPeriodType === 'monthly') {
            const monthKey = window.getKey ? window.getKey(`studentGrades_${currentMonth}`) : `studentGrades_${currentMonth}`;
            let mGrades = JSON.parse(localStorage.getItem(monthKey)) || JSON.parse(localStorage.getItem(`studentGrades_${currentMonth}`)) || [];
            let mList = Array.isArray(mGrades) ? mGrades : Object.values(mGrades);

            if (mList.length > 0) {
                const valid = mList.map(s => ({
                    id: (s.id || '').toString().trim(),
                    name: (s.name || '').toString().trim(),
                    avg: parseFloat(s.average || s.totalScore || 0),
                    explicitRank: parseInt(s.rank || 0, 10)
                })).filter(s => s.avg > 0);
                
                valid.sort((a, b) => b.avg - a.avg);
                let curRank = 1;
                let curAvg = -1;
                let tie = 0;
                valid.forEach((s, idx) => {
                    if (s.explicitRank > 0) {
                        s.rank = s.explicitRank;
                    } else if (s.avg === curAvg) {
                        s.rank = curRank;
                        tie++;
                    } else {
                        curRank = curRank + tie;
                        if (idx === 0) curRank = 1;
                        s.rank = curRank;
                        curAvg = s.avg;
                        tie = 1;
                    }
                    if (s.id) rankMap.set(s.id, s.rank);
                    if (s.name) rankMap.set(s.name, s.rank);
                });
            }
        }
    } catch (e) {
        console.warn('Error reading system ranking data', e);
    }

    // Default sequential rank for any unranked student
    profiles.forEach((s, idx) => {
        const idStr = (s.id || '').toString().trim();
        const nameStr = (s.name || '').toString().trim();
        if (!rankMap.has(idStr) && !rankMap.has(nameStr)) {
            rankMap.set(idStr, idx + 1);
            rankMap.set(nameStr, idx + 1);
        }
    });

    return rankMap;
}

// Load Active Class Students
function loadClassStudents() {
    const storageKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
    currentStudentsList = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (currentStudentsList.length === 0) {
        currentStudentsList = JSON.parse(localStorage.getItem('students')) || [];
    }

    const rankMap = calculateStudentRankMap();

    currentStudentsList.forEach((student, idx) => {
        const idStr = (student.id || '').toString().trim();
        const nameStr = (student.name || '').toString().trim();
        student.calculatedRank = rankMap.get(idStr) || rankMap.get(nameStr) || (idx + 1);
    });

    populateStudentsDropdown();
}

function populateStudentsDropdown() {
    const picker = document.getElementById('student-select');
    if (!picker) return;
    picker.innerHTML = '';

    if (currentStudentsList.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = '-- គ្មានទិន្នន័យសិស្ស --';
        picker.appendChild(opt);
        return;
    }

    let filtered = currentStudentsList.map((s, idx) => ({ student: s, originalIndex: idx }));

    if (currentStudentFilterMode === 'top5') {
        filtered = filtered.filter(item => item.student.calculatedRank >= 1 && item.student.calculatedRank <= 5);
    } else if (currentStudentFilterMode === 'top10') {
        filtered = filtered.filter(item => item.student.calculatedRank >= 1 && item.student.calculatedRank <= 10);
    }

    // Sort options by rank
    filtered.sort((a, b) => a.student.calculatedRank - b.student.calculatedRank);

    if (filtered.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = '-- គ្មានសិស្សក្នុងចំណាត់ថ្នាក់នេះ --';
        picker.appendChild(opt);
        return;
    }

    filtered.forEach(item => {
        const student = item.student;
        const opt = document.createElement('option');
        opt.value = item.originalIndex;
        const g = (student.gender === 'ស' || student.gender === 'ស្រី' || (student.gender || '').toLowerCase() === 'f') ? 'ស្រី' : 'ប្រុស';
        const rankKh = toKhmerNum(student.calculatedRank);
        let badge = `លេខ ${rankKh}`;
        if (student.calculatedRank === 1) badge = `🥇 លេខ ${rankKh}`;
        else if (student.calculatedRank === 2) badge = `🥈 លេខ ${rankKh}`;
        else if (student.calculatedRank === 3) badge = `🥉 លេខ ${rankKh}`;
        else if (student.calculatedRank <= 5) badge = `🏆 លេខ ${rankKh}`;

        opt.textContent = `${badge}៖ ${student.name} (${g}) - ${student.id || ''}`;
        picker.appendChild(opt);
    });

    // Ensure selected value matches
    const match = filtered.find(item => item.originalIndex === currentStudentIndex);
    if (match) {
        picker.value = currentStudentIndex;
    } else if (filtered.length > 0) {
        currentStudentIndex = filtered[0].originalIndex;
        picker.value = currentStudentIndex;
        renderCurrentStudent();
    }
}

function setStudentFilter(mode) {
    currentStudentFilterMode = mode;
    ['all', 'top5', 'top10'].forEach(m => {
        const btn = document.getElementById(`filter-${m}-btn`);
        if (btn) {
            if (m === mode) {
                btn.style.background = '#fff';
                btn.style.color = '#0f172a';
                btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = '#64748b';
                btn.style.boxShadow = 'none';
            }
        }
    });
    populateStudentsDropdown();
}

function selectStudentByRank(rankNumber) {
    const rankMap = calculateStudentRankMap();
    
    let foundIdx = -1;
    for (let idx = 0; idx < currentStudentsList.length; idx++) {
        const s = currentStudentsList[idx];
        const idStr = (s.id || '').toString().trim();
        const nameStr = (s.name || '').toString().trim();
        const r = rankMap.get(idStr) || rankMap.get(nameStr) || (idx + 1);
        if (r === rankNumber) {
            foundIdx = idx;
            break;
        }
    }

    if (foundIdx === -1) {
        if (currentStudentsList[rankNumber - 1]) {
            foundIdx = rankNumber - 1;
        } else if (currentStudentsList.length > 0) {
            foundIdx = 0;
        }
    }

    if (foundIdx !== -1) {
        currentStudentIndex = foundIdx;
        const picker = document.getElementById('student-select');
        if (picker) picker.value = currentStudentIndex;
        renderCurrentStudent();
    }
}

// Load School and Teacher Info
function loadSchoolAndTeacherInfo() {
    let districtName = 'សន្ទុក';
    let schoolName = 'ផ្លុង';
    let teacherName = '';
    let gradeName = getActiveClassGrade();
    let academicYear = (window.classManager && typeof window.classManager.getCurrentAcademicYearName === 'function')
        ? window.classManager.getCurrentAcademicYearName()
        : (localStorage.getItem('academicYear') || localStorage.getItem('schoolYear') || '២០២៥ - ២០២៦');

    try {
        const schoolKey = window.getKey ? window.getKey('schoolRecords') : 'schoolRecords';
        let records = JSON.parse(localStorage.getItem(schoolKey)) || JSON.parse(localStorage.getItem('schoolRecords'));
        if (records) {
            let latest = Array.isArray(records) ? records[records.length - 1] : records;
            if (latest) {
                if (latest.districtOffice || latest.district) {
                    let d = (latest.districtOffice || latest.district).trim();
                    districtName = d.replace(/^ការិយាល័យអប់រំ\\s*យុវជន\\s*និងកីឡា\\s*/, '').trim();
                    if (!districtName.startsWith('ស្រុក') && !districtName.startsWith('ក្រុង') && !districtName.startsWith('ខណ្ឌ')) {
                        districtName = 'ស្រុក' + districtName;
                    }
                }
                if (latest.schoolName) {
                    schoolName = latest.schoolName.trim().replace(/^សាលាបឋមសិក្សា\\s*/, '').replace(/^បឋមសិក្សា\\s*/, '');
                }
            }
        }

        const teacherKey = window.getKey ? window.getKey('teacherProfiles') : 'teacherProfiles';
        let tRecords = JSON.parse(localStorage.getItem(teacherKey)) || JSON.parse(localStorage.getItem('teacherProfiles'));
        if (tRecords) {
            let mainTeacher = Array.isArray(tRecords) ? tRecords[0] : tRecords;
            if (mainTeacher) {
                teacherName = mainTeacher.name || '';
                if (mainTeacher.className) {
                    gradeName = mainTeacher.className.replace(/^ថ្នាក់ទី\\s*/, '').replace(/^ទី\\s*/, '').trim();
                }
            }
        }
    } catch (e) {
        console.warn('Error loading school/teacher records', e);
    }

    // Populate Headers
    const elDistrict = document.getElementById('cert-org-district');
    const elSchool = document.getElementById('cert-org-school');
    const elDirectorSchool = document.getElementById('cert-director-school-title');
    const elDisplaySchool = document.getElementById('cert-display-school');
    const elSigLoc = document.getElementById('cert-display-location');
    const elTeacherSig = document.getElementById('cert-teacher-signature-name');
    const elInputLoc = document.getElementById('cert-input-district-location');
    const elInputYear = document.getElementById('cert-input-academic-year');

    if (elDistrict) elDistrict.textContent = districtName;
    if (elSchool) elSchool.textContent = schoolName;
    if (elDirectorSchool) elDirectorSchool.textContent = schoolName;
    if (elDisplaySchool) elDisplaySchool.textContent = schoolName;
    if (elSigLoc) elSigLoc.textContent = schoolName;
    if (elInputLoc) elInputLoc.value = schoolName;
    if (elTeacherSig) elTeacherSig.textContent = teacherName;
    let directorName = '';
    try {
        if (typeof latest !== 'undefined' && latest) {
            directorName = latest.directorName || latest.principalName || '';
        }
    } catch(e) {}
    if (!directorName) {
        directorName = localStorage.getItem('directorName') || localStorage.getItem('principalName') || '';
    }
    const elDirectorSig = document.getElementById('cert-director-signature-name');
    if (elDirectorSig && directorName && !elDirectorSig.textContent.trim()) {
        elDirectorSig.textContent = directorName;
    }
    if (elInputYear) elInputYear.value = convertStringToKhmerDigits(academicYear);
}

// Initialize Dates
function initCurrentDateAndCalendar() {
    const today = new Date();
    const picker = document.getElementById('cert-date-picker');
    if (picker) {
        picker.value = today.toISOString().split('T')[0];
    }
    updateDatesFromDateObject(today);
}

function onCertDateChange(dateStr) {
    if (!dateStr) return;
    const d = new Date(dateStr);
    updateDatesFromDateObject(d);
}

function updateDatesFromDateObject(d) {
    const day = toKhmerNum(d.getDate().toString().padStart(2, '0'));
    const month = KHMER_MONTHS_NAMES[d.getMonth()];
    const year = toKhmerNum(d.getFullYear());

    const elDay = document.getElementById('cert-display-solar-day');
    const elMonth = document.getElementById('cert-display-solar-month');
    const elYear = document.getElementById('cert-display-solar-year');
    const elLunar = document.getElementById('cert-display-lunar-date');

    if (elDay) elDay.textContent = day;
    if (elMonth) elMonth.textContent = month;
    if (elYear) elYear.textContent = year;

    const lunarStr = calculateKhmerLunarDate(d);
    if (elLunar) elLunar.textContent = lunarStr;
}

// Parse Date of Birth into Khmer Day, Month, Year
function parseDobToKhmer(dobStr) {
    if (!dobStr) return { day: '.....', month: '..........', year: '២០....' };
    let d, m, y;
    if (dobStr.includes('-')) {
        const p = dobStr.split('-');
        y = p[0];
        m = parseInt(p[1], 10);
        d = parseInt(p[2], 10);
    } else if (dobStr.includes('/')) {
        const p = dobStr.split('/');
        if (p.length === 3) {
            d = parseInt(p[0], 10);
            m = parseInt(p[1], 10);
            y = p[2].length === 4 ? p[2] : '20' + p[2];
        }
    }

    if (!y || isNaN(m) || isNaN(d)) return { day: '.....', month: '..........', year: '២០....' };

    return {
        day: toKhmerNum(d.toString().padStart(2, '0')),
        month: KHMER_MONTHS_NAMES[m - 1] || '',
        year: toKhmerNum(y)
    };
}

// Compute rank for a student
function getStudentCalculatedRank(studentId, studentName) {
    const rankMap = calculateStudentRankMap();
    if (studentId && rankMap.has(studentId.toString().trim())) {
        return rankMap.get(studentId.toString().trim());
    }
    if (studentName && rankMap.has(studentName.trim())) {
        return rankMap.get(studentName.trim());
    }
    return 1;
}

// Render Current Student onto Certificate
function renderCurrentStudent() {
    if (currentStudentsList.length === 0) return;

    const student = currentStudentsList[currentStudentIndex] || currentStudentsList[0];
    if (!student) return;

    const picker = document.getElementById('student-select');
    if (picker) picker.value = currentStudentIndex;

    // 1. Name & Gender
    const elName = document.getElementById('cert-display-name');
    const elGender = document.getElementById('cert-display-gender');
    if (elName) elName.textContent = student.name || '';
    const isFem = (student.gender === 'ស' || student.gender === 'ស្រី' || (student.gender || '').toLowerCase() === 'f');
    if (elGender) elGender.textContent = isFem ? 'ស្រី' : 'ប្រុស';

    // 2. Date of Birth
    const dob = parseDobToKhmer(student.dob);
    const elDobDay = document.getElementById('cert-display-dob-day');
    const elDobMonth = document.getElementById('cert-display-dob-month');
    const elDobYear = document.getElementById('cert-display-dob-year');
    if (elDobDay) elDobDay.textContent = dob.day;
    if (elDobMonth) elDobMonth.textContent = dob.month;
    if (elDobYear) elDobYear.textContent = dob.year;

    // 3. Grade
    let rawGrade = student.grade || student.class || student.className || student.gradeLevel || getActiveClassGrade();
    let cleanGrade = formatGradeText(rawGrade);
    const elGrade = document.getElementById('cert-display-grade');
    const inputGrade = document.getElementById('cert-input-grade');
    if (elGrade) elGrade.textContent = cleanGrade;
    if (inputGrade) inputGrade.value = cleanGrade;

    // 4. Rank (Automatic Dynamic Rank based on evaluation period)
    const rankNum = getStudentCalculatedRank(student.id, student.name);
    const elRank = document.getElementById('cert-display-rank');
    const inputRank = document.getElementById('cert-input-rank');
    if (elRank) elRank.textContent = toKhmerNum(rankNum);
    if (inputRank) inputRank.value = toKhmerNum(rankNum);

    // 5. Period
    updatePeriodDisplay();

    // 6. Photo
    const photoImg = document.getElementById('cert-student-photo-img');
    const photoText = document.getElementById('photo-placeholder-text');
    if (student.photo || student.avatar) {
        if (photoImg) {
            photoImg.src = student.photo || student.avatar;
            photoImg.style.display = 'block';
        }
        if (photoText) photoText.style.display = 'none';
    } else {
        if (photoImg) {
            photoImg.src = '';
            photoImg.style.display = 'none';
        }
        if (photoText) photoText.style.display = 'block';
    }
}

function onStudentChange(idx) {
    currentStudentIndex = parseInt(idx, 10);
    renderCurrentStudent();
}

function onPeriodTypeChange() {
    const pType = document.getElementById('period-type-select').value;
    currentPeriodType = pType;
    const mGroup = document.getElementById('month-selector-group');
    if (mGroup) {
        mGroup.style.display = pType === 'monthly' ? 'block' : 'none';
    }
    updatePeriodDisplay();
    loadClassStudents();
    renderCurrentStudent();
}

function onMonthChange() {
    const mSelect = document.getElementById('month-select');
    if (mSelect) currentMonth = mSelect.value;
    updatePeriodDisplay();
    loadClassStudents();
    renderCurrentStudent();
}

function updatePeriodDisplay() {
    const elPeriod = document.getElementById('cert-display-period');
    const yearInput = document.getElementById('cert-input-academic-year');
    const yearStr = yearInput ? yearInput.value : '២០២៥-២០២៦';

    if (!elPeriod) return;

    if (currentPeriodType === 'annual') {
        elPeriod.textContent = `ឆ្នាំសិក្សា ${yearStr}`;
    } else if (currentPeriodType === 'semester1') {
        elPeriod.textContent = `ឆមាសទី១ ឆ្នាំសិក្សា ${yearStr}`;
    } else if (currentPeriodType === 'semester2') {
        elPeriod.textContent = `ឆមាសទី២ ឆ្នាំសិក្សា ${yearStr}`;
    } else if (currentPeriodType === 'monthly') {
        elPeriod.textContent = `ខែ${currentMonth} ឆ្នាំសិក្សា ${yearStr}`;
    }
}

function updateRankFromInput(val) {
    const elRank = document.getElementById('cert-display-rank');
    if (elRank) elRank.textContent = convertStringToKhmerDigits(val);
}

function updateAcademicYear(val) {
    updatePeriodDisplay();
}

function updateLocation(val) {
    const elSigLoc = document.getElementById('cert-display-location');
    if (elSigLoc) elSigLoc.textContent = val;
}

function togglePhotoBox(show) {
    showPhotoBox = show;
    const pBox = document.getElementById('cert-photo-container');
    if (pBox) pBox.style.display = show ? 'flex' : 'none';
}

function toggleHeaderLayout(is3Lines) {
    is3LineHeader = is3Lines;
    const hBox = document.getElementById('cert-header-hierarchy');
    const dist = document.getElementById('cert-org-district') ? document.getElementById('cert-org-district').textContent : 'ស្រុកសន្ទុក';
    const sch = document.getElementById('cert-org-school') ? document.getElementById('cert-org-school').textContent : 'ផ្លុង';

    if (!hBox) return;

    if (is3Lines) {
        hBox.innerHTML = `
            <div class="cert-header-logo-wrapper">
                <img src="images/moeys-logo.png" alt="MoEYS Emblem" class="cert-moeys-emblem">
            </div>
            <div class="org-line-1" id="header-line-1">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
            <div class="org-line-2" id="header-line-2">ការិយាល័យអប់រំ យុវជន និងកីឡា <span contenteditable="true" id="cert-org-district">${dist}</span></div>
            <div class="org-line-3" id="header-line-3">សាលាបឋមសិក្សា <span contenteditable="true" id="cert-org-school">${sch}</span></div>
        `;
    } else {
        hBox.innerHTML = `
            <div class="cert-header-logo-wrapper">
                <img src="images/moeys-logo.png" alt="MoEYS Emblem" class="cert-moeys-emblem">
            </div>
            <div class="org-line-1" id="header-line-1">ការិយាល័យអប់រំ យុវជន និងកីឡា <span contenteditable="true" id="cert-org-district">${dist}</span></div>
            <div class="org-line-2" id="header-line-2">សាលាបឋមសិក្សា <span contenteditable="true" id="cert-org-school">${sch}</span></div>
        `;
    }
}

// -------------------------------------------------------------
// CERTIFICATE BORDER THEMES (All Authentic Styles)
// -------------------------------------------------------------
const CERT_STYLES = {
    1: {
        name: 'ស៊ុមមាសបុរាណ (ទំព័រ ៩-១២)',
        borderImg: 'images/praise_frame_style_1.png',
        showBlueFrame: true,
        headerColor: '#0b3c75',
        titleColor: '#d32f2f',
        auto3Lines: false,
        autoPhotoBox: false
    },
    2: {
        name: 'ស៊ុមមាសផ្កាភ្ញី (Border 6)',
        borderImg: 'images/praise_frame_border6.png',
        showBlueFrame: false,
        headerColor: '#0b3c75',
        titleColor: '#d32f2f',
        auto3Lines: true,
        autoPhotoBox: true
    },
    3: {
        name: 'ខៀវផ្កាភ្ញី (ទំព័រ ៣-៤)',
        borderImg: 'images/praise_frame_style_3.png',
        showBlueFrame: false,
        headerColor: '#1e40af',
        titleColor: '#d32f2f',
        auto3Lines: false,
        autoPhotoBox: false
    },
    4: {
        name: 'មាស & ផ្កាខៀវ (ទំព័រ ៥-៦)',
        borderImg: 'images/praise_frame_style_4.png',
        showBlueFrame: false,
        headerColor: '#0b3c75',
        titleColor: '#d32f2f',
        auto3Lines: false,
        autoPhotoBox: false
    },
    5: {
        name: 'មាស & បៃតង (ទំព័រ ៧-៨)',
        borderImg: 'images/praise_frame_style_5.png',
        showBlueFrame: false,
        headerColor: '#166534',
        titleColor: '#d32f2f',
        auto3Lines: false,
        autoPhotoBox: false
    },
    7: {
        name: 'ខៀវបុរាណ (ទំព័រ ១៤)',
        borderImg: 'images/praise_frame_style_7.png',
        showBlueFrame: false,
        headerColor: '#0369a1',
        titleColor: '#d32f2f',
        auto3Lines: false,
        autoPhotoBox: false
    }
};

let currentBorderFilter = 'none';
let currentBodyFontSizePt = 11.5;
let currentTitleFontSizePt = 30;

function setBodyFontSize(val) {
    currentBodyFontSizePt = parseFloat(val);
    const disp = document.getElementById('display-body-font-size');
    const slider = document.getElementById('body-font-size-slider');
    if (disp) disp.textContent = currentBodyFontSizePt + ' pt';
    if (slider) slider.value = currentBodyFontSizePt;
    document.documentElement.style.setProperty('--cert-body-size', currentBodyFontSizePt + 'pt');
}

function adjustBodyFontSize(delta) {
    let newVal = Math.min(16, Math.max(8, currentBodyFontSizePt + delta));
    setBodyFontSize(newVal);
}

function setTitleFontSize(val) {
    currentTitleFontSizePt = parseFloat(val);
    const disp = document.getElementById('display-title-font-size');
    const slider = document.getElementById('title-font-size-slider');
    if (disp) disp.textContent = currentTitleFontSizePt + ' pt';
    if (slider) slider.value = currentTitleFontSizePt;
    document.documentElement.style.setProperty('--cert-title-size', currentTitleFontSizePt + 'pt');
}

function adjustTitleFontSize(delta) {
    let newVal = Math.min(45, Math.max(18, currentTitleFontSizePt + delta));
    setTitleFontSize(newVal);
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function computeCssFilterForColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 'none';
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Grayscale (black, grey, white)
    if (hsl.s < 12) {
        const b = Math.max(0.3, Math.min(1.5, hsl.l / 45));
        return `grayscale(100%) brightness(${b.toFixed(2)}) contrast(115%)`;
    }

    // Base frame has natural gold/amber hue (~38 deg)
    const baseHue = 38;
    let hueDiff = (hsl.h - baseHue + 360) % 360;
    let sat = Math.max(90, Math.min(260, Math.round(hsl.s * 1.55)));
    let bright = Math.max(0.55, Math.min(1.4, (hsl.l / 48))).toFixed(2);

    return `hue-rotate(${hueDiff}deg) saturate(${sat}%) brightness(${bright})`;
}

let currentCustomBorderColor = 'original';

function applyCustomBorderColor(hexColor) {
    currentCustomBorderColor = hexColor;
    const picker = document.getElementById('cert-border-color-picker');
    const hexDisplay = document.getElementById('color-hex-display');
    if (picker) picker.value = hexColor;
    if (hexDisplay) hexDisplay.textContent = hexColor.toUpperCase();

    // Compute universal, ultra-sharp GPU-accelerated CSS filter
    const filterVal = computeCssFilterForColor(hexColor);
    currentBorderFilter = filterVal;

    document.documentElement.style.setProperty('--cert-border-filter', filterVal);

    const borderImg = document.getElementById('cert-border-img');
    if (borderImg) {
        borderImg.style.filter = filterVal;
    }

    // Harmonize inner SVG blue frame stroke
    const blueFramePaths = document.querySelectorAll('#cert-inner-blue-frame path');
    blueFramePaths.forEach(p => p.setAttribute('stroke', hexColor));
}

function onCustomColorPick(hex) {
    applyCustomBorderColor(hex);
}

function resetBorderColor() {
    currentCustomBorderColor = 'original';
    currentBorderFilter = 'none';
    document.documentElement.style.setProperty('--cert-border-filter', 'none');
    
    const borderImg = document.getElementById('cert-border-img');
    if (borderImg) {
        borderImg.style.filter = 'none';
    }

    const picker = document.getElementById('cert-border-color-picker');
    const hexDisplay = document.getElementById('color-hex-display');
    if (picker) picker.value = '#c59b27';
    if (hexDisplay) hexDisplay.textContent = 'គំរូដើម';

    const blueFramePaths = document.querySelectorAll('#cert-inner-blue-frame path');
    blueFramePaths.forEach(p => p.setAttribute('stroke', '#003366'));
}

function applyBorderFilter(filterVal) {
    currentBorderFilter = filterVal;
    document.documentElement.style.setProperty('--cert-border-filter', filterVal);
    const borderImg = document.getElementById('cert-border-img');
    if (borderImg) {
        borderImg.style.filter = filterVal;
    }
}

function setCertStyle(styleNum, cardElem) {
    currentCertStyle = styleNum;

    // Update active UI cards
    if (cardElem) {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        cardElem.classList.add('active');
    }

    const cfg = CERT_STYLES[styleNum] || CERT_STYLES[1];
    const borderImg = document.getElementById('cert-border-img');
    const blueFrame = document.getElementById('cert-inner-blue-frame');
    const svg = document.getElementById('svg-border');
    const kingdomTitle = document.querySelector('.cert-kingdom-title');
    const mottoTitle = document.querySelector('.cert-motto-title');

    if (borderImg) {
        borderImg.src = cfg.borderImg;
        borderImg.style.display = 'block';
        borderImg.style.filter = currentBorderFilter;
    }
    if (blueFrame) {
        blueFrame.style.display = cfg.showBlueFrame ? 'block' : 'none';
    }
    if (svg) {
        svg.style.display = 'none';
    }
    if (kingdomTitle) kingdomTitle.style.color = cfg.headerColor;
    if (mottoTitle) mottoTitle.style.color = cfg.headerColor;

    if (cfg.auto3Lines !== undefined) {
        const toggle3Lines = document.getElementById('toggle-header-3lines');
        if (toggle3Lines) {
            toggle3Lines.checked = cfg.auto3Lines;
            toggleHeaderLayout(cfg.auto3Lines);
        }
    }

    if (cfg.autoPhotoBox !== undefined) {
        const togglePhoto = document.getElementById('toggle-photo-box');
        if (togglePhoto) {
            togglePhoto.checked = cfg.autoPhotoBox;
            togglePhotoBox(cfg.autoPhotoBox);
        }
    }
}
// Photo Upload Handling
function triggerPhotoUpload() {
    const input = document.getElementById('cert-photo-input');
    if (input) input.click();
}

function handlePhotoUploaded(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const photoImg = document.getElementById('cert-student-photo-img');
        const photoText = document.getElementById('photo-placeholder-text');
        if (photoImg) {
            photoImg.src = evt.target.result;
            photoImg.style.display = 'block';
        }
        if (photoText) photoText.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Reset Template to Defaults
async function resetCertificateTemplate() {
    const ok = typeof confirmDialog === 'function' 
        ? await confirmDialog({ type: 'warning', message: 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យដើមឡើងវិញមែនទេ?' })
        : confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យដើមឡើងវិញមែនទេ?');
    if (ok) {
        if (typeof resetBorderColor === 'function') resetBorderColor();
        if (typeof setBodyFontSize === 'function') setBodyFontSize(11.5);
        if (typeof setTitleFontSize === 'function') setTitleFontSize(30);
        loadSchoolAndTeacherInfo();
        initCurrentDateAndCalendar();
        renderCurrentStudent();
        const firstCard = document.querySelector('.theme-card');
        if (typeof setCertStyle === 'function') setCertStyle(1, firstCard);
    }
}

// Export Certificate as PNG Image
function exportAsImage() {
    const certEl = document.getElementById('single-cert-page');
    if (!certEl || typeof html2canvas === 'undefined') {
        alert('សូមរង់ចាំ ឬប្រើមុខងារ Print');
        return;
    }

    const studentName = document.getElementById('cert-display-name').textContent || 'certificate';
    
    html2canvas(certEl, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ប័ណ្ណសរសើរ_${studentName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Image export error', err);
        alert('មានបញ្ហាក្នុងការទាញយកជារូបភាព');
    });
}

// Print Single Certificate
function printSingleCertificate() {
    window.print();
}

// -------------------------------------------------------------
// BATCH PRINTING ENGINE (បោះពុម្ពបណ្ណសរសើរជាក្រុម)
// -------------------------------------------------------------
function openBatchModal() {
    const modal = document.getElementById('batch-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    populateBatchChecklist();
}

function closeBatchModal() {
    const modal = document.getElementById('batch-modal');
    if (modal) modal.style.display = 'none';
}

function populateBatchChecklist() {
    const container = document.getElementById('batch-students-checklist');
    if (!container) return;
    container.innerHTML = '';

    if (currentStudentsList.length === 0) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.9rem; text-align: center; padding: 10px;">គ្មានទិន្នន័យសិស្ស</div>';
        return;
    }

    currentStudentsList.forEach((student, idx) => {
        const rank = getStudentCalculatedRank(student.id, student.name);
        const g = (student.gender === 'ស' || student.gender === 'ស្រី') ? 'ស្រី' : 'ប្រុស';

        const row = document.createElement('label');
        row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer; font-size: 0.88rem;';
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="batch-student-checkbox" value="${idx}" checked onchange="updateBatchCount()">
                <span><strong>${idx + 1}. ${student.name}</strong> (${g})</span>
            </div>
            <span style="color: #d97706; font-weight: bold; background: #fef3c7; padding: 2px 8px; border-radius: 12px; font-size: 0.78rem;">លេខ ${toKhmerNum(rank)}</span>
        `;
        container.appendChild(row);
    });

    updateBatchCount();
}

function updateBatchCount() {
    const checkboxes = document.querySelectorAll('.batch-student-checkbox:checked');
    const countEl = document.getElementById('batch-selected-count');
    if (countEl) countEl.textContent = checkboxes.length;
}

function selectBatchRange(range) {
    const checkboxes = document.querySelectorAll('.batch-student-checkbox');
    checkboxes.forEach(cb => {
        const idx = parseInt(cb.value, 10);
        const student = currentStudentsList[idx];
        if (!student) return;
        const rank = getStudentCalculatedRank(student.id, student.name);

        if (range === 'top5') {
            cb.checked = (rank <= 5);
        } else if (range === 'top10') {
            cb.checked = (rank <= 10);
        } else {
            cb.checked = true;
        }
    });
    updateBatchCount();
}

function toggleSelectAllBatch(select) {
    const checkboxes = document.querySelectorAll('.batch-student-checkbox');
    checkboxes.forEach(cb => cb.checked = select);
    updateBatchCount();
}

// Execute Batch Print (Generates multi-page A4 Landscape certificate stack)
function executeBatchPrint() {
    const selectedCheckboxes = document.querySelectorAll('.batch-student-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីបោះពុម្ព');
        return;
    }

    const printContainer = document.getElementById('print-container');
    if (!printContainer) return;

    // Get current template state
    const districtText = document.getElementById('cert-org-district').textContent;
    const schoolText = document.getElementById('cert-org-school').textContent;
    const directorSchool = document.getElementById('cert-director-school-title').textContent;
    const displaySchool = document.getElementById('cert-display-school').textContent;
    const periodText = document.getElementById('cert-display-period').textContent;
    const directorRole = document.getElementById('cert-director-role-label')?.textContent || 'នាយកសាលា';
    const teacherRole = document.getElementById('cert-teacher-role-label')?.textContent || '';
    const lunarDate = document.getElementById('cert-display-lunar-date').textContent;
    const sigLocation = document.getElementById('cert-display-location').textContent;
    const solarDay = document.getElementById('cert-display-solar-day').textContent;
    const solarMonth = document.getElementById('cert-display-solar-month').textContent;
    const solarYear = document.getElementById('cert-display-solar-year').textContent;
    const teacherSigName = document.getElementById('cert-teacher-signature-name')?.textContent || '';
    const directorSigName = document.getElementById('cert-director-signature-name')?.textContent || '';
    const borderSvgHtml = document.getElementById('svg-border').innerHTML;

    // Build pages
    let allPagesHtml = '';
    const cfg = CERT_STYLES[currentCertStyle] || CERT_STYLES[1];

    selectedCheckboxes.forEach(cb => {
        const sIdx = parseInt(cb.value, 10);
        const student = currentStudentsList[sIdx];
        if (!student) return;

        const isFem = (student.gender === 'ស' || student.gender === 'ស្រី' || (student.gender || '').toLowerCase() === 'f');
        const gText = isFem ? 'ស្រី' : 'ប្រុស';
        const dob = parseDobToKhmer(student.dob);
        let rawGrade = student.grade || student.class || student.className || student.gradeLevel || getActiveClassGrade();
        let cleanGrade = formatGradeText(rawGrade);
        const rank = getStudentCalculatedRank(student.id, student.name);

        allPagesHtml += `
            <div class="cert-page-wrapper" style="--cert-body-size: ${currentBodyFontSizePt}pt; --cert-title-size: ${currentTitleFontSizePt}pt; --cert-border-filter: ${currentBorderFilter};">
                <img src="${cfg.borderImg}" class="cert-border-frame-img" style="filter: ${currentBorderFilter};" alt="Official Frame">
                ${cfg.showBlueFrame ? `
                    <svg width="100%" height="100%" viewBox="0 0 1060 740" preserveAspectRatio="none" style="position: absolute; inset: 0; pointer-events: none; z-index: 8;">
                        <path d="M 94 88 L 966 88 L 966 652 L 575 652 Q 575 618 530 618 Q 485 618 485 652 L 94 652 Z" fill="none" stroke="#003366" stroke-width="2.5" />
                        <path d="M 98 92 L 962 92 L 962 648 L 573 648 Q 573 622 530 622 Q 487 622 487 648 L 98 648 Z" fill="none" stroke="#003366" stroke-width="1.2" />
                    </svg>
                ` : ''}
                <div class="cert-watermark"></div>
                <div class="cert-inner-content">
                    <div class="cert-header-row">
                        <div class="cert-header-left">
                            <div class="cert-header-logo-wrapper">
                                <img src="images/moeys-logo.png" alt="MoEYS Emblem" class="cert-moeys-emblem">
                            </div>
                            ${is3LineHeader ? `
                                <div class="org-line-1">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                                <div class="org-line-2">ការិយាល័យអប់រំ យុវជន និងកីឡា ${districtText}</div>
                                <div class="org-line-3">សាលាបឋមសិក្សា ${schoolText}</div>
                            ` : `
                                <div class="org-line-1">ការិយាល័យអប់រំ យុវជន និងកីឡា ${districtText}</div>
                                <div class="org-line-2">សាលាបឋមសិក្សា ${schoolText}</div>
                            `}
                        </div>
                        <div class="cert-header-right">
                            <div class="cert-kingdom-title" style="color: ${cfg.headerColor};">ព្រះរាជាណាចក្រកម្ពុជា</div>
                            <div class="cert-motto-title" style="color: ${cfg.headerColor};">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                            <div class="cert-header-divider">
                                <img src="images/header-divider.png" alt="Tactical Divider" style="height: 12px; max-width: 140px;" onerror="this.outerHTML='<span class=\\\'divider-tactical-khmer\\\'>៚៚៚ ៚ ៚៚៚</span>'">
                            </div>
                        </div>
                    </div>

                    <div class="cert-title-area">
                        <h1 class="cert-main-title">ប័ណ្ណសរសើរ</h1>
                        <div class="cert-flower-flourish">
                            <span>✿</span>
                            <span>✿</span>
                            <span>✿</span>
                            <span>✿</span>
                            <span>✿</span>
                        </div>
                        <div class="cert-issuer-title">
                            <span>នាយកសាលាបឋមសិក្សា</span> <span class="dot-underline">${directorSchool}</span>
                        </div>
                    </div>

                    <div class="cert-body-content">
                        <p class="cert-body-p">
                            សូមសរសើរចំពោះសិស្សឈ្មោះ <span class="highlight-bold-moul">${student.name || ''}</span>
                            ភេទ <span class="highlight-red">${gText}</span>
                            កើតនៅថ្ងៃទី<span class="highlight-red">${dob.day}</span>
                            ខែ<span class="highlight-red">${dob.month}</span>
                            ឆ្នាំ<span class="highlight-red">${dob.year}</span>
                            រៀនថ្នាក់ទី<span class="highlight-red">${cleanGrade}</span>
                            នៃសាលាបឋមសិក្សា <span class="highlight-red">${displaySchool}</span>
                        </p>
                        <p class="cert-body-p">
                            ដែលបានខិតខំរៀនសូត្ររហូតទទួលបានលទ្ធផលល្អក្នុងការសិក្សា និងទទួលបានចំណាត់ថ្នាក់លេខ <span class="highlight-bold-moul">${toKhmerNum(rank)}</span>
                            ប្រចាំ<span class="highlight-bold-moul">${periodText}</span> ។
                        </p>
                        <p class="cert-body-p-final">
                            ប័ណ្ណសរសើរនេះប្រគល់ជូនសាមីខ្លួនប្រើប្រាស់តាមការដែលអាចប្រើបាន។
                        </p>
                    </div>

                    <div class="cert-signatures-row" style="justify-content: flex-end;">
                        ${showPhotoBox ? `
                            <div class="cert-photo-wrapper">
                                <div class="photo-frame-box">
                                    ${(student.photo || student.avatar) ? `<img src="${student.photo || student.avatar}" alt="">` : `<span>៤×៦</span>`}
                                </div>
                            </div>
                        ` : ''}

                        <div class="cert-sig-box cert-sig-right">
                            <div class="lunar-date">${lunarDate}</div>
                            <div class="solar-date">
                                <span class="dot-underline">${sigLocation}</span> ត្រូវនឹងថ្ងៃទី${solarDay} ខែ${solarMonth} ឆ្នាំ${solarYear}
                            </div>
                            <div class="cert-role-label">${directorRole}</div>
                            <div class="sig-empty-space"></div>
                            <div class="cert-name-line">${directorSigName}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    closeBatchModal();

    // Temporarily replace print container content and print
    const originalContent = printContainer.innerHTML;
    printContainer.innerHTML = allPagesHtml;

    setTimeout(() => {
        window.print();
        // Restore after print
        printContainer.innerHTML = originalContent;
        // Re-bind style & student
        setCertStyle(currentCertStyle);
        renderCurrentStudent();
    }, 250);
}


