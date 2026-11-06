// student-id-card.js - Logic for Student ID Card (ប័ណ្ណសម្គាល់ខ្លួនសិស្ស)

let currentStudentsList = [];
let currentStudentIndex = 0;
let isBatchMode = false;

const KHMER_NUMS = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
const KHMER_MONTHS_NAMES = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

function toKhmerNum(num) {
    if (num === null || num === undefined) return '';
    return num.toString().split('').map(d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d).join('');
}

// Convert numbers in any string to Khmer digits
function convertStringToKhmerDigits(str) {
    if (!str) return '';
    return str.toString().replace(/[0-9]/g, d => KHMER_NUMS[d] !== undefined ? KHMER_NUMS[d] : d);
}

// Get School Info from Teacher Teaching Data (teacher.html -> បង្រៀននៅសាលា)
function getSchoolInfoFromDatabase() {
    let prov = '';
    let dist = '';
    let school = '';
    let level = '';

    try {
        const storageKey = window.getKey ? window.getKey('schoolRecords') : 'schoolRecords';
        let records = JSON.parse(localStorage.getItem(storageKey));
        if (!records || !records.length) {
            records = JSON.parse(localStorage.getItem('schoolRecords'));
        }
        if (records) {
            if (Array.isArray(records) && records.length > 0) {
                const latest = records[records.length - 1];
                prov = latest.schoolProvince || latest.province || '';
                dist = latest.districtOffice || latest.district || '';
                school = latest.schoolName || '';
                level = latest.teachingLevel || '';
            } else if (typeof records === 'object') {
                prov = records.schoolProvince || records.province || '';
                dist = records.districtOffice || records.district || '';
                school = records.schoolName || '';
                level = records.teachingLevel || '';
            }
        }
    } catch (e) {
        console.warn('Error reading schoolRecords', e);
    }

    if (!prov) prov = localStorage.getItem('attendance_custom_province') || 'កំពង់ធំ';
    if (!dist) dist = localStorage.getItem('attendance_custom_district') || 'សន្ទុក';
    if (!school) school = localStorage.getItem('attendance_custom_school') || 'ផ្លុង';

    const deptProv = prov ? `មន្ទីរអប់រំយុវជន និង កីឡា ខេត្ត ${prov}` : 'មន្ទីរអប់រំយុវជន និង កីឡា ខេត្ត កំពង់ធំ';
    
    // Format full school name e.g. "បឋមសិក្សា ផ្លុង"
    let fullSchool = school;
    if (level && level.includes('បឋម')) {
        fullSchool = (school.startsWith('បឋម') || school.startsWith('សាលា')) ? school : `បឋមសិក្សា ${school}`;
    } else if (level && (level.includes('វិទ្យាល័យ') || level.includes('អនុវិទ្យាល័យ'))) {
        fullSchool = school;
    } else if (school && !school.includes('សាលា') && !school.includes('បឋម') && !school.includes('វិ.')) {
        fullSchool = `បឋមសិក្សា ${school}`;
    }

    return {
        province: prov || 'កំពង់ធំ',
        district: dist || 'សន្ទុក',
        schoolName: fullSchool || 'បឋមសិក្សា ផ្លុង',
        rawSchoolName: school || 'ផ្លុង',
        deptProv: deptProv,
        locationPrefix: dist || prov || 'សន្ទុក'
    };
}

// Load saved settings or defaults
function getCardSettings() {
    const schoolInfo = getSchoolInfoFromDatabase();
    const defaultSettings = {
        deptProv: schoolInfo.deptProv,
        schoolName: schoolInfo.schoolName,
        academicYear: '២០២៥ ~ ២០២៦',
        locationPrefix: schoolInfo.locationPrefix,
        principalName: '',
        showStamp: false,
        showSignature: false,
        showWatermark: true,
        customStamp: null,
        customSignature: null
    };

    try {
        const saved = localStorage.getItem('studentIdCardSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.deptProv && (parsed.deptProv.includes('កណ្ដាល') || parsed.deptProv.includes('កណ្តាល'))) {
                parsed.deptProv = schoolInfo.deptProv;
            }
            if (parsed.schoolName && parsed.schoolName.includes('វិ.ខេមរបុរាណនារាញ្ញ')) {
                parsed.schoolName = schoolInfo.schoolName;
            }
            if (parsed.locationPrefix && parsed.locationPrefix.includes('ឈូងលាភ')) {
                parsed.locationPrefix = schoolInfo.locationPrefix;
            }
            return { ...defaultSettings, ...parsed };
        }
    } catch (e) {
        console.error('Error loading card settings', e);
    }
    return defaultSettings;
}

function saveCardSettings(settings) {
    try {
        localStorage.setItem('studentIdCardSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving card settings', e);
    }
}

function saveCurrentStudentsList() {
    try {
        const storageKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
        localStorage.setItem(storageKey, JSON.stringify(currentStudentsList));
        if (storageKey === 'studentProfilesData') {
            localStorage.setItem('students', JSON.stringify(currentStudentsList));
        }
    } catch (e) {
        console.warn('Error saving students list', e);
    }
}

function updateStudentPickerOption(idx) {
    const picker = document.getElementById('student-picker');
    if (!picker || !currentStudentsList[idx]) return;
    const s = currentStudentsList[idx];
    const g = (s.gender === 'ស' || s.gender === 'ស្រី' || s.gender === 'F') ? 'ស្រី' : 'ប្រុស';
    const opt = picker.options[idx];
    if (opt) {
        opt.textContent = `${toKhmerNum(idx + 1)}. ${s.name} (${g}) - ${s.id || ''}`;
    }
}

// Format Date string to full Khmer Date format
function formatKhmerDOB(dobStr) {
    if (!dobStr) return '';
    
    let d = '', m = '', y = '';
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
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        }
    } else if (dobStr.includes(' ')) {
        // Already formatted with Khmer or words
        return convertStringToKhmerDigits(dobStr);
    }

    if (!y || isNaN(m) || isNaN(d)) {
        return convertStringToKhmerDigits(dobStr);
    }

    const khmerDay = toKhmerNum(d.toString().padStart(2, '0'));
    const khmerMonth = KHMER_MONTHS_NAMES[m - 1] || '';
    const khmerYear = toKhmerNum(y);

    return `${khmerDay} ${khmerMonth} ${khmerYear}`;
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
    loadClassStudents();
    applySavedSettingsToUI();
    initCurrentDates();
    bindInlineCardInputs();

    // Check URL parameters for specific student
    const urlParams = new URLSearchParams(window.location.search);
    const targetStudentId = urlParams.get('studentId');
    if (targetStudentId && currentStudentsList.length > 0) {
        const foundIdx = currentStudentsList.findIndex(s => s.id === targetStudentId);
        if (foundIdx !== -1) {
            currentStudentIndex = foundIdx;
        }
    }

    renderCurrentStudent();

    // Listen to classManager changes if available
    window.addEventListener('classChanged', () => {
        loadClassStudents();
        renderCurrentStudent();
    });
});

// Bind real-time input listeners to all card fields for automatic persistence
function bindInlineCardInputs() {
    // 1. Student Name
    const nameInput = document.getElementById('card-student-name');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].name = e.target.value;
                saveCurrentStudentsList();
                updateStudentPickerOption(currentStudentIndex);
            }
        });
    }

    // 2. Gender
    const genderInput = document.getElementById('card-student-gender');
    if (genderInput) {
        genderInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].gender = e.target.value;
                saveCurrentStudentsList();
                updateStudentPickerOption(currentStudentIndex);
            }
        });
    }

    // 3. Date of Birth
    const dobInput = document.getElementById('card-student-dob');
    if (dobInput) {
        dobInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].dob = e.target.value;
                saveCurrentStudentsList();
            }
        });
    }

    // 4. Place of Birth
    const pobInput = document.getElementById('card-student-pob');
    if (pobInput) {
        pobInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].pob = e.target.value;
                saveCurrentStudentsList();
            }
        });
    }

    // 5. Father Name
    const fatherInput = document.getElementById('card-father-name');
    if (fatherInput) {
        fatherInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].fatherName = e.target.value;
                saveCurrentStudentsList();
            }
        });
    }

    // 6. Mother Name
    const motherInput = document.getElementById('card-mother-name');
    if (motherInput) {
        motherInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                currentStudentsList[currentStudentIndex].motherName = e.target.value;
                saveCurrentStudentsList();
            }
        });
    }

    // 7. Student ID
    const idInput = document.getElementById('card-student-id');
    if (idInput) {
        idInput.addEventListener('input', (e) => {
            if (currentStudentsList[currentStudentIndex]) {
                const cleanId = e.target.value.replace(/^ID:\s*/i, '');
                currentStudentsList[currentStudentIndex].id = cleanId;
                saveCurrentStudentsList();
                updateStudentPickerOption(currentStudentIndex);
            }
        });
    }

    // 8. Principal Name (Can be edited, custom, or completely deleted/empty)
    const principalInput = document.getElementById('card-principal-name');
    if (principalInput) {
        principalInput.addEventListener('input', (e) => {
            const settings = getCardSettings();
            settings.principalName = e.target.value;
            saveCardSettings(settings);
        });
    }

    // 9. School Header & Year Settings
    const deptProvInput = document.getElementById('card-dept-prov');
    if (deptProvInput) {
        deptProvInput.addEventListener('input', (e) => {
            const settings = getCardSettings();
            settings.deptProv = e.target.value;
            saveCardSettings(settings);
        });
    }

    const schoolNameInput = document.getElementById('card-school-name');
    if (schoolNameInput) {
        schoolNameInput.addEventListener('input', (e) => {
            const settings = getCardSettings();
            settings.schoolName = e.target.value;
            saveCardSettings(settings);
        });
    }

    const yearInput = document.getElementById('card-academic-year-val');
    if (yearInput) {
        yearInput.addEventListener('input', (e) => {
            const settings = getCardSettings();
            settings.academicYear = e.target.value;
            saveCardSettings(settings);
        });
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
        const g = (student.gender === 'ស' || student.gender === 'ស្រី' || student.gender === 'F') ? 'ស្រី' : 'ប្រុស';
        opt.textContent = `${toKhmerNum(idx + 1)}. ${student.name} (${g}) - ${student.id || ''}`;
        picker.appendChild(opt);
    });

    picker.value = currentStudentIndex;
}

// Initialize Lunar and Solar Dates
function initCurrentDates() {
    const now = new Date();
    const settings = getCardSettings();
    const locPrefix = settings.locationPrefix || 'សន្ទុក';

    // Solar Date
    const solarDay = toKhmerNum(now.getDate());
    const solarMonth = KHMER_MONTHS_NAMES[now.getMonth()];
    const solarYear = toKhmerNum(now.getFullYear());
    const solarStr = `${locPrefix} ថ្ងៃទី ${solarDay} ខែ${solarMonth} ឆ្នាំ${solarYear}`;
    
    const solarInput = document.getElementById('card-solar-date');
    if (solarInput && (!solarInput.value || solarInput.value.includes('២០២១') || solarInput.value.includes('ឈូងលាភ'))) {
        solarInput.value = solarStr;
    }

    // Lunar Date (Compute using khmer-calendar if available)
    let lunarStr = 'ថ្ងៃសុក្រ ១០រោច ខែចេត្រ ឆ្នាំឆ្លូវ ត្រីស័ក ព.ស.២៥៦៤';
    try {
        if (typeof KhmerDate !== 'undefined' || typeof getKhmerLunarDate === 'function') {
            if (typeof getKhmerLunarDate === 'function') {
                lunarStr = getKhmerLunarDate(now);
            }
        }
    } catch (e) {
        console.log('Lunar date fallback', e);
    }

    const lunarInput = document.getElementById('card-lunar-date');
    if (lunarInput && (!lunarInput.value || lunarInput.value.includes('២៥៦៤'))) {
        lunarInput.value = lunarStr;
    }
}

// Apply settings to UI
function applySavedSettingsToUI() {
    const settings = getCardSettings();

    const deptProv = document.getElementById('card-dept-prov');
    if (deptProv && settings.deptProv) deptProv.value = settings.deptProv;

    const schoolName = document.getElementById('card-school-name');
    if (schoolName && settings.schoolName) schoolName.value = settings.schoolName;

    const academicYear = document.getElementById('card-academic-year-val');
    if (academicYear && settings.academicYear) academicYear.value = settings.academicYear;

    const principalName = document.getElementById('card-principal-name');
    if (principalName) {
        principalName.value = (settings.principalName !== undefined) ? settings.principalName : '';
    }

    // Toggle Stamp
    if (settings.customStamp && settings.showStamp !== false) {
        const customImg = document.getElementById('custom-stamp-img');
        if (customImg) {
            customImg.src = settings.customStamp;
            customImg.style.display = 'block';
        }
        toggleStampVisibility(true);
    } else {
        toggleStampVisibility(false);
    }

    // Toggle Signature
    if (settings.customSignature && settings.showSignature !== false) {
        const customSig = document.getElementById('custom-signature-img');
        if (customSig) {
            customSig.src = settings.customSignature;
            customSig.style.display = 'block';
        }
        toggleSignatureVisibility(true);
    } else {
        toggleSignatureVisibility(false);
    }

    // Toggle Watermark
    toggleWatermarkVisibility(settings.showWatermark);
}

// Render Current Student Data to ID Card
function renderCurrentStudent() {
    if (currentStudentsList.length === 0) return;

    const student = currentStudentsList[currentStudentIndex] || currentStudentsList[0];
    if (!student) return;

    const picker = document.getElementById('student-picker');
    if (picker) picker.value = currentStudentIndex;

    // 1. Name & Gender
    const nameInput = document.getElementById('card-student-name');
    if (nameInput) nameInput.value = student.name || 'សុខ សុផាវត្តី';

    const genderInput = document.getElementById('card-student-gender');
    const isFem = (student.gender === 'ស' || student.gender === 'ស្រី' || (student.gender || '').toLowerCase() === 'f');
    if (genderInput) genderInput.value = isFem ? 'ស្រី' : 'ប្រុស';

    // 2. Date of birth
    const dobInput = document.getElementById('card-student-dob');
    if (dobInput) {
        dobInput.value = student.dob ? formatKhmerDOB(student.dob) : '១២ ឧសភា ១៩៩៩';
    }

    // 3. Place of birth
    const pobInput = document.getElementById('card-student-pob');
    if (pobInput) {
        let pobFull = '';
        if (student.pobVillage || student.pobCommune || student.pobDistrict || student.pobProvince) {
            const parts = [
                student.pobVillage ? student.pobVillage : '',
                student.pobCommune ? student.pobCommune : '',
                student.pobDistrict ? student.pobDistrict : '',
                student.pobProvince ? student.pobProvince : ''
            ].filter(Boolean);
            pobFull = parts.join(' ');
        } else if (student.pob) {
            pobFull = student.pob;
        } else {
            pobFull = 'ផ្លុង សន្ទុក កំពង់ធំ';
        }
        pobInput.value = pobFull;
    }

    // 4. Parents
    let fatherName = student.fatherName || '';
    let motherName = student.motherName || '';
    if (!fatherName && !motherName && student.guardian && student.guardian.includes(' / ')) {
        const gParts = student.guardian.split(' / ');
        fatherName = gParts[0];
        motherName = gParts[1];
    }
    const fatherInput = document.getElementById('card-father-name');
    if (fatherInput) fatherInput.value = fatherName || 'ភិន សុដ';

    const motherInput = document.getElementById('card-mother-name');
    if (motherInput) motherInput.value = motherName || 'ជួន ស្រង';

    // 5. Student ID
    const idInput = document.getElementById('card-student-id');
    if (idInput) {
        const sId = student.id || '0011001';
        idInput.value = sId.startsWith('ID:') ? sId : `ID:${sId}`;
    }

    // 6. Active Class Name
    const classInput = document.getElementById('card-class-name-val');
    if (classInput) {
        const activeClass = window.classManager ? window.classManager.getActiveClass() : { name: '៦A' };
        const rawClass = (activeClass && activeClass.name) ? activeClass.name : '៦A';
        const cleanClass = rawClass.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/i, '').trim();
        classInput.value = cleanClass || '៦A';
    }

    // 7. Student Photo
    const photoImg = document.getElementById('card-photo-img');
    const photoPlaceholder = document.getElementById('card-photo-placeholder');
    if (student.photo) {
        photoImg.src = student.photo;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    } else {
        photoImg.src = '';
        photoImg.style.display = 'none';
        photoPlaceholder.style.display = 'flex';
    }
}

// Navigation between students
window.navigateStudent = function(direction) {
    if (currentStudentsList.length === 0) return;
    currentStudentIndex += direction;
    if (currentStudentIndex < 0) currentStudentIndex = currentStudentsList.length - 1;
    if (currentStudentIndex >= currentStudentsList.length) currentStudentIndex = 0;
    renderCurrentStudent();
};

window.onStudentSelectChanged = function() {
    const picker = document.getElementById('student-picker');
    currentStudentIndex = parseInt(picker.value, 10) || 0;
    renderCurrentStudent();
};

// Photo Upload Handler
window.triggerStudentPhotoUpload = function() {
    document.getElementById('student-photo-file').click();
};

window.handleStudentPhotoUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Photo = e.target.result;
        
        // Update current student image in UI
        const photoImg = document.getElementById('card-photo-img');
        const photoPlaceholder = document.getElementById('card-photo-placeholder');
        photoImg.src = base64Photo;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';

        // Update and persist in studentProfilesData
        if (currentStudentsList.length > 0 && currentStudentsList[currentStudentIndex]) {
            currentStudentsList[currentStudentIndex].photo = base64Photo;
            const storageKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
            localStorage.setItem(storageKey, JSON.stringify(currentStudentsList));

            // Sync with Firebase if available
            if (window.dbSync && typeof window.dbSync.saveData === 'function') {
                window.dbSync.saveData(storageKey, currentStudentsList);
            }
        }
    };
    reader.readAsDataURL(file);
};

// Custom Stamp & Signature Uploads
window.triggerCustomStampUpload = function() {
    document.getElementById('custom-stamp-file').click();
};

window.handleCustomStampUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Stamp = e.target.result;
        const settings = getCardSettings();
        settings.customStamp = base64Stamp;
        settings.showStamp = true;
        saveCardSettings(settings);

        const customImg = document.getElementById('custom-stamp-img');
        if (customImg) {
            customImg.src = base64Stamp;
            customImg.style.display = 'block';
        }
        toggleStampVisibility(true);
    };
    reader.readAsDataURL(file);
};

window.triggerCustomSignatureUpload = function() {
    document.getElementById('custom-signature-file').click();
};

window.handleCustomSignatureUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Sig = e.target.result;
        const settings = getCardSettings();
        settings.customSignature = base64Sig;
        settings.showSignature = true;
        saveCardSettings(settings);

        const customSig = document.getElementById('custom-signature-img');
        if (customSig) {
            customSig.src = base64Sig;
            customSig.style.display = 'block';
        }
        toggleSignatureVisibility(true);
    };
    reader.readAsDataURL(file);
};

window.resetStampAndSignature = function() {
    const settings = getCardSettings();
    settings.customStamp = null;
    settings.customSignature = null;
    settings.showStamp = false;
    settings.showSignature = false;
    saveCardSettings(settings);

    const customStampImg = document.getElementById('custom-stamp-img');
    if (customStampImg) {
        customStampImg.src = '';
        customStampImg.style.display = 'none';
    }
    const customSigImg = document.getElementById('custom-signature-img');
    if (customSigImg) {
        customSigImg.src = '';
        customSigImg.style.display = 'none';
    }
    toggleStampVisibility(false);
    toggleSignatureVisibility(false);

    const stampCheck = document.getElementById('modal-toggle-stamp');
    if (stampCheck) stampCheck.checked = false;
    const sigCheck = document.getElementById('modal-toggle-signature');
    if (sigCheck) sigCheck.checked = false;
};

// Visibility Toggles
window.toggleStampVisibility = function(show) {
    const container = document.getElementById('stamp-container');
    if (container) container.style.display = show ? 'block' : 'none';
};

window.toggleSignatureVisibility = function(show) {
    const container = document.getElementById('signature-container');
    if (container) container.style.display = show ? 'block' : 'none';
};

window.toggleWatermarkVisibility = function(show) {
    const watermark = document.getElementById('watermark-layer');
    if (watermark) watermark.style.display = show ? 'block' : 'none';
};

// Settings Modal Controls
window.openSettingsModal = function() {
    const settings = getCardSettings();
    document.getElementById('modal-dept-prov').value = document.getElementById('card-dept-prov').value || settings.deptProv;
    document.getElementById('modal-school-name').value = document.getElementById('card-school-name').value || settings.schoolName;
    document.getElementById('modal-academic-year').value = document.getElementById('card-academic-year-val').value || settings.academicYear;
    document.getElementById('modal-location-prefix').value = settings.locationPrefix;
    
    const principalInput = document.getElementById('card-principal-name');
    document.getElementById('modal-principal-name').value = principalInput ? principalInput.value : (settings.principalName !== undefined ? settings.principalName : '');
    
    document.getElementById('modal-toggle-stamp').checked = settings.showStamp !== false;
    document.getElementById('modal-toggle-signature').checked = settings.showSignature !== false;
    document.getElementById('modal-toggle-watermark').checked = settings.showWatermark !== false;

    document.getElementById('settings-modal').classList.add('active');
};

window.closeSettingsModal = function() {
    document.getElementById('settings-modal').classList.remove('active');
};

window.saveSettingsModal = function() {
    const settings = getCardSettings();
    settings.deptProv = document.getElementById('modal-dept-prov').value.trim();
    settings.schoolName = document.getElementById('modal-school-name').value.trim();
    settings.academicYear = document.getElementById('modal-academic-year').value.trim();
    settings.locationPrefix = document.getElementById('modal-location-prefix').value.trim();
    settings.principalName = document.getElementById('modal-principal-name').value.trim();
    
    settings.showStamp = document.getElementById('modal-toggle-stamp').checked;
    settings.showSignature = document.getElementById('modal-toggle-signature').checked;
    settings.showWatermark = document.getElementById('modal-toggle-watermark').checked;

    saveCardSettings(settings);
    applySavedSettingsToUI();
    initCurrentDates();
    closeSettingsModal();
};

// === BATCH PRINTING (Grid A4 Layout) ===
let currentBatchGridSize = 6;

window.setBatchGridSize = function(size) {
    currentBatchGridSize = parseInt(size, 10) || 6;
    const btn4 = document.getElementById('btn-layout-4');
    const btn6 = document.getElementById('btn-layout-6');
    const btn8 = document.getElementById('btn-layout-8');
    const btn9 = document.getElementById('btn-layout-9');
    if (btn4) btn4.classList.toggle('active', currentBatchGridSize === 4);
    if (btn6) btn6.classList.toggle('active', currentBatchGridSize === 6);
    if (btn8) btn8.classList.toggle('active', currentBatchGridSize === 8);
    if (btn9) btn9.classList.toggle('active', currentBatchGridSize === 9);
    
    if (isBatchMode) {
        renderBatchPrintSheets();
    }
};

window.toggleBatchPrintMode = function() {
    isBatchMode = !isBatchMode;
    const singleView = document.getElementById('single-card-view');
    const batchView = document.getElementById('batch-print-container');
    const batchBtnText = document.getElementById('batch-btn-text');
    const layoutSelector = document.getElementById('batch-layout-selector');

    if (isBatchMode) {
        singleView.style.display = 'none';
        batchView.style.display = 'block';
        batchBtnText.textContent = '👁️ មើលកាតម្តងមួយ (Single View)';
        if (layoutSelector) layoutSelector.style.display = 'inline-flex';
        renderBatchPrintSheets();
    } else {
        singleView.style.display = 'block';
        batchView.style.display = 'none';
        batchBtnText.textContent = '🖨️ បោះពុម្ពទាំងថ្នាក់ (A4 Grid)';
        if (layoutSelector) layoutSelector.style.display = 'none';
    }
};

function renderBatchPrintSheets() {
    const batchContainer = document.getElementById('batch-print-container');
    batchContainer.innerHTML = '';

    if (currentStudentsList.length === 0) {
        batchContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: #64748b;">គ្មានទិន្នន័យសិស្សដើម្បីបោះពុម្ពទេ</div>';
        return;
    }

    const settings = getCardSettings();
    const deptProv = document.getElementById('card-dept-prov').value || settings.deptProv;
    const schoolName = document.getElementById('card-school-name').value || settings.schoolName;
    const academicYear = document.getElementById('card-academic-year-val').value || settings.academicYear;
    const classVal = document.getElementById('card-class-name-val').value || '៦A';
    const lunarDate = document.getElementById('card-lunar-date').value;
    const solarDate = document.getElementById('card-solar-date').value;
    const principalInput = document.getElementById('card-principal-name');
    const principalName = principalInput ? principalInput.value : (settings.principalName !== undefined ? settings.principalName : '');

    const isGrid9 = (currentBatchGridSize === 9);
    const isGrid8 = (currentBatchGridSize === 8);
    const isGrid6 = (currentBatchGridSize === 6);
    const chunkSize = isGrid9 ? 9 : (isGrid8 ? 8 : (isGrid6 ? 6 : 4));

    // Top Interactive Banner for Switching Layouts
    const bannerDiv = document.createElement('div');
    bannerDiv.className = 'batch-mode-banner no-print';
    bannerDiv.style.cssText = 'max-width: 210mm; margin: 0 auto 20px; background: #ede9fe; border: 1.5px solid #a78bfa; padding: 12px 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.08); flex-wrap: wrap; gap: 10px;';
    bannerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #7c3aed; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🖨️</div>
            <div>
                <div style="color: #4c1d95; font-size: 1rem; font-weight: 700;">ប្លង់បោះពុម្ពទាំងថ្នាក់លើក្រដាស A4 (ខ្នាតចតុកោណកែង)</div>
                <div style="font-size: 0.85rem; color: #6d28d9;">ជ្រើសរើសទម្រង់៖ ៤ កាត, ៦ កាត, ៨ កាត ឬ ៩ កាត ក្នុង ១ សន្លឹក A4</div>
            </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="layout-opt-btn ${currentBatchGridSize === 4 ? 'active' : ''}" onclick="setBatchGridSize(4)" style="padding: 7px 14px; font-size: 0.9rem;">
                📇 ៤ កាត
            </button>
            <button type="button" class="layout-opt-btn ${currentBatchGridSize === 6 ? 'active' : ''}" onclick="setBatchGridSize(6)" style="padding: 7px 14px; font-size: 0.9rem;">
                📑 ៦ កាត
            </button>
            <button type="button" class="layout-opt-btn ${currentBatchGridSize === 8 ? 'active' : ''}" onclick="setBatchGridSize(8)" style="padding: 7px 14px; font-size: 0.9rem;">
                🏷️ ៨ កាត
            </button>
            <button type="button" class="layout-opt-btn ${currentBatchGridSize === 9 ? 'active' : ''}" onclick="setBatchGridSize(9)" style="padding: 7px 14px; font-size: 0.9rem;">
                💳 ៩ កាត
            </button>
        </div>
    `;
    batchContainer.appendChild(bannerDiv);

    for (let i = 0; i < currentStudentsList.length; i += chunkSize) {
        const chunk = currentStudentsList.slice(i, i + chunkSize);
        const pageDiv = document.createElement('div');
        pageDiv.className = (isGrid6 || isGrid8) ? 'a4-print-page landscape-page' : 'a4-print-page';

        const gridDiv = document.createElement('div');
        if (isGrid9) {
            gridDiv.className = 'cards-grid-9';
        } else if (isGrid8) {
            gridDiv.className = 'cards-grid-8';
        } else if (isGrid6) {
            gridDiv.className = 'cards-grid-6';
        } else {
            gridDiv.className = 'cards-grid-4';
        }

        chunk.forEach(student => {
            const isFem = (student.gender === 'ស' || student.gender === 'ស្រី' || (student.gender || '').toLowerCase() === 'f');
            const gText = isFem ? 'ស្រី' : 'ប្រុស';
            const dobText = student.dob ? formatKhmerDOB(student.dob) : '១២ ឧសភា ១៩៩៩';
            
            let pobFull = '';
            if (student.pobVillage || student.pobCommune || student.pobDistrict || student.pobProvince) {
                pobFull = [student.pobVillage, student.pobCommune, student.pobDistrict, student.pobProvince].filter(Boolean).join(' ');
            } else if (student.pob) {
                pobFull = student.pob;
            } else {
                pobFull = 'ផ្លុង សន្ទុក កំពង់ធំ';
            }

            let fatherName = student.fatherName || '';
            let motherName = student.motherName || '';
            if (!fatherName && !motherName && student.guardian && student.guardian.includes(' / ')) {
                const gParts = student.guardian.split(' / ');
                fatherName = gParts[0];
                motherName = gParts[1];
            }
            if (!fatherName) fatherName = 'ភិន សុដ';
            if (!motherName) motherName = 'ជួន ស្រង';

            const sId = student.id || '0011001';
            const sIdClean = sId.startsWith('ID:') ? sId : `ID:${sId}`;

            let cardHtml = '';
            if (isGrid9) {
                // 9-Card per A4 Layout (Equal Dimensions 63.5mm x 91mm)
                cardHtml = `
                    <div class="batch-id-card grid-9-card">
                        <div class="crop-mark-tl"></div>
                        <div class="crop-mark-tr"></div>
                        <div class="crop-mark-bl"></div>
                        <div class="crop-mark-br"></div>
                        <div class="batch-inner-border">
                            <!-- Watermark -->
                            ${settings.showWatermark !== false ? `<div class="card-watermark"></div>` : ''}

                            <div class="card-content-layer">
                                <!-- Top Header -->
                                <div class="card-header-block" style="margin-bottom: 1px;">
                                    <div class="header-top-row" style="min-height: 26px; display: flex; align-items: center; justify-content: space-between;">
                                        <div class="moeys-logo-box" style="width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <img src="moeys-logo.png" alt="MoEYS Logo" class="moeys-logo-svg" style="width: 100%; height: 100%; object-fit: contain;">
                                        </div>
                                        <div class="national-motto-area" style="padding: 0 2px; flex: 1; text-align: center;">
                                            <div class="motto-line-1" style="font-size: 5.6pt; line-height: 1.6; margin-bottom: 2px; white-space: nowrap;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                                            <div class="motto-line-2" style="font-size: 5.6pt; line-height: 1.6; margin-bottom: 1px; white-space: nowrap;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                                            <img src="header-divider.png" alt="divider" class="motto-ribbon-divider" style="height: 7.5px; margin: 2px auto 0; display: block;">
                                        </div>
                                        <div class="header-spacer-box" style="width: 22px; height: 22px; flex-shrink: 0; visibility: hidden;"></div>
                                    </div>
                                    <div class="dept-prov-line" style="margin-top: 1px;">
                                        <div class="dept-prov-text" style="font-size: 5.4pt;">${deptProv}</div>
                                    </div>
                                    <div class="card-blue-divider" style="margin: 1px 0 2px;"></div>
                                </div>

                                <!-- Title -->
                                <div class="card-title-section" style="margin-bottom: 2px;">
                                    <h1 class="card-main-title" style="font-size: 9pt; margin-bottom: 1px;">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស</h1>
                                    <div class="card-academic-year" style="font-size: 6.4pt;">ឆ្នាំសិក្សា ${academicYear}</div>
                                    <div class="card-class-level" style="font-size: 6.8pt;">ថ្នាក់ទី ${classVal}</div>
                                </div>

                                <!-- Student Info -->
                                <div class="student-info-section" style="gap: 1px; margin: 2px 0 3px;">
                                    <div class="info-row info-row-split" style="font-size: 6.2pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">គោត្តនាម នាម :</span>
                                            <span class="info-value" style="font-size: 6.2pt; font-weight: 700;">${student.name || ''}</span>
                                        </div>
                                        <div class="split-col" style="width: 40px; justify-content: flex-end;">
                                            <span class="info-label">ភេទ :</span>
                                            <span class="info-value" style="font-size: 6.2pt;">${gText}</span>
                                        </div>
                                    </div>
                                    <div class="info-row" style="font-size: 6pt;">
                                        <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត :</span>
                                        <span class="info-value" style="font-size: 6pt;">${dobText}</span>
                                    </div>
                                    <div class="info-row" style="font-size: 6pt;">
                                        <span class="info-label">ទីកន្លែងកំណើត :</span>
                                        <span class="info-value" style="font-size: 6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${pobFull}</span>
                                    </div>
                                    <div class="info-row info-row-split" style="font-size: 6pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ឪពុក :</span>
                                            <span class="info-value" style="font-size: 6pt;">${fatherName}</span>
                                        </div>
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ម្តាយ :</span>
                                            <span class="info-value" style="font-size: 6pt;">${motherName}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom Photo & Sign -->
                                <div class="card-bottom-section" style="gap: 4px;">
                                    <div class="photo-and-id-column" style="width: 18mm;">
                                        <div class="id-bar-header" style="padding: 1px 0;">
                                            <div class="id-bar-text" style="font-size: 5.6pt;">${sIdClean}</div>
                                        </div>
                                        <div class="photo-container-box" style="height: 24mm;">
                                            ${student.photo ? `<img src="${student.photo}" alt="Photo">` : `
                                                 <div class="photo-placeholder" style="font-size: 5.2pt;">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    <div>រូប ៤x៦</div>
                                                </div>
                                            `}
                                        </div>
                                    </div>

                                    <div class="card-sign-column" style="min-height: 25mm;">
                                        <div class="student-of-school-title" style="font-size: 6.2pt;">ជាសិស្ស ${schoolName}</div>
                                        <div class="dates-wrapper" style="font-size: 4.6pt; line-height: 1.55; display: flex; flex-direction: column; gap: 1px;">
                                            <div class="lunar-date-line">${lunarDate}</div>
                                            <div class="solar-date-line">${solarDate}</div>
                                        </div>
                                        <div class="director-role-title" style="font-size: 5.8pt;">នាយកសាលា</div>

                                        <div class="stamp-signature-overlay-box" style="height: 9.5mm;">
                                            ${(settings.showStamp !== false && settings.customStamp) ? `
                                                <img src="${settings.customStamp}" class="school-stamp-img" style="width: 24px; height: 24px;">
                                            ` : ''}

                                            ${(settings.showSignature !== false && settings.customSignature) ? `
                                                <img src="${settings.customSignature}" class="principal-signature-img" style="width: 34px; height: 18px;">
                                            ` : ''}
                                        </div>

                                        <div class="principal-name-red" style="font-size: 6.4pt;">${principalName}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
            } else if (isGrid8) {
                // 8-Card per A4 Landscape Layout (Grid 4x2 - Standard Vertical Rectangle 67mm x 96mm)
                cardHtml = `
                    <div class="batch-id-card grid-8-card">
                        <div class="crop-mark-tl"></div>
                        <div class="crop-mark-tr"></div>
                        <div class="crop-mark-bl"></div>
                        <div class="crop-mark-br"></div>
                        <div class="batch-inner-border">
                            <!-- Watermark -->
                            ${settings.showWatermark !== false ? `<div class="card-watermark"></div>` : ''}

                            <div class="card-content-layer">
                                <!-- Top Header -->
                                <div class="card-header-block" style="margin-bottom: 2px;">
                                    <div class="header-top-row" style="min-height: 28px; display: flex; align-items: center; justify-content: space-between;">
                                        <div class="moeys-logo-box" style="width: 25px; height: 25px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <img src="moeys-logo.png" alt="MoEYS Logo" class="moeys-logo-svg" style="width: 100%; height: 100%; object-fit: contain;">
                                        </div>
                                        <div class="national-motto-area" style="padding: 0 2px; flex: 1; text-align: center;">
                                            <div class="motto-line-1" style="font-size: 6.2pt; line-height: 1.6; margin-bottom: 2.5px; white-space: nowrap;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                                            <div class="motto-line-2" style="font-size: 6.2pt; line-height: 1.6; margin-bottom: 1.5px; white-space: nowrap;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                                            <img src="header-divider.png" alt="divider" class="motto-ribbon-divider" style="height: 8.5px; margin: 2px auto 0; display: block;">
                                        </div>
                                        <div class="header-spacer-box" style="width: 25px; height: 25px; flex-shrink: 0; visibility: hidden;"></div>
                                    </div>
                                    <div class="dept-prov-line" style="margin-top: 1px;">
                                        <div class="dept-prov-text" style="font-size: 5.8pt;">${deptProv}</div>
                                    </div>
                                    <div class="card-blue-divider" style="margin: 1px 0 2px;"></div>
                                </div>

                                <!-- Title -->
                                <div class="card-title-section" style="margin-bottom: 2px;">
                                    <h1 class="card-main-title" style="font-size: 9.5pt; margin-bottom: 1px;">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស</h1>
                                    <div class="card-academic-year" style="font-size: 6.8pt;">ឆ្នាំសិក្សា ${academicYear}</div>
                                    <div class="card-class-level" style="font-size: 7.2pt;">ថ្នាក់ទី ${classVal}</div>
                                </div>

                                <!-- Student Info -->
                                <div class="student-info-section" style="gap: 1.5px; margin: 2px 0 3px;">
                                    <div class="info-row info-row-split" style="font-size: 6.6pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">គោត្តនាម នាម :</span>
                                            <span class="info-value" style="font-size: 6.6pt; font-weight: 700;">${student.name || ''}</span>
                                        </div>
                                        <div class="split-col" style="width: 44px; justify-content: flex-end;">
                                            <span class="info-label">ភេទ :</span>
                                            <span class="info-value" style="font-size: 6.6pt;">${gText}</span>
                                        </div>
                                    </div>
                                    <div class="info-row" style="font-size: 6.4pt;">
                                        <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត :</span>
                                        <span class="info-value" style="font-size: 6.4pt;">${dobText}</span>
                                    </div>
                                    <div class="info-row" style="font-size: 6.4pt;">
                                        <span class="info-label">ទីកន្លែងកំណើត :</span>
                                        <span class="info-value" style="font-size: 6.4pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">${pobFull}</span>
                                    </div>
                                    <div class="info-row info-row-split" style="font-size: 6.4pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ឪពុក :</span>
                                            <span class="info-value" style="font-size: 6.4pt;">${fatherName}</span>
                                        </div>
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ម្តាយ :</span>
                                            <span class="info-value" style="font-size: 6.4pt;">${motherName}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom Photo & Sign -->
                                <div class="card-bottom-section" style="gap: 4px;">
                                    <div class="photo-and-id-column" style="width: 19mm;">
                                        <div class="id-bar-header" style="padding: 1px 0;">
                                            <div class="id-bar-text" style="font-size: 5.8pt;">${sIdClean}</div>
                                        </div>
                                        <div class="photo-container-box" style="height: 26mm;">
                                            ${student.photo ? `<img src="${student.photo}" alt="Photo">` : `
                                                <div class="photo-placeholder" style="font-size: 5.5pt;">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    <div>រូប ៤x៦</div>
                                                </div>
                                            `}
                                        </div>
                                    </div>

                                    <div class="card-sign-column" style="min-height: 27mm;">
                                        <div class="student-of-school-title" style="font-size: 6.6pt;">ជាសិស្ស ${schoolName}</div>
                                        <div class="dates-wrapper" style="font-size: 5pt; line-height: 1.6; display: flex; flex-direction: column; gap: 1px;">
                                            <div class="lunar-date-line">${lunarDate}</div>
                                            <div class="solar-date-line">${solarDate}</div>
                                        </div>
                                        <div class="director-role-title" style="font-size: 6.2pt;">នាយកសាលា</div>

                                        <div class="stamp-signature-overlay-box" style="height: 10mm;">
                                            ${(settings.showStamp !== false && settings.customStamp) ? `
                                                <img src="${settings.customStamp}" class="school-stamp-img" style="width: 26px; height: 26px;">
                                            ` : ''}

                                            ${(settings.showSignature !== false && settings.customSignature) ? `
                                                <img src="${settings.customSignature}" class="principal-signature-img" style="width: 36px; height: 20px;">
                                            ` : ''}
                                        </div>

                                        <div class="principal-name-red" style="font-size: 6.8pt;">${principalName}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
            } else if (isGrid6) {
                // 6-Card per A4 Landscape Layout (Grid 3x2 - Vertical Rectangle 74mm x 98mm)
                cardHtml = `
                    <div class="batch-id-card grid-6-card">
                        <div class="crop-mark-tl"></div>
                        <div class="crop-mark-tr"></div>
                        <div class="crop-mark-bl"></div>
                        <div class="crop-mark-br"></div>
                        <div class="batch-inner-border">
                            <!-- Watermark -->
                            ${settings.showWatermark !== false ? `<div class="card-watermark"></div>` : ''}

                            <div class="card-content-layer">
                                <!-- Top Header -->
                                <div class="card-header-block" style="margin-bottom: 2px;">
                                    <div class="header-top-row" style="min-height: 30px; display: flex; align-items: center; justify-content: space-between;">
                                        <div class="moeys-logo-box" style="width: 28px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <img src="moeys-logo.png" alt="MoEYS Logo" class="moeys-logo-svg" style="width: 100%; height: 100%; object-fit: contain;">
                                        </div>
                                        <div class="national-motto-area" style="padding: 0 2px; flex: 1; text-align: center;">
                                            <div class="motto-line-1" style="font-size: 6.8pt; line-height: 1.6; margin-bottom: 3px; white-space: nowrap;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                                            <div class="motto-line-2" style="font-size: 6.8pt; line-height: 1.6; margin-bottom: 2px; white-space: nowrap;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                                            <img src="header-divider.png" alt="divider" class="motto-ribbon-divider" style="height: 9.5px; margin: 2px auto 0; display: block;">
                                        </div>
                                        <div class="header-spacer-box" style="width: 28px; height: 28px; flex-shrink: 0; visibility: hidden;"></div>
                                    </div>
                                    <div class="dept-prov-line" style="margin-top: 1px;">
                                        <div class="dept-prov-text" style="font-size: 6.2pt;">${deptProv}</div>
                                    </div>
                                    <div class="card-blue-divider" style="margin: 1px 0 2px;"></div>
                                </div>

                                <!-- Title -->
                                <div class="card-title-section" style="margin-bottom: 2px;">
                                    <h1 class="card-main-title" style="font-size: 10pt; margin-bottom: 1px;">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស</h1>
                                    <div class="card-academic-year" style="font-size: 7.2pt;">ឆ្នាំសិក្សា ${academicYear}</div>
                                    <div class="card-class-level" style="font-size: 7.6pt;">ថ្នាក់ទី ${classVal}</div>
                                </div>

                                <!-- Student Info -->
                                <div class="student-info-section" style="gap: 2px; margin: 2px 0 4px;">
                                    <div class="info-row info-row-split" style="font-size: 6.8pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">គោត្តនាម នាម :</span>
                                            <span class="info-value" style="font-size: 6.8pt; font-weight: 700;">${student.name || ''}</span>
                                        </div>
                                        <div class="split-col" style="width: 46px; justify-content: flex-end;">
                                            <span class="info-label">ភេទ :</span>
                                            <span class="info-value" style="font-size: 6.8pt;">${gText}</span>
                                        </div>
                                    </div>
                                    <div class="info-row" style="font-size: 6.6pt;">
                                        <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត :</span>
                                        <span class="info-value" style="font-size: 6.6pt;">${dobText}</span>
                                    </div>
                                    <div class="info-row" style="font-size: 6.6pt;">
                                        <span class="info-label">ទីកន្លែងកំណើត :</span>
                                        <span class="info-value" style="font-size: 6.6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${pobFull}</span>
                                    </div>
                                    <div class="info-row info-row-split" style="font-size: 6.6pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ឪពុក :</span>
                                            <span class="info-value" style="font-size: 6.6pt;">${fatherName}</span>
                                        </div>
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ម្តាយ :</span>
                                            <span class="info-value" style="font-size: 6.6pt;">${motherName}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom Photo & Sign -->
                                <div class="card-bottom-section" style="gap: 5px;">
                                    <div class="photo-and-id-column" style="width: 21mm;">
                                        <div class="id-bar-header" style="padding: 1px 0;">
                                            <div class="id-bar-text" style="font-size: 6.2pt;">${sIdClean}</div>
                                        </div>
                                        <div class="photo-container-box" style="height: 28mm;">
                                            ${student.photo ? `<img src="${student.photo}" alt="Photo">` : `
                                                <div class="photo-placeholder" style="font-size: 5.8pt;">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    <div>រូប ៤x៦</div>
                                                </div>
                                            `}
                                        </div>
                                    </div>

                                    <div class="card-sign-column" style="min-height: 29mm;">
                                        <div class="student-of-school-title" style="font-size: 6.8pt;">ជាសិស្ស ${schoolName}</div>
                                        <div class="dates-wrapper" style="font-size: 5.2pt; line-height: 1.65; display: flex; flex-direction: column; gap: 1.5px;">
                                            <div class="lunar-date-line">${lunarDate}</div>
                                            <div class="solar-date-line">${solarDate}</div>
                                        </div>
                                        <div class="director-role-title" style="font-size: 6.4pt;">នាយកសាលា</div>

                                        <div class="stamp-signature-overlay-box" style="height: 11mm;">
                                            ${(settings.showStamp !== false && settings.customStamp) ? `
                                                <img src="${settings.customStamp}" class="school-stamp-img" style="width: 28px; height: 28px;">
                                            ` : ''}

                                            ${(settings.showSignature !== false && settings.customSignature) ? `
                                                <img src="${settings.customSignature}" class="principal-signature-img" style="width: 38px; height: 22px;">
                                            ` : ''}
                                        </div>

                                        <div class="principal-name-red" style="font-size: 7.2pt;">${principalName}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 4-Card per A4 Layout (Standard 92mm x 134mm)
                cardHtml = `
                    <div class="batch-id-card">
                        <div class="crop-mark-tl"></div>
                        <div class="crop-mark-tr"></div>
                        <div class="crop-mark-bl"></div>
                        <div class="crop-mark-br"></div>
                        <div class="batch-inner-border">
                            <!-- Watermark -->
                            ${settings.showWatermark !== false ? `<div class="card-watermark"></div>` : ''}

                            <div class="card-content-layer">
                                <!-- Top Header -->
                                <div class="card-header-block">
                                    <div class="header-top-row" style="min-height: 44px; display: flex; align-items: center; justify-content: space-between;">
                                        <div class="moeys-logo-box" style="width: 38px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <img src="moeys-logo.png" alt="MoEYS Logo" class="moeys-logo-svg" style="width: 100%; height: 100%; object-fit: contain;">
                                        </div>
                                        <div class="national-motto-area" style="padding: 0 4px; flex: 1; text-align: center;">
                                            <div class="motto-line-1" style="font-size: 8.5pt; line-height: 1.65; margin-bottom: 4px; white-space: nowrap;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                                            <div class="motto-line-2" style="font-size: 8.5pt; line-height: 1.65; margin-bottom: 3px; white-space: nowrap;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                                            <img src="header-divider.png" alt="divider" class="motto-ribbon-divider" style="height: 12px; margin: 3px auto 0; display: block;">
                                        </div>
                                        <div class="header-spacer-box" style="width: 38px; height: 38px; flex-shrink: 0; visibility: hidden;"></div>
                                    </div>
                                    <div class="dept-prov-line" style="margin-top: 1px;">
                                        <div class="dept-prov-text" style="font-size: 8.2pt;">${deptProv}</div>
                                    </div>
                                    <div class="card-blue-divider" style="margin: 2px 0 3px;"></div>
                                </div>

                                <!-- Title -->
                                <div class="card-title-section" style="margin-bottom: 3px;">
                                    <h1 class="card-main-title" style="font-size: 13pt;">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស</h1>
                                    <div class="card-academic-year" style="font-size: 9.8pt;">ឆ្នាំសិក្សា ${academicYear}</div>
                                    <div class="card-class-level" style="font-size: 10.2pt;">ថ្នាក់ទី ${classVal}</div>
                                </div>

                                <!-- Student Info -->
                                <div class="student-info-section" style="gap: 3px; margin: 3px 0 5px;">
                                    <div class="info-row info-row-split" style="font-size: 8.8pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">គោត្តនាម នាម :</span>
                                            <span class="info-value" style="font-size: 8.8pt;">${student.name || ''}</span>
                                        </div>
                                        <div class="split-col" style="width: 60px; justify-content: flex-end;">
                                            <span class="info-label">ភេទ :</span>
                                            <span class="info-value" style="font-size: 8.8pt;">${gText}</span>
                                        </div>
                                    </div>
                                    <div class="info-row" style="font-size: 8.8pt;">
                                        <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត :</span>
                                        <span class="info-value" style="font-size: 8.8pt;">${dobText}</span>
                                    </div>
                                    <div class="info-row" style="font-size: 8.8pt;">
                                        <span class="info-label">ទីកន្លែងកំណើត :</span>
                                        <span class="info-value" style="font-size: 8.8pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;">${pobFull}</span>
                                    </div>
                                    <div class="info-row info-row-split" style="font-size: 8.8pt;">
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ឪពុកឈ្មោះ :</span>
                                            <span class="info-value" style="font-size: 8.8pt;">${fatherName}</span>
                                        </div>
                                        <div class="split-col" style="flex: 1;">
                                            <span class="info-label">ម្តាយឈ្មោះ :</span>
                                            <span class="info-value" style="font-size: 8.8pt;">${motherName}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom Photo & Sign -->
                                <div class="card-bottom-section" style="gap: 6px;">
                                    <div class="photo-and-id-column" style="width: 27mm;">
                                        <div class="id-bar-header" style="padding: 1px 0;">
                                            <div class="id-bar-text" style="font-size: 7.8pt;">${sIdClean}</div>
                                        </div>
                                        <div class="photo-container-box" style="height: 36mm;">
                                            ${student.photo ? `<img src="${student.photo}" alt="Photo">` : `
                                                <div class="photo-placeholder" style="font-size: 7pt;">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    <div>រូបថត ៤x៦</div>
                                                </div>
                                            `}
                                        </div>
                                    </div>

                                    <div class="card-sign-column" style="min-height: 39mm;">
                                        <div class="student-of-school-title" style="font-size: 8.4pt;">ជាសិស្ស ${schoolName}</div>
                                        <div class="dates-wrapper" style="font-size: 6.6pt; line-height: 1.75; display: flex; flex-direction: column; gap: 2px;">
                                            <div class="lunar-date-line">${lunarDate}</div>
                                            <div class="solar-date-line">${solarDate}</div>
                                        </div>
                                        <div class="director-role-title" style="font-size: 8.4pt;">នាយកសាលា</div>

                                        <div class="stamp-signature-overlay-box" style="height: 16mm;">
                                            ${(settings.showStamp !== false && settings.customStamp) ? `
                                                <img src="${settings.customStamp}" class="school-stamp-img" style="width: 38px; height: 38px;">
                                            ` : ''}

                                            ${(settings.showSignature !== false && settings.customSignature) ? `
                                                <img src="${settings.customSignature}" class="principal-signature-img" style="width: 50px; height: 30px;">
                                            ` : ''}
                                        </div>

                                        <div class="principal-name-red" style="font-size: 8.8pt;">${principalName}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
            }
            gridDiv.innerHTML += cardHtml;
        });

        pageDiv.appendChild(gridDiv);
        batchContainer.appendChild(pageDiv);
    }
}

// === EXPORT & PRINT ACTIONS ===
window.printCardDocument = function() {
    const isLandscape = (isBatchMode && (currentBatchGridSize === 6 || currentBatchGridSize === 8));
    if (isLandscape) {
        document.body.classList.add('is-landscape-print');
    } else {
        document.body.classList.remove('is-landscape-print');
    }
    window.print();
};

window.exportCardAsPDF = function() {
    const targetElement = isBatchMode ? document.getElementById('batch-print-container') : document.getElementById('printable-card-element');
    const student = currentStudentsList[currentStudentIndex] || { name: 'សិស្ស', id: 'Card' };
    const fileName = isBatchMode ? `Student_ID_Cards_Class_Batch.pdf` : `Student_ID_${student.id || ''}_${student.name || 'Card'}.pdf`;
    const isLandscape = (isBatchMode && (currentBatchGridSize === 6 || currentBatchGridSize === 8));

    const opt = {
        margin: isBatchMode ? [5, 5, 5, 5] : [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: isBatchMode ? 'a4' : [115, 165], orientation: isLandscape ? 'landscape' : 'portrait' }
    };

    html2pdf().set(opt).from(targetElement).save();
};

window.exportCardAsImage = function() {
    const targetElement = document.getElementById('printable-card-element');
    const student = currentStudentsList[currentStudentIndex] || { name: 'student', id: 'card' };
    const fileName = `Student_ID_${student.id || ''}_${student.name || 'card'}.png`;

    html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
};
