const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

document.addEventListener('DOMContentLoaded', () => {
    initDateControls();
    loadSchoolInfo();
    loadTeacherProfile();
    
    // Automatically generate grid for current month/year
    generateGrid();
});

function initDateControls() {
    const today = new Date();
    document.getElementById('month-select').value = today.getMonth() + 1;
    document.getElementById('year-select').value = today.getFullYear();
}

function loadSchoolInfo() {
    let customProvince = localStorage.getItem('attendance_custom_province');
    if (customProvince) document.getElementById('print-province').textContent = customProvince;
    
    let customDistrict = localStorage.getItem('attendance_custom_district');
    if (customDistrict) document.getElementById('print-district').textContent = customDistrict;
    
    let customSchool = localStorage.getItem('attendance_custom_school');
    if (customSchool) document.getElementById('print-school').textContent = customSchool;
    
    let customGrade = localStorage.getItem('attendance_custom_grade');
    if (customGrade) document.getElementById('print-grade').textContent = customGrade;

    if (typeof window.getKey !== 'function') return;
    
    // Fallback to loaded records if no custom value is set yet
    const schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];
    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        
        if (!customProvince) {
            let province = latestSchool.province || '.................................';
            document.getElementById('print-province').textContent = province;
        }

        if (!customDistrict) {
            let district = latestSchool.districtOffice || '.......................................';
            district = district.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*ស្រុក\s*/, '');
            district = district.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*/, '');
            district = district.replace(/^ស្រុក\s*/, '');
            document.getElementById('print-district').textContent = district;
        }
        
        if (!customSchool) {
            let school = latestSchool.schoolName || '.......................................';
            document.getElementById('print-school').textContent = school;
        }
    }
}

function loadTeacherProfile() {
    let customGrade = localStorage.getItem('attendance_custom_grade');
    if (customGrade) {
        document.getElementById('print-grade').textContent = customGrade;
        return; // Already loaded from custom
    }

    if (typeof window.getKey !== 'function') return;
    const teacherProfiles = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    if (teacherProfiles.length > 0) {
        const mainTeacher = teacherProfiles[0];
        if (mainTeacher.className) {
            let cName = mainTeacher.className.replace(/^ទី\s*/, '');
            document.getElementById('print-grade').textContent = cName;
        }
    }
}

function saveCustomHeader(elementId) {
    const text = document.getElementById(elementId).textContent.trim();
    if (elementId === 'print-province') localStorage.setItem('attendance_custom_province', text);
    if (elementId === 'print-district') localStorage.setItem('attendance_custom_district', text);
    if (elementId === 'print-school') localStorage.setItem('attendance_custom_school', text);
    if (elementId === 'print-grade') localStorage.setItem('attendance_custom_grade', text);
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function generateGrid() {
    const month = parseInt(document.getElementById('month-select').value);
    const year = parseInt(document.getElementById('year-select').value);
    
    if (!month || !year) return;
    
    // Update headers
    document.getElementById('print-month-year').textContent = `${khmerMonths[month - 1]} ឆ្នាំ ${year}`;
    
    const daysInMonth = getDaysInMonth(year, month);
    
    // Load saved attendance data if exists early to get holidays
    const storageKey = typeof window.getKey === 'function' ? window.getKey(`attendance_${year}_${month}`) : `attendance_${year}_${month}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey)) || {};
    
    // Determine holidays
    let holidays = savedData.holidays;
    if (!holidays) {
        holidays = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month - 1, i);
            if (dateObj.getDay() === 0) {
                holidays.push(i);
            }
        }
    }
    
    // Generate Table Headers
    const headerRow1 = document.getElementById('table-header-row-1');
    const headerRow2 = document.getElementById('table-header-row-2');
    
    headerRow1.innerHTML = `
        <th rowspan="2" style="width: 30px;">ល.រ</th>
        <th rowspan="2" style="width: 70px;">អត្តលេខ</th>
        <th rowspan="2" style="min-width: 150px;">គោត្តនាម និងនាម</th>
        <th rowspan="2" style="width: 40px;">ភេទ</th>
    `;
    headerRow2.innerHTML = '';
    
    for (let i = 1; i <= 31; i++) {
        if (i <= daysInMonth) {
            const isHoliday = holidays.includes(i);
            const classStr = isHoliday ? 'day-col sunday' : 'day-col';
            headerRow1.innerHTML += `<th rowspan="2" class="${classStr} header-day" data-day="${i}" onclick="toggleHoliday(${i})" style="cursor: pointer;" title="ចុចដើម្បីបិទ/បើក ថ្ងៃឈប់សម្រាក (Toggle Holiday)">${i}</th>`;
        } else {
            // Empty columns if month has less than 31 days
            headerRow1.innerHTML += `<th rowspan="2" class="day-col" style="background-color: #f3f4f6;"></th>`;
        }
    }
    
    headerRow1.innerHTML += `
        <th colspan="3">ចំនួនអវត្តមាន</th>
        <th rowspan="2" style="min-width: 100px;">សេចក្ដីផ្សេងៗ</th>
    `;
    
    headerRow2.innerHTML += `
        <th style="width: 30px;">អ</th>
        <th style="width: 30px;">ច</th>
        <th style="width: 30px;">សរុប</th>
    `;
    
    // Load students
    let students = [];
    if (typeof window.getKey === 'function') {
        students = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
    } else {
        students = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
    }
    
    // Sort students by name
    students.sort((a, b) => a.name.localeCompare(b.name, 'km'));
    
    let totalStudents = students.length;
    let femaleStudents = students.filter(s => s.gender === 'ស្រី').length;
    
    document.getElementById('print-total-students').textContent = totalStudents;
    document.getElementById('print-female-students').textContent = femaleStudents;
    
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        const stData = savedData[student.id] || {};
        
        let html = `
            <td>${index + 1}</td>
            <td>${student.id || ''}</td>
            <td class="name-col">${student.name}</td>
            <td>${student.gender}</td>
        `;
        
        for (let i = 1; i <= 31; i++) {
            if (i <= daysInMonth) {
                const isHoliday = holidays.includes(i);
                const classStr = isHoliday ? 'day-col sunday' : 'day-col';
                const val = stData[`day_${i}`] || '';
                const valClass = val === 'អ' ? 'red-text' : '';
                
                html += `<td class="${classStr} col-day-${i}"><input type="text" class="attendance-input ${valClass}" data-student="${student.id}" data-day="${i}" value="${val}" maxlength="1" onkeyup="calculateTotals('${student.id}')" onchange="calculateTotals('${student.id}')"></td>`;
            } else {
                html += `<td class="day-col" style="background-color: #f3f4f6;"></td>`;
            }
        }
        
        html += `
            <td id="total-a-${student.id}">${stData.totalA || 0}</td>
            <td id="total-p-${student.id}">${stData.totalP || 0}</td>
            <td id="total-all-${student.id}">${(stData.totalA || 0) + (stData.totalP || 0)}</td>
            <td><input type="text" class="attendance-input" style="text-align: left; padding: 0 5px;" data-student="${student.id}" data-note="true" value="${stData.note || ''}"></td>
        `;
        
        row.innerHTML = html;
        tbody.appendChild(row);
    });
}

function toggleHoliday(day) {
    const header = document.querySelector(`.header-day[data-day="${day}"]`);
    if (!header) return;
    
    const isNowHoliday = !header.classList.contains('sunday');
    
    if (isNowHoliday) {
        header.classList.add('sunday');
    } else {
        header.classList.remove('sunday');
    }
    
    const cells = document.querySelectorAll(`.col-day-${day}`);
    cells.forEach(cell => {
        if (isNowHoliday) {
            cell.classList.add('sunday');
        } else {
            cell.classList.remove('sunday');
        }
    });
}

function calculateTotals(studentId) {
    const inputs = document.querySelectorAll(`input[data-student="${studentId}"][data-day]`);
    let totalA = 0; // អ
    let totalP = 0; // ច
    
    inputs.forEach(input => {
        const val = input.value.trim().toUpperCase();
        // Convert lower case khmer to upper just in case, though khmer doesn't have cases.
        // We accept 'អ' for Absent without permission and 'ច' for Absent with permission
        if (val === 'អ' || val === 'a' || val === 'A') {
            input.value = 'អ';
            input.classList.add('red-text');
            totalA++;
        } else if (val === 'ច' || val === 'p' || val === 'P' || val === 'c' || val === 'C') {
            input.value = 'ច';
            input.classList.remove('red-text');
            totalP++;
        } else {
            input.value = ''; // clear invalid inputs
            input.classList.remove('red-text');
        }
    });
    
    document.getElementById(`total-a-${studentId}`).textContent = totalA;
    document.getElementById(`total-p-${studentId}`).textContent = totalP;
    document.getElementById(`total-all-${studentId}`).textContent = totalA + totalP;
}

function saveAttendance() {
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    
    if (!month || !year) return;
    
    let students = [];
    if (typeof window.getKey === 'function') {
        students = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
    } else {
        students = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
    }
    
    let dataToSave = {};
    
    students.forEach(student => {
        const stData = {};
        const inputs = document.querySelectorAll(`input[data-student="${student.id}"][data-day]`);
        
        inputs.forEach(input => {
            const day = input.getAttribute('data-day');
            const val = input.value.trim();
            if (val) {
                stData[`day_${day}`] = val;
            }
        });
        
        const noteInput = document.querySelector(`input[data-student="${student.id}"][data-note="true"]`);
        if (noteInput && noteInput.value.trim()) {
            stData.note = noteInput.value.trim();
        }
        
        stData.totalA = parseInt(document.getElementById(`total-a-${student.id}`).textContent) || 0;
        stData.totalP = parseInt(document.getElementById(`total-p-${student.id}`).textContent) || 0;
        
        dataToSave[student.id] = stData;
    });
    
    const holidays = [];
    document.querySelectorAll('.header-day').forEach(header => {
        if (header.classList.contains('sunday')) {
            holidays.push(parseInt(header.getAttribute('data-day')));
        }
    });
    dataToSave.holidays = holidays;
    
    const storageKey = typeof window.getKey === 'function' ? window.getKey(`attendance_${year}_${month}`) : `attendance_${year}_${month}`;
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    
    alert('ទិន្នន័យត្រូវបានរក្សាទុករួចរាល់! (Data saved successfully!)');
}

// --- IMPORT EXCEL LOGIC ---
function openImportModal() {
    document.getElementById('import-modal').style.display = 'flex';
    document.getElementById('import-textarea').value = '';
    const fileInput = document.getElementById('import-file');
    if (fileInput) fileInput.value = '';
    document.getElementById('import-textarea').focus();
}

function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
}

function processImport() {
    const fileInput = document.getElementById('import-file');
    const textarea = document.getElementById('import-textarea');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            parseImportData(csv, ',');
        };
        reader.readAsArrayBuffer(file);
    } else {
        const text = textarea.value.trim();
        if (!text) {
            alert('សូមជ្រើសរើសឯកសារ Excel ឬ Paste ទិន្នន័យជាមុនសិន!');
            return;
        }
        parseImportData(text, '\t');
    }
}

function parseImportData(text, separator) {
    const rows = text.split('\n');
    let importedCount = 0;
    
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    const daysInMonth = getDaysInMonth(year, month);
    
    rows.forEach(row => {
        let cols;
        if (separator === ',') {
            cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        } else {
            cols = row.split('\t').map(c => c.trim());
        }
        
        // We expect: 0: ល.រ, 1: អត្តលេខ, 2: ឈ្មោះ, 3: ភេទ, 4-34: ថ្ងៃ១-៣១
        if (cols.length >= 2) {
            const id = cols[1];
            const name = cols[2];
            
            // Skip header row
            if (!id || id === 'អត្តលេខ' || id.toLowerCase() === 'id') return;
            
            // Find student inputs in DOM
            let studentInputs = document.querySelectorAll(`input[data-student="${id}"][data-day]`);
            let studentIdMatch = id;
            
            // If ID not found, try finding by name (as a fallback)
            if (studentInputs.length === 0 && name) {
                // In case ID changed but name matches, search DOM
                const rows = document.querySelectorAll('#table-body tr');
                for (let r of rows) {
                    const nameCell = r.querySelector('td:nth-child(3)');
                    if (nameCell && nameCell.textContent.trim() === name) {
                        const idCell = r.querySelector('td:nth-child(2)');
                        if (idCell) {
                            studentIdMatch = idCell.textContent.trim();
                            studentInputs = document.querySelectorAll(`input[data-student="${studentIdMatch}"][data-day]`);
                            break;
                        }
                    }
                }
            }
            
            if (studentInputs.length > 0) {
                for (let i = 1; i <= 31; i++) {
                    if (i <= daysInMonth) {
                        // The attendance marks start at index 4 (day 1 = cols[4])
                        let mark = cols[i + 3] || '';
                        mark = mark.replace(/"/g, '').trim().toUpperCase();
                        
                        const input = document.querySelector(`input[data-student="${studentIdMatch}"][data-day="${i}"]`);
                        if (input) {
                            if (mark === 'អ' || mark === 'A') mark = 'អ';
                            else if (mark === 'ច' || mark === 'C' || mark === 'P') mark = 'ច';
                            else mark = '';
                            
                            input.value = mark;
                        }
                    }
                }
                
                // Update totals dynamically
                calculateTotals(studentIdMatch);
                importedCount++;
            }
        }
    });
    
    if (importedCount > 0) {
        saveAttendance();
        closeImportModal();
        alert(`បាននាំចូលវត្តមានសិស្សចំនួន ${importedCount} នាក់ ដោយជោគជ័យ!`);
    } else {
        alert('មិនមានទិន្នន័យសិស្សត្រូវបាននាំចូលទេ។ សូមពិនិត្យមើលទម្រង់ (Format) ឱ្យបានត្រឹមត្រូវ ជាពិសេស អត្តលេខសិស្ស។');
    }
}

function downloadTemplate() {
    let headers = ['ល.រ', 'អត្តលេខ', 'គោត្តនាម និងនាម', 'ភេទ'];
    for (let i = 1; i <= 31; i++) {
        headers.push(i.toString());
    }
    
    const escapeCSV = (arr) => arr.map(field => `"${field}"`).join(',');
    let csvContent = escapeCSV(headers) + '\n';
    
    // Check if we have students in the system to pre-fill
    let students = [];
    if (typeof window.getKey === 'function') {
        students = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
    } else {
        students = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
    }
    
    if (students.length > 0) {
        // Sort students
        students.sort((a, b) => a.name.localeCompare(b.name, 'km'));
        
        // Add each student
        students.forEach((student, index) => {
            let row = [
                (index + 1).toString(),
                student.id,
                student.name,
                student.gender || 'ប'
            ];
            // Fill 31 empty columns for days
            for (let i = 1; i <= 31; i++) {
                row.push('');
            }
            csvContent += escapeCSV(row) + '\n';
        });
    } else {
        // Sample row if no students
        let sampleRow = ['1', 'S-001', 'សេង ហុង', 'ប'];
        for (let i = 1; i <= 31; i++) {
            sampleRow.push('');
        }
        csvContent += escapeCSV(sampleRow) + '\n';
    }
    
    // Add UTF-8 BOM
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_attendance_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
