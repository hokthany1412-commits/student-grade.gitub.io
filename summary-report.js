// summary-report.js - Student Statistics & Summary Report

document.addEventListener('DOMContentLoaded', () => {
    // Setup Active Class Indicator and Academic Year Display
    updateActiveClassLabel();
    updateAcademicYearDisplay();

    // Load and Initialize Data
    initStudentStatistics();
    initSubjectReport();

    // Listen for input changes in form to auto-save
    const formPaper = document.getElementById('printable-statistics-form');
    if (formPaper) {
        formPaper.addEventListener('input', debounce(saveStatisticsData, 500));
    }
});

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateActiveClassLabel() {
    const indicator = document.getElementById('active-class-indicator');
    if (indicator && window.classManager) {
        const activeClass = window.classManager.getActiveClass();
        indicator.textContent = activeClass.name;
    }
    const classInput = document.getElementById('stat-class-name');
    if (classInput && window.classManager) {
        const activeClass = window.classManager.getActiveClass();
        if (!classInput.value || classInput.value === 'ថ្នាក់ទី ៥ ក') {
            classInput.value = activeClass.name;
        }
    }
}

// Helper: Convert Khmer numerals to English
function toArabicDigits(str) {
    if (!str) return '';
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return str.toString().replace(/[០-៩]/g, d => {
        const idx = khmerDigits.indexOf(d);
        return idx !== -1 ? String(idx) : d;
    });
}

// Helper: Convert English numerals to Khmer
function toKhmerDigits(num) {
    if (num === null || num === undefined) return '';
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return num.toString().replace(/[0-9]/g, d => khmerDigits[parseInt(d, 10)] || d);
}

// Extract grade number (1 to 6) from class name e.g. "ថ្នាក់ទី ៥ ក" -> 5
function getGradeNumber(className) {
    if (!className) return 5;
    const s = toArabicDigits(className);
    const m = s.match(/(?:ថ្នាក់ទី|ទី)?s*([1-6])/);
    if (m) return parseInt(m[1], 10);
    return 5;
}

// Determine active academic year start number (e.g. 2026 from "២០២៦ - ២០២៧" or "ay_2026_2027")
function getActiveAcademicYearStartNumber() {
    let yearName = '';
    if (window.classManager && typeof window.classManager.getActiveAcademicYear === 'function') {
        const y = window.classManager.getActiveAcademicYear();
        if (y && y.name) yearName = y.name;
        else if (y && y.id) yearName = y.id;
    }
    if (!yearName) {
        yearName = localStorage.getItem('activeAcademicYearId') ||
                   localStorage.getItem('schoolYear') ||
                   localStorage.getItem('academicYear') ||
                   localStorage.getItem('currentAcademicYear') || '';
    }
    const s = toArabicDigits(yearName);
    const m = s.match(/\b(20\d\d)\b/);
    if (m) {
        return parseInt(m[1], 10);
    }
    return new Date().getFullYear();
}

// Determine reference cutoff date (MoEYS standard is 01 November of academic year)
function getCutoffDateInfo() {
    const defaultYear = getActiveAcademicYearStartNumber();
    const asOfInput = document.getElementById('stat-asof-date');
    if (asOfInput && asOfInput.value) {
        const parsed = parseStudentDOB(asOfInput.value);
        if (parsed && parsed.year > 2000 && parsed.year < 2100) {
            return { year: parsed.year, month: parsed.month || 11, day: parsed.day || 1 };
        }
    }
    return { year: defaultYear, month: 11, day: 1 };
}

// Update header and labels dynamically based on active academic year
function updateAcademicYearDisplay() {
    const activeYear = window.classManager ? window.classManager.getActiveAcademicYear() : null;
    const yrName = activeYear ? activeYear.name : '២០២៦ - ២០២៧';
    const cleanYr = yrName.replace(/\s+/g, '').replace('-', '_');

    // Header Title
    const titleEl = document.getElementById('stat-academic-year-title') || document.querySelector('.form-academic-year');
    if (titleEl) {
        titleEl.textContent = `ឆ្នាំសិក្សា ${cleanYr}`;
    }

    // Section 2 Subtitle
    const subLabel = document.getElementById('stat-academic-year-sub');
    if (subLabel) {
        subLabel.textContent = cleanYr;
    } else {
        const subSp = document.querySelector('.section-subtitle-kh span');
        if (subSp) subSp.textContent = `ក្នុងឆ្នាំសិក្សា${cleanYr} ចំនួនសិស្សរាប់ត្រឹមថ្ងៃទី`;
    }

    // Default cutoff as-of date
    const refYear = getActiveAcademicYearStartNumber();
    const refYearKhmer = toKhmerDigits(refYear);
    const asOfInput = document.getElementById('stat-asof-date');
    if (asOfInput) {
        if (!asOfInput.value || asOfInput.value.includes('២០២៥')) {
            asOfInput.value = `០១ វិច្ឆិកា ${refYearKhmer}`;
        }
    }

    // Created date
    const createdDateInput = document.getElementById('stat-created-date');
    if (createdDateInput) {
        if (!createdDateInput.value || createdDateInput.value.includes('២០២៥')) {
            createdDateInput.value = `០១ វិច្ឆិកា ${refYearKhmer}`;
        }
    }
}

// Robust Student DOB Parser: handles DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD, ISO, Khmer numerals, Year-only
function parseStudentDOB(dobStr) {
    if (!dobStr) return null;
    if (dobStr instanceof Date && !isNaN(dobStr.getTime())) {
        return {
            year: dobStr.getFullYear(),
            month: dobStr.getMonth() + 1,
            day: dobStr.getDate()
        };
    }
    let s = toArabicDigits(dobStr).trim();
    if (!s) return null;

    // Strip time portion if present
    s = s.split('T')[0].trim();

    // 1. YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (m) {
        const y = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        const d = parseInt(m[3], 10);
        if (y > 1900 && y < 2100 && mon >= 1 && mon <= 12 && d >= 1 && d <= 31) {
            return { year: y, month: mon, day: d };
        }
    }

    // 2. DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
    m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        const y = parseInt(m[3], 10);
        if (y > 1900 && y < 2100 && mon >= 1 && mon <= 12 && d >= 1 && d <= 31) {
            return { year: y, month: mon, day: d };
        }
    }

    // 3. Year only (e.g. "2016" or "២០១៦")
    m = s.match(/\b(19\d\d|20\d\d)\b/);
    if (m) {
        return { year: parseInt(m[1], 10), month: 1, day: 1 };
    }

    // 4. Fallback Date.parse
    const dObj = new Date(s);
    if (!isNaN(dObj.getTime()) && dObj.getFullYear() > 1900 && dObj.getFullYear() < 2100) {
        return {
            year: dObj.getFullYear(),
            month: dObj.getMonth() + 1,
            day: dObj.getDate()
        };
    }

    return null;
}

// Compute Numeric Age accurate to the official MoEYS cutoff date (default: 01 Nov of active academic year)
function getNumericAge(dobString, cutoffInfo = null, defaultGradeAge = 10) {
    if (!dobString) return defaultGradeAge;
    const dob = parseStudentDOB(dobString);
    if (!dob) return defaultGradeAge;

    const cutoff = cutoffInfo || getCutoffDateInfo();
    let age = cutoff.year - dob.year;
    if (dob.month > cutoff.month || (dob.month === cutoff.month && dob.day > cutoff.day)) {
        age--;
    }
    if (age < 0 || age > 90) return defaultGradeAge;
    return age;
}

// Exact Disadvantaged & Difficulty Categories matching the Ministry form
const DIFFICULTY_ITEMS = [
    { id: 'diff_see', name: 'ពិបាកក្នុងការមើលឃើញ' },
    { id: 'diff_hear', name: 'ពិបាកក្នុងការស្តាប់' },
    { id: 'diff_speak', name: 'ពិបាកក្នុងការនិយាយ' },
    { id: 'diff_walk', name: 'ពិបាកក្នុងការដើរ' },
    { id: 'diff_memory', name: 'ពិការសតិបញ្ញាខាងចងចាំ' },
    { id: 'diff_intellect', name: 'ពិការសតិបញ្ញា' },
    { id: 'diff_mental', name: 'ពិបាកខាងផ្លូវចិត្ត' },
    { id: 'diff_multiple', name: 'ពិការភាពច្រើន (ក្រៅពី ៧ខាងលើ)' },
    { id: 'diff_nutrition', name: 'ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ' },
    { id: 'diff_health1', name: 'សុខភាព/ជំងឺប្រចាំកាយ' },
    { id: 'diff_migrant', name: 'មកពីគ្រួសារផ្លាស់ប្តូរទីលំនៅ' },
    { id: 'diff_orphan', name: 'កុមារកំព្រា' },
    { id: 'diff_hiv', name: 'កុមាររងគ្រោះដោយ HIV/AIDS' },
    { id: 'diff_violence', name: 'កុមាររងអំពើហិង្សាក្នុងគ្រួសារ' },
    { id: 'diff_exploit', name: 'កុមាររងការកេងប្រវ័ញ្ចកម្លាំង' },
    { id: 'diff_poor', name: 'កុមារដែលមកពីគ្រួសារក្រីក្រ' }
];

// Exact Age Categories matching the Ministry form (6 to 15+)
const AGE_CATEGORIES = [
    '6', '7', '8', '9', '10', '11', '12', '13', '14', '15+'
];

function isFemale(student) {
    const g = (student.gender || '').trim();
    return g === 'ស្រី' || g === 'ស' || g.toLowerCase() === 'f' || g.toLowerCase() === 'female';
}

function isRepeater(student) {
    const s = (student.status || '').trim();
    return s === 'សិស្សចាស់ (ត្រួតថ្នាក់)' || s === 'ត្រួតថ្នាក់' || s === 'សិស្សចាស់';
}

// -------------------------------------------------------------
// INITIALIZATION & AUTO-CALCULATION OF STUDENT STATISTICS
// -------------------------------------------------------------
function initStudentStatistics() {
    updateAcademicYearDisplay();
    updateActiveClassLabel();

    const storageKey = window.getKey ? window.getKey('classStudentStats') : 'classStudentStats';
    const savedData = JSON.parse(localStorage.getItem(storageKey));
    const studentProfiles = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData')) || [];

    // Verify if savedData has valid non-empty ageStats matching roster
    let isValidSavedStats = false;
    if (savedData && savedData.ageStats) {
        let totalCounted = 0;
        Object.keys(savedData.ageStats).forEach(k => {
            const row = savedData.ageStats[k];
            totalCounted += (Number(row.newTot) || 0) + (Number(row.repTot) || 0);
        });
        // Check if total matches studentProfiles count (or is non-zero when profiles exist)
        if (studentProfiles.length === 0) {
            isValidSavedStats = true;
        } else if (totalCounted > 0 && Math.abs(totalCounted - studentProfiles.length) <= 2) {
            isValidSavedStats = true;
        }
    }

    if (savedData && isValidSavedStats) {
        populateFormFromData(savedData);
    } else {
        recalculateFromRoster(false); // compute fresh without alert
    }
}

// Recalculate directly from student roster & school/teacher databases across all classes
window.recalculateFromRoster = function(showAlert = true) {
    updateAcademicYearDisplay();
    updateActiveClassLabel();

    const studentProfiles = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData')) || [];
    const teacherProfiles = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('teacherProfiles') : 'teacherProfiles')) || [];
    const activeClass = window.classManager ? window.classManager.getActiveClass() : { id: 'default', name: 'ថ្នាក់ទី ៥ ក' };
    
    const gradeNum = getGradeNumber(activeClass.name);
    const defaultGradeAge = (gradeNum >= 1 && gradeNum <= 6) ? (gradeNum + 5) : 10;
    const cutoff = getCutoffDateInfo();

    // 1. Pre-fill Teacher & School info
    let teacher = teacherProfiles.find(t => t.className && (t.className === activeClass.name || t.className.includes(String(gradeNum)))) || teacherProfiles[0] || {};
    if (teacher.name) {
        document.getElementById('stat-teacher-name').value = teacher.name;
    }
    if (teacher.gender) {
        toggleTeacherGender(teacher.gender === 'ស' || teacher.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស');
    }
    if (teacher.dob) {
        const tAge = getNumericAge(teacher.dob, cutoff, 35);
        if (tAge > 0) document.getElementById('stat-teacher-age').value = tAge;
    }

    // Set class name on form
    const classNameInput = document.getElementById('stat-class-name');
    if (classNameInput) {
        classNameInput.value = activeClass.name;
    }

    // 2. Compute Age Breakdown
    const ageStats = {};
    AGE_CATEGORIES.forEach(cat => {
        ageStats[cat] = { newTot: 0, newFem: 0, repTot: 0, repFem: 0 };
    });

    let ind_6_11_tot = 0, ind_6_11_fem = 0;
    let ind_12_tot = 0, ind_12_fem = 0;

    let ec_gov_new_tot = 0, ec_gov_new_fem = 0, ec_gov_rep_tot = 0, ec_gov_rep_fem = 0;
    let ec_pvt_new_tot = 0, ec_pvt_new_fem = 0, ec_pvt_rep_tot = 0, ec_pvt_rep_fem = 0;
    let ec_com_new_tot = 0, ec_com_new_fem = 0, ec_com_rep_tot = 0, ec_com_rep_fem = 0;
    let ec_oth_new_tot = 0, ec_oth_new_fem = 0, ec_oth_rep_tot = 0, ec_oth_rep_fem = 0;

    const diffCounts = {};
    DIFFICULTY_ITEMS.forEach(item => {
        diffCounts[item.id] = { tot: 0, fem: 0 };
    });

    let healthSupportTot = 0, healthSupportFem = 0;
    let disabilitySupportTot = 0, disabilitySupportFem = 0;

    studentProfiles.forEach(student => {
        const female = isFemale(student);
        const repeater = isRepeater(student);
        const age = getNumericAge(student.dob, cutoff, defaultGradeAge);

        // Map to standard age key (6, 7, 8, 9, 10, 11, 12, 13, 14, 15+)
        let ageKey = '6';
        if (age <= 6) {
            // In MoEYS standard, Grade 1 has no repeaters at age 6; repeaters who are <=6 map to 7
            ageKey = repeater ? '7' : '6';
        } else if (age >= 15) {
            ageKey = '15+';
        } else if (age >= 7 && age <= 14) {
            ageKey = age.toString();
        }

        if (ageStats[ageKey]) {
            if (repeater) {
                ageStats[ageKey].repTot++;
                if (female) ageStats[ageKey].repFem++;
            } else {
                ageStats[ageKey].newTot++;
                if (female) ageStats[ageKey].newFem++;
            }
        }

        // Indigenous Minority Check
        const isInd = student.isIndigenous || student.indigenous === true || student.indigenous === 'ពិតមែន';
        if (isInd) {
            if (age >= 6 && age <= 11) {
                ind_6_11_tot++;
                if (female) ind_6_11_fem++;
            } else if (age >= 12) {
                ind_12_tot++;
                if (female) ind_12_fem++;
            }
        }

        // Early childhood (for Grade 1)
        const ecType = student.earlyChildhoodType || student.earlyChildhood || '';
        if (ecType === 'មត្តេយ្យរដ្ឋ' || student.earlyChildhoodProgram === 'មត្តេយ្យរដ្ឋ' || (student.earlyChildhood === 'បានឆ្លងកាត់' && !student.earlyChildhoodType)) {
            if (repeater) { ec_gov_rep_tot++; if (female) ec_gov_rep_fem++; }
            else { ec_gov_new_tot++; if (female) ec_gov_new_fem++; }
        } else if (ecType === 'មត្តេយ្យឯកជន') {
            if (repeater) { ec_pvt_rep_tot++; if (female) ec_pvt_rep_fem++; }
            else { ec_pvt_new_tot++; if (female) ec_pvt_new_fem++; }
        } else if (ecType === 'មត្តេយ្យសហគមន៍') {
            if (repeater) { ec_com_rep_tot++; if (female) ec_com_rep_fem++; }
            else { ec_com_new_tot++; if (female) ec_com_new_fem++; }
        } else if (ecType === 'ការអប់រំតាមផ្ទះ' || ecType === 'ផ្សេងៗ' || ecType === 'ការអប់រំតាមផ្ទះ/តាមវត្ត/ផ្សេងៗ') {
            if (repeater) { ec_oth_rep_tot++; if (female) ec_oth_rep_fem++; }
            else { ec_oth_new_tot++; if (female) ec_oth_new_fem++; }
        }

        // Difficulties / Disabilities
        let diffKeys = [];
        if (Array.isArray(student.difficulty)) {
            diffKeys = [...student.difficulty];
        } else if (typeof student.difficulty === 'string' && student.difficulty.trim() !== '') {
            diffKeys = student.difficulty.split(',').map(s => s.trim()).filter(Boolean);
        }

        // Auto check orphan status
        if (!diffKeys.includes('diff_orphan') && student.orphanStatus && student.orphanStatus !== 'មិនកំព្រា' && student.orphanStatus !== 'ទេ') {
            diffKeys.push('diff_orphan');
        }

        // Auto check poor / equity status
        const hasEquityCard = student.equityCard && student.equityCard !== 'គ្មាន' && student.equityCard !== '-' && student.equityCard.trim() !== '';
        if (!diffKeys.includes('diff_poor') && (hasEquityCard || student.isPoor === true || student.isPoor === 'ពិតមែន' || (student.poorCard && student.poorCard !== 'គ្មាន') || student.equityCardNumber || student.equityCardLevel)) {
            diffKeys.push('diff_poor');
        }

        // Auto map old difficulty keys if present
        diffKeys.forEach(diffKey => {
            let mappedKey = diffKey;
            if (diffKey === 'diff_move' || diffKey === 'diff_walk') mappedKey = 'diff_walk';
            if (diffKey === 'diff_learn') mappedKey = 'diff_intellect';
            if (diffKey === 'diff_disabled_total') mappedKey = 'diff_multiple';

            if (diffCounts[mappedKey]) {
                diffCounts[mappedKey].tot++;
                if (female) diffCounts[mappedKey].fem++;
            }
        });

        // Health & Disability supports
        if (student.hasHealthSupport || student.healthSupport) {
            healthSupportTot++;
            if (female) healthSupportFem++;
        }
        if (student.hasDisabilitySupport || student.disabilitySupport || student.assistiveDevice) {
            disabilitySupportTot++;
            if (female) disabilitySupportFem++;
        }
    });

    // Populate Age Table
    renderAgeBreakdownTable(ageStats);

    // Populate Indigenous
    const ind611Tot = document.getElementById('ind-6-11-tot');
    const ind611Fem = document.getElementById('ind-6-11-fem');
    const ind12Tot = document.getElementById('ind-12-tot');
    const ind12Fem = document.getElementById('ind-12-fem');
    if (ind611Tot) ind611Tot.value = ind_6_11_tot;
    if (ind611Fem) ind611Fem.value = ind_6_11_fem;
    if (ind12Tot) ind12Tot.value = ind_12_tot;
    if (ind12Fem) ind12Fem.value = ind_12_fem;
    calculateIndigenousTotals();

    // Populate Early Childhood
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('ec-gov-new-tot', ec_gov_new_tot);
    setVal('ec-gov-new-fem', ec_gov_new_fem);
    setVal('ec-gov-rep-tot', ec_gov_rep_tot);
    setVal('ec-gov-rep-fem', ec_gov_rep_fem);

    setVal('ec-pvt-new-tot', ec_pvt_new_tot);
    setVal('ec-pvt-new-fem', ec_pvt_new_fem);
    setVal('ec-pvt-rep-tot', ec_pvt_rep_tot);
    setVal('ec-pvt-rep-fem', ec_pvt_rep_fem);

    setVal('ec-com-new-tot', ec_com_new_tot);
    setVal('ec-com-new-fem', ec_com_new_fem);
    setVal('ec-com-rep-tot', ec_com_rep_tot);
    setVal('ec-com-rep-fem', ec_com_rep_fem);

    setVal('ec-oth-new-tot', ec_oth_new_tot);
    setVal('ec-oth-new-fem', ec_oth_new_fem);
    setVal('ec-oth-rep-tot', ec_oth_rep_tot);
    setVal('ec-oth-rep-fem', ec_oth_rep_fem);

    // Populate Difficulties Table inputs
    Object.keys(diffCounts).forEach(id => {
        const inpTot = document.querySelector(`.diff-tot[data-id="${id}"]`);
        const inpFem = document.querySelector(`.diff-fem[data-id="${id}"]`);
        if (inpTot) inpTot.value = diffCounts[id].tot;
        if (inpFem) inpFem.value = diffCounts[id].fem;
    });

    // Populate Health/Disability support
    setVal('stat-health-support-tot', healthSupportTot);
    setVal('stat-health-support-fem', healthSupportFem);
    setVal('stat-disability-support-tot', disabilitySupportTot);
    setVal('stat-disability-support-fem', disabilitySupportFem);

    // Save
    saveStatisticsData();

    if (showAlert) {
        alert(`✅ បានគណនាទិន្នន័យស្ថិតិឡើងវិញដោយជោគជ័យ ពីសិស្សសរុប ${studentProfiles.length} នាក់ នៃ${activeClass.name}!`);
    }
};

// Render Age Breakdown Rows
function renderAgeBreakdownTable(ageStats) {
    const tbody = document.getElementById('tbody-age-breakdown');
    if (!tbody) return;
    tbody.innerHTML = '';

    AGE_CATEGORIES.forEach(cat => {
        const d = ageStats[cat] || { newTot: 0, newFem: 0, repTot: 0, repFem: 0 };
        const rowTot = (Number(d.newTot) || 0) + (Number(d.repTot) || 0);
        const rowFem = (Number(d.newFem) || 0) + (Number(d.repFem) || 0);

        const tr = document.createElement('tr');
        
        // Gray out age 6 repeater cells as per official ministry form template (age 6 has no repeaters)
        const isAge6 = (cat === '6');

        tr.innerHTML = `
            <td style="font-weight: bold;">${cat}</td>
            <td><input type="number" class="cell-input age-new-tot" data-age="${cat}" value="${d.newTot}" min="0" oninput="calculateAgeRowTotals(this)"></td>
            <td><input type="number" class="cell-input age-new-fem" data-age="${cat}" value="${d.newFem}" min="0" oninput="calculateAgeRowTotals(this)"></td>
            ${isAge6 ? `<td class="cell-disabled-gray"><input type="number" class="cell-input age-rep-tot" data-age="${cat}" value="0" min="0" disabled style="display:none;"></td><td class="cell-disabled-gray"><input type="number" class="cell-input age-rep-fem" data-age="${cat}" value="0" min="0" disabled style="display:none;"></td>` : `<td><input type="number" class="cell-input age-rep-tot" data-age="${cat}" value="${d.repTot}" min="0" oninput="calculateAgeRowTotals(this)"></td><td><input type="number" class="cell-input age-rep-fem" data-age="${cat}" value="${d.repFem}" min="0" oninput="calculateAgeRowTotals(this)"></td>`}
            <td class="font-bold age-row-tot" style="font-weight: 500;">${rowTot}</td>
            <td class="font-bold age-row-fem" style="font-weight: 500;">${rowFem}</td>
        `;
        tbody.appendChild(tr);
    });

    calculateAgeGrandTotals();
}

// Calculate individual row total & grand totals
function calculateAgeRowTotals(inputEl) {

    const tr = inputEl.closest('tr');
    if (!tr) return;
    const newTot = Number(tr.querySelector('.age-new-tot')?.value) || 0;
    const newFem = Number(tr.querySelector('.age-new-fem')?.value) || 0;
    const repTot = Number(tr.querySelector('.age-rep-tot')?.value) || 0;
    const repFem = Number(tr.querySelector('.age-rep-fem')?.value) || 0;

    const rowTotEl = tr.querySelector('.age-row-tot');
    const rowFemEl = tr.querySelector('.age-row-fem');
    if (rowTotEl) rowTotEl.textContent = newTot + repTot;
    if (rowFemEl) rowFemEl.textContent = newFem + repFem;

    calculateAgeGrandTotals();
    saveStatisticsData();
}
window.calculateIndigenousTotals = calculateIndigenousTotals;

function calculateAgeGrandTotals() {
    let sumNewTot = 0, sumNewFem = 0, sumRepTot = 0, sumRepFem = 0;
    let sumGrandTot = 0, sumGrandFem = 0;

    document.querySelectorAll('#tbody-age-breakdown tr').forEach(tr => {
        const nt = Number(tr.querySelector('.age-new-tot')?.value) || 0;
        const nf = Number(tr.querySelector('.age-new-fem')?.value) || 0;
        const rt = Number(tr.querySelector('.age-rep-tot')?.value) || 0;
        const rf = Number(tr.querySelector('.age-rep-fem')?.value) || 0;

        sumNewTot += nt;
        sumNewFem += nf;
        sumRepTot += rt;
        sumRepFem += rf;
        sumGrandTot += (nt + rt);
        sumGrandFem += (nf + rf);
    });

    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setTxt('age-sum-new-tot', sumNewTot);
    setTxt('age-sum-new-fem', sumNewFem);
    setTxt('age-sum-rep-tot', sumRepTot);
    setTxt('age-sum-rep-fem', sumRepFem);
    setTxt('age-sum-grand-tot', sumGrandTot);
    setTxt('age-sum-grand-fem', sumGrandFem);
}

// Indigenous Totals calculation
function calculateIndigenousTotals() {

    const n611_t = Number(document.getElementById('ind-6-11-tot')?.value) || 0;
    const n611_f = Number(document.getElementById('ind-6-11-fem')?.value) || 0;
    const n12_t = Number(document.getElementById('ind-12-tot')?.value) || 0;
    const n12_f = Number(document.getElementById('ind-12-fem')?.value) || 0;

    const totEl = document.getElementById('ind-sum-tot');
    const femEl = document.getElementById('ind-sum-fem');
    if (totEl) totEl.textContent = n611_t + n12_t;
    if (femEl) femEl.textContent = n611_f + n12_f;
    saveStatisticsData();
};

// Gender / Indigenous Circle Toggles
function toggleTeacherGender(g) {

    const m = document.getElementById('circle-male');
    const f = document.getElementById('circle-female');
    if (!m || !f) return;
    if (g === 'ប្រុស') {
        m.style.border = '1.5px solid #000000';
        m.style.borderRadius = '50%';
        m.style.padding = '1px 5px';
        m.style.fontWeight = 'bold';
        f.style.border = 'none';
        f.style.fontWeight = 'normal';
    } else {
        f.style.border = '1.5px solid #000000';
        f.style.borderRadius = '50%';
        f.style.padding = '1px 5px';
        f.style.fontWeight = 'bold';
        m.style.border = 'none';
        m.style.fontWeight = 'normal';
    }
    saveStatisticsData();
}
window.toggleTeacherGender = toggleTeacherGender;

function toggleTeacherIndigenous(isInd) {

    const y = document.getElementById('circle-ind-yes');
    const n = document.getElementById('circle-ind-no');
    if (!y || !n) return;
    if (isInd) {
        y.style.border = '1.5px solid #000000';
        y.style.borderRadius = '50%';
        y.style.padding = '1px 5px';
        y.style.fontWeight = 'bold';
        n.style.border = 'none';
        n.style.fontWeight = 'normal';
    } else {
        n.style.border = '1.5px solid #000000';
        n.style.borderRadius = '50%';
        n.style.padding = '1px 5px';
        n.style.fontWeight = 'bold';
        y.style.border = 'none';
        y.style.fontWeight = 'normal';
    }
    saveStatisticsData();
}
window.toggleTeacherIndigenous = toggleTeacherIndigenous;

// Save form state to LocalStorage per class
function saveStatisticsData() {
    const storageKey = window.getKey ? window.getKey('classStudentStats') : 'classStudentStats';

    const ageStats = {};
    document.querySelectorAll('#tbody-age-breakdown tr').forEach(tr => {
        const ageKey = tr.querySelector('td:first-child')?.textContent?.trim();
        if (ageKey) {
            ageStats[ageKey] = {
                newTot: Number(tr.querySelector('.age-new-tot')?.value) || 0,
                newFem: Number(tr.querySelector('.age-new-fem')?.value) || 0,
                repTot: Number(tr.querySelector('.age-rep-tot')?.value) || 0,
                repFem: Number(tr.querySelector('.age-rep-fem')?.value) || 0
            };
        }
    });

    const diffCounts = {};
    document.querySelectorAll('#table-difficulties .diff-tot').forEach(inpTot => {
        const id = inpTot.dataset.id;
        const inpFem = document.querySelector(`.diff-fem[data-id="${id}"]`);
        if (id) {
            diffCounts[id] = {
                tot: Number(inpTot.value) || 0,
                fem: Number(inpFem?.value) || 0
            };
        }
    });

    const dataToSave = {
        province: document.getElementById('stat-province')?.value || '',
        district: document.getElementById('stat-district')?.value || '',
        school: document.getElementById('stat-school')?.value || '',
        className: document.getElementById('stat-class-name')?.value || '',
        teacherName: document.getElementById('stat-teacher-name')?.value || '',
        teacherGender: document.getElementById('circle-female')?.style.fontWeight === 'bold' ? 'ស្រី' : 'ប្រុស',
        teacherAge: document.getElementById('stat-teacher-age')?.value || '',
        teacherIndigenous: document.getElementById('circle-ind-yes')?.style.fontWeight === 'bold',
        teacherEdu: document.getElementById('stat-teacher-edu')?.value || '',
        teacherExp: document.getElementById('stat-teacher-exp')?.value || '',
        teacherPedagogy: document.getElementById('stat-teacher-pedagogy')?.value || '',
        asOfDate: document.getElementById('stat-asof-date')?.value || '',
        createdPlace: document.getElementById('stat-created-place')?.value || '',
        createdDate: document.getElementById('stat-created-date')?.value || '',
        teacherSig: document.getElementById('stat-teacher-sig')?.value || '',
        
        ec_gov_new_tot: document.getElementById('ec-gov-new-tot')?.value || 0,
        ec_gov_new_fem: document.getElementById('ec-gov-new-fem')?.value || 0,
        ec_gov_rep_tot: document.getElementById('ec-gov-rep-tot')?.value || 0,
        ec_gov_rep_fem: document.getElementById('ec-gov-rep-fem')?.value || 0,

        ec_pvt_new_tot: document.getElementById('ec-pvt-new-tot')?.value || 0,
        ec_pvt_new_fem: document.getElementById('ec-pvt-new-fem')?.value || 0,
        ec_pvt_rep_tot: document.getElementById('ec-pvt-rep-tot')?.value || 0,
        ec_pvt_rep_fem: document.getElementById('ec-pvt-rep-fem')?.value || 0,

        ec_com_new_tot: document.getElementById('ec-com-new-tot')?.value || 0,
        ec_com_new_fem: document.getElementById('ec-com-new-fem')?.value || 0,
        ec_com_rep_tot: document.getElementById('ec-com-rep-tot')?.value || 0,
        ec_com_rep_fem: document.getElementById('ec-com-rep-fem')?.value || 0,

        ec_oth_new_tot: document.getElementById('ec-oth-new-tot')?.value || 0,
        ec_oth_new_fem: document.getElementById('ec-oth-new-fem')?.value || 0,
        ec_oth_rep_tot: document.getElementById('ec-oth-rep-tot')?.value || 0,
        ec_oth_rep_fem: document.getElementById('ec-oth-rep-fem')?.value || 0,

        ind_6_11_tot: document.getElementById('ind-6-11-tot')?.value || 0,
        ind_6_11_fem: document.getElementById('ind-6-11-fem')?.value || 0,
        ind_12_tot: document.getElementById('ind-12-tot')?.value || 0,
        ind_12_fem: document.getElementById('ind-12-fem')?.value || 0,

        healthSupportTot: document.getElementById('stat-health-support-tot')?.value || 0,
        healthSupportFem: document.getElementById('stat-health-support-fem')?.value || 0,
        disabilitySupportTot: document.getElementById('stat-disability-support-tot')?.value || 0,
        disabilitySupportFem: document.getElementById('stat-disability-support-fem')?.value || 0,

        ageStats,
        diffCounts
    };

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    try {
        localStorage.setItem('_last_local_student_edit_time', String(Date.now()));
    } catch(e) {}
}

// Restore saved data into UI
function populateFormFromData(data) {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };

    setVal('stat-province', data.province);
    setVal('stat-district', data.district);
    setVal('stat-school', data.school);
    setVal('stat-class-name', data.className);
    setVal('stat-teacher-name', data.teacherName);
    if (data.teacherGender) toggleTeacherGender(data.teacherGender);
    setVal('stat-teacher-age', data.teacherAge);
    if (typeof data.teacherIndigenous === 'boolean') toggleTeacherIndigenous(data.teacherIndigenous);
    setVal('stat-teacher-edu', data.teacherEdu);
    setVal('stat-teacher-exp', data.teacherExp);
    setVal('stat-teacher-pedagogy', data.teacherPedagogy);
    setVal('stat-asof-date', data.asOfDate);
    setVal('stat-created-place', data.createdPlace);
    setVal('stat-created-date', data.createdDate);
    setVal('stat-teacher-sig', data.teacherSig);

    setVal('ec-gov-new-tot', data.ec_gov_new_tot);
    setVal('ec-gov-new-fem', data.ec_gov_new_fem);
    setVal('ec-gov-rep-tot', data.ec_gov_rep_tot);
    setVal('ec-gov-rep-fem', data.ec_gov_rep_fem);

    setVal('ec-pvt-new-tot', data.ec_pvt_new_tot);
    setVal('ec-pvt-new-fem', data.ec_pvt_new_fem);
    setVal('ec-pvt-rep-tot', data.ec_pvt_rep_tot);
    setVal('ec-pvt-rep-fem', data.ec_pvt_rep_fem);

    setVal('ec-com-new-tot', data.ec_com_new_tot);
    setVal('ec-com-new-fem', data.ec_com_new_fem);
    setVal('ec-com-rep-tot', data.ec_com_rep_tot);
    setVal('ec-com-rep-fem', data.ec_com_rep_fem);

    setVal('ec-oth-new-tot', data.ec_oth_new_tot);
    setVal('ec-oth-new-fem', data.ec_oth_new_fem);
    setVal('ec-oth-rep-tot', data.ec_oth_rep_tot);
    setVal('ec-oth-rep-fem', data.ec_oth_rep_fem);

    setVal('ind-6-11-tot', data.ind_6_11_tot);
    setVal('ind-6-11-fem', data.ind_6_11_fem);
    setVal('ind-12-tot', data.ind_12_tot);
    setVal('ind-12-fem', data.ind_12_fem);
    calculateIndigenousTotals();

    setVal('stat-health-support-tot', data.healthSupportTot);
    setVal('stat-health-support-fem', data.healthSupportFem);
    setVal('stat-disability-support-tot', data.disabilitySupportTot);
    setVal('stat-disability-support-fem', data.disabilitySupportFem);

    if (data.ageStats) {
        renderAgeBreakdownTable(data.ageStats);
    }
    if (data.diffCounts) {
        Object.keys(data.diffCounts).forEach(id => {
            const inpTot = document.querySelector(`.diff-tot[data-id="${id}"]`);
            const inpFem = document.querySelector(`.diff-fem[data-id="${id}"]`);
            if (inpTot) inpTot.value = data.diffCounts[id].tot;
            if (inpFem) inpFem.value = data.diffCounts[id].fem;
        });
    }
}

// -------------------------------------------------------------
// EXPORT TO PDF & EXCEL
// -------------------------------------------------------------
window.exportStatsToPDF = function() {
    const element = document.getElementById('printable-statistics-form');
    if (!element) return;

    const activeClass = window.classManager ? window.classManager.getActiveClass() : { name: 'ថ្នាក់ទី ៥ ក' };
    const opt = {
        margin: [15, 8, 6, 8],
        filename: `ស្ថានភាពស្ថិតិសិស្ស_${activeClass.name}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
};

window.exportStatsToExcel = function() {
    const wb = XLSX.utils.book_new();
    const activeClass = window.classManager ? window.classManager.getActiveClass() : { name: 'ថ្នាក់ទី ៥ ក' };
    const activeYear = window.classManager ? window.classManager.getActiveAcademicYear() : { name: '២០២៦ - ២០២៧' };

    const ageRows = [
        ['តារាងចំនួនសិស្សតាមថ្នាក់ (សម្រាប់គ្រូ)'],
        [`ថ្នាក់៖ ${activeClass.name}`, `ឆ្នាំសិក្សា៖ ${activeYear.name}`],
        [],
        ['១. ព័ត៌មានសាវតាគ្រូទទួលបន្ទុកថ្នាក់'],
        ['ឈ្មោះជាអក្សរខ្មែរ', document.getElementById('stat-teacher-name')?.value || ''],
        ['ភេទ', document.getElementById('circle-male')?.style.fontWeight === 'bold' ? 'ប្រុស' : 'ស្រី'],
        ['អាយុ', document.getElementById('stat-teacher-age')?.value || ''],
        ['ជនជាតិដើមភាគតិច', document.getElementById('circle-ind-yes')?.style.fontWeight === 'bold' ? 'ពិតមែន' : 'ទេ'],
        ['កម្រិតវប្បធម៌', document.getElementById('stat-teacher-edu')?.value || ''],
        [],
        ['២. សិស្សថ្មី សិស្សឡើងថ្នាក់ និងសិស្សត្រួតថ្នាក់'],
        ['អាយុ (ឆ្នាំ)', 'សិស្សថ្មី (សរុប)', 'សិស្សថ្មី (ស្រី)', 'សិស្សត្រួតថ្នាក់ (សរុប)', 'សិស្សត្រួតថ្នាក់ (ស្រី)', 'សរុប (សរុប)', 'សរុប (ស្រី)']
    ];

    document.querySelectorAll('#tbody-age-breakdown tr').forEach(tr => {
        const cat = tr.querySelector('td:first-child')?.textContent?.trim() || '';
        const nt = tr.querySelector('.age-new-tot')?.value || '0';
        const nf = tr.querySelector('.age-new-fem')?.value || '0';
        const rt = tr.querySelector('.age-rep-tot')?.value || '0';
        const rf = tr.querySelector('.age-rep-fem')?.value || '0';
        const rowTot = tr.querySelector('.age-row-tot')?.textContent || '0';
        const rowFem = tr.querySelector('.age-row-fem')?.textContent || '0';

        ageRows.push([cat, nt, nf, rt, rf, rowTot, rowFem]);
    });

    ageRows.push([
        'សរុប',
        document.getElementById('age-sum-new-tot')?.textContent || '0',
        document.getElementById('age-sum-new-fem')?.textContent || '0',
        document.getElementById('age-sum-rep-tot')?.textContent || '0',
        document.getElementById('age-sum-rep-fem')?.textContent || '0',
        document.getElementById('age-sum-grand-tot')?.textContent || '0',
        document.getElementById('age-sum-grand-fem')?.textContent || '0'
    ]);

    ageRows.push([]);
    ageRows.push(['៤. សិស្សតាមជនជាតិដើមភាគតិច']);
    ageRows.push(['ក្រុមអាយុ', 'សរុប', 'ស្រី']);
    ageRows.push(['6-11', document.getElementById('ind-6-11-tot')?.value || '0', document.getElementById('ind-6-11-fem')?.value || '0']);
    ageRows.push(['12+', document.getElementById('ind-12-tot')?.value || '0', document.getElementById('ind-12-fem')?.value || '0']);
    ageRows.push(['សរុប', document.getElementById('ind-sum-tot')?.textContent || '0', document.getElementById('ind-sum-fem')?.textContent || '0']);

    const ws = XLSX.utils.aoa_to_sheet(ageRows);
    XLSX.utils.book_append_sheet(wb, ws, 'ស្ថានភាពស្ថិតិសិស្ស');
    XLSX.writeFile(wb, `Student_Class_Statistics_${activeClass.name}_${new Date().toISOString().slice(0,10)}.xlsx`);
};

// -------------------------------------------------------------
// TAB SWITCHING LOGIC
// -------------------------------------------------------------
window.switchTab = function(tabName) {
    const secStats = document.getElementById('section-statistics');
    const secSub = document.getElementById('section-subject');
    if (secStats) secStats.style.display = tabName === 'statistics' ? 'block' : 'none';
    if (secSub) secSub.style.display = tabName === 'subject' ? 'block' : 'none';

    const btnStats = document.getElementById('tab-statistics');
    const btnSubject = document.getElementById('tab-subject');

    if (tabName === 'statistics') {
        if (btnStats) {
            btnStats.style.background = '#3b82f6';
            btnStats.style.color = 'white';
            btnStats.style.border = 'none';
            btnStats.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
        }
        if (btnSubject) {
            btnSubject.style.background = 'white';
            btnSubject.style.color = '#64748b';
            btnSubject.style.border = '1px solid #e2e8f0';
            btnSubject.style.boxShadow = 'none';
        }
    } else {
        if (btnSubject) {
            btnSubject.style.background = '#3b82f6';
            btnSubject.style.color = 'white';
            btnSubject.style.border = 'none';
            btnSubject.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
        }
        if (btnStats) {
            btnStats.style.background = 'white';
            btnStats.style.color = '#64748b';
            btnStats.style.border = '1px solid #e2e8f0';
            btnStats.style.boxShadow = 'none';
        }
    }
};

// -------------------------------------------------------------
// SUBJECT REPORT TAB
// -------------------------------------------------------------
function initSubjectReport() {
    const sem1Grades = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('semester1ExamGrades') : 'semester1ExamGrades')) || [];
    const sem2Grades = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('semester2ExamGrades') : 'semester2ExamGrades')) || [];
    const annualGrades = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('annualExamGrades') : 'annualExamGrades')) || [];
    const studentProfiles = JSON.parse(localStorage.getItem(window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData')) || [];

    const subjectsConfig = [
        { name: 'ភាសាខ្មែរ', keys: ['s_kh1', 's_kh2', 's_kh3', 's_kh4', 's_es'] },
        { name: 'គណិតវិទ្យា', keys: ['s_ma'] },
        { name: 'សិក្សាសង្គម', keys: ['s_so1', 's_so2', 's_ls'] },
        { name: 'វិទ្យាសាស្ត្រ', keys: ['s_sc'] }
    ];

    function getStudentSubjectScore(studentId, keys) {
        const annualArr = Array.isArray(annualGrades) ? annualGrades : Object.values(annualGrades || {});
        const sem1Arr = Array.isArray(sem1Grades) ? sem1Grades : Object.values(sem1Grades || {});
        const sem2Arr = Array.isArray(sem2Grades) ? sem2Grades : Object.values(sem2Grades || {});

        let annualRec = annualArr.find(r => r.id === studentId);
        if (annualRec && annualRec.grades) {
            let sum = 0, count = 0;
            keys.forEach(k => {
                let v = parseFloat(annualRec.grades[k]);
                if (!isNaN(v)) { sum += v; count++; }
            });
            if (count > 0) return sum / count;
        }

        let sem1Rec = sem1Arr.find(r => r.id === studentId);
        let sem2Rec = sem2Arr.find(r => r.id === studentId);

        let sem1Score = null;
        if (sem1Rec && sem1Rec.grades) {
            let sum1 = 0, count1 = 0;
            keys.forEach(k => {
                let v = parseFloat(sem1Rec.grades[k]);
                if (!isNaN(v)) { sum1 += v; count1++; }
            });
            if (count1 > 0) sem1Score = sum1 / count1;
        }

        let sem2Score = null;
        if (sem2Rec && sem2Rec.grades) {
            let sum2 = 0, count2 = 0;
            keys.forEach(k => {
                let v = parseFloat(sem2Rec.grades[k]);
                if (!isNaN(v)) { sum2 += v; count2++; }
            });
            if (count2 > 0) sem2Score = sum2 / count2;
        }

        if (sem1Score !== null && sem2Score !== null) return (sem1Score + sem2Score) / 2;
        if (sem1Score !== null) return sem1Score;
        if (sem2Score !== null) return sem2Score;
        return null;
    }

    const tbodySubject = document.getElementById('subject-report-body');
    if (!tbodySubject) return;
    tbodySubject.innerHTML = '';

    subjectsConfig.forEach(subj => {
        const countsTotal = Array(11).fill(0);
        const countsFemale = Array(11).fill(0);

        studentProfiles.forEach(st => {
            const score = getStudentSubjectScore(st.id, subj.keys);
            if (score !== null && !isNaN(score)) {
                let rounded = Math.round(score);
                if (rounded < 0) rounded = 0;
                if (rounded > 10) rounded = 10;

                countsTotal[rounded]++;
                if (isFemale(st)) {
                    countsFemale[rounded]++;
                }
            }
        });

        const totalStudents = countsTotal.reduce((a, b) => a + b, 0);
        const totalFemale = countsFemale.reduce((a, b) => a + b, 0);

        let passedTotal = 0, passedFemale = 0;
        for (let i = 5; i <= 10; i++) {
            passedTotal += countsTotal[i];
            passedFemale += countsFemale[i];
        }

        // Row Total (សរុប)
        const trTotal = document.createElement('tr');
        trTotal.innerHTML = `
            <td rowspan="2" class="subject-name-cell">${subj.name}</td>
            <td class="gender-male" style="font-weight: bold;">សរុប</td>
            ${countsTotal.map(c => `<td>${c > 0 ? c : ''}</td>`).join('')}
            <td class="total-col">${totalStudents}</td>
            <td class="passed-col">${passedTotal}</td>
        `;
        tbodySubject.appendChild(trTotal);

        // Row Female (ស្រី)
        const trFemale = document.createElement('tr');
        trFemale.innerHTML = `
            <td class="gender-female" style="font-weight: bold;">ស្រី</td>
            ${countsFemale.map(c => `<td>${c > 0 ? c : ''}</td>`).join('')}
            <td class="total-col">${totalFemale}</td>
            <td class="passed-col">${passedFemale}</td>
        `;
        tbodySubject.appendChild(trFemale);
    });
}
