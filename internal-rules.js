// internal-rules.js - Manages Classroom Internal Regulations (បទបញ្ជាផ្ទៃក្នុង)

const DEFAULT_RULES = [
    "សិស្សទាំងអស់ត្រូវស្អាតជានិច្ច នឹងត្រូវមានសម្លៀកបំពាក់សមរម្យ ។",
    "សិស្សប្រុសត្រូវកាត់សក់ខ្លី សិស្សស្រីដែលមានសក់វែងត្រូវចងសក់ឱ្យបានសមរម្យ ។",
    "មិនត្រូវពាក់គ្រឿងអលង្ការនៅក្នុងសាលារៀន ។",
    "សិស្សទាំងអស់ចូលរួមគោរពទង់ជាតិរាល់ព្រឹក និងល្ងាច ។",
    "ពេលម៉ោងរៀនត្រូវស្ងៀមស្ងាត់ និងមានសណ្ដាប់ធ្នាប់ មិនរំខានដល់មិត្តរួមថ្នាក់ ។",
    "ពេលលោកគ្រូអ្នកគ្រូ ឬមានភ្ញៀវចូលក្នុងថ្នាក់សិស្សទាំងអស់ត្រូវក្រោកឈរសំពះដើម្បីសម្ដែងការគួរសម ។",
    "ពេលចេញលេងសិស្សទាំងអស់ត្រូវប្រកាន់អាកប្បកិរិយាសមរម្យ មិនត្រូវស្រែកឡូឡា ឈ្លោះប្រកែកគ្នា ឬប្រើប្រាស់អំពើហិង្សា ។",
    "មិនត្រូវជិះកង់ ឬពាក់មួកក្នុងបរិវេណសាលា ។",
    "មិនត្រូវចោលសំរាមផ្តេសផ្តាស ត្រូវចោលសំរាមក្នុងធុងសំរាមឱ្យបានត្រឹមត្រូវ ។",
    "សិស្សទាំងអស់ត្រូវមករៀនឱ្យបានទៀងទាត់ពេលវេលា ។",
    "ពេលសិស្សឈប់ត្រូវសុំច្បាប់ដោយមានបញ្ជាក់មូលហេតុច្បាស់លាស់ ឬអាណាព្យាបាលមកសុំផ្ទាល់ ។",
    "សិស្សទាំងអស់ត្រូវគោរពវិន័យសាលា និងអនុវត្តបទបញ្ជាផ្ទៃក្នុងរបស់សាលាឱ្យបានខ្ជាប់ខ្ជួន ។"
];

const DEFAULT_PREAMBLE = "យោងតាមអង្គប្រជុំលោកគ្រូ អ្នកគ្រូសម្រេចបង្កើតបទបញ្ជាដូចតទៅ៖";
const DEFAULT_YEAR = "២០២៥ - ២០២៦";
const DEFAULT_LUNAR = "ថ្ងៃសៅរ៍ ៥ រោច ខែកត្តិក ឆ្នាំថោះ បញ្ចស័ក ព.ស ២៥៦៧";
const DEFAULT_SOLAR = "វាលនិន្ទ្រា ថ្ងៃទី០២ ខែធ្នូ ឆ្នាំ២០២៣";

const KHMER_NUMS = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
function toKhmerNum(num) {
    if (num === null || num === undefined) return '';
    return num.toString().split('').map(d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d).join('');
}

function initLunarPhases() {
    const phaseSelect = document.getElementById('lunar-phase');
    if (!phaseSelect || phaseSelect.children.length > 0) return;
    
    phaseSelect.innerHTML = '';
    // ១កើត ដល់ ១៥កើត
    for (let i = 1; i <= 15; i++) {
        const opt = document.createElement('option');
        const val = `${toKhmerNum(i)}កើត`;
        opt.value = val;
        opt.textContent = val;
        phaseSelect.appendChild(opt);
    }
    // ១រោច ដល់ ១៥រោច
    for (let i = 1; i <= 15; i++) {
        const opt = document.createElement('option');
        const val = `${toKhmerNum(i)}រោច`;
        opt.value = val;
        opt.textContent = val;
        if (i === 5) opt.selected = true; // default ៥រោច
        phaseSelect.appendChild(opt);
    }
}

window.updateLunar = function() {
    const day = document.getElementById('lunar-day-week') ? document.getElementById('lunar-day-week').value : 'សៅរ៍';
    const phase = document.getElementById('lunar-phase') ? document.getElementById('lunar-phase').value : '៥រោច';
    const month = document.getElementById('lunar-month') ? document.getElementById('lunar-month').value : 'កត្តិក';
    const zodiac = document.getElementById('lunar-zodiac') ? document.getElementById('lunar-zodiac').value : 'ថោះ';
    const era = document.getElementById('lunar-era') ? document.getElementById('lunar-era').value : 'បញ្ចស័ក';
    const be = document.getElementById('lunar-be') ? document.getElementById('lunar-be').value : 'ព.ស ២៥៦៧';
    
    const lunarText = `ថ្ងៃ${day} ${phase} ខែ${month} ឆ្នាំ${zodiac} ${era} ${be}`;
    const lunarEl = document.getElementById('lunar-date-text');
    if (lunarEl) lunarEl.innerText = lunarText;
    saveInternalRulesData();
};

window.updateSolarDate = function(dateString, autoUpdateLunar = true) {
    if (!dateString) return;
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return;

    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    
    const day = toKhmerNum(dateObj.getDate().toString().padStart(2, '0'));
    const month = khmerMonths[dateObj.getMonth()];
    const year = toKhmerNum(dateObj.getFullYear());
    
    const locationInput = document.getElementById('solar-location');
    const location = locationInput && locationInput.value.trim() ? locationInput.value.trim() : 'វាលនិន្ទ្រា';
    const formatted = `${location} ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
    
    const solarEl = document.getElementById('solar-date-text');
    if (solarEl) solarEl.innerText = formatted;
    
    // Auto-update Lunar Date if KhmerCalendar library is available
    if (autoUpdateLunar && window.KhmerCalendar && window.KhmerCalendar.toKhmerLunarDate) {
        try {
            const lunarData = window.KhmerCalendar.toKhmerLunarDate(dateObj);
            if (lunarData) {
                if (document.getElementById('lunar-day-week') && lunarData.dayOfWeek) {
                    document.getElementById('lunar-day-week').value = lunarData.dayOfWeek;
                }
                if (document.getElementById('lunar-phase') && lunarData.moonDayKhmer) {
                    const phaseStr = lunarData.moonDayKhmer + (lunarData.moonStatus || 'កើត');
                    document.getElementById('lunar-phase').value = phaseStr;
                }
                if (document.getElementById('lunar-month') && lunarData.khmerMonth) {
                    document.getElementById('lunar-month').value = lunarData.khmerMonth;
                }
                if (document.getElementById('lunar-zodiac') && lunarData.animalYear) {
                    document.getElementById('lunar-zodiac').value = lunarData.animalYear;
                }
                if (document.getElementById('lunar-era') && lunarData.sak) {
                    document.getElementById('lunar-era').value = lunarData.sak;
                }
                if (document.getElementById('lunar-be') && lunarData.buddhistEraYearKhmer) {
                    document.getElementById('lunar-be').value = "ព.ស " + lunarData.buddhistEraYearKhmer;
                }
                updateLunar();
            }
        } catch (e) {
            console.error("Error generating lunar date", e);
        }
    }
    saveInternalRulesData();
};

window.triggerSolarUpdate = function() {
    const picker = document.getElementById('solar-picker');
    if (picker && picker.value) {
        updateSolarDate(picker.value, false);
    } else {
        const locationInput = document.getElementById('solar-location');
        const location = locationInput && locationInput.value.trim() ? locationInput.value.trim() : 'វាលនិន្ទ្រា';
        const solarEl = document.getElementById('solar-date-text');
        if (solarEl) {
            solarEl.innerText = solarEl.innerText.replace(/^.*?(?=ថ្ងៃទី)/, `${location} `);
            saveInternalRulesData();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLunarPhases();

    // Listen for global class switcher changes
    window.addEventListener('classChanged', () => {
        loadInternalRulesData();
    });

    // Attach auto-save to all editable fields
    setupAutoSave();

    // Initial load
    setTimeout(loadInternalRulesData, 80);
});

function isOnlyDots(str) {
    if (!str) return true;
    return /^[\s\.\u2026]+$/.test(str.trim());
}

function getSystemSchoolInfo() {
    let cluster = '';
    let school = '';
    let grade = '៥ ក';
    let year = '២០២៥ - ២០២៦';
    let teacher = '';
    let principal = '';
    let location = 'ផ្លុង';

    // 1. Check Class Manager for Grade
    if (window.classManager) {
        const activeClass = window.classManager.getActiveClass();
        if (activeClass && activeClass.name) {
            grade = activeClass.name.replace(/^ថ្នាក់ទី\s*/, '').replace(/^ថ្នាក់\s*/, '').trim();
        }
    }

    // 2. Scan schoolRecords across all keys
    try {
        const candidateKeys = ['schoolRecords', 'schoolRecords_default'];
        if (window.classManager) {
            candidateKeys.unshift(window.classManager.getKey('schoolRecords'));
        }
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.includes('schoolRecords') && !candidateKeys.includes(k)) {
                candidateKeys.push(k);
            }
        }

        for (const k of candidateKeys) {
            const records = JSON.parse(localStorage.getItem(k));
            if (Array.isArray(records) && records.length > 0) {
                for (let j = records.length - 1; j >= 0; j--) {
                    const r = records[j];
                    if (!cluster && r.schoolCluster && !isOnlyDots(r.schoolCluster)) {
                        cluster = r.schoolCluster.replace(/^កម្រង\s*៖?\s*/, '').trim();
                    }
                    if (!school && r.schoolName && !isOnlyDots(r.schoolName)) {
                        school = r.schoolName.replace(/^សាលាបឋមសិក្សា\s*/, '').trim();
                        location = school;
                    }
                    if (r.academicYear && !isOnlyDots(r.academicYear) && r.academicYear !== '២០២៣ - ២០២៤') {
                        year = r.academicYear.trim();
                    }
                }
            }
        }
    } catch (e) {}

    // 3. Check classInfo
    try {
        const key = window.classManager ? window.classManager.getKey('classInfo') : 'classInfo';
        const classInfo = JSON.parse(localStorage.getItem(key)) || JSON.parse(localStorage.getItem('classInfo')) || {};
        if (!cluster && classInfo.clusterName && !isOnlyDots(classInfo.clusterName)) {
            cluster = classInfo.clusterName.replace(/^កម្រង\s*៖?\s*/, '').trim();
        }
        if (!school && classInfo.schoolName && !isOnlyDots(classInfo.schoolName)) {
            school = classInfo.schoolName.replace(/^សាលាបឋមសិក្សា\s*/, '').trim();
        }
        if (classInfo.academicYear && !isOnlyDots(classInfo.academicYear) && classInfo.academicYear !== '២០២៣ - ២០២៤') {
            year = classInfo.academicYear.trim();
        }
        if (!grade && classInfo.className && !isOnlyDots(classInfo.className)) {
            grade = classInfo.className.replace(/^ថ្នាក់ទី\s*/, '').trim();
        }
    } catch (e) {}

    // 4. Check teacherProfiles
    try {
        const key = window.classManager ? window.classManager.getKey('teacherProfiles') : 'teacherProfiles';
        const teachers = JSON.parse(localStorage.getItem(key)) || JSON.parse(localStorage.getItem('teacherProfiles')) || [];
        if (teachers.length > 0) {
            if (teachers[0].name && !isOnlyDots(teachers[0].name)) {
                teacher = teachers[0].name.trim();
            }
            if (!grade && teachers[0].className && !isOnlyDots(teachers[0].className)) {
                grade = teachers[0].className.replace(/^ថ្នាក់ទី\s*/, '').trim();
            }
        }
    } catch (e) {}

    // 5. Check currentUser for principal/admin name
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.fullName && (user.role === 'admin' || user.role === 'principal')) {
            principal = user.fullName.replace(/\s*\(Admin\)/i, '').trim();
        }
    } catch (e) {}

    // 6. Direct fallback keys
    if (!cluster) {
        const dirCluster = localStorage.getItem('clusterName') || localStorage.getItem('cluster_name');
        cluster = (dirCluster && !isOnlyDots(dirCluster)) ? dirCluster : 'ទីពោ';
    }
    if (!school) {
        const dirSchool = localStorage.getItem('schoolName') || localStorage.getItem('school_name');
        school = (dirSchool && !isOnlyDots(dirSchool)) ? dirSchool : 'ផ្លុង';
    }
    const dirYear = localStorage.getItem('academicYear') || localStorage.getItem('schoolYear');
    if (dirYear && !isOnlyDots(dirYear) && dirYear !== '២០២៣ - ២០២៤') {
        year = dirYear;
    }

    return { cluster, school, grade, year, teacher, principal, location };
}

function loadInternalRulesData() {
    const classId = window.classManager ? window.classManager.getActiveClassId() : 'default';
    const storageKey = `internal_rules_data_${classId}`;
    
    let savedData = null;
    try {
        savedData = JSON.parse(localStorage.getItem(storageKey));
    } catch(e) {
        console.error(e);
    }

    const sysInfo = getSystemSchoolInfo();

    // DOM Elements
    const clusterEl = document.getElementById('cluster-name');
    const schoolEl = document.getElementById('school-name');
    const gradeEl = document.getElementById('grade-name');
    const yearEl = document.getElementById('academic-year');
    const preambleEl = document.getElementById('doc-preamble-text');
    const principalEl = document.getElementById('principal-name');
    const teacherEl = document.getElementById('teacher-name');
    const lunarEl = document.getElementById('lunar-date-text');
    const solarEl = document.getElementById('solar-date-text');

    // Populate cluster (prefer real profile ទីពោ)
    if (clusterEl) {
        if (savedData && savedData.cluster && !isOnlyDots(savedData.cluster) && savedData.cluster !== '....................' && savedData.cluster !== 'ទីពោ') {
            clusterEl.innerText = savedData.cluster;
        } else {
            clusterEl.innerText = sysInfo.cluster || 'ទីពោ';
        }
    }

    // Populate school
    if (schoolEl) {
        if (savedData && savedData.school && !isOnlyDots(savedData.school)) {
            schoolEl.innerText = savedData.school;
        } else {
            schoolEl.innerText = sysInfo.school || 'ផ្លុង';
        }
    }

    // Populate grade
    if (gradeEl) {
        if (savedData && savedData.grade && !isOnlyDots(savedData.grade)) {
            gradeEl.innerText = savedData.grade;
        } else {
            gradeEl.innerText = sysInfo.grade || '៥ ក';
        }
    }

    // Populate academic year (prefer active year ២០២៥ - ២០២៦)
    if (yearEl) {
        if (savedData && savedData.academicYear && !isOnlyDots(savedData.academicYear) && savedData.academicYear !== '២០២៣ - ២០២៤') {
            yearEl.innerText = savedData.academicYear;
        } else {
            yearEl.innerText = sysInfo.year || '២០២៥ - ២០២៦';
        }
    }

    // Populate preamble
    if (preambleEl) {
        preambleEl.innerText = (savedData && savedData.preamble) ? savedData.preamble : DEFAULT_PREAMBLE;
    }

    // Populate principal
    if (principalEl) {
        if (savedData && savedData.principal && !isOnlyDots(savedData.principal)) {
            principalEl.innerText = savedData.principal;
        } else if (sysInfo.principal) {
            principalEl.innerText = sysInfo.principal;
        } else {
            principalEl.innerText = '...........................';
        }
    }

    // Populate teacher
    if (teacherEl) {
        if (savedData && savedData.teacher && !isOnlyDots(savedData.teacher)) {
            teacherEl.innerText = savedData.teacher;
        } else if (sysInfo.teacher) {
            teacherEl.innerText = sysInfo.teacher;
        } else {
            teacherEl.innerText = '...........................';
        }
    }

    // Populate dates and Date Settings inputs
    const locInput = document.getElementById('solar-location');
    const pickInput = document.getElementById('solar-picker');
    const lDay = document.getElementById('lunar-day-week');
    const lPhase = document.getElementById('lunar-phase');
    const lMonth = document.getElementById('lunar-month');
    const lZodiac = document.getElementById('lunar-zodiac');
    const lEra = document.getElementById('lunar-era');
    const lBe = document.getElementById('lunar-be');

    if (locInput) {
        locInput.value = (savedData && savedData.solarLocation) ? savedData.solarLocation : (sysInfo.location || 'វាលនិន្ទ្រា');
    }
    if (pickInput) {
        pickInput.value = (savedData && savedData.solarPicker) ? savedData.solarPicker : '2023-12-02';
    }
    if (lDay && savedData && savedData.lunarDayWeek) lDay.value = savedData.lunarDayWeek;
    if (lPhase && savedData && savedData.lunarPhase) lPhase.value = savedData.lunarPhase;
    if (lMonth && savedData && savedData.lunarMonth) lMonth.value = savedData.lunarMonth;
    if (lZodiac && savedData && savedData.lunarZodiac) lZodiac.value = savedData.lunarZodiac;
    if (lEra && savedData && savedData.lunarEra) lEra.value = savedData.lunarEra;
    if (lBe && savedData && savedData.lunarBe) lBe.value = savedData.lunarBe;

    if (lunarEl) {
        lunarEl.innerText = (savedData && savedData.lunarDate) ? savedData.lunarDate : DEFAULT_LUNAR;
    }
    if (solarEl) {
        if (savedData && savedData.solarDate) {
            solarEl.innerText = savedData.solarDate;
        } else {
            solarEl.innerText = `${sysInfo.location || 'វាលនិន្ទ្រា'} ថ្ងៃទី០២ ខែធ្នូ ឆ្នាំ២០២៣`;
        }
    }

    // Render rules
    renderRules((savedData && savedData.rules && savedData.rules.length > 0) ? savedData.rules : DEFAULT_RULES);
}

function renderRules(rulesArray) {
    const container = document.getElementById('rules-list');
    if (!container) return;

    container.innerHTML = '';
    const khmerNums = ['១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០', '១១', '១២', '១៣', '១៤', '១៥', '១៦', '១៧', '១៨', '១៩', '២០'];

    rulesArray.forEach((ruleText, index) => {
        const numStr = khmerNums[index] || (index + 1).toString();
        const row = document.createElement('div');
        row.className = 'rule-row';
        row.innerHTML = `
            <span class="rule-num">ប្រការ${numStr} <span class="rule-colon">៖</span></span>
            <span class="rule-content" contenteditable="true" spellcheck="false">${ruleText}</span>
        `;
        container.appendChild(row);
    });

    setupRulesAutoSave();
}

function setupAutoSave() {
    const fields = [
        'cluster-name', 'school-name', 'grade-name', 'academic-year',
        'doc-preamble-text', 'principal-name', 'teacher-name',
        'lunar-date-text', 'solar-date-text'
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', debounce(saveInternalRulesData, 500));
            el.addEventListener('blur', saveInternalRulesData);
        }
    });
}

function setupRulesAutoSave() {
    const ruleContents = document.querySelectorAll('.rule-content');
    ruleContents.forEach(el => {
        el.addEventListener('input', debounce(saveInternalRulesData, 500));
        el.addEventListener('blur', saveInternalRulesData);
    });
}

function saveInternalRulesData() {
    const classId = window.classManager ? window.classManager.getActiveClassId() : 'default';
    const storageKey = `internal_rules_data_${classId}`;

    const clusterEl = document.getElementById('cluster-name');
    const schoolEl = document.getElementById('school-name');
    const gradeEl = document.getElementById('grade-name');
    const yearEl = document.getElementById('academic-year');
    const preambleEl = document.getElementById('doc-preamble-text');
    const principalEl = document.getElementById('principal-name');
    const teacherEl = document.getElementById('teacher-name');
    const lunarEl = document.getElementById('lunar-date-text');
    const solarEl = document.getElementById('solar-date-text');

    const locInput = document.getElementById('solar-location');
    const pickInput = document.getElementById('solar-picker');
    const lDay = document.getElementById('lunar-day-week');
    const lPhase = document.getElementById('lunar-phase');
    const lMonth = document.getElementById('lunar-month');
    const lZodiac = document.getElementById('lunar-zodiac');
    const lEra = document.getElementById('lunar-era');
    const lBe = document.getElementById('lunar-be');

    const ruleContents = document.querySelectorAll('.rule-content');
    const rules = Array.from(ruleContents).map(el => el.innerText.trim());

    const dataToSave = {
        cluster: clusterEl ? clusterEl.innerText.trim() : '',
        school: schoolEl ? schoolEl.innerText.trim() : '',
        grade: gradeEl ? gradeEl.innerText.trim() : '',
        academicYear: yearEl ? yearEl.innerText.trim() : '',
        preamble: preambleEl ? preambleEl.innerText.trim() : '',
        principal: principalEl ? principalEl.innerText.trim() : '',
        teacher: teacherEl ? teacherEl.innerText.trim() : '',
        lunarDate: lunarEl ? lunarEl.innerText.trim() : '',
        solarDate: solarEl ? solarEl.innerText.trim() : '',
        solarLocation: locInput ? locInput.value.trim() : '',
        solarPicker: pickInput ? pickInput.value : '',
        lunarDayWeek: lDay ? lDay.value : '',
        lunarPhase: lPhase ? lPhase.value : '',
        lunarMonth: lMonth ? lMonth.value : '',
        lunarZodiac: lZodiac ? lZodiac.value : '',
        lunarEra: lEra ? lEra.value : '',
        lunarBe: lBe ? lBe.value.trim() : '',
        rules: rules
    };

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    if (window.dbSync && window.dbSync.saveKey) {
        window.dbSync.saveKey(storageKey, JSON.stringify(dataToSave));
    }
}

function resetToDefaultRules() {
    if (confirm('តើអ្នកពិតជាចង់កំណត់ទម្រង់បទបញ្ជាផ្ទៃក្នុងត្រឡប់ទៅជាទម្រង់ដើម ១០០% វិញមែនទេ?')) {
        const classId = window.classManager ? window.classManager.getActiveClassId() : 'default';
        const storageKey = `internal_rules_data_${classId}`;
        localStorage.removeItem(storageKey);
        loadInternalRulesData();
        alert('🎉 បានកំណត់ត្រឡប់ទៅទម្រង់ដើមដោយជោគជ័យ!');
    }
}

function exportToPDF() {
    const sheet = document.getElementById('rules-a4-sheet');
    if (!sheet) return;

    const opt = {
        margin: [10, 10, 10, 10], // mm
        filename: 'Internal_Rules_បទបញ្ជាផ្ទៃក្នុង.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(sheet).save();
}

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
