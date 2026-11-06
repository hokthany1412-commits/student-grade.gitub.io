// remedial-invitation.js - Parent Invitation Letters Generator (2 Cards per A4 Landscape)
// Synchronized 100% with the Remedial Students List & Clean Zero-Blank-Page Printing

// Khmer Number Converter
const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
function toKhmerNum(num) {
    if (num === null || num === undefined || num === '') return '';
    return num.toString().replace(/\d/g, d => khmerDigits[parseInt(d)]);
}

// Global State
let currentClassScope = 'all';
let currentFilterMode = 'remedial'; // 'remedial' | 'custom' | 'weak' | 'all'
let allSchoolStudents = [];
let customSelectedKeys = new Set();
let manualRows = [];
let isBlankMode = false;
let blankCardsCount = 2;

function getClassKey(baseKey, classId) {
    if (!classId || classId === 'default') return baseKey;
    return `${baseKey}_${classId}`;
}

document.addEventListener('DOMContentLoaded', () => {
    initClassScopeDropdown();
    initData();
    setupInlineAutoSave();
});

function initClassScopeDropdown() {
    const dropdown = document.getElementById('class-scope-dropdown');
    const modalFilter = document.getElementById('modal-class-filter');
    if (!dropdown) return;

    const classes = window.classManager ? window.classManager.getClasses() : [
        { id: 'class_g1_k', name: 'ថ្នាក់ទី ១ ក' },
        { id: 'class_g2_k', name: 'ថ្នាក់ទី ២ ក' },
        { id: 'class_g3_k', name: 'ថ្នាក់ទី ៣ ក' },
        { id: 'class_g4_k', name: 'ថ្នាក់ទី ៤ ក' },
        { id: 'default', name: 'ថ្នាក់ទី ៥ ក' },
        { id: 'class_g6_k', name: 'ថ្នាក់ទី ៦ ក' }
    ];

    let optHtml = `<option value="all">🌐 គ្រប់ថ្នាក់ទាំងអស់</option>`;
    let modalOptHtml = `<option value="all">គ្រប់ថ្នាក់ទាំងអស់</option>`;

    classes.forEach(c => {
        optHtml += `<option value="${c.id}">🏫 ${c.name}</option>`;
        modalOptHtml += `<option value="${c.id}">${c.name}</option>`;
    });

    dropdown.innerHTML = optHtml;
    if (modalFilter) modalFilter.innerHTML = modalOptHtml;

    const savedScope = localStorage.getItem('remedial_class_scope');
    if (savedScope && (savedScope === 'all' || classes.some(c => c.id === savedScope))) {
        currentClassScope = savedScope;
        dropdown.value = savedScope;
    }
}

function onClassScopeChanged(newScope) {
    currentClassScope = newScope;
    isBlankMode = false;
    renderInvitations();
    updateStats();
}

function initData() {
    allSchoolStudents = [];

    const classes = window.classManager ? window.classManager.getClasses() : [
        { id: 'class_g1_k', name: 'ថ្នាក់ទី ១ ក' },
        { id: 'class_g2_k', name: 'ថ្នាក់ទី ២ ក' },
        { id: 'class_g3_k', name: 'ថ្នាក់ទី ៣ ក' },
        { id: 'class_g4_k', name: 'ថ្នាក់ទី ៤ ក' },
        { id: 'default', name: 'ថ្នាក់ទី ៥ ក' },
        { id: 'class_g6_k', name: 'ថ្នាក់ទី ៦ ក' }
    ];

    classes.forEach(c => {
        const studentKey = getClassKey('studentProfilesData', c.id);
        const rawStudents = JSON.parse(localStorage.getItem(studentKey)) || [];

        const sem1Key = getClassKey('semester1ExamGrades', c.id);
        const sem2Key = getClassKey('semester2ExamGrades', c.id);
        const annualKey = getClassKey('annualExamGrades', c.id);

        const sem1Grades = JSON.parse(localStorage.getItem(sem1Key)) || [];
        const sem2Grades = JSON.parse(localStorage.getItem(sem2Key)) || [];
        const annualGrades = JSON.parse(localStorage.getItem(annualKey)) || {};

        rawStudents.forEach(s => {
            let avg = null;
            let grade = '';

            if (annualGrades[s.id] && annualGrades[s.id].annualAvg !== undefined) {
                avg = parseFloat(annualGrades[s.id].annualAvg);
                grade = annualGrades[s.id].grade || '';
            } else {
                const s1 = (Array.isArray(sem1Grades) ? sem1Grades : []).find(g => g.id === s.id);
                const s2 = (Array.isArray(sem2Grades) ? sem2Grades : []).find(g => g.id === s.id);

                let s1Avg = s1 && s1.sem_avg !== undefined && s1.sem_avg !== null ? parseFloat(s1.sem_avg) : null;
                let s2Avg = s2 && s2.sem_avg !== undefined && s2.sem_avg !== null ? parseFloat(s2.sem_avg) : null;

                if (s1Avg !== null && s2Avg !== null) avg = (s1Avg + s2Avg) / 2;
                else if (s1Avg !== null) avg = s1Avg;
                else if (s2Avg !== null) avg = s2Avg;
            }

            if (avg !== null && !isNaN(avg)) {
                if (!grade) {
                    if (avg >= 9) grade = 'A';
                    else if (avg >= 8) grade = 'B';
                    else if (avg >= 7) grade = 'C';
                    else if (avg >= 6) grade = 'D';
                    else if (avg >= 5) grade = 'E';
                    else grade = 'F';
                }
            }

            const cleanClassName = (s.grade || s.className || c.name || '').replace(/^ថ្នាក់ទី\s*/, '').trim();

            allSchoolStudents.push({
                ...s,
                compositeKey: `${c.id}_${s.id}`,
                classId: c.id,
                className: c.name,
                grade: cleanClassName,
                annualAvg: avg,
                annualGrade: grade
            });
        });
    });

    // Load manual/Excel rows from Remedial system
    manualRows = JSON.parse(localStorage.getItem('remedial_manual_rows')) || [];
    manualRows.forEach(mr => {
        if (!mr.classId && mr.grade) {
            mr.classId = detectClassIdFromGrade(mr.grade);
        }
    });

    // Load custom selected keys from Remedial system
    const savedCustomKeys = JSON.parse(localStorage.getItem('remedial_selected_keys'));
    if (savedCustomKeys && Array.isArray(savedCustomKeys)) {
        customSelectedKeys = new Set(savedCustomKeys);
    } else {
        customSelectedKeys = new Set();
    }

    currentFilterMode = 'remedial';

    updateFilterButtonsUI();
    renderInvitations();
    updateStats();
}

function setFilterMode(mode) {
    currentFilterMode = mode;
    isBlankMode = false;
    updateFilterButtonsUI();
    renderInvitations();
    updateStats();
}

function updateFilterButtonsUI() {
    const btnRemedial = document.getElementById('btn-filter-remedial');
    const btnCustom = document.getElementById('btn-filter-custom');
    const btnWeak = document.getElementById('btn-filter-weak');
    const btnAll = document.getElementById('btn-filter-all');

    if (btnRemedial) btnRemedial.classList.toggle('active', currentFilterMode === 'remedial');
    if (btnCustom) btnCustom.classList.toggle('active', currentFilterMode === 'custom');
    if (btnWeak) btnWeak.classList.toggle('active', currentFilterMode === 'weak');
    if (btnAll) btnAll.classList.toggle('active', currentFilterMode === 'all');

    const countEl = document.getElementById('custom-selected-count');
    if (countEl) countEl.textContent = toKhmerNum(customSelectedKeys.size);

    const remedialCountEl = document.getElementById('remedial-list-count');
    if (remedialCountEl) {
        const remedialList = getRemedialSystemStudents();
        remedialCountEl.textContent = remedialList.length;
    }
}

function detectClassIdFromGrade(gradeStr) {
    if (!gradeStr) return 'default';
    const cleanNum = gradeStr.toString().replace(/[^0-9០-៩]/g, '').replace(/[០-៩]/g, d => '០១២៣៤៥៦៧៨៩'.indexOf(d));
    if (cleanNum === '1') return 'class_g1_k';
    if (cleanNum === '2') return 'class_g2_k';
    if (cleanNum === '3') return 'class_g3_k';
    if (cleanNum === '4') return 'class_g4_k';
    if (cleanNum === '5') return 'default';
    if (cleanNum === '6') return 'class_g6_k';
    return 'default';
}

function isStudentInClass(s, targetScope) {
    if (!targetScope || targetScope === 'all') return true;
    
    // Direct classId check
    if (s.classId && s.classId === targetScope) return true;

    // Resolve target scope grade digits
    let targetDigits = '';
    if (targetScope === 'class_g1_k') targetDigits = '1';
    else if (targetScope === 'class_g2_k') targetDigits = '2';
    else if (targetScope === 'class_g3_k') targetDigits = '3';
    else if (targetScope === 'class_g4_k') targetDigits = '4';
    else if (targetScope === 'default' || targetScope === 'class_g5_k') targetDigits = '5';
    else if (targetScope === 'class_g6_k') targetDigits = '6';
    else if (window.classManager && typeof window.classManager.getClasses === 'function') {
        const cls = window.classManager.getClasses().find(c => c.id === targetScope);
        if (cls) {
            targetDigits = cls.name.replace(/[^0-9០-៩]/g, '').replace(/[០-៩]/g, d => '០១២៣៤៥៦៧៨៩'.indexOf(d));
        }
    }

    const rawGrade = (s.grade || s.className || '').toString().trim();
    if (!rawGrade) return false;

    const sDigits = rawGrade.replace(/[^0-9០-៩]/g, '').replace(/[០-៩]/g, d => '០១២៣៤៥៦៧៨៩'.indexOf(d));
    if (sDigits && targetDigits && sDigits === targetDigits) return true;

    return false;
}

// Compute the EXACT active remedial list from remedial-students.js
function getRemedialSystemStudents() {
    let list = [];

    // 1. Manual rows (including Excel imported rows in Remedial system)
    const manual = JSON.parse(localStorage.getItem('remedial_manual_rows')) || [];
    manual.forEach(mr => {
        if (isStudentInClass(mr, currentClassScope)) {
            list.push(mr);
        }
    });

    // 2. Custom selected students from Remedial List
    const savedKeys = JSON.parse(localStorage.getItem('remedial_selected_keys'));
    if (savedKeys && Array.isArray(savedKeys) && savedKeys.length > 0) {
        const keySet = new Set(savedKeys);
        allSchoolStudents.forEach(s => {
            if (keySet.has(s.compositeKey)) {
                if (isStudentInClass(s, currentClassScope)) {
                    list.push(s);
                }
            }
        });
    } else if (manual.length === 0) {
        // 3. Only fall back to weak students if there are NO manual/Excel imported rows
        allSchoolStudents.forEach(s => {
            if (s.annualAvg !== null && s.annualAvg > 0 && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E')) {
                if (isStudentInClass(s, currentClassScope)) {
                    list.push(s);
                }
            }
        });
    }

    return list;
}

function getDisplayStudents() {
    if (isBlankMode) {
        const blanks = [];
        for (let i = 0; i < blankCardsCount; i++) {
            blanks.push({
                isBlank: true,
                name: '........................',
                fatherName: '........................',
                motherName: '........................',
                gender: '......',
                grade: '......'
            });
        }
        return blanks;
    }

    if (currentFilterMode === 'remedial') {
        return getRemedialSystemStudents();
    }

    let scopedList = allSchoolStudents.filter(s => isStudentInClass(s, currentClassScope));

    let list = [];
    if (currentFilterMode === 'weak') {
        list = scopedList.filter(s => {
            return s.annualAvg !== null && s.annualAvg > 0 && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E');
        });
    } else if (currentFilterMode === 'custom') {
        list = scopedList.filter(s => customSelectedKeys.has(s.compositeKey));
    } else if (currentFilterMode === 'all') {
        list = [...scopedList];
    }

    manualRows.forEach(mr => {
        if (isStudentInClass(mr, currentClassScope)) {
            list.push(mr);
        }
    });

    return list;
}

function getSettings() {
    const officeName = localStorage.getItem('invitation_office_name') || 'ការិយាល័យអប់រំយុវជន និងកីឡាស្រុកសន្ទុក';
    const schoolName = localStorage.getItem('invitation_school_name') || 'សាលាបឋមសិក្សា ផ្លុង';
    const purpose = localStorage.getItem('invitation_purpose') || 'ដើម្បីមកចូលរួមប្រជុំស្តីពីការបំប៉នបន្ថែមនៅចុងឆ្នាំសិក្សា២០២៥-២០២៦ កូន ក្នុងការរៀនសូត្រ។';
    const venue = localStorage.getItem('invitation_venue') || 'នៅសាលាបឋមសិក្សា ផ្លុង';
    const time = localStorage.getItem('invitation_time') || 'ម៉ោង ៧ : ៣០ នាទីព្រឹក';
    const dateText = localStorage.getItem('invitation_date_text') || 'ថ្ងៃអង្គារ ១២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០ ត្រូវនឹងថ្ងៃទី ២៥ ខែ សីហា ឆ្នាំ ២០២៦';
    const principal = localStorage.getItem('remedial_principal_name') || '....................................';

    return { officeName, schoolName, purpose, venue, time, dateText, principal };
}

// RENDER 2 INVITATIONS PER A4 LANDSCAPE SHEET
function renderInvitations() {
    const container = document.getElementById('invitations-container');
    if (!container) return;

    const students = getDisplayStudents();
    const cfg = getSettings();

    const totalEl = document.getElementById('total-invitations-count');
    if (totalEl) totalEl.textContent = students.length;

    if (students.length === 0) {
        container.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 40px; text-align: center; color: #64748b; width: 100%; max-width: 600px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">✉️</div>
                <h3 style="margin: 0 0 8px 0; color: #1e293b; font-family: var(--font-khmer-title); font-weight: normal; font-size: 1.1rem;">មិនមានទិន្នន័យសិស្សក្នុងបញ្ជីបំប៉ននៅឡើយទេ</h3>
                <p style="font-size: 0.9rem; margin-bottom: 16px;">លោកគ្រូ/អ្នកគ្រូ អាចចុចប៊ូតុង «ជ្រើសរើសសិស្ស (+/-)» ឬត្រឡប់ទៅ «បញ្ជីសិស្សបំប៉ន» ដើម្បីនាំចូលពី Excel</p>
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <a href="remedial-students.html" class="btn btn-secondary" style="font-size: 0.85rem; text-decoration: none;">📋 ទៅកាន់បញ្ជីសិស្សបំប៉ន</a>
                    <button class="btn btn-primary" onclick="openStudentPickerModal()" style="font-size: 0.85rem;">🎯 ជ្រើសរើសសិស្ស (+/-)</button>
                </div>
            </div>
        `;
        return;
    }

    // Pair into 2 cards per sheet (Only pair real students, avoid generating trailing empty cards if odd)
    const sheets = [];
    for (let i = 0; i < students.length; i += 2) {
        sheets.push([students[i], students[i + 1] || null]);
    }

    let html = '';
    sheets.forEach((pair, sheetIdx) => {
        const card1 = pair[0];
        const card2 = pair[1];

        html += `
            <div class="a4-landscape-sheet" data-sheet="${sheetIdx + 1}">
                <!-- CARD 1 (LEFT) -->
                ${renderSingleCardHtml(card1, cfg)}

                <!-- CUTTING DIVIDER -->
                <div class="cutting-divider"></div>

                <!-- CARD 2 (RIGHT) -->
                ${card2 ? renderSingleCardHtml(card2, cfg) : renderSingleCardHtml({ isBlank: true, name: '........................', fatherName: '........................', motherName: '........................', gender: '......', grade: '......' }, cfg)}
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderSingleCardHtml(s, cfg) {
    let father = s.fatherName || '';
    let mother = s.motherName || '';

    if (!father && !mother && s.guardian) {
        if (s.guardian.includes(' / ')) {
            const parts = s.guardian.split(' / ');
            father = parts[0].trim();
            mother = parts[1].trim();
        } else {
            father = s.guardian.trim();
        }
    }

    if (!father) father = '........................';
    if (!mother) mother = '........................';

    const name = s.name || s.studentName || '........................';
    
    let gender = s.gender || '';
    if (gender === 'ប' || gender === 'ប្រុស' || (typeof gender === 'string' && (gender.toLowerCase() === 'm' || gender.toLowerCase() === 'male'))) {
        gender = 'ប្រុស';
    } else if (gender === 'ស' || gender === 'ស្រី' || (typeof gender === 'string' && (gender.toLowerCase() === 'f' || gender.toLowerCase() === 'female'))) {
        gender = 'ស្រី';
    }
    if (!gender) gender = '......';

    let grade = s.grade || s.className || '';
    grade = grade.replace(/^ថ្នាក់ទី\s*/, '').trim();
    grade = toKhmerNum(grade);
    if (!grade) grade = '......';

    return `
        <div class="invitation-card">
            <div>
                <!-- Top Motto Center -->
                <div class="motto-section">
                    <div class="motto-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div class="motto-sub">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <img src="header-divider.png" alt="divider" class="motto-divider" onerror="this.onerror=null; this.src='images/header-divider.png';">
                </div>

                <!-- School Info Left -->
                <div class="school-branch-info">
                    <div class="office-title editable-item" contenteditable="true" data-cfg="office">${cfg.officeName}</div>
                    <div class="school-name-title editable-item" contenteditable="true" data-cfg="school">${cfg.schoolName}</div>
                </div>

                <!-- Heading Titles Center -->
                <div class="invitation-heading-box">
                    <div class="invitation-main-title">លិខិតអញ្ជើញ</div>
                    <div class="sender-title">នាយក${cfg.schoolName}</div>
                    <div class="respect-invite-title">សូមគោរពអញ្ជើញ</div>
                </div>

                <!-- Body Content (Khmer OS Battambang Size 12 - Single Flowing Sentence) -->
                <div class="invitation-body">
                    លោក <span class="field-highlight">${father}</span> ឬលោកស្រី <span class="field-highlight">${mother}</span> ដែលជាឪពុក ឬម្តាយសិស្សឈ្មោះ <span class="field-highlight">${name}</span> ភេទ <span class="field-highlight">${gender}</span> រៀននៅថ្នាក់ទី <span class="field-highlight">${grade}</span> <span class="editable-item" contenteditable="true" data-cfg="purpose">${cfg.purpose}</span>
                </div>

                <!-- Meeting Points (Khmer OS Battambang Size 12) -->
                <ul class="meeting-list">
                    <li>
                        <span class="meeting-list-bullet">➤</span>
                        <span class="meeting-list-label">ទីកន្លែងប្រជុំ</span>
                        <span class="meeting-list-sep">៖</span>
                        <span class="meeting-list-val editable-item" contenteditable="true" data-cfg="venue">${cfg.venue}</span>
                    </li>
                    <li>
                        <span class="meeting-list-bullet">➤</span>
                        <span class="meeting-list-label">កាលបរិច្ឆេទ</span>
                        <span class="meeting-list-sep">៖</span>
                        <span class="meeting-list-val editable-item" contenteditable="true" data-cfg="dateText">${cfg.dateText}</span>
                    </li>
                    <li>
                        <span class="meeting-list-bullet">➤</span>
                        <span class="meeting-list-label">ពេលវេលា</span>
                        <span class="meeting-list-sep">៖</span>
                        <span class="meeting-list-val editable-item" contenteditable="true" data-cfg="time">${cfg.time}</span>
                    </li>
                </ul>
            </div>

            <!-- Signature Bottom Right - Elevated -->
            <div class="invitation-signature-box">
                <div class="signature-inner">
                    <div class="sign-role">នាយកសាលា</div>
                    <div class="sign-author editable-item" contenteditable="true" data-cfg="principal">${cfg.principal}</div>
                </div>
            </div>
        </div>
    `;
}

function generateBlankInvitations(count = 2) {
    isBlankMode = true;
    blankCardsCount = count || 2;
    renderInvitations();
}

// Auto-save inline edits on the card
function setupInlineAutoSave() {
    const container = document.getElementById('invitations-container');
    if (!container) return;

    container.addEventListener('blur', (e) => {
        if (e.target.classList.contains('editable-item')) {
            const key = e.target.dataset.cfg;
            const val = e.target.textContent.trim();
            if (key === 'office') localStorage.setItem('invitation_office_name', val);
            else if (key === 'school') localStorage.setItem('invitation_school_name', val);
            else if (key === 'purpose') localStorage.setItem('invitation_purpose', val);
            else if (key === 'venue') localStorage.setItem('invitation_venue', val);
            else if (key === 'time') localStorage.setItem('invitation_time', val);
            else if (key === 'dateText') localStorage.setItem('invitation_date_text', val);
            else if (key === 'principal') localStorage.setItem('remedial_principal_name', val);
        }
    }, true);
}

function updateStats() {
    const list = getDisplayStudents();
    const countEl = document.getElementById('total-invitations-count');
    if (countEl) countEl.textContent = list.length;
}

// ==================== SETTINGS MODAL ====================
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const cfg = getSettings();
    document.getElementById('cfg-office-name').value = cfg.officeName;
    document.getElementById('cfg-school-name').value = cfg.schoolName;
    document.getElementById('cfg-meeting-purpose').value = cfg.purpose;
    document.getElementById('cfg-meeting-venue').value = cfg.venue;
    document.getElementById('cfg-meeting-time').value = cfg.time;
    document.getElementById('cfg-full-date-text').value = cfg.dateText;
    document.getElementById('cfg-principal-name').value = cfg.principal.includes('...') ? '' : cfg.principal;

    modal.style.display = 'flex';
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
}

function onDatePickerChanged(dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const d = toKhmerNum(String(dateObj.getDate()).padStart(2, '0'));
    const m = khmerMonths[dateObj.getMonth()];
    const y = toKhmerNum(dateObj.getFullYear());

    let lunarPart = '';
    if (typeof KhmerCalendar !== 'undefined' && typeof KhmerCalendar.toKhmerLunarDate === 'function') {
        const res = KhmerCalendar.toKhmerLunarDate(dateObj);
        if (res && res.lunarDateText) {
            let t = res.lunarDateText;
            if (t.includes('ត្រូវនឹង')) t = t.split('ត្រូវនឹង')[0].trim();
            lunarPart = t;
        }
    }

    let fullText = '';
    if (lunarPart) {
        fullText = `${lunarPart} ត្រូវនឹងថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
    } else {
        const dayNames = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
        const dayName = dayNames[dateObj.getDay()];
        fullText = `ថ្ងៃ${dayName} ត្រូវនឹងថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
    }

    document.getElementById('cfg-full-date-text').value = fullText;
}

function setTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePicker = document.getElementById('cfg-date-picker');
    if (datePicker) {
        datePicker.value = `${yyyy}-${mm}-${dd}`;
        onDatePickerChanged(datePicker.value);
    }
}

function saveSettings() {
    const office = document.getElementById('cfg-office-name').value.trim();
    const school = document.getElementById('cfg-school-name').value.trim();
    const purpose = document.getElementById('cfg-meeting-purpose').value.trim();
    const venue = document.getElementById('cfg-meeting-venue').value.trim();
    const time = document.getElementById('cfg-meeting-time').value.trim();
    const dateText = document.getElementById('cfg-full-date-text').value.trim();
    const principal = document.getElementById('cfg-principal-name').value.trim();

    if (office) localStorage.setItem('invitation_office_name', office);
    if (school) localStorage.setItem('invitation_school_name', school);
    if (purpose) localStorage.setItem('invitation_purpose', purpose);
    if (venue) localStorage.setItem('invitation_venue', venue);
    if (time) localStorage.setItem('invitation_time', time);
    if (dateText) localStorage.setItem('invitation_date_text', dateText);
    if (principal) localStorage.setItem('remedial_principal_name', principal);

    closeSettingsModal();
    renderInvitations();
}

// ==================== STUDENT PICKER MODAL ====================
function openStudentPickerModal() {
    const modal = document.getElementById('student-picker-modal');
    const tbody = document.getElementById('modal-student-table-body');
    if (!modal || !tbody) return;

    let html = '';
    allSchoolStudents.forEach(s => {
        const isChecked = customSelectedKeys.has(s.compositeKey) ? 'checked' : '';
        let gender = s.gender || '';
        if (gender === 'ប' || gender === 'ប្រុស' || (typeof gender === 'string' && (gender.toLowerCase() === 'm' || gender.toLowerCase() === 'male'))) gender = 'ប្រុស';
        else if (gender === 'ស' || gender === 'ស្រី' || (typeof gender === 'string' && (gender.toLowerCase() === 'f' || gender.toLowerCase() === 'female'))) gender = 'ស្រី';

        let parents = s.fatherName || '';
        if (s.motherName) {
            parents = parents ? `${parents} / ${s.motherName}` : s.motherName;
        } else if (!parents && s.guardian) {
            parents = s.guardian;
        }
        if (!parents) parents = '-';

        const isWeak = s.annualAvg !== null && s.annualAvg > 0 && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E');

        html += `
            <tr data-class-id="${s.classId}" style="border-bottom: 1px solid #f1f5f9; ${isWeak ? 'background-color: #fff7ed;' : ''}">
                <td style="padding: 6px 8px; text-align: center;">
                    <input type="checkbox" class="student-modal-cb" value="${s.compositeKey}" ${isChecked}>
                </td>
                <td style="padding: 6px 8px; font-weight: 600;">
                    ${s.name || s.studentName}
                    ${isWeak ? '<span style="font-size: 0.7rem; color: #ea580c; background: #ffedd5; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">ខ្សោយ</span>' : ''}
                </td>
                <td style="padding: 6px 8px; color: #475569; font-size: 0.82rem;">${parents}</td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 600; color: #4338ca;">${toKhmerNum(s.grade)}</td>
                <td style="padding: 6px 8px; text-align: center;">${gender}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    modal.style.display = 'flex';
}

function closeStudentPickerModal() {
    const modal = document.getElementById('student-picker-modal');
    if (modal) modal.style.display = 'none';
}

function filterModalStudentList() {
    const query = (document.getElementById('modal-search-input').value || '').trim().toLowerCase();
    const classFilter = document.getElementById('modal-class-filter').value;
    const rows = document.querySelectorAll('#modal-student-table-body tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const rowClassId = row.dataset.classId;
        const matchQuery = text.includes(query);
        const matchClass = classFilter === 'all' || rowClassId === classFilter;
        row.style.display = (matchQuery && matchClass) ? '' : 'none';
    });
}

function toggleSelectAllModal(select) {
    const checkboxes = document.querySelectorAll('.student-modal-cb');
    checkboxes.forEach(cb => {
        if (cb.closest('tr').style.display !== 'none') {
            cb.checked = select;
        }
    });
}

function applyStudentPickerSelection() {
    const checkboxes = document.querySelectorAll('.student-modal-cb');
    customSelectedKeys.clear();
    checkboxes.forEach(cb => {
        if (cb.checked) {
            customSelectedKeys.add(cb.value);
        }
    });

    localStorage.setItem('remedial_selected_keys', JSON.stringify(Array.from(customSelectedKeys)));
    setFilterMode('custom');
    closeStudentPickerModal();
}

// ==================== DOWNLOAD PDF ====================
function downloadPDF() {
    const element = document.getElementById('invitations-container');
    if (!element) return;

    const opt = {
        margin: [0, 0, 0, 0],
        filename: 'លិខិតអញ្ជើញអាណាព្យាបាលសិស្ស.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
}
