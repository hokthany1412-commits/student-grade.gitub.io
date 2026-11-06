// student-roster.js - Official Student Roster Management & Printable Document

// Default 54 Students from Official Template
const DEFAULT_STUDENT_ROSTER = [
    { id: '1312', name: 'កែម សុផាន់ណា', gender: 'ស', fatherName: 'អូន កែម', motherName: 'ថន យៀក', pobVillage: 'ផ្លុង', phone: '096 55 57 139', note: '' },
    { id: '1173', name: 'កែ សុគាម', gender: 'ប', fatherName: 'កែម កែ', motherName: 'ម៉ាប់ សុំ', pobVillage: 'ផ្លុង', phone: '093 906 739', note: '' },
    { id: '1290', name: 'ខន ប៊ុនថង', gender: 'ប', fatherName: 'ខន ខេង', motherName: 'ឡុច ញ៉ាញ់', pobVillage: 'ផ្លុង', phone: '093 298 475', note: 'ក្រ២/០៤៣១/២០២៣' },
    { id: '1301', name: 'ខែត លីនដា', gender: 'ស', fatherName: 'ខន ខែត', motherName: 'ហ៊ុយ ភ័ក្ត្រ', pobVillage: 'ផ្លុង', phone: '096 66 12 757', note: '' },
    { id: '1328', name: 'ឃួន ស្រីឃួច', gender: 'ស', fatherName: 'សែម សុខឃួន', motherName: 'ជឹម ម៉ៅ', pobVillage: 'ផ្លុង', phone: '096 84 37 105', note: 'ក្រ២/០៧១៥/២០២៤' },
    { id: '1327', name: 'ងឿន ភីម', gender: 'ស', fatherName: 'ងឿន ម៉ុក', motherName: 'ខា សុឃឿន', pobVillage: 'ផ្លុង', phone: '085 59 34 19 340', note: 'ក្រ២/០៤២០/២០២២' },
    { id: '1135', name: 'ចំរើន បញ្ញា', gender: 'ស', fatherName: 'គិន ចំរើន', motherName: 'ភៀន ភី', pobVillage: 'ផ្លុង', phone: '081 755 941', note: '' },
    { id: '1298', name: 'ចំរើន សុធារិទ្ធ', gender: 'ប', fatherName: 'សុង ចំរើន', motherName: 'សៃ សារូ', pobVillage: 'ផ្លុង', phone: '031 53 11 222', note: '' },
    { id: '1314', name: 'ឆៃនី នីតា', gender: 'ស', fatherName: 'ប៊ុន ឆៃនី', motherName: 'អៀង ឡៃនួន', pobVillage: 'ផ្លុង', phone: '096 26 59 605', note: 'ក្រ២/០៤៩៦/២០២៣' },
    { id: '1288', name: 'ដំ ស្រីនា', gender: 'ស', fatherName: 'មិថុនា ដំ (ស្លាប់)', motherName: 'ធូ ញឹក', pobVillage: 'ផ្លុង', phone: '', note: 'ក្រ២/០៤៩៥/២០២៣(កំព្រា ឪពុក)' },
    { id: '1444', name: 'តឿម ប៊ុនតី', gender: 'ប', fatherName: 'រៀន ប៊ុនតឿម', motherName: 'ឌី ភឿប', pobVillage: 'ផ្លុង', phone: '096 61 78 179', note: '' },
    { id: '1445', name: 'នឹម លីម៉េង', gender: 'ប', fatherName: 'នឹម នីម', motherName: 'ទុំ ឃ្លាណា', pobVillage: 'ផ្លុង', phone: '096 80 01 958', note: 'ក្រ២/០៥៩៨/២០២៣' },
    { id: '1446', name: 'ប៉ីន បូណា', gender: 'ប', fatherName: 'ម៉ា ប៉ីន', motherName: 'គី ធុន', pobVillage: 'ផ្លុង', phone: '081 744 412', note: 'ក្រ១/០៧៥៥/២០២៥' },
    { id: '1286', name: 'ប៊ុនធឿន ម៉ីម៉ី', gender: 'ស', fatherName: 'ហម ប៊ុនធឿន', motherName: 'វ៉ន ចន្ទី', pobVillage: 'ផ្លុង', phone: '015 341 473', note: '' },
    { id: '1448', name: 'ផាយ ស្រីតា', gender: 'ស', fatherName: 'ឌី ផាយ', motherName: 'សៅ មន', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1299', name: 'ផូ ចិន', gender: 'ស', fatherName: 'ងួន ផូ', motherName: 'ប៉ៅ រែន', pobVillage: 'ផ្លុង', phone: '093 927 873', note: 'ក្រ២/០៤២២/២០២៣' },
    { id: '1449', name: 'ពក ពេជ្រ', gender: 'ប', fatherName: 'ហ៊ឹម ពក', motherName: 'យូ យ៉ា', pobVillage: 'ផ្លុង', phone: '096 56 34 678', note: '' },
    { id: '1295', name: 'ពូក សៀងហុង', gender: 'ប', fatherName: 'ហុន ពូក', motherName: 'ឡាញ ពិសី', pobVillage: 'ផ្លុង', phone: '081 634 296', note: '' },
    { id: '1275', name: 'ពេញ រក្សា', gender: 'ស', fatherName: 'អ៊ុ ពេញ', motherName: 'ហ៊ឹម ហ៊ាន', pobVillage: 'ផ្លុង', phone: '069 306 381', note: '' },
    { id: '1450', name: 'ភាង សំភ័ន្ន', gender: 'ប', fatherName: 'ភី ភាង', motherName: 'ជូ សុខធឿន', pobVillage: 'ផ្លុង', phone: '096 99 41 871', note: '' },
    { id: '1279', name: 'ភាព សោភា', gender: 'ប', fatherName: 'ឈឹម ភាព', motherName: 'ហ៊ាន ហួន', pobVillage: 'ផ្លុង', phone: '096 84 50 646', note: '' },
    { id: '1451', name: 'ភឿន សារ៉ាយ', gender: 'ស', fatherName: 'អ៊ុង សុភឿន', motherName: 'ណាក រ៉ន', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1335', name: 'ម៉ុន លីហ្សា', gender: 'ស', fatherName: 'ភិន ពន្លក', motherName: 'ស៊ឹង សុភន', pobVillage: 'ផ្លុង', phone: '086 383 950', note: '' },
    { id: '1131', name: 'យ៉ុន សូរិយា', gender: 'ស', fatherName: 'គឹម យឹម', motherName: 'អ៊ឹម ឡួយ', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1303', name: 'រ៉ង ភារ៉ូត', gender: 'ប', fatherName: 'ស៊ឹង សំវង់', motherName: 'ជា សុភ័ក្រ', pobVillage: 'ផ្លុង', phone: '070 382 956', note: '' },
    { id: '1285', name: 'រ៉ាយ ធារ័ត្ន', gender: 'ស', fatherName: 'រ៉ី វ៉ាយ', motherName: 'ជូន ផាយ', pobVillage: 'ផ្លុង', phone: '087 469 726', note: '' },
    { id: '1282', name: 'រ៉ី សៀងរ៉ាត់', gender: 'ប', fatherName: 'រី រី', motherName: 'ឡាញ ជាង', pobVillage: 'ផ្លុង', phone: '096 77 17 263', note: '' },
    { id: '1281', name: 'រិន ថុនា', gender: 'ស', fatherName: 'ម៉ែម រិន', motherName: 'រ៉ន យ៉ាត', pobVillage: 'ផ្លុង', phone: '096 60 63 227', note: '' },
    { id: '1452', name: 'រឿង វីរៈ', gender: 'ប', fatherName: 'នួន រៀង', motherName: 'ប៊ុត ហុង', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1294', name: 'លីម គីមលីញ', gender: 'ស', fatherName: 'ឡៀង សុភ័ណ', motherName: 'ជួន ភ័ន', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1453', name: 'លីម សុខា', gender: 'ប', fatherName: 'លឹម ផាង', motherName: 'ឌី ផ្លាប់', pobVillage: 'ផ្លុង', phone: '093 350 913', note: '' },
    { id: '1244', name: 'លុក រៀម', gender: 'ប', fatherName: 'លឹម លុក', motherName: 'គៀន គាង', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1280', name: 'វង រ៉ាឌី', gender: 'ស', fatherName: 'ញ៉ែប វ៉ែ', motherName: 'សូត្រ ស៊ីដា', pobVillage: 'ផ្លុង', phone: '086 372 547', note: '' },
    { id: '1283', name: 'វ៉ាន់ ឧស្សាហ៍', gender: 'ប', fatherName: 'វ៉ាន់ វ៉ាន់', motherName: 'ឆឹម ពក', pobVillage: 'ផ្លុង', phone: '', note: '' },
    { id: '1249', name: 'វ៉ិត ណាវី', gender: 'ស', fatherName: 'អ៊ុក វ៉ិត', motherName: 'អៀង សុភ័ក្រ', pobVillage: 'ផ្លុង', phone: '069 784 251', note: '' },
    { id: '1323', name: 'រ៉ឹក វី', gender: 'ប', fatherName: 'វ៉ាត វ៉ិត', motherName: 'អៀង លិស', pobVillage: 'ផ្លុង', phone: '096 85 03 730', note: '' },
    { id: '1454', name: 'វិសាល រ៉ាឌី', gender: 'ស', fatherName: 'ហ៊ុយ វិសាល', motherName: 'ខុំ ឃីម', pobVillage: 'ផ្លុង', phone: '081 566 854', note: '' },
    { id: '1455', name: 'វុត្ធី សុភ័ណ្ឌ', gender: 'ស', fatherName: 'ញឹម វុត្ធី', motherName: 'លីម សុភី', pobVillage: 'ផ្លុង', phone: '093 351 055', note: 'ក្រ២/០៥៩០/២០២៣ (កំព្រា ឪពុក)' },
    { id: '1307', name: 'ស៊ីញ ភ័ក្រ្តវណ្ណ', gender: 'ស', fatherName: 'សៀង ស៊ីញ', motherName: 'ប៉ា រា', pobVillage: 'ផ្លុង', phone: '070 366 083', note: '' },
    { id: '1274', name: 'ស៊ី ស្រីណែត', gender: 'ស', fatherName: 'ស្រិន គឹមស្រ៊ី', motherName: 'រី សុខនាថ', pobVillage: 'ផ្លុង', phone: '088 86 83 316', note: '' },
    { id: '1278', name: 'សី នីតា', gender: 'ស', fatherName: 'សី លី', motherName: 'កាំង យៀង', pobVillage: 'ផ្លុង', phone: '081 861 751', note: 'ក្រ២/០៥៨៤/២០២៣' },
    { id: '1456', name: 'សី ស៊ីផៃ', gender: 'ស', fatherName: 'អ៊ុង ពិសី', motherName: 'គូ ជាង', pobVillage: 'ផ្លុង', phone: '096 98 47 001', note: '' },
    { id: '1457', name: 'សុខ សៅ', gender: 'ប', fatherName: 'ស សុក', motherName: 'លុច ប៉ាង', pobVillage: 'ផ្លុង', phone: '', note: 'ក្រ២/០៣៨៤/២០២៣' },
    { id: '1458', name: 'សុភា នីកា', gender: 'ស', fatherName: 'ស៊ឹង សុភា', motherName: 'ជឿន កាន់', pobVillage: 'ផ្លុង', phone: '087 991 282', note: '' },
    { id: '1459', name: 'សៀប ដានិ', gender: 'ប', fatherName: 'ជឹម សាន់', motherName: 'អ៊ុន ធឿន', pobVillage: 'ផ្លុង', phone: '', note: 'ក្រ២/០២៥២/២០២៣' },
    { id: '1304', name: 'សេក សុធា', gender: 'ប', fatherName: 'យឿន សេក', motherName: 'និម សាំង', pobVillage: 'ផ្លុង', phone: '096 54 95 112', note: 'ក្រ២/០៤៧៤/២០២៣' },
    { id: '1306', name: 'សេង លីហ្សា', gender: 'ស', fatherName: 'ស៊ឹង សេង', motherName: 'ខន ផន', pobVillage: 'ផ្លុង', phone: '096 77 41 221', note: '' },
    { id: '1318', name: 'សៅ សុខា', gender: 'ស', fatherName: 'សុះ សៅ', motherName: 'ខ្ញុំ ខៃ', pobVillage: 'ផ្លុង', phone: '096 72 67 034', note: '' },
    { id: '1316', name: 'ហ៊ី ម៉ាហា', gender: 'ប', fatherName: 'រដ្ឋា សេងហ៊ី', motherName: 'ហ៊ុក ផាត់', pobVillage: 'ផ្លុង', phone: '096 83 29 685', note: 'ក្រ២/០៥៥០/២០២៣(កំព្រា ឪពុក)' },
    { id: '1308', name: 'ហួន សុខណាក់', gender: 'ប', fatherName: 'ហាញ់ ហួន', motherName: 'ខន ឈូក', pobVillage: 'ផ្លុង', phone: '069 286 375', note: '' },
    { id: '1309', name: 'ហេង ឡៃហៀក', gender: 'ស', fatherName: 'ភឹម ហ៊ីង', motherName: 'ស៊ីម ផល្លី', pobVillage: 'ផ្លុង', phone: '070 548 199', note: '' },
    { id: '1460', name: 'ហេង ឡៃហៀង', gender: 'ប', fatherName: 'ភឹម ហ៊ីង', motherName: 'ស៊ីម ផល្លី', pobVillage: 'ផ្លុង', phone: '', note: 'ត្រួតថ្នាក់' },
    { id: '1393', name: 'អ៊ាន់ ស៊ីណាវ', gender: 'ស', fatherName: 'អៀង អ៊ាន់', motherName: 'គា ឌី', pobVillage: 'ផ្លុង', phone: '096 83 54 512', note: 'ក្រ២/០៦៨១/២០២៤' },
    { id: '1289', name: 'អ៊ន អ៊ុត', gender: 'ប', fatherName: 'អ៊ឹម អ៊ន', motherName: 'យ៉ុង ធឿន', pobVillage: 'ផ្លុង', phone: '096 68 65 031', note: 'ក្រ២/០៦៨៦/២០២៤' }
];

// State variables
let studentsRoster = [];
let currentNumeralMode = 'arabic'; // 'arabic' (1, 2, 3) or 'khmer' (១, ២, ៣)

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

// Format Number according to toggle mode
function formatNum(num) {
    if (num === null || num === undefined || num === '') return '';
    if (currentNumeralMode === 'khmer') {
        return toKhmerNum(num);
    }
    return toArabicNum(num);
}

// Toggle Numeral Mode
function toggleNumeralMode() {
    currentNumeralMode = currentNumeralMode === 'arabic' ? 'khmer' : 'arabic';
    const btnText = document.getElementById('numeral-mode-text');
    if (btnText) {
        btnText.textContent = currentNumeralMode === 'arabic' ? 'លេខអារ៉ាប់ (1, 2, 3)' : 'លេខខ្មែរ (១, ២, ៣)';
    }
    renderRosterTable();
}

// Load Roster Data
function loadRosterData() {
    let key = 'studentProfilesData';
    if (window.classManager && typeof window.classManager.getKey === 'function') {
        key = window.classManager.getKey('studentProfilesData');
    }

    let stored = localStorage.getItem(key);
    let list = [];

    if (stored) {
        try {
            list = JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored profiles', e);
        }
    }

    // Merge and sync directly with profile data (ក្រ១/ក្រ២/បណ្ណសមធម៌)
    list.forEach(s => {
        const defS = DEFAULT_STUDENT_ROSTER.find(d => d.id === s.id || (d.name && d.name.replace(/\s+/g,'') === (s.name || '').replace(/\s+/g,'')));
        
        // Priority 1: Check if profile has equityCard and equityCardNo
        if (s.equityCard && s.equityCard !== 'គ្មាន' && s.equityCard !== '-') {
            let eqPrefix = '';
            if (s.equityCard.includes('ក្រ១') || s.equityCard === '1') eqPrefix = 'ក្រ១';
            else if (s.equityCard.includes('ក្រ២') || s.equityCard === '2') eqPrefix = 'ក្រ២';
            else if (s.equityCard.includes('ក្រ៣') || s.equityCard === '3') eqPrefix = 'ក្រ៣';
            else eqPrefix = s.equityCard;

            if (s.equityCardNo) {
                let cardNo = s.equityCardNo.toString().trim();
                if (cardNo.startsWith('ក្រ១/') || cardNo.startsWith('ក្រ២/') || cardNo.startsWith('ក្រ៣/')) {
                    s.note = cardNo;
                } else {
                    s.note = `${eqPrefix}/${toKhmerNum(cardNo)}`;
                }
            } else if (!s.note || s.note.startsWith('កម្រិតក្រ')) {
                s.note = defS && defS.note ? defS.note : '';
            }
        }
        // Priority 2: If note is empty or vague placeholder, get from official roster or equityCode
        else if (!s.note || s.note === 'កម្រិតក្រ២' || s.note === 'កម្រិតក្រ១' || s.note === 'កម្រិតក្រ' || s.note === 'ក្រ២' || s.note === 'ក្រ១' || s.note === 'គ្មាន' || s.note === '-') {
            if (defS && defS.note) {
                s.note = defS.note;
            } else if (s.equityCode) {
                s.note = s.equityCode;
            } else if (s.idPoor) {
                s.note = s.idPoor;
            } else {
                s.note = '';
            }
        }

        if (defS) {
            if (!s.phone && defS.phone) s.phone = defS.phone;
            if (!s.fatherName && defS.fatherName) s.fatherName = defS.fatherName;
            if (!s.motherName && defS.motherName) s.motherName = defS.motherName;
            if (!s.pobVillage || s.pobVillage === 'ឆ្លង') s.pobVillage = 'ផ្លុង';
        }
    });

    localStorage.setItem(key, JSON.stringify(list));
    studentsRoster = list;

    // Load Header & Teacher / School Info
    loadSchoolAndClassInfo();
    renderRosterTable();
    updateStatistics();
}

// Load School & Class Information
function loadSchoolAndClassInfo() {
    let schoolName = 'សាលាបឋមសិក្សា ផ្លុង';
    let className = 'ថ្នាក់ទី ៥';
    let year = (window.classManager && typeof window.classManager.getCurrentAcademicYearName === 'function')
        ? window.classManager.getCurrentAcademicYearName()
        : (localStorage.getItem('academicYear') || localStorage.getItem('schoolYear') || '២០២៥ - ២០២៦');
    let teacherName = '...................................................';
    let directorName = '...................................................';

    if (window.classManager) {
        const activeClass = window.classManager.getActiveClass();
        if (activeClass && activeClass.name) {
            className = activeClass.name;
        }

        const classInfoKey = window.classManager.getKey('classInfo');
        const classInfo = JSON.parse(localStorage.getItem(classInfoKey)) || {};
        if (classInfo.academicYear) year = classInfo.academicYear;

        const schoolKey = window.classManager.getKey('schoolRecords');
        const schoolRecords = JSON.parse(localStorage.getItem(schoolKey)) || [];
        if (schoolRecords.length > 0 && schoolRecords[schoolRecords.length - 1].schoolName) {
            const rawSchool = schoolRecords[schoolRecords.length - 1].schoolName.trim();
            if (rawSchool && rawSchool !== 'ផ្លុង' && rawSchool !== 'ឆ្លង') {
                schoolName = rawSchool.includes('សាលា') ? rawSchool : `សាលាបឋមសិក្សា ${rawSchool}`;
            }
        }

        const teacherKey = window.classManager.getKey('teacherProfiles');
        const teacherProfiles = JSON.parse(localStorage.getItem(teacherKey)) || [];
        if (teacherProfiles.length > 0 && teacherProfiles[0].name) {
            teacherName = teacherProfiles[0].name;
        }
    }

    // Saved custom doc settings
    const savedDocSettings = JSON.parse(localStorage.getItem('student_roster_doc_settings')) || {};

    let finalSchoolName = savedDocSettings.schoolName || schoolName;
    if (!finalSchoolName || finalSchoolName === 'ផ្លុង' || finalSchoolName === 'ឆ្លង') {
        finalSchoolName = 'សាលាបឋមសិក្សា ផ្លុង';
    } else if (!finalSchoolName.includes('សាលា') && !finalSchoolName.includes('បឋម')) {
        finalSchoolName = `សាលាបឋមសិក្សា ${finalSchoolName}`;
    }

    const schoolEl = document.getElementById('doc-school-name');
    if (schoolEl) schoolEl.textContent = finalSchoolName;
    document.querySelectorAll('.doc-school-name-p2').forEach(el => el.textContent = finalSchoolName);

    const fullTitle = savedDocSettings.mainTitle || `បញ្ជីឈ្មោះសិស្ស ${className} ឆ្នាំសិក្សា${year}`;
    const titleEl = document.getElementById('doc-main-title');
    if (titleEl) titleEl.textContent = fullTitle;
    document.querySelectorAll('.doc-main-title-p2').forEach(el => el.textContent = `${fullTitle} (តចប់)`);

    const teacherEl = document.getElementById('sig-teacher-name');
    if (teacherEl) teacherEl.textContent = savedDocSettings.teacherName || teacherName;

    const directorEl = document.getElementById('sig-director-name');
    if (directorEl) directorEl.textContent = savedDocSettings.directorName || directorName;

    const lunarEl = document.getElementById('sig-lunar-date');
    if (lunarEl && savedDocSettings.lunarDate) {
        lunarEl.textContent = savedDocSettings.lunarDate;
    }

    const solarEl = document.getElementById('sig-solar-date');
    if (solarEl && savedDocSettings.solarDate) {
        solarEl.textContent = savedDocSettings.solarDate;
    }
}

// Save document editable texts
function saveDocSettings() {
    const settings = {
        schoolName: document.getElementById('doc-school-name')?.textContent.trim(),
        mainTitle: document.getElementById('doc-main-title')?.textContent.trim(),
        teacherName: document.getElementById('sig-teacher-name')?.textContent.trim(),
        directorName: document.getElementById('sig-director-name')?.textContent.trim(),
        lunarDate: document.getElementById('sig-lunar-date')?.textContent.trim(),
        solarDate: document.getElementById('sig-solar-date')?.textContent.trim()
    };
    localStorage.setItem('student_roster_doc_settings', JSON.stringify(settings));
}

// Helper to split full name into Surname & Given Name
function formatNameCell(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
        return `<div class="name-grid-cell"><span class="name-last">${parts[0]}</span><span class="name-first"></span></div>`;
    }
    const lastName = parts[0];
    const firstName = parts.slice(1).join(' ');
    return `<div class="name-grid-cell"><span class="name-last">${lastName}</span><span class="name-first">${firstName}</span></div>`;
}

// Render Table Rows (Split 1-27 on Page 1, 28-54 on Page 2)
function renderRosterTable() {
    const tbodyP1 = document.getElementById('roster-table-body-p1') || document.getElementById('roster-table-body');
    const tbodyP2 = document.getElementById('roster-table-body-p2');

    if (tbodyP1) tbodyP1.innerHTML = '';
    if (tbodyP2) tbodyP2.innerHTML = '';

    studentsRoster.forEach((student, index) => {
        const row = document.createElement('tr');
        const numDisplay = formatNum(index + 1);
        const nameHtml = formatNameCell(student.name || '');
        const gender = student.gender || 'ស';
        const father = student.fatherName || '';
        const mother = student.motherName || '';
        const village = student.pobVillage || student.pob || 'ផ្លុង';
        const phone = student.phone || '';
        
        // Determine note directly from student profile fields (បណ្ណសមធម៌ / ក្រ១ / ក្រ២ / ត្រួតថ្នាក់)
        let note = student.note || '';
        
        // If student has equityCard and equityCardNo, format it as ក្រ១ or ក្រ២ or ក្រ៣ + / + cardNo
        if (student.equityCard && student.equityCard !== 'គ្មាន' && student.equityCard !== '-') {
            let eqPrefix = '';
            if (student.equityCard.includes('ក្រ១') || student.equityCard === '1') eqPrefix = 'ក្រ១';
            else if (student.equityCard.includes('ក្រ២') || student.equityCard === '2') eqPrefix = 'ក្រ២';
            else if (student.equityCard.includes('ក្រ៣') || student.equityCard === '3') eqPrefix = 'ក្រ៣';
            else eqPrefix = student.equityCard;

            if (student.equityCardNo) {
                let cardNo = student.equityCardNo.toString().trim();
                // Ensure format e.g. ក្រ២/០២៨៦/២០២៣
                if (cardNo.startsWith('ក្រ១/') || cardNo.startsWith('ក្រ២/') || cardNo.startsWith('ក្រ៣/')) {
                    note = cardNo;
                } else {
                    note = `${eqPrefix}/${toKhmerNum(cardNo)}`;
                }
            } else if (!note) {
                note = eqPrefix;
            }
        }

        // If note is still a vague placeholder, clean it
        if (note === 'គ្មាន' || note === '-' || note === 'None' || note === 'កម្រិតក្រ២' || note === 'កម្រិតក្រ១' || note === 'កម្រិតក្រ៣') {
            note = '';
        }

        row.innerHTML = `
            <td class="col-no">${numDisplay}</td>
            <td class="col-name" contenteditable="true" onblur="updateStudentName(${index}, this)">${nameHtml}</td>
            <td class="col-gender" contenteditable="true" onblur="updateStudentField(${index}, 'gender', this.textContent)">${gender}</td>
            <td class="col-father" contenteditable="true" onblur="updateStudentField(${index}, 'fatherName', this.textContent)">${father}</td>
            <td class="col-mother" contenteditable="true" onblur="updateStudentField(${index}, 'motherName', this.textContent)">${mother}</td>
            <td class="col-village" contenteditable="true" onblur="updateStudentField(${index}, 'pobVillage', this.textContent)">${village}</td>
            <td class="col-phone" contenteditable="true" onblur="updateStudentField(${index}, 'phone', this.textContent)">${phone}</td>
            <td class="col-note" contenteditable="true" onblur="updateStudentField(${index}, 'note', this.textContent)">${note}</td>
        `;

        // 27 students on Page 1 (1 to 27) and remaining 27 students on Page 2 (28 to 54)
        if (index < 27) {
            if (tbodyP1) tbodyP1.appendChild(row);
        } else {
            if (tbodyP2) tbodyP2.appendChild(row);
            else if (tbodyP1) tbodyP1.appendChild(row);
        }
    });

    updateStatistics();
}

// Update Student Name
function updateStudentName(index, el) {
    if (!studentsRoster[index]) return;
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    studentsRoster[index].name = text;
    saveRosterToStorage();
    el.innerHTML = formatNameCell(text);
    updateStatistics();
}

// Update Single Student Field
function updateStudentField(index, field, value) {
    if (!studentsRoster[index]) return;
    studentsRoster[index][field] = value.trim();
    saveRosterToStorage();
    updateStatistics();
}

// Save Roster to LocalStorage
function saveRosterToStorage() {
    let key = 'studentProfilesData';
    if (window.classManager && typeof window.classManager.getKey === 'function') {
        key = window.classManager.getKey('studentProfilesData');
    }
    localStorage.setItem(key, JSON.stringify(studentsRoster));
    if (window.dbSync && typeof window.dbSync.saveData === 'function') {
        window.dbSync.saveData(key, studentsRoster);
    }
}

// Update Statistics & Total Row
function updateStatistics() {
    const total = studentsRoster.length;
    const females = studentsRoster.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length;
    const males = total - females;
    const equityCount = studentsRoster.filter(s => {
        const n = (s.note || s.equityCard || '').toLowerCase();
        return n.includes('ក្រ១') || n.includes('ក្រ២') || n.includes('ក្រ');
    }).length;
    const repeaterCount = studentsRoster.filter(s => {
        const n = (s.note || s.status || '').toLowerCase();
        return n.includes('ត្រួតថ្នាក់') || n.includes('ត្រួត');
    }).length;

    // Update Toolbar Pills
    const infoTotal = document.getElementById('info-total-students');
    if (infoTotal) infoTotal.textContent = `${total} នាក់`;

    const infoFemale = document.getElementById('info-female-students');
    if (infoFemale) infoFemale.textContent = `${females} នាក់`;

    const infoMale = document.getElementById('info-male-students');
    if (infoMale) infoMale.textContent = `${males} នាក់`;

    const infoEquity = document.getElementById('info-equity-students');
    if (infoEquity) infoEquity.textContent = `${equityCount} នាក់`;

    const infoRepeater = document.getElementById('info-repeater-students');
    if (infoRepeater) infoRepeater.textContent = `${repeaterCount} នាក់`;

    // Update Table Summary Footer
    const summaryFooter = document.getElementById('roster-total-summary');
    if (summaryFooter) {
        const totalKh = toKhmerNum(total);
        const femaleKh = toKhmerNum(females);
        summaryFooter.textContent = `សរុបចំនួនសិស្ស ${totalKh}នាក់ ស្រី ${femaleKh}នាក់`;
    }
}

// Modal Handlers
function openAddStudentModal() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('modal-title').textContent = 'បន្ថែមសិស្សថ្មី';
    document.getElementById('form-village').value = 'ផ្លុង';
    document.getElementById('student-modal').style.display = 'flex';
}

function closeStudentModal() {
    document.getElementById('student-modal').style.display = 'none';
}

function handleSaveStudent(e) {
    e.preventDefault();
    const id = document.getElementById('student-id').value || (Date.now() % 10000).toString();
    const name = document.getElementById('form-name').value.trim();
    const gender = document.getElementById('form-gender').value;
    const fatherName = document.getElementById('form-father').value.trim();
    const motherName = document.getElementById('form-mother').value.trim();
    const pobVillage = document.getElementById('form-village').value.trim() || 'ផ្លុង';
    const phone = document.getElementById('form-phone').value.trim();
    const note = document.getElementById('form-note').value.trim();

    const newStudent = {
        id,
        name,
        gender,
        fatherName,
        motherName,
        pobVillage,
        phone,
        note
    };

    studentsRoster.push(newStudent);
    saveRosterToStorage();
    renderRosterTable();
    closeStudentModal();
}

// EXPORT TO EXCEL WITH FULL STYLING (FONTS, BORDERS, ALIGNMENT)
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការបណ្ណាល័យ Excel...');
        return;
    }

    const schoolName = document.getElementById('doc-school-name')?.textContent.trim() || 'សាលាបឋមសិក្សា ផ្លុង';
    const mainTitle = document.getElementById('doc-main-title')?.textContent.trim() || 'បញ្ជីឈ្មោះសិស្ស ថ្នាក់ទី ៥ ឆ្នាំសិក្សា២០២៥-២០២៦';
    const totalKh = toKhmerNum(studentsRoster.length);
    const femaleKh = toKhmerNum(studentsRoster.filter(s => s.gender === 'ស' || s.gender === 'ស្រី').length);

    const fontTitle = 'Khmer OS Muol Light';
    const fontBody = 'Khmer OS Battambang';

    const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
    };

    const wsData = [
        ['ព្រះរាជាណាចក្រកម្ពុជា', '', '', '', '', '', '', ''],
        ['ជាតិ សាសនា ព្រះមហាក្សត្រ', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        [schoolName, '', '', '', '', '', '', ''],
        [mainTitle, '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['ល.រ', 'គោត្តនាម+នាម', 'ភេទ', 'ឈ្មោះឪពុក', 'ឈ្មោះម្តាយ', 'មកពីភូមិ', 'លេខទូរស័ព្ទ', 'ផ្សេងៗ(ត្រួតថ្នាក់)']
    ];

    const tableStartRow = 6; // 0-indexed row 6 is Header row ('ល.រ', ...)

    studentsRoster.forEach((s, idx) => {
        wsData.push([
            idx + 1,
            s.name || '',
            s.gender || 'ស',
            s.fatherName || '',
            s.motherName || '',
            s.pobVillage || 'ផ្លុង',
            s.phone || '',
            s.note || ''
        ]);
    });

    const tableEndRow = tableStartRow + studentsRoster.length;

    wsData.push([`សរុបចំនួនសិស្ស ${totalKh}នាក់ ស្រី ${femaleKh}នាក់`, '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '']);
    wsData.push(['បានឃើញ និងឯកភាព', '', '', '', document.getElementById('sig-lunar-date')?.textContent.trim() || '', '', '', '']);
    wsData.push(['នាយកសាលា', '', '', '', document.getElementById('sig-solar-date')?.textContent.trim() || '', '', '', '']);
    wsData.push(['', '', '', '', 'ហត្ថលេខា និងឈ្មោះគ្រូបន្ទុកថ្នាក់', '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set Merges Across Columns A to H (0 to 7)
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Kingdom title (Center A-H)
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Kingdom motto (Center A-H)
        { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // School name (Left A-C)
        { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // Main title (Center A-H)
        { s: { r: tableEndRow + 1, c: 0 }, e: { r: tableEndRow + 1, c: 7 } }, // Total summary (Left A-H)
        { s: { r: tableEndRow + 3, c: 0 }, e: { r: tableEndRow + 3, c: 2 } }, // Director Approved
        { s: { r: tableEndRow + 4, c: 0 }, e: { r: tableEndRow + 4, c: 2 } }, // Director Role
        { s: { r: tableEndRow + 3, c: 4 }, e: { r: tableEndRow + 3, c: 7 } }, // Lunar date
        { s: { r: tableEndRow + 4, c: 4 }, e: { r: tableEndRow + 4, c: 7 } }, // Solar date
        { s: { r: tableEndRow + 5, c: 4 }, e: { r: tableEndRow + 5, c: 7 } }  // Teacher Role
    ];

    // Set Column Widths
    ws['!cols'] = [
        { wch: 6 },   // No
        { wch: 22 },  // Name
        { wch: 6 },   // Gender
        { wch: 18 },  // Father
        { wch: 18 },  // Mother
        { wch: 10 },  // Village
        { wch: 16 },  // Phone
        { wch: 28 }   // Note
    ];

    // Apply Styling to Cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            let cell = ws[cellAddress];
            if (!cell) {
                // If cell is part of table, create blank cell with border
                if (R >= tableStartRow && R <= tableEndRow && C <= 7) {
                    ws[cellAddress] = { t: 's', v: '', s: { border: borderThin } };
                }
                continue;
            }

            // Default
            cell.s = {
                font: { name: fontBody, sz: 10 },
                alignment: { vertical: 'center' }
            };

            // Kingdom Header
            if (R === 0 || R === 1) {
                cell.s.font = { name: fontTitle, sz: 11, bold: true };
                cell.s.alignment = { horizontal: 'center', vertical: 'center' };
            }
            // School Name
            else if (R === 3) {
                cell.s.font = { name: fontTitle, sz: 10.5 };
                cell.s.alignment = { horizontal: 'left', vertical: 'center' };
            }
            // Main Title
            else if (R === 4) {
                cell.s.font = { name: fontTitle, sz: 12, bold: true };
                cell.s.alignment = { horizontal: 'center', vertical: 'center' };
            }
            // Table Header Row
            else if (R === tableStartRow) {
                cell.s.font = { name: fontTitle, sz: 9.5, bold: true };
                cell.s.fill = { fgColor: { rgb: 'F1F5F9' } };
                cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                cell.s.border = borderThin;
            }
            // Table Data Rows
            else if (R > tableStartRow && R <= tableEndRow) {
                cell.s.font = { name: fontBody, sz: 10 };
                cell.s.border = borderThin;
                if (C === 0 || C === 2 || C === 5 || C === 6 || C === 7) {
                    cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                } else {
                    cell.s.alignment = { horizontal: 'left', vertical: 'center' };
                }
            }
            // Summary Text (No wrapText, span left)
            else if (R === tableEndRow + 1) {
                cell.s.font = { name: fontTitle, sz: 10.5 };
                cell.s.alignment = { horizontal: 'left', vertical: 'center', wrapText: false };
            }
            // Signatures
            else if (R >= tableEndRow + 3) {
                cell.s.font = { name: fontBody, sz: 10 };
                if (R === tableEndRow + 4 && C === 0) cell.s.font = { name: fontTitle, sz: 10 };
                if (R === tableEndRow + 5 && C === 4) cell.s.font = { name: fontTitle, sz: 10 };
                cell.s.alignment = { horizontal: C === 0 ? 'center' : 'center', vertical: 'center' };
            }
        }
    }

    // Excel Page Setup & Margins (Matches Page Setup: Top 1.4, Bottom 0.4, Left 0.8, Right 0.8, Header 0.8, Footer 0.8)
    ws['!margins'] = {
        top: 1.4 / 2.54,      // 1.4 cm converted to inches
        bottom: 0.4 / 2.54,   // 0.4 cm converted to inches
        left: 0.8 / 2.54,     // 0.8 cm converted to inches
        right: 0.8 / 2.54,    // 0.8 cm converted to inches
        header: 0.8 / 2.54,   // 0.8 cm converted to inches
        footer: 0.8 / 2.54    // 0.8 cm converted to inches
    };

    // Excel Print Page Properties
    ws['!pageSetup'] = {
        paperSize: 9,         // A4
        orientation: 'landscape',
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        verticalCentered: true
    };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'បញ្ជីឈ្មោះសិស្ស');

    const cleanTitle = mainTitle.replace(/[/\\?%*:|"<>]/g, '_');
    XLSX.writeFile(wb, `${cleanTitle}.xlsx`);
}

// EXPORT TO PDF
function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        alert('សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការបណ្ណាល័យ PDF...');
        return;
    }

    const element = document.getElementById('roster-print-sheet');
    const mainTitle = document.getElementById('doc-main-title')?.textContent.trim() || 'បញ្ជីឈ្មោះសិស្ស';

    const opt = {
        margin: [10, 10, 10, 10], // 1cm margin on all sides
        filename: `${mainTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Inject global class selector if classManager exists
    if (window.classManager && typeof window.classManager.renderClassSelector === 'function') {
        const container = document.getElementById('class-selector-container');
        if (container) {
            window.classManager.renderClassSelector(container);
        }
    }

    // Listen for class switch events
    window.addEventListener('classChanged', () => {
        loadRosterData();
    });

    // Initial Load
    loadRosterData();
});
