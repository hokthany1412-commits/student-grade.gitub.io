// seat-plan.js - Logic for Primary School Classroom Seating Plan (ប្លង់តុអង្គុយសិស្ស)

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
function toKhmerNumber(num) {
    if (num === null || num === undefined) return '';
    return num.toString().split('').map(d => KHMER_DIGITS[d] !== undefined ? KHMER_DIGITS[d] : d).join('');
}

const TOTAL_DESKS = 15; // 5 rows x 3 columns = 15 desks (30 seats)
let currentStudents = [];
let seatingData = {}; // deskIndex: { left: studentObj|null, right: studentObj|null }
let activeEditingSeat = null; // { deskIndex, slot: 'left'|'right' }

document.addEventListener('DOMContentLoaded', () => {
    loadClassAndSchoolMeta();
    loadClassStudents();
    loadSeatingData();
    renderSeatingGrid();
    setupKhmerDates();
});

// Load school, teacher, and class information
function loadClassAndSchoolMeta() {
    if (!window.classManager) return;
    const info = window.classManager.getSchoolInfo ? window.classManager.getSchoolInfo() : {};
    const className = window.classManager.getCurrentClassName ? window.classManager.getCurrentClassName() : 'ថ្នាក់ទី ៥ ក';
    const yearName = window.classManager.getCurrentAcademicYearName ? window.classManager.getCurrentAcademicYearName() : '២០២៥ - ២០២៦';

    const elSchool = document.getElementById('lbl-school-name');
    const elCluster = document.getElementById('lbl-cluster-name');
    const elClass = document.getElementById('lbl-class-name');
    const elYear = document.getElementById('lbl-academic-year');
    const elTeacher = document.getElementById('sig-teacher-name');
    const elDirector = document.getElementById('sig-director-name');

    if (elSchool) elSchool.textContent = info.school || 'សាលាបឋមសិក្សា ផ្លុង';
    if (elCluster) elCluster.textContent = info.cluster || 'ទីពោ';
    if (elClass) elClass.textContent = className;
    if (elYear) elYear.textContent = yearName;
    if (elTeacher) elTeacher.textContent = info.teacher || '...................................................';
    if (elDirector) elDirector.textContent = info.director || '...................................................';
}

// Load active students from storage
function loadClassStudents() {
    const key = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
    let data = [];
    try {
        data = JSON.parse(localStorage.getItem(key)) || [];
        if (data.length === 0 && key === 'studentProfilesData') {
            data = JSON.parse(localStorage.getItem('students')) || [];
        }
    } catch (e) {
        console.error('Error loading student profiles', e);
    }
    currentStudents = data;
}

// Load or initialize seating data
function loadSeatingData() {
    const storageKey = window.getKey ? window.getKey('classroomSeatingPlan') : 'classroomSeatingPlan';
    let saved = null;
    try {
        saved = JSON.parse(localStorage.getItem(storageKey));
    } catch(e) {}

    if (saved && typeof saved === 'object') {
        seatingData = saved;
    } else {
        // Initialize empty 15 desks
        seatingData = {};
        for (let i = 1; i <= TOTAL_DESKS; i++) {
            seatingData[i] = { left: null, right: null };
        }
        // If students exist, auto fill for initial view
        if (currentStudents.length > 0) {
            autoAssignSeats(false);
        }
    }
}

function saveSeatingData() {
    const storageKey = window.getKey ? window.getKey('classroomSeatingPlan') : 'classroomSeatingPlan';
    try {
        localStorage.setItem(storageKey, JSON.stringify(seatingData));
    } catch (e) {
        console.warn('Error saving seating data', e);
    }
}

// Render the 15 desks in 3 columns
function renderSeatingGrid() {
    const container = document.getElementById('seating-grid-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= TOTAL_DESKS; i++) {
        const desk = seatingData[i] || { left: null, right: null };
        const rowNum = Math.ceil(i / 3);
        const colNum = ((i - 1) % 3) + 1;

        const deskEl = document.createElement('div');
        deskEl.className = 'desk-card';

        deskEl.innerHTML = `
            <div class="desk-header">
                <span>តុទី ${toKhmerNumber(i)} (ជួរ ${toKhmerNumber(rowNum)} ជួរឈរ ${toKhmerNumber(colNum)})</span>
                <span>🪑 ២ កៅអី</span>
            </div>
            <div class="seats-container">
                <div class="seat-slot ${getSeatClass(desk.left)}" onclick="openSeatModal(${i}, 'left')" title="ចុចដើម្បីកំណត់សិស្សកៅអីឆ្វេង">
                    ${renderSeatContent(desk.left, 'កៅអី ក')}
                </div>
                <div class="seat-slot ${getSeatClass(desk.right)}" onclick="openSeatModal(${i}, 'right')" title="ចុចដើម្បីកំណត់សិស្សកៅអីស្តាំ">
                    ${renderSeatContent(desk.right, 'កៅអី ខ')}
                </div>
            </div>
        `;

        container.appendChild(deskEl);
    }
}

function getSeatClass(student) {
    if (!student) return '';
    const isGirl = (student.gender === 'ស' || student.gender === 'ស្រី' || student.gender === 'F');
    return isGirl ? 'occupied-girl' : 'occupied-boy';
}

function renderSeatContent(student, fallbackLabel) {
    if (!student) {
        return `<span class="seat-empty-label">+ ${fallbackLabel}</span>`;
    }
    const isGirl = (student.gender === 'ស' || student.gender === 'ស្រី' || student.gender === 'F');
    const genderText = isGirl ? 'ស្រី' : 'ប្រុស';
    const genderClass = isGirl ? 'girl' : 'boy';

    return `
        <div class="seat-student-name" title="${student.name}">${student.name}</div>
        <div class="seat-student-gender ${genderClass}">(${genderText}) ${student.id ? '#' + student.id : ''}</div>
    `;
}

// Auto Assign seats from available student list
function autoAssignSeats(promptUser = true) {
    if (promptUser && !confirm('តើអ្នកពិតជាចង់រៀបចំសិស្សដាក់តុដោយស្វ័យប្រវត្តិតាមបញ្ជីឈ្មោះឬទេ?')) {
        return;
    }

    // Reset all desks
    seatingData = {};
    for (let i = 1; i <= TOTAL_DESKS; i++) {
        seatingData[i] = { left: null, right: null };
    }

    let sIdx = 0;
    for (let i = 1; i <= TOTAL_DESKS && sIdx < currentStudents.length; i++) {
        if (sIdx < currentStudents.length) {
            seatingData[i].left = {
                id: currentStudents[sIdx].id || '',
                name: currentStudents[sIdx].name || '',
                gender: currentStudents[sIdx].gender || 'ប'
            };
            sIdx++;
        }
        if (sIdx < currentStudents.length) {
            seatingData[i].right = {
                id: currentStudents[sIdx].id || '',
                name: currentStudents[sIdx].name || '',
                gender: currentStudents[sIdx].gender || 'ប'
            };
            sIdx++;
        }
    }

    saveSeatingData();
    renderSeatingGrid();
}

function clearAllSeats() {
    if (!confirm('តើអ្នកពិតជាចង់សម្អាតប្លង់តុអង្គុយទាំងអស់ឬទេ?')) return;
    for (let i = 1; i <= TOTAL_DESKS; i++) {
        seatingData[i] = { left: null, right: null };
    }
    saveSeatingData();
    renderSeatingGrid();
}

// Seat Modal Editing
function openSeatModal(deskIndex, slot) {
    activeEditingSeat = { deskIndex, slot };
    const modal = document.getElementById('seat-edit-modal');
    const title = document.getElementById('modal-desk-title');
    const picker = document.getElementById('modal-student-picker');

    const slotName = slot === 'left' ? 'ខាងឆ្វេង (ក)' : 'ខាងស្តាំ (ខ)';
    if (title) title.textContent = `តុទី ${toKhmerNumber(deskIndex)} - កៅអី${slotName}`;

    // Populate picker
    if (picker) {
        picker.innerHTML = '<option value="">-- សូមជ្រើសរើសសិស្ស --</option>';
        currentStudents.forEach(s => {
            const isG = (s.gender === 'ស' || s.gender === 'ស្រី' || s.gender === 'F');
            const gStr = isG ? 'ស្រី' : 'ប្រុស';
            const opt = document.createElement('option');
            opt.value = s.id || s.name;
            opt.textContent = `${s.name} (${gStr}) ${s.id ? '- ' + s.id : ''}`;
            picker.appendChild(opt);
        });

        const currentAssigned = seatingData[deskIndex] ? seatingData[deskIndex][slot] : null;
        if (currentAssigned) {
            picker.value = currentAssigned.id || currentAssigned.name;
        } else {
            picker.value = '';
        }
    }

    if (modal) modal.style.display = 'flex';
}

function closeSeatModal() {
    const modal = document.getElementById('seat-edit-modal');
    if (modal) modal.style.display = 'none';
    activeEditingSeat = null;
}

function confirmSeatAssignment() {
    if (!activeEditingSeat) return;
    const picker = document.getElementById('modal-student-picker');
    const chosenVal = picker ? picker.value : '';

    if (!chosenVal) {
        removeStudentFromSeat();
        return;
    }

    const found = currentStudents.find(s => (s.id && s.id.toString() === chosenVal) || s.name === chosenVal);
    if (found) {
        if (!seatingData[activeEditingSeat.deskIndex]) {
            seatingData[activeEditingSeat.deskIndex] = { left: null, right: null };
        }
        seatingData[activeEditingSeat.deskIndex][activeEditingSeat.slot] = {
            id: found.id || '',
            name: found.name || '',
            gender: found.gender || 'ប'
        };
        saveSeatingData();
        renderSeatingGrid();
    }
    closeSeatModal();
}

function removeStudentFromSeat() {
    if (!activeEditingSeat) return;
    if (seatingData[activeEditingSeat.deskIndex]) {
        seatingData[activeEditingSeat.deskIndex][activeEditingSeat.slot] = null;
        saveSeatingData();
        renderSeatingGrid();
    }
    closeSeatModal();
}

// Setup Khmer Buddhist and Solar dates
function setupKhmerDates() {
    const now = new Date();
    const sDay = toKhmerNumber(now.getDate());
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const sMonth = khmerMonths[now.getMonth()];
    const sYear = toKhmerNumber(now.getFullYear());

    let location = 'ផ្លុង';
    if (window.classManager && window.classManager.getSchoolInfo) {
        const info = window.classManager.getSchoolInfo();
        location = info.district || info.school || 'ផ្លុង';
    }

    const elSolar = document.getElementById('lbl-solar-date');
    if (elSolar) {
        elSolar.textContent = `ធ្វើនៅ${location}, ថ្ងៃទី ${sDay} ខែ ${sMonth} ឆ្នាំ ${sYear}`;
    }

    const elLunar = document.getElementById('lbl-lunar-date');
    if (elLunar) {
        if (typeof KhmerCalendar !== 'undefined' && KhmerCalendar.toKhmerLunarDate) {
            try {
                const lunar = KhmerCalendar.toKhmerLunarDate(now);
                if (lunar && lunar.lunarDateText) {
                    elLunar.textContent = lunar.lunarDateText;
                }
            } catch(e) {
                elLunar.textContent = `ថ្ងៃព្រហស្បតិ៍ ៩ កើត ខែពិសាខ ឆ្នាំម្សាញ់ ព.ស. ២៥៦៩`;
            }
        }
    }
}

// Export as PDF
function exportSeatPlanPDF() {
    const element = document.getElementById('printable-seating-plan');
    const className = window.classManager && window.classManager.getCurrentClassName ? window.classManager.getCurrentClassName() : 'Class';
    const opt = {
        margin: [5, 5, 5, 5],
        filename: `Seating_Plan_${className.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
