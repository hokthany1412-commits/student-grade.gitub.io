// student-duties.js - Student Duties & Leadership Roles Logic

const ROLE_FIELDS = [
    'role-president',
    'role-vice1',
    'role-vice2',
    'role-discipline',
    'role-discipline-asst',
    'role-attendance',
    'role-hygiene',
    'role-hygiene-asst',
    'role-gardener',
    'role-study',
    'role-library',
    'role-tutor',
    'role-sports',
    'role-arts',
    'role-group1',
    'role-group2',
    'role-group3',
    'role-group4'
];

function toKhmerNumber(num) {
    if (num === null || num === undefined) return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, match => khmerDigits[parseInt(match)]);
}

function initDutiesApp() {
    populateLunarPhases();
    setupDateListeners();
    populateStudentSelectOptions();
    loadDutiesData();
    
    // Add click/focus listeners so clicking any select dynamically ensures options are present
    document.querySelectorAll('.role-student-select').forEach(select => {
        select.addEventListener('focus', () => {
            if (select.options.length <= 1) {
                populateStudentSelectOptions();
            }
        });
        select.addEventListener('mousedown', () => {
            if (select.options.length <= 1) {
                populateStudentSelectOptions();
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDutiesApp);
} else {
    initDutiesApp();
}

// Global window load backup
window.addEventListener('load', () => {
    populateStudentSelectOptions();
    loadDutiesData();
});

// Listen for class changes (e.g., switching from Grade 5 to Grade 6)
window.addEventListener('classChanged', () => {
    populateStudentSelectOptions();
    loadDutiesData();
});

function populateLunarPhases() {
    const lunarPhaseSelect = document.getElementById('lunar-phase');
    if (!lunarPhaseSelect) return;
    
    lunarPhaseSelect.innerHTML = '';
    const phases = [];
    const nums = ['១','២','៣','៤','៥','៦','៧','៨','៩','១០','១១','១២','១៣','១៤','១៥'];
    nums.forEach(n => phases.push(`${n}កើត`));
    nums.forEach(n => phases.push(`${n}រោច`));
    
    phases.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === '១៤កើត') opt.selected = true;
        lunarPhaseSelect.appendChild(opt);
    });
}

function setupDateListeners() {
    const inputs = [
        'solar-location', 'solar-day', 'solar-month', 'solar-year',
        'lunar-day-name', 'lunar-phase', 'lunar-month', 'lunar-zodiac', 'lunar-era', 'lunar-be-year'
    ];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateDateDisplays);
            el.addEventListener('change', updateDateDisplays);
        }
    });
}

function updateDateDisplays() {
    const loc = document.getElementById('solar-location')?.value.trim() || 'ផ្លុង';
    const sDay = document.getElementById('solar-day')?.value.trim() || '១០';
    const sMonth = document.getElementById('solar-month')?.value || 'តុលា';
    const sYear = document.getElementById('solar-year')?.value.trim() || '២០២៦';

    const solarDateEl = document.getElementById('solar-date');
    if (solarDateEl) {
        solarDateEl.textContent = `${loc}, ថ្ងៃទី${sDay} ខែ${sMonth} ឆ្នាំ ${sYear}`;
    }

    const lDayName = document.getElementById('lunar-day-name')?.value || 'ចន្ទ';
    const lPhase = document.getElementById('lunar-phase')?.value || '១៤កើត';
    const lMonth = document.getElementById('lunar-month')?.value || 'អស្សុជ';
    const lZodiac = document.getElementById('lunar-zodiac')?.value || 'មមី';
    const lEra = document.getElementById('lunar-era')?.value || 'អដ្ឋស័ក';
    const lBe = document.getElementById('lunar-be-year')?.value.trim() || '២៥៧០';

    const lunarDateEl = document.getElementById('lunar-date');
    if (lunarDateEl) {
        lunarDateEl.textContent = `ថ្ងៃ${lDayName} ${lPhase} ខែ${lMonth} ឆ្នាំ${lZodiac} ${lEra} ព.ស ${lBe}`;
    }
}

function loadDutiesData() {
    if (!window.classManager) return;

    loadSchoolInfo();
    populateStudentSelectOptions();

    // Load saved duties
    const storageKey = window.classManager.getKey('studentDutiesData');
    const savedData = JSON.parse(localStorage.getItem(storageKey)) || null;

    if (savedData) {
        ROLE_FIELDS.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = savedData[fieldId] || '';
            }
        });

        // Load date settings if available
        if (savedData.dates) {
            const d = savedData.dates;
            if (d.solarLocation && document.getElementById('solar-location')) document.getElementById('solar-location').value = d.solarLocation;
            if (d.solarDay && document.getElementById('solar-day')) document.getElementById('solar-day').value = d.solarDay;
            if (d.solarMonth && document.getElementById('solar-month')) document.getElementById('solar-month').value = d.solarMonth;
            if (d.solarYear && document.getElementById('solar-year')) document.getElementById('solar-year').value = d.solarYear;

            if (d.lunarDayName && document.getElementById('lunar-day-name')) document.getElementById('lunar-day-name').value = d.lunarDayName;
            if (d.lunarPhase && document.getElementById('lunar-phase')) document.getElementById('lunar-phase').value = d.lunarPhase;
            if (d.lunarMonth && document.getElementById('lunar-month')) document.getElementById('lunar-month').value = d.lunarMonth;
            if (d.lunarZodiac && document.getElementById('lunar-zodiac')) document.getElementById('lunar-zodiac').value = d.lunarZodiac;
            if (d.lunarEra && document.getElementById('lunar-era')) document.getElementById('lunar-era').value = d.lunarEra;
            if (d.lunarBeYear && document.getElementById('lunar-be-year')) document.getElementById('lunar-be-year').value = d.lunarBeYear;
        }
    } else {
        // Initialize default dates
        initDefaultDates();
    }

    updateDateDisplays();
}

function initDefaultDates() {
    const today = new Date();
    const sDay = toKhmerNumber(today.getDate());
    const sYear = toKhmerNumber(today.getFullYear());
    
    if (document.getElementById('solar-day')) document.getElementById('solar-day').value = sDay;
    if (document.getElementById('solar-year')) document.getElementById('solar-year').value = sYear;
    if (document.getElementById('lunar-be-year')) document.getElementById('lunar-be-year').value = toKhmerNumber(today.getFullYear() + 544);
}

function loadSchoolInfo() {
    if (!window.classManager) return;
    const info = window.classManager.getSchoolInfo();
    const currentClass = window.classManager.getCurrentClass();

    const lblCluster = document.getElementById('lbl-cluster');
    const lblSchool = document.getElementById('lbl-school');
    const lblClass = document.getElementById('lbl-class');
    const sigTeacher = document.getElementById('sig-teacher');
    const sigDirector = document.getElementById('sig-director');

    if (lblCluster) lblCluster.textContent = info.cluster || 'ទីពោ';
    if (lblSchool) lblSchool.textContent = info.school || 'សាលាបឋមសិក្សា ផ្លុង';
    if (lblClass) lblClass.textContent = currentClass || '៦ គ';
    if (sigTeacher) sigTeacher.textContent = info.teacher || '...................................................';
    if (sigDirector) sigDirector.textContent = info.director || '...................................................';
}

const DEFAULT_STUDENT_ROSTER = [
    { id: '1312', name: 'កែម សុផាន់ណា', gender: 'ស' },
    { id: '1173', name: 'កែ សុគាម', gender: 'ប' },
    { id: '1290', name: 'ខន ប៊ុនថង', gender: 'ប' },
    { id: '1301', name: 'ខែត លីនដា', gender: 'ស' },
    { id: '1328', name: 'ឃួន ស្រីឃួច', gender: 'ស' },
    { id: '1327', name: 'ងឿន ភីម', gender: 'ស' },
    { id: '1135', name: 'ចំរើន បញ្ញា', gender: 'ស' },
    { id: '1298', name: 'ចំរើន សុធារិទ្ធ', gender: 'ប' },
    { id: '1314', name: 'ឆៃនី នីតា', gender: 'ស' },
    { id: '1288', name: 'ដំ ស្រីនា', gender: 'ស' },
    { id: '1444', name: 'តឿម ប៊ុនតី', gender: 'ប' },
    { id: '1445', name: 'នឹម លីម៉េង', gender: 'ប' },
    { id: '1446', name: 'ប៉ីន បូណា', gender: 'ប' },
    { id: '1286', name: 'ប៊ុនធឿន ម៉ីម៉ី', gender: 'ស' },
    { id: '1448', name: 'ផាយ ស្រីតា', gender: 'ស' },
    { id: '1299', name: 'ផូ ចិន', gender: 'ស' },
    { id: '1449', name: 'ពក ពេជ្រ', gender: 'ប' },
    { id: '1295', name: 'ពូក សៀងហុង', gender: 'ប' },
    { id: '1275', name: 'ពេញ រក្សា', gender: 'ស' },
    { id: '1450', name: 'ភាង សំភ័ន្ន', gender: 'ប' },
    { id: '1279', name: 'ភាព សោភា', gender: 'ប' },
    { id: '1451', name: 'ភឿន សារ៉ាយ', gender: 'ស' },
    { id: '1335', name: 'ម៉ុន លីហ្សា', gender: 'ស' },
    { id: '1131', name: 'យ៉ុន សូរិយា', gender: 'ស' },
    { id: '1303', name: 'រ៉ង ភារ៉ូត', gender: 'ប' },
    { id: '1285', name: 'រ៉ាយ ធារ័ត្ន', gender: 'ស' },
    { id: '1282', name: 'រ៉ី សៀងរ៉ាត់', gender: 'ប' },
    { id: '1281', name: 'រិន ថុនា', gender: 'ស' },
    { id: '1452', name: 'រឿង វីរៈ', gender: 'ប' },
    { id: '1294', name: 'លីម គីមលីញ', gender: 'ស' },
    { id: '1453', name: 'លីម សុខា', gender: 'ប' },
    { id: '1244', name: 'លុក រៀម', gender: 'ប' },
    { id: '1280', name: 'វង រ៉ាឌី', gender: 'ស' },
    { id: '1283', name: 'វ៉ាន់ ឧស្សាហ៍', gender: 'ប' },
    { id: '1249', name: 'វ៉ិត ណាវី', gender: 'ស' },
    { id: '1323', name: 'រ៉ឹក វី', gender: 'ប' },
    { id: '1454', name: 'វិសាល រ៉ាឌី', gender: 'ស' },
    { id: '1455', name: 'វុត្ធី សុភ័ណ្ឌ', gender: 'ស' },
    { id: '1307', name: 'ស៊ីញ ភ័ក្រ្តវណ្ណ', gender: 'ស' },
    { id: '1274', name: 'ស៊ី ស្រីណែត', gender: 'ស' },
    { id: '1278', name: 'សី នីតា', gender: 'ស' },
    { id: '1456', name: 'សី ស៊ីផៃ', gender: 'ស' },
    { id: '1457', name: 'សុខ សៅ', gender: 'ប' },
    { id: '1458', name: 'សុភា នីកា', gender: 'ស' },
    { id: '1459', name: 'សៀប ដានិ', gender: 'ប' },
    { id: '1304', name: 'សេក សុធា', gender: 'ប' },
    { id: '1306', name: 'សេង លីហ្សា', gender: 'ស' },
    { id: '1318', name: 'សៅ សុខា', gender: 'ស' },
    { id: '1316', name: 'ហ៊ី ម៉ាហា', gender: 'ប' },
    { id: '1308', name: 'ហួន សុខណាក់', gender: 'ប' },
    { id: '1309', name: 'ហេង ឡៃហៀក', gender: 'ស' },
    { id: '1460', name: 'ហេង ឡៃហៀង', gender: 'ប' },
    { id: '1393', name: 'អ៊ាន់ ស៊ីណាវ', gender: 'ស' },
    { id: '1289', name: 'អ៊ន អ៊ុត', gender: 'ប' }
];

function getAvailableStudents() {
    let students = [];
    
    // 1. Try class-scoped studentProfilesData
    if (window.classManager) {
        const key = window.classManager.getKey('studentProfilesData');
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data) && data.length > 0) students = data;
        } catch(e) {}
    }

    // 2. Try global studentProfilesData
    if (!students || students.length === 0) {
        try {
            const data = JSON.parse(localStorage.getItem('studentProfilesData'));
            if (Array.isArray(data) && data.length > 0) students = data;
        } catch(e) {}
    }

    // 3. Try studentRosterData
    if (!students || students.length === 0) {
        if (window.classManager) {
            const key = window.classManager.getKey('studentRosterData');
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0) students = data;
            } catch(e) {}
        }
        if (!students || students.length === 0) {
            try {
                const data = JSON.parse(localStorage.getItem('studentRosterData'));
                if (Array.isArray(data) && data.length > 0) students = data;
            } catch(e) {}
        }
    }

    // 4. Try studentGradesData
    if (!students || students.length === 0) {
        let gradesKey = 'studentGradesData';
        if (window.classManager) {
            gradesKey = window.classManager.getKey('studentGradesData');
        }
        try {
            const grades = JSON.parse(localStorage.getItem(gradesKey)) || JSON.parse(localStorage.getItem('studentGradesData')) || [];
            if (Array.isArray(grades) && grades.length > 0) {
                students = grades.map(g => ({ name: g.name, id: g.id, gender: g.gender }));
            }
        } catch(e) {}
    }

    // 5. Fallback to default student roster (54 students)
    if (!students || students.length === 0) {
        students = DEFAULT_STUDENT_ROSTER;
    }

    return students;
}

function populateStudentSelectOptions() {
    const students = getAvailableStudents();
    const selectElements = document.querySelectorAll('.role-student-select');

    selectElements.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- ជ្រើសរើសសិស្ស --</option>';
        
        students.forEach((s, idx) => {
            const name = (s.name || '').trim();
            if (name) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = `${toKhmerNumber(idx + 1)}. ${name}${s.gender ? ' (' + s.gender + ')' : ''}`;
                select.appendChild(opt);
            }
        });

        // Restore value if available
        if (currentValue) {
            select.value = currentValue;
        }

        // Auto-save on change
        select.onchange = () => {
            saveDuties(false);
        };
    });
}

window.autoAssignLeadership = function() {
    const students = getAvailableStudents();

    if (students.length === 0) {
        alert('សូមបញ្ចូលទិន្នន័យសិស្សក្នុងទំព័រ "ប្រវត្តិរូបសិស្ស" ឬ "បញ្ចូលពិន្ទុ" ជាមុនសិន!');
        return;
    }

    // Populate roles sequentially from the active class roster
    ROLE_FIELDS.forEach((fieldId, idx) => {
        const input = document.getElementById(fieldId);
        if (input && students[idx]) {
            input.value = students[idx].name;
        }
    });

    saveDuties(false);
    showDutyToast('🎉 បានចាប់ឈ្មោះសិស្សពីបញ្ជីថ្នាក់មកបំពេញតួនាទីដោយជោគជ័យ!');
};

window.clearAllDuties = function() {
    if (!confirm('តើអ្នកពិតជាចង់សម្អាតឈ្មោះក្នុងតួនាទីទាំងអស់មែនទេ?')) return;
    ROLE_FIELDS.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) input.value = '';
    });
    saveDuties(false);
    showDutyToast('🗑️ បានសម្អាតឈ្មោះរួចរាល់!');
};

window.saveDuties = function(showNotif = true) {
    if (!window.classManager) return;

    const dataToSave = {
        dates: {
            solarLocation: document.getElementById('solar-location')?.value || '',
            solarDay: document.getElementById('solar-day')?.value || '',
            solarMonth: document.getElementById('solar-month')?.value || '',
            solarYear: document.getElementById('solar-year')?.value || '',
            lunarDayName: document.getElementById('lunar-day-name')?.value || '',
            lunarPhase: document.getElementById('lunar-phase')?.value || '',
            lunarMonth: document.getElementById('lunar-month')?.value || '',
            lunarZodiac: document.getElementById('lunar-zodiac')?.value || '',
            lunarEra: document.getElementById('lunar-era')?.value || '',
            lunarBeYear: document.getElementById('lunar-be-year')?.value || ''
        }
    };

    ROLE_FIELDS.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            dataToSave[fieldId] = input.value.trim();
        }
    });

    const storageKey = window.classManager.getKey('studentDutiesData');
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    if (window.dbSync && window.dbSync.saveKey) {
        window.dbSync.saveKey(storageKey, JSON.stringify(dataToSave));
    }

    if (showNotif) {
        showDutyToast('✅ បានរក្សាទុកការបែងចែកតួនាទីសិស្សដោយជោគជ័យ!');
    }
};

function showDutyToast(msg) {
    let notif = document.getElementById('duty-toast-notif');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'duty-toast-notif';
        notif.style.cssText = 'position: fixed; bottom: 25px; right: 25px; background: #0f172a; color: #f8fafc; padding: 14px 22px; border-radius: 12px; font-family: "Battambang", sans-serif; font-size: 0.92rem; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.35); border-left: 5px solid #10b981; transition: all 0.3s ease; opacity: 0; transform: translateY(20px); pointer-events: none;';
        document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(20px)';
    }, 3000);
}

window.downloadPDF = function() {
    const element = document.getElementById('duty-print-area');
    if (!element) return;

    const opt = {
        margin: [4, 4, 4, 4],
        filename: `ការបែងចែកតួនាទីសិស្ស_${window.classManager ? window.classManager.getCurrentClass() : 'Class'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
};

window.downloadWord = function() {
    const content = document.getElementById('duty-print-area').innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>ការបែងចែកតួនាទីសិស្ស</title>
    <style>
        body { font-family: 'Battambang', Arial, sans-serif; }
        .moul-font { font-family: 'Moul', cursive; }
        .duty-frame { border: 2px solid #0b3c8f; padding: 15px; }
        .role-card { border: 1px solid #ccc; padding: 8px; margin-bottom: 8px; }
    </style>
    </head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `ការបែងចែកតួនាទីសិស្ស_${window.classManager ? window.classManager.getCurrentClass() : 'Class'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};
