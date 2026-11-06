// remedial-students.js - Strict A4 Multi-Page Layout with Perfect Bounded Sizing

// Khmer Number Converter
const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
function toKhmerNum(num) {
    if (num === null || num === undefined || num === '') return '';
    return num.toString().replace(/\d/g, d => khmerDigits[parseInt(d)]);
}

// Global State
let currentClassScope = 'all'; // 'all' or class ID
let currentFilterMode = 'weak'; // 'weak' | 'custom' | 'all'
let rowsPerPageSetting = 'auto'; // 'auto' | '25' | '30' | '35' | 'all'
let allSchoolStudents = [];
let customSelectedKeys = new Set();
let manualRows = [];
let pendingExcelRows = [];

function getClassKey(baseKey, classId) {
    if (!classId || classId === 'default') return baseKey;
    return `${baseKey}_${classId}`;
}

document.addEventListener('DOMContentLoaded', () => {
    initClassScopeDropdown();
    initData();
    setupInlineEditAutoSave();
    setupExcelDropZone();
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

    const savedRpp = localStorage.getItem('remedial_rows_per_page');
    if (savedRpp) {
        rowsPerPageSetting = savedRpp;
        const rppSelect = document.getElementById('rows-per-page-select');
        if (rppSelect) rppSelect.value = savedRpp;
    }
}

function onClassScopeChanged(newScope) {
    currentClassScope = newScope;
    localStorage.setItem('remedial_class_scope', newScope);
    renderRemedialTable();
    updateStats();
}

function onRowsPerPageChanged(val) {
    rowsPerPageSetting = val;
    localStorage.setItem('remedial_rows_per_page', val);
    renderRemedialTable();
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

    const savedCustomKeys = JSON.parse(localStorage.getItem('remedial_selected_keys'));
    if (savedCustomKeys && Array.isArray(savedCustomKeys)) {
        customSelectedKeys = new Set(savedCustomKeys);
    } else {
        customSelectedKeys = new Set();
        allSchoolStudents.forEach(s => {
            if (s.annualAvg !== null && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E')) {
                customSelectedKeys.add(s.compositeKey);
            }
        });
    }

    manualRows = JSON.parse(localStorage.getItem('remedial_manual_rows')) || [];
    manualRows.forEach(mr => {
        if (!mr.classId && mr.grade) {
            mr.classId = detectClassIdFromGrade(mr.grade);
        }
    });

    const savedFilter = localStorage.getItem('remedial_filter_mode');
    if (savedFilter) {
        currentFilterMode = savedFilter;
    }

    updateFilterButtonsUI();
    renderRemedialTable();
    updateStats();
}

function setFilterMode(mode) {
    currentFilterMode = mode;
    localStorage.setItem('remedial_filter_mode', mode);
    updateFilterButtonsUI();
    renderRemedialTable();
    updateStats();
}

function updateFilterButtonsUI() {
    const btnWeak = document.getElementById('btn-filter-weak');
    const btnCustom = document.getElementById('btn-filter-custom');
    const btnAll = document.getElementById('btn-filter-all');

    if (btnWeak) btnWeak.classList.toggle('active', currentFilterMode === 'weak');
    if (btnCustom) btnCustom.classList.toggle('active', currentFilterMode === 'custom');
    if (btnAll) btnAll.classList.toggle('active', currentFilterMode === 'all');

    const countEl = document.getElementById('custom-selected-count');
    if (countEl) countEl.textContent = toKhmerNum(customSelectedKeys.size);
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

function getDisplayStudents() {
    let scopedList = allSchoolStudents.filter(s => isStudentInClass(s, currentClassScope));

    let list = [];

    if (currentFilterMode === 'weak') {
        list = scopedList.filter(s => {
            return s.annualAvg !== null && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E');
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

function getDocumentMeta() {
    const title = localStorage.getItem('remedial_doc_title') || 'បញ្ជីរាយនាមសិស្សសម្រាប់បំប៉នបន្ថែមនៅចុងឆ្នាំសិក្សា';
    const year = localStorage.getItem('remedial_doc_year') || 'ឆ្នាំសិក្សា ២០២៥-២០២៦';
    const principal = localStorage.getItem('remedial_principal_name') || '....................................';
    
    let teacher = localStorage.getItem('remedial_teacher_name');
    if (!teacher) {
        const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles')) || [];
        teacher = (teacherProfiles.length > 0 && teacherProfiles[0].name) ? teacherProfiles[0].name : '....................................';
    }

    const today = new Date();
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const d = toKhmerNum(today.getDate());
    const m = khmerMonths[today.getMonth()];
    const y = toKhmerNum(today.getFullYear());
    const solarStr = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;

    let lunarStr = 'ថ្ងៃ..........................ខែ....................ឆ្នាំ..................ស័ក ព.ស. ២៥....';
    if (typeof KhmerCalendar !== 'undefined' && typeof KhmerCalendar.toKhmerLunarDate === 'function') {
        const res = KhmerCalendar.toKhmerLunarDate(today);
        if (res && res.lunarDateText) {
            let text = res.lunarDateText;
            if (text.includes('ត្រូវនឹង')) text = text.split('ត្រូវនឹង')[0].trim();
            lunarStr = text;
        }
    }

    return { title, year, principal, teacher, solarStr, lunarStr };
}

// Bounded Columns: Sum = 100%
const COLGROUP_HTML = `
    <colgroup>
        <col style="width: 6%;">
        <col style="width: 21%;">
        <col style="width: 21%;">
        <col style="width: 24%;">
        <col style="width: 8%;">
        <col style="width: 20%;">
    </colgroup>
`;

// RENDER REMEDIAL TABLE WITH STRICT A4 MULTI-PAGE SHEETS
function renderRemedialTable() {
    const container = document.getElementById('remedial-pages-container');
    if (!container) return;

    const students = getDisplayStudents();
    const meta = getDocumentMeta();

    if (students.length === 0) {
        container.innerHTML = `
            <div class="a4-sheet">
                <div class="a4-content-top">
                    <div class="table-container-box">
                        <table class="remedial-table">
                            ${COLGROUP_HTML}
                            <thead>
                                <tr>
                                    <th colspan="6" class="table-main-title" contenteditable="true" id="doc-title">${meta.title}</th>
                                </tr>
                                <tr>
                                    <th colspan="6" class="table-sub-title" contenteditable="true" id="doc-year">${meta.year}</th>
                                </tr>
                                <tr>
                                    <th class="col-header-cell">ល.រ</th>
                                    <th class="col-header-cell">ឈ្មោះឪពុក</th>
                                    <th class="col-header-cell">ឈ្មោះម្តាយ</th>
                                    <th class="col-header-cell">ឈ្មោះសិស្ស</th>
                                    <th class="col-header-cell">ភេទ</th>
                                    <th class="col-header-cell">ថ្នាក់ទី</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6" style="text-align: center; padding: 40px 10px; color: #64748b;">
                                        <strong>មិនមានទិន្នន័យសិស្សបំប៉នក្នុងបញ្ជីនៅឡើយទេ</strong><br>
                                        <span style="font-size: 0.85rem;">សូមចុចលើប៊ូតុង «នាំចូលពី Excel» ឬ «ជ្រើសរើសសិស្ស (+/-)» ឬ «បន្ថែមជួរដេក»</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <div class="signature-section">
                        <div class="signature-grid">
                            <div class="signature-col">
                                <div style="margin-bottom: 2px;">បានឃើញ និងឯកភាព</div>
                                <div class="sign-title">នាយកសាលា</div>
                                <div class="sign-name" contenteditable="true" id="lbl-principal-name">${meta.principal}</div>
                            </div>
                            <div class="signature-col">
                                <div contenteditable="true">${meta.lunarStr}</div>
                                <div style="margin-top: 2px;" contenteditable="true">${meta.solarStr}</div>
                                <div class="sign-title" style="margin-top: 3px;">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</div>
                                <div class="sign-name" contenteditable="true" id="lbl-teacher-name">${meta.teacher}</div>
                            </div>
                        </div>
                    </div>
                    <div class="a4-footer">ទំព័រទី ១ / ១</div>
                </div>
            </div>
        `;
        return;
    }

    // Smart A4 page partitioning
    const pages = [];
    if (rowsPerPageSetting === 'auto') {
        if (students.length <= 30) {
            pages.push({ students: students, hasSignatures: true });
        } else {
            let cursor = 0;
            while (cursor < students.length) {
                const remaining = students.length - cursor;
                if (remaining <= 28) {
                    pages.push({ students: students.slice(cursor), hasSignatures: true });
                    cursor = students.length;
                } else if (remaining <= 35) {
                    pages.push({ students: students.slice(cursor, cursor + 26), hasSignatures: false });
                    cursor += 26;
                } else {
                    pages.push({ students: students.slice(cursor, cursor + 35), hasSignatures: false });
                    cursor += 35;
                }
            }
            if (pages.length > 0) {
                pages[pages.length - 1].hasSignatures = true;
            }
        }
    } else if (rowsPerPageSetting === 'all') {
        pages.push({ students: students, hasSignatures: true });
    } else {
        const fixedSize = parseInt(rowsPerPageSetting) || 25;
        for (let i = 0; i < students.length; i += fixedSize) {
            const isLast = (i + fixedSize) >= students.length;
            pages.push({ students: students.slice(i, i + fixedSize), hasSignatures: isLast });
        }
    }

    const totalPages = pages.length;
    let fullHtml = '';
    let globalRowCounter = 0;

    pages.forEach((pageData, pageIdx) => {
        const pageNum = pageIdx + 1;
        const isFirstPage = pageNum === 1;
        const hasSignatures = pageData.hasSignatures;

        let tableRowsHtml = '';
        pageData.students.forEach((s) => {
            globalRowCounter++;
            const no = toKhmerNum(globalRowCounter);

            let father = s.fatherName || '';
            if (!father && s.guardian && s.guardian.includes(' / ')) {
                father = s.guardian.split(' / ')[0].trim();
            }

            let mother = s.motherName || '';
            if (!mother && s.guardian && s.guardian.includes(' / ')) {
                mother = s.guardian.split(' / ')[1].trim();
            }

            const name = s.name || s.studentName || '';

            let gender = s.gender || '';
            if (gender === 'ប្រុស') gender = 'ប';
            else if (gender === 'ស្រី') gender = 'ស';

            let grade = s.grade || s.className || '';
            grade = grade.replace(/^ថ្នាក់ទី\s*/, '');

            const isManual = !!s.isManual;
            const rowId = isManual ? s.manualId : s.compositeKey;

            tableRowsHtml += `
                <tr data-id="${rowId}" data-is-manual="${isManual}">
                    <td class="cell-no">${no}</td>
                    <td class="cell-father editable-cell" contenteditable="true" data-field="fatherName">${father}</td>
                    <td class="cell-mother editable-cell" contenteditable="true" data-field="motherName">${mother}</td>
                    <td class="cell-name editable-cell" contenteditable="true" data-field="name">${name}</td>
                    <td class="cell-gender editable-cell" contenteditable="true" data-field="gender">${gender}</td>
                    <td class="cell-grade editable-cell" contenteditable="true" data-field="grade">${grade}</td>
                </tr>
            `;
        });

        let theadHeaderRows = '';
        if (isFirstPage) {
            theadHeaderRows = `
                <tr>
                    <th colspan="6" class="table-main-title" contenteditable="true" id="doc-title">${meta.title}</th>
                </tr>
                <tr>
                    <th colspan="6" class="table-sub-title" contenteditable="true" id="doc-year">${meta.year}</th>
                </tr>
            `;
        } else {
            theadHeaderRows = `
                <tr>
                    <th colspan="6" class="table-sub-title" style="padding: 4px 2px; font-size: 10pt;">(ត) ${meta.title} - ${meta.year}</th>
                </tr>
            `;
        }

        let signaturesHtml = '';
        if (hasSignatures) {
            signaturesHtml = `
                <div class="signature-section">
                    <div class="signature-grid">
                        <div class="signature-col">
                            <div style="font-size: 9.5pt; margin-bottom: 2px;">បានឃើញ និងឯកភាព</div>
                            <div class="sign-title">នាយកសាលា</div>
                            <div class="sign-name" contenteditable="true" id="lbl-principal-name">${meta.principal}</div>
                        </div>
                        <div class="signature-col">
                            <div style="font-size: 9.5pt;" contenteditable="true">${meta.lunarStr}</div>
                            <div style="font-size: 9.5pt; margin-top: 2px;" contenteditable="true">${meta.solarStr}</div>
                            <div class="sign-title" style="margin-top: 2px;">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</div>
                            <div class="sign-name" contenteditable="true" id="lbl-teacher-name">${meta.teacher}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        fullHtml += `
            <div class="a4-sheet" data-page="${pageNum}">
                <div class="a4-content-top">
                    <div class="table-container-box">
                        <table class="remedial-table">
                            ${COLGROUP_HTML}
                            <thead>
                                ${theadHeaderRows}
                                <tr>
                                    <th class="col-header-cell">ល.រ</th>
                                    <th class="col-header-cell">ឈ្មោះឪពុក</th>
                                    <th class="col-header-cell">ឈ្មោះម្តាយ</th>
                                    <th class="col-header-cell">ឈ្មោះសិស្ស</th>
                                    <th class="col-header-cell">ភេទ</th>
                                    <th class="col-header-cell">ថ្នាក់ទី</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    ${signaturesHtml}
                    <div class="a4-footer">ទំព័រទី ${toKhmerNum(pageNum)} នៃ ${toKhmerNum(totalPages)}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = fullHtml;
}

// Auto-save Inline Edits
function setupInlineEditAutoSave() {
    const container = document.getElementById('remedial-pages-container');
    if (!container) return;

    container.addEventListener('blur', (e) => {
        if (e.target.classList.contains('editable-cell')) {
            const tr = e.target.closest('tr');
            if (!tr) return;
            const id = tr.dataset.id;
            const isManual = tr.dataset.isManual === 'true';
            const field = e.target.dataset.field;
            const value = e.target.textContent.trim();

            if (isManual) {
                const target = manualRows.find(m => m.manualId === id);
                if (target) {
                    target[field] = value;
                    localStorage.setItem('remedial_manual_rows', JSON.stringify(manualRows));
                }
            } else {
                const target = allSchoolStudents.find(s => s.compositeKey === id);
                if (target) {
                    target[field] = value;
                    const classKey = getClassKey('studentProfilesData', target.classId);
                    const classStudents = JSON.parse(localStorage.getItem(classKey)) || [];
                    const found = classStudents.find(s => s.id === target.id);
                    if (found) {
                        found[field] = value;
                        localStorage.setItem(classKey, JSON.stringify(classStudents));
                    }
                }
            }
            updateStats();
        } else if (e.target.id === 'doc-title') {
            localStorage.setItem('remedial_doc_title', e.target.textContent.trim());
        } else if (e.target.id === 'doc-year') {
            localStorage.setItem('remedial_doc_year', e.target.textContent.trim());
        } else if (e.target.id === 'lbl-principal-name') {
            localStorage.setItem('remedial_principal_name', e.target.textContent.trim());
        } else if (e.target.id === 'lbl-teacher-name') {
            localStorage.setItem('remedial_teacher_name', e.target.textContent.trim());
        }
    }, true);
}

// Stats
function updateStats() {
    const list = getDisplayStudents();
    const total = list.length;
    let female = 0;
    let male = 0;

    list.forEach(s => {
        let g = s.gender || '';
        if (g === 'ស' || g === 'ស្រី') female++;
        else if (g === 'ប' || g === 'ប្រុស') male++;
    });

    let classTotal = allSchoolStudents.length;
    if (currentClassScope !== 'all') {
        classTotal = allSchoolStudents.filter(s => s.classId === currentClassScope).length;
    }

    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.textContent = `${toKhmerNum(total)} នាក់`;

    const femaleEl = document.getElementById('stat-female');
    if (femaleEl) femaleEl.textContent = `${toKhmerNum(female)} នាក់`;

    const maleEl = document.getElementById('stat-male');
    if (maleEl) maleEl.textContent = `${toKhmerNum(male)} នាក់`;

    const classTotalEl = document.getElementById('stat-class-total');
    if (classTotalEl) classTotalEl.textContent = `${toKhmerNum(classTotal)} នាក់`;

    const countEl = document.getElementById('custom-selected-count');
    if (countEl) countEl.textContent = toKhmerNum(customSelectedKeys.size);
}

// ==================== EXCEL IMPORT ====================
function openExcelImportModal() {
    const modal = document.getElementById('excel-import-modal');
    if (!modal) return;
    document.getElementById('excel-file-input').value = '';
    document.getElementById('excel-preview-container').style.display = 'none';
    document.getElementById('btn-confirm-import').style.display = 'none';
    pendingExcelRows = [];
    modal.style.display = 'flex';
}

function closeExcelImportModal() {
    const modal = document.getElementById('excel-import-modal');
    if (modal) modal.style.display = 'none';
}

function setupExcelDropZone() {
    const dropZone = document.getElementById('excel-drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) handleFile(files[0]);
    }, false);
}

function handleExcelFileUpload(input) {
    if (input.files && input.files.length > 0) handleFile(input.files[0]);
}

function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            parseExcelRows(rows);
        } catch (err) {
            alert('បរាជ័យក្នុងការអានឯកសារ Excel! សូមពិនិត្យមើលឯកសារឡើងវិញ។');
            console.error(err);
        }
    };

    reader.readAsArrayBuffer(file);
}

function parseExcelRows(rows) {
    if (!rows || rows.length === 0) {
        alert('ឯកសារ Excel គ្មានទិន្នន័យទេ!');
        return;
    }

    let headerIdx = -1;
    let colMap = { father: -1, mother: -1, name: -1, gender: -1, grade: -1 };

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i].map(c => c ? c.toString().trim().toLowerCase() : '');
        row.forEach((cell, colIdx) => {
            if (cell.includes('ឪពុក') || cell.includes('father')) colMap.father = colIdx;
            else if (cell.includes('ម្តាយ') || cell.includes('mother')) colMap.mother = colIdx;
            else if (cell.includes('ឈ្មោះសិស្ស') || cell.includes('គោត្តនាម') || cell.includes('student') || (cell.includes('ឈ្មោះ') && !cell.includes('ឪពុក') && !cell.includes('ម្តាយ'))) colMap.name = colIdx;
            else if (cell.includes('ភេទ') || cell.includes('gender') || cell.includes('sex')) colMap.gender = colIdx;
            else if (cell.includes('ថ្នាក់') || cell.includes('grade') || cell.includes('class')) colMap.grade = colIdx;
        });

        if (colMap.name !== -1) {
            headerIdx = i;
            break;
        }
    }

    if (headerIdx === -1) {
        headerIdx = 0;
        colMap = { father: 1, mother: 2, name: 3, gender: 4, grade: 5 };
    }

    const dataRows = rows.slice(headerIdx + 1);
    pendingExcelRows = [];

    dataRows.forEach((r, idx) => {
        if (!r || r.length === 0 || r.every(cell => !cell || cell.toString().trim() === '')) return;

        const name = colMap.name !== -1 && r[colMap.name] ? r[colMap.name].toString().trim() : (r[3] || '').toString().trim();
        if (!name || name === 'ឈ្មោះសិស្ស' || name === 'ឈ្មោះ') return;

        let father = colMap.father !== -1 && r[colMap.father] ? r[colMap.father].toString().trim() : (r[1] || '').toString().trim();
        let mother = colMap.mother !== -1 && r[colMap.mother] ? r[colMap.mother].toString().trim() : (r[2] || '').toString().trim();
        let gender = colMap.gender !== -1 && r[colMap.gender] ? r[colMap.gender].toString().trim() : (r[4] || '').toString().trim();
        let grade = colMap.grade !== -1 && r[colMap.grade] ? r[colMap.grade].toString().trim() : (r[5] || '').toString().trim();

        if (gender === 'ប្រុស' || gender === 'ប' || gender.toLowerCase() === 'm' || gender.toLowerCase() === 'male') gender = 'ប';
        else if (gender === 'ស្រី' || gender === 'ស' || gender.toLowerCase() === 'f' || gender.toLowerCase() === 'female') gender = 'ស';

        grade = grade.replace(/^ថ្នាក់ទី\s*/, '').trim();
        const detectedClassId = detectClassIdFromGrade(grade);

        pendingExcelRows.push({
            manualId: 'excel_' + Date.now() + '_' + idx,
            isManual: true,
            classId: detectedClassId,
            name,
            fatherName: father,
            motherName: mother,
            gender,
            grade
        });
    });

    if (pendingExcelRows.length === 0) {
        alert('មិនអាចទាញទិន្នន័យឈ្មោះសិស្សពី Excel បានទេ!');
        return;
    }

    const previewContainer = document.getElementById('excel-preview-container');
    const previewTbody = document.getElementById('excel-preview-tbody');
    const countEl = document.getElementById('preview-row-count');
    const confirmBtn = document.getElementById('btn-confirm-import');

    countEl.textContent = pendingExcelRows.length;
    let previewHtml = '';
    pendingExcelRows.slice(0, 30).forEach((item, i) => {
        previewHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; text-align: center; font-weight: 600;">${toKhmerNum(i + 1)}</td>
                <td style="padding: 4px;">${item.fatherName}</td>
                <td style="padding: 4px;">${item.motherName}</td>
                <td style="padding: 4px; font-weight: 700;">${item.name}</td>
                <td style="padding: 4px; text-align: center;">${item.gender}</td>
                <td style="padding: 4px; text-align: center;">${item.grade}</td>
            </tr>
        `;
    });

    previewTbody.innerHTML = previewHtml;
    previewContainer.style.display = 'block';
    confirmBtn.style.display = 'inline-flex';
}

function confirmExcelImport() {
    if (pendingExcelRows.length === 0) return;
    const mode = document.querySelector('input[name="import-mode"]:checked').value;

    if (mode === 'replace') {
        manualRows = [...pendingExcelRows];
        customSelectedKeys.clear();
    } else {
        manualRows = [...manualRows, ...pendingExcelRows];
    }

    localStorage.setItem('remedial_manual_rows', JSON.stringify(manualRows));
    localStorage.setItem('remedial_selected_keys', JSON.stringify(Array.from(customSelectedKeys)));

    closeExcelImportModal();
    setFilterMode('custom');
    renderRemedialTable();
    updateStats();

    alert(`✓ បាននាំចូលទិន្នន័យសិស្សចំនួន ${pendingExcelRows.length} នាក់ដោយជោគជ័យ!`);
}

function downloadSampleTemplate() {
    const wsData = [
        ["បញ្ជីរាយនាមសិស្សសម្រាប់បំប៉នបន្ថែមនៅចុងឆ្នាំសិក្សា"],
        ["ឆ្នាំសិក្សា ២០២៥-២០២៦"],
        [],
        ["ល.រ", "ឈ្មោះឪពុក", "ឈ្មោះម្តាយ", "ឈ្មោះសិស្ស", "ភេទ", "ថ្នាក់ទី"],
        [1, "សុខ ចាន់", "មាស សុផល", "សុខ សុភា", "ស", "៥ក"],
        [2, "កែវ វិបុល", "ប៉ែន រស្មី", "កែវ សម្បត្តិ", "ប", "៥ក"],
        [3, "ឡុង ធី", "សាន វណ្ណា", "ឡុង ដារ៉ា", "ប", "៦ក"]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
    ];

    ws['!cols'] = [
        { wch: 6 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 8 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "គំរូសិស្សបំប៉ន");
    XLSX.writeFile(wb, "គំរូបញ្ជីសិស្សបំប៉នបន្ថែម.xlsx");
}

// ==================== MODAL: STUDENT PICKER ====================
function openStudentPickerModal() {
    const modal = document.getElementById('student-picker-modal');
    const tbody = document.getElementById('modal-student-table-body');
    if (!modal || !tbody) return;

    let html = '';
    allSchoolStudents.forEach(s => {
        const isChecked = customSelectedKeys.has(s.compositeKey) ? 'checked' : '';
        let gender = s.gender || '';
        if (gender === 'ប្រុស') gender = 'ប';
        else if (gender === 'ស្រី') gender = 'ស';

        const avgDisplay = s.annualAvg !== null ? toKhmerNum(s.annualAvg.toFixed(2)) : '-';
        const isWeak = s.annualAvg !== null && (s.annualAvg < 5.0 || s.annualGrade === 'F' || s.annualGrade === 'E');

        html += `
            <tr data-class-id="${s.classId}" style="border-bottom: 1px solid #f1f5f9; ${isWeak ? 'background-color: #fff7ed;' : ''}">
                <td style="padding: 6px 8px; text-align: center;">
                    <input type="checkbox" class="student-modal-cb" value="${s.compositeKey}" ${isChecked}>
                </td>
                <td style="padding: 6px 8px; font-weight: 600;">
                    ${s.name || s.studentName}
                    ${isWeak ? '<span style="font-size: 0.7rem; color: #ea580c; background: #ffedd5; padding: 1px 4px; border-radius: 3px; margin-left: 3px;">ខ្សោយ</span>' : ''}
                </td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 600; color: #4338ca;">${s.grade}</td>
                <td style="padding: 6px 8px; text-align: center;">${gender}</td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 600; ${isWeak ? 'color: #dc2626;' : ''}">${avgDisplay}</td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 700; ${isWeak ? 'color: #dc2626;' : ''}">${s.annualGrade || '-'}</td>
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
    const classFilter = document.getElementById('modal-class-filter');
    const classFilterVal = classFilter ? classFilter.value : 'all';
    const rows = document.querySelectorAll('#modal-student-table-body tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const rowClassId = row.dataset.classId;
        const matchQuery = text.includes(query);
        const matchClass = classFilterVal === 'all' || rowClassId === classFilterVal;
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

// ==================== MODAL: ADD MANUAL ROW ====================
function openAddManualRowModal() {
    const modal = document.getElementById('add-manual-modal');
    if (!modal) return;

    let defaultGrade = '';
    if (currentClassScope !== 'all') {
        const found = allSchoolStudents.find(s => s.classId === currentClassScope);
        if (found) defaultGrade = found.grade;
    }

    document.getElementById('manual-student-name').value = '';
    document.getElementById('manual-student-gender').value = 'ស';
    document.getElementById('manual-student-grade').value = defaultGrade;
    document.getElementById('manual-father-name').value = '';
    document.getElementById('manual-mother-name').value = '';

    modal.style.display = 'flex';
}

function closeAddManualRowModal() {
    const modal = document.getElementById('add-manual-modal');
    if (modal) modal.style.display = 'none';
}

function saveManualRow() {
    const name = document.getElementById('manual-student-name').value.trim();
    const gender = document.getElementById('manual-student-gender').value;
    const grade = document.getElementById('manual-student-grade').value.trim();
    const fatherName = document.getElementById('manual-father-name').value.trim();
    const motherName = document.getElementById('manual-mother-name').value.trim();

    if (!name) {
        alert('សូមបញ្ចូលឈ្មោះសិស្ស!');
        return;
    }

    const detectedClassId = detectClassIdFromGrade(grade) || (currentClassScope !== 'all' ? currentClassScope : 'default');

    const newRow = {
        manualId: 'manual_' + Date.now(),
        isManual: true,
        classId: detectedClassId,
        name,
        gender,
        grade,
        fatherName,
        motherName
    };

    manualRows.push(newRow);
    localStorage.setItem('remedial_manual_rows', JSON.stringify(manualRows));

    closeAddManualRowModal();
    renderRemedialTable();
    updateStats();
}

// ==================== MODAL: HEADER SETTINGS ====================
function openHeaderSettingsModal() {
    const modal = document.getElementById('header-settings-modal');
    if (!modal) return;

    const meta = getDocumentMeta();
    document.getElementById('cfg-doc-title').value = meta.title;
    document.getElementById('cfg-doc-year').value = meta.year;
    document.getElementById('cfg-principal-name').value = meta.principal.includes('...') ? '' : meta.principal;
    document.getElementById('cfg-teacher-name').value = meta.teacher.includes('...') ? '' : meta.teacher;

    modal.style.display = 'flex';
}

function closeHeaderSettingsModal() {
    const modal = document.getElementById('header-settings-modal');
    if (modal) modal.style.display = 'none';
}

function onDatePickerChanged(dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    loadSavedOrCurrentDate(dateObj);
}

function setTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePicker = document.getElementById('cfg-date-picker');
    if (datePicker) datePicker.value = `${yyyy}-${mm}-${dd}`;
    loadSavedOrCurrentDate(today);
}

function saveHeaderSettings() {
    const title = document.getElementById('cfg-doc-title').value.trim();
    const year = document.getElementById('cfg-doc-year').value.trim();
    const principal = document.getElementById('cfg-principal-name').value.trim();
    const teacher = document.getElementById('cfg-teacher-name').value.trim();

    if (title) localStorage.setItem('remedial_doc_title', title);
    if (year) localStorage.setItem('remedial_doc_year', year);
    if (principal) localStorage.setItem('remedial_principal_name', principal);
    if (teacher) localStorage.setItem('remedial_teacher_name', teacher);

    closeHeaderSettingsModal();
    renderRemedialTable();
}

function resetToDefaults() {
    if (confirm('តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់កំណត់ទិន្នន័យឡើងវិញមែនទេ?')) {
        localStorage.removeItem('remedial_selected_keys');
        localStorage.removeItem('remedial_manual_rows');
        localStorage.removeItem('remedial_filter_mode');
        localStorage.removeItem('remedial_class_scope');
        localStorage.removeItem('remedial_rows_per_page');
        localStorage.removeItem('remedial_doc_title');
        localStorage.removeItem('remedial_doc_year');
        initData();
    }
}

// ==================== EXPORT TO EXCEL ====================
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('សូមរង់ចាំបណ្ណាល័យ Excel កំពុងដំណើរការ...');
        return;
    }

    const students = getDisplayStudents();
    if (students.length === 0) {
        alert('មិនមានទិន្នន័យសម្រាប់ទាញយកជា Excel ទេ!');
        return;
    }

    const meta = getDocumentMeta();
    const wb = XLSX.utils.book_new();
    const ws = {};
    const merges = [];
    const rowHeights = [];

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

    const styleTitle = {
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

    const styleDataLeft = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: borderThin
    };

    const styleDataName = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: borderThin
    };

    const styleDate = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSign = {
        font: { name: 'Khmer OS Battambang', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const styleSignPrincipal = {
        font: { name: 'Khmer OS Muol Light', sz: 9.5, bold: true, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

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

    // Document Title & Academic Year
    mergeAndSet(currentRow, 0, currentRow, 5, meta.title, styleTitle);
    rowHeights[currentRow] = { hpt: 24 };
    currentRow++;

    mergeAndSet(currentRow, 0, currentRow, 5, meta.year, styleSubTitle);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    // Table Headers (Directly continuous)
    const headers = ["ល.រ", "ឈ្មោះឪពុក", "ឈ្មោះម្តាយ", "ឈ្មោះសិស្ស", "ភេទ", "ថ្នាក់ទី"];
    headers.forEach((h, colIdx) => setCell(currentRow, colIdx, h, styleTableHeader));
    rowHeights[currentRow] = { hpt: 26 };
    currentRow++;

    // Data Rows
    students.forEach((s, idx) => {
        let father = s.fatherName || '';
        if (!father && s.guardian && s.guardian.includes(' / ')) father = s.guardian.split(' / ')[0].trim();

        let mother = s.motherName || '';
        if (!mother && s.guardian && s.guardian.includes(' / ')) mother = s.guardian.split(' / ')[1].trim();

        let gender = s.gender || '';
        if (gender === 'ប្រុស') gender = 'ប';
        else if (gender === 'ស្រី') gender = 'ស';

        let grade = s.grade || s.className || '';
        grade = grade.replace(/^ថ្នាក់ទី\s*/, '');

        setCell(currentRow, 0, toKhmerNum(idx + 1), styleDataCenterBold);
        setCell(currentRow, 1, father, styleDataLeft);
        setCell(currentRow, 2, mother, styleDataLeft);
        setCell(currentRow, 3, s.name || s.studentName || '', styleDataName);
        setCell(currentRow, 4, gender, styleDataCenter);
        setCell(currentRow, 5, grade, styleDataCenterBold);

        rowHeights[currentRow] = { hpt: 22 };
        currentRow++;
    });

    // Signatures (Directly continuous)
    mergeAndSet(currentRow, 0, currentRow, 2, 'បានឃើញ និងឯកភាព', styleSign);
    mergeAndSet(currentRow, 3, currentRow, 5, 'គ្រូប្រចាំថ្នាក់', styleSign);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    mergeAndSet(currentRow, 0, currentRow, 2, 'នាយកសាលា', styleSignPrincipal);
    mergeAndSet(currentRow, 3, currentRow, 5, '', styleSign);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    mergeAndSet(currentRow, 0, currentRow, 2, '', styleSign);
    mergeAndSet(currentRow, 3, currentRow, 5, '', styleSign);
    rowHeights[currentRow] = { hpt: 45 };
    currentRow++;

    mergeAndSet(currentRow, 0, currentRow, 2, meta.principal || '.....................................', styleSign);
    mergeAndSet(currentRow, 3, currentRow, 5, meta.teacher || '.....................................', styleSign);
    rowHeights[currentRow] = { hpt: 20 };
    currentRow++;

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: currentRow - 1, c: 5 } });
    ws['!merges'] = merges;
    ws['!rows'] = rowHeights;
    ws['!cols'] = [
        { wch: 7 },  // Col 0: ល.រ
        { wch: 20 }, // Col 1: ឈ្មោះឪពុក
        { wch: 20 }, // Col 2: ឈ្មោះម្តាយ
        { wch: 24 }, // Col 3: ឈ្មោះសិស្ស
        { wch: 8 },  // Col 4: ភេទ
        { wch: 15 }  // Col 5: ថ្នាក់ទី
    ];

    ws['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    ws['!margins'] = { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };
    ws['!views'] = [{ showGridLines: true }];

    XLSX.utils.book_append_sheet(wb, ws, "បញ្ជីសិស្សបំប៉ន");
    XLSX.writeFile(wb, "បញ្ជីរាយនាមសិស្សបំប៉នបន្ថែមចុងឆ្នាំ.xlsx");
}

// ==================== DOWNLOAD PDF ====================
function downloadPDF() {
    const element = document.getElementById('remedial-pages-container');
    if (!element) return;

    const opt = {
        margin: [4, 4, 4, 4],
        filename: 'បញ្ជីរាយនាមសិស្សសម្រាប់បំប៉នបន្ថែម.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}
