const defaultTeachersData = [
    { name: "ឃុន កុម្ភៈ", gender: "ប", role: "នាយក", total: "", female: "" },
    { name: "កឹក គុណផា", gender: "ប", role: "ប.រទី១", total: 54, female: 24 },
    { name: "ជា សុជាតិ", gender: "ស", role: "ប.រទី២", total: 38, female: 20 },
    { name: "ងួន ស្រីនីន", gender: "ស", role: "ប.រទី៣", total: 38, female: 13 },
    { name: "ថន គន្ធា", gender: "ស", role: "ប.រទី៤", total: 42, female: 17 },
    { name: "ហុក ថានី", gender: "ប", role: "ប.រទី៥", total: 54, female: 30 },
    { name: "ស៊ឹង ដារ៉ា", gender: "ប", role: "ប.រទី៦", total: 26, female: 14 }
];

function getTeacherAttendanceKey() {
    return typeof window.getKey === 'function' ? window.getKey('teacherAttendanceList') : 'teacherAttendanceList';
}

function loadTeachersData() {
    const raw = localStorage.getItem(getTeacherAttendanceKey());
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch(e) {
            console.error("Error parsing teacher attendance data:", e);
        }
    }
    return JSON.parse(JSON.stringify(defaultTeachersData));
}

let teachersData = loadTeachersData();
let saveDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSchoolInfo();
    setupSchoolHeaderListeners();
    renderTable();
    setDefaultDate();
});

function parseKhmerOrArabicNum(str) {
    if (!str && str !== 0) return 0;
    const khmerDigits = {'០':0, '១':1, '២':2, '៣':3, '៤':4, '៥':5, '៦':6, '៧':7, '៨':8, '៩':9};
    let normalized = String(str).trim().replace(/[០-៩]/g, d => khmerDigits[d]);
    let val = parseInt(normalized, 10);
    return isNaN(val) ? 0 : val;
}

function renderTable() {
    const tbody = document.getElementById('attendance-body');
    const tfoot = document.getElementById('attendance-foot');
    if (!tbody || !tfoot) return;
    
    let html = '';
    let sumTotal = 0;
    let sumFemale = 0;
    
    teachersData.forEach((teacher, index) => {
        const totalNum = parseKhmerOrArabicNum(teacher.total);
        const femaleNum = parseKhmerOrArabicNum(teacher.female);
        if (teacher.total !== '' && teacher.total !== undefined && teacher.total !== null) sumTotal += totalNum;
        if (teacher.female !== '' && teacher.female !== undefined && teacher.female !== null) sumFemale += femaleNum;
        
        html += `
            <tr data-index="${index}">
                <td style="font-weight: bold;">${index + 1}</td>
                <td class="text-left editable-cell" contenteditable="true" data-field="name" style="font-family: 'Khmer OS Muol Light', 'Moul', cursive; font-size: 13px;" title="ចុចដើម្បីកែប្រែឈ្មោះ">${teacher.name || ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="gender" style="font-family: 'Khmer OS Muol Light', 'Moul', cursive; font-size: 13px;" title="ចុចដើម្បីកែប្រែភេទ">${teacher.gender || ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="role" style="font-family: 'Moul', cursive; font-size: 13px;" title="ចុចដើម្បីកែប្រែថ្នាក់ទី/តួនាទី">${teacher.role || ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="total" style="font-weight: 500;" title="ចុចដើម្បីកែប្រែចំនួនសិស្សសរុប">${teacher.total !== undefined && teacher.total !== null ? teacher.total : ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="female" style="font-weight: 500;" title="ចុចដើម្បីកែប្រែចំនួនសិស្សស្រី">${teacher.female !== undefined && teacher.female !== null ? teacher.female : ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="absentTotal">${teacher.absentTotal || ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="absentFemale">${teacher.absentFemale || ''}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="editable-cell" contenteditable="true" data-field="permission">${teacher.permission || ''}</td>
                <td class="editable-cell" contenteditable="true" data-field="lessonCount">${teacher.lessonCount || ''}</td>
                <td class="no-print action-col" style="padding: 2px;">
                    <button type="button" class="btn-delete-row" onclick="deleteTeacherRow(${index})" title="លុបជួរគ្រូនេះ">✕</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    tfoot.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; font-family: 'Khmer OS Muol Light', 'Moulpali', 'Moul', cursive;">សរុប</td>
            <td id="sum-total">${sumTotal > 0 ? sumTotal : ''}</td>
            <td id="sum-female">${sumFemale > 0 ? sumFemale : ''}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="no-print action-col"></td>
        </tr>
    `;

    bindTableEvents();
}

function bindTableEvents() {
    const tbody = document.getElementById('attendance-body');
    if (!tbody) return;

    tbody.oninput = function(e) {
        const target = e.target;
        if (target && target.classList.contains('editable-cell')) {
            const row = target.closest('tr');
            if (!row) return;
            const index = parseInt(row.getAttribute('data-index'), 10);
            const field = target.getAttribute('data-field');
            if (field && teachersData[index]) {
                teachersData[index][field] = target.innerText.trim();
                if (field === 'total' || field === 'female') {
                    updateFootTotals();
                }
                debouncedSave();
            }
        }
    };

    tbody.onblur = function(e) {
        const target = e.target;
        if (target && target.classList.contains('editable-cell')) {
            saveTeachersData(false);
        }
    };
}

function updateFootTotals() {
    let sumTotal = 0;
    let sumFemale = 0;
    teachersData.forEach(t => {
        if (t.total !== '' && t.total !== undefined && t.total !== null) {
            sumTotal += parseKhmerOrArabicNum(t.total);
        }
        if (t.female !== '' && t.female !== undefined && t.female !== null) {
            sumFemale += parseKhmerOrArabicNum(t.female);
        }
    });
    const sumTotalEl = document.getElementById('sum-total');
    const sumFemaleEl = document.getElementById('sum-female');
    if (sumTotalEl) sumTotalEl.innerText = sumTotal > 0 ? sumTotal : '';
    if (sumFemaleEl) sumFemaleEl.innerText = sumFemale > 0 ? sumFemale : '';
}

function debouncedSave() {
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
        saveTeachersData(false);
    }, 500);
}

function showSaveToast() {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

function saveTeachersData(showToast = false) {
    localStorage.setItem(getTeacherAttendanceKey(), JSON.stringify(teachersData));
    if (showToast) {
        showSaveToast();
    }
}

function addTeacherRow() {
    teachersData.push({
        name: "គ្រូថ្មី",
        gender: "ប",
        role: "ប.រ",
        total: "",
        female: "",
        absentTotal: "",
        absentFemale: "",
        permission: "",
        lessonCount: ""
    });
    saveTeachersData(true);
    renderTable();
    
    // Focus the newly created row's name field
    setTimeout(() => {
        const rows = document.querySelectorAll('#attendance-body tr');
        if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            const nameCell = lastRow.querySelector('[data-field="name"]');
            if (nameCell) {
                nameCell.focus();
                const range = document.createRange();
                range.selectNodeContents(nameCell);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, 100);
}

function deleteTeacherRow(index) {
    const teacherName = teachersData[index]?.name || 'នេះ';
    if (confirm(`តើលោកអ្នកពិតជាចង់លុបជួរគ្រូ "${teacherName}" មែនទេ?`)) {
        teachersData.splice(index, 1);
        saveTeachersData(true);
        renderTable();
    }
}

function resetTeachersToDefault() {
    if (confirm('តើលោកអ្នកចង់កំណត់បញ្ជីគ្រូ និងចំនួនសិស្សឡើងវិញទៅទម្រង់ដើម (Default) មែនទេ?')) {
        teachersData = JSON.parse(JSON.stringify(defaultTeachersData));
        saveTeachersData(true);
        renderTable();
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('batch-start-date');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        const endDateInput = document.getElementById('batch-end-date');
        if (endDateInput) endDateInput.value = today;
    }

    const savedDate = localStorage.getItem(typeof window.getKey === 'function' ? window.getKey('teacherAttendanceDate') : 'teacherAttendanceDate');
    if (savedDate) {
        const disp = document.getElementById('display-date');
        if (disp) disp.innerText = savedDate;
    } else {
        const today = new Date();
        if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
            const res = KhmerCalendar.toKhmerLunarDate(today);
            let gregText = res.gregorianDateText.replace(/ថ្ងៃទី\s*([១-៩])\s*ខែ/, 'ថ្ងៃទី០$1 ខែ');
            const disp = document.getElementById('display-date');
            if (disp) disp.innerText = `${res.lunarDateText} ត្រូវនឹង${gregText}`;
        }
    }
}

function loadSchoolInfo() {
    const customDistrict = localStorage.getItem('attendance_custom_district');
    const customCluster = localStorage.getItem('attendance_custom_cluster');
    const customSchool = localStorage.getItem('attendance_custom_school');

    const distEl = document.getElementById('display-district');
    const clusEl = document.getElementById('display-cluster');
    const schlEl = document.getElementById('display-school');

    if (customDistrict && distEl) distEl.innerText = customDistrict;
    if (customCluster && clusEl) clusEl.innerText = customCluster;
    if (customSchool && schlEl) schlEl.innerText = customSchool;

    const schoolRecords = JSON.parse(localStorage.getItem(typeof window.getKey === 'function' ? window.getKey('schoolRecords') : 'schoolRecords')) || [];
    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        if (!customDistrict && latestSchool.districtOffice && distEl) {
            distEl.innerText = latestSchool.districtOffice;
        }
        if (!customCluster && latestSchool.schoolCluster && clusEl) {
            clusEl.innerText = latestSchool.schoolCluster;
        }
        if (!customSchool && latestSchool.schoolName && schlEl) {
            schlEl.innerText = latestSchool.schoolName;
        }
    }
}

function setupSchoolHeaderListeners() {
    const distEl = document.getElementById('display-district');
    const clusEl = document.getElementById('display-cluster');
    const schlEl = document.getElementById('display-school');

    if (distEl) {
        distEl.addEventListener('blur', () => {
            localStorage.setItem('attendance_custom_district', distEl.innerText.trim());
            showSaveToast();
        });
    }
    if (clusEl) {
        clusEl.addEventListener('blur', () => {
            localStorage.setItem('attendance_custom_cluster', clusEl.innerText.trim());
            showSaveToast();
        });
    }
    if (schlEl) {
        schlEl.addEventListener('blur', () => {
            localStorage.setItem('attendance_custom_school', schlEl.innerText.trim());
            showSaveToast();
        });
    }
}

function formatKhmerDate(dateObj) {
    const khmerDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const khmerMonths = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", 
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
    ];
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    
    const dayName = khmerDays[dateObj.getDay()];
    const dateNum = dateObj.getDate().toString().padStart(2, '0').split('').map(d => khmerNums[d] || d).join('');
    const monthName = khmerMonths[dateObj.getMonth()];
    const yearNum = dateObj.getFullYear().toString().split('').map(d => khmerNums[d] || d).join('');
    
    return `ថ្ងៃ${dayName} ទី ${dateNum} ខែ ${monthName} ឆ្នាំ ${yearNum}`;
}

function generateBatchPrint() {
    const startDateStr = document.getElementById('batch-start-date').value;
    const endDateStr = document.getElementById('batch-end-date').value;
    const skipSunday = document.getElementById('skip-sunday').checked;
    
    if (!startDateStr || !endDateStr) {
        alert('សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម និងថ្ងៃបញ្ចប់!');
        return;
    }
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (startDate > endDate) {
        alert('ថ្ងៃចាប់ផ្តើមមិនអាចធំជាងថ្ងៃបញ្ចប់បានទេ!');
        return;
    }
    
    const originalPrintArea = document.getElementById('print-area');
    const mainContent = document.querySelector('.main-content');
    
    let batchWrapper = document.getElementById('batch-print-wrapper');
    if (!batchWrapper) {
        batchWrapper = document.createElement('div');
        batchWrapper.id = 'batch-print-wrapper';
        mainContent.appendChild(batchWrapper);
    }
    
    batchWrapper.innerHTML = '';
    originalPrintArea.style.display = 'none';
    
    let currentDate = new Date(startDate);
    let pageCount = 0;
    
    while (currentDate <= endDate) {
        if (skipSunday && currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        const pageClone = originalPrintArea.cloneNode(true);
        pageClone.removeAttribute('id');
        pageClone.style.display = 'block';
        pageClone.classList.add('batch-page');
        
        let khmerDateStr = '';
        if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
            const res = KhmerCalendar.toKhmerLunarDate(currentDate);
            let gregText = res.gregorianDateText;
            gregText = gregText.replace(/ថ្ងៃទី\s*([១-៩])\s*ខែ/, 'ថ្ងៃទី០$1 ខែ');
            khmerDateStr = `${res.lunarDateText} ត្រូវនឹង${gregText}`;
        } else {
            khmerDateStr = formatKhmerDate(currentDate);
        }
        
        const dateElement = pageClone.querySelector('.report-date');
        if (dateElement) {
            dateElement.innerText = khmerDateStr;
        }
        
        batchWrapper.appendChild(pageClone);
        
        pageCount++;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (pageCount === 0) {
        alert('មិនមានទំព័រត្រូវបានបង្កើតទេ! សូមពិនិត្យមើលកាលបរិច្ឆេទរបស់អ្នកឡើងវិញ។');
        originalPrintArea.style.display = 'block';
        return;
    }
    
    setTimeout(() => {
        window.print();
        
        if (confirm('ការបោះពុម្ពបានបញ្ចប់! តើអ្នកចង់ត្រឡប់ទៅទម្រង់ដើម ១សន្លឹកវិញទេ?')) {
            batchWrapper.innerHTML = '';
            originalPrintArea.style.display = 'block';
        }
    }, 500);
}
