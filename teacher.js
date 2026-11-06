// Data Array to hold teacher records
let teachers = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
let editingTeacherId = null;

// DOM Elements
const form = document.getElementById('teacher-form');
const tableBody = document.getElementById('table-body');
const clearBtn = document.getElementById('clear-btn');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const tableResponsive = document.querySelector('.table-responsive');

// Teacher photo state
let currentTeacherPhotoBase64 = '';

// Teacher Photo Handlers
window.handleTeacherPhotoFileInput = function(input) {
    if (input.files && input.files[0]) {
        processTeacherPhotoFile(input.files[0]);
    }
};

window.handleTeacherPhotoDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('teacher-photo-dropzone');
    if (dropzone) dropzone.style.borderColor = '#94a3b8';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processTeacherPhotoFile(e.dataTransfer.files[0]);
    }
};

function processTeacherPhotoFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, JPEG)!');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_W = 400;
            const MAX_H = 500;
            let w = img.width;
            let h = img.height;

            if (w > h) {
                if (w > MAX_W) {
                    h = Math.round(h * (MAX_W / w));
                    w = MAX_W;
                }
            } else {
                if (h > MAX_H) {
                    w = Math.round(w * (MAX_H / h));
                    h = MAX_H;
                }
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            currentTeacherPhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setTeacherPhotoPreview(currentTeacherPhotoBase64);
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function setTeacherPhotoPreview(photoUrl) {
    const preview = document.getElementById('teacher-photo-preview');
    const placeholder = document.getElementById('teacher-photo-placeholder');
    const removeBtn = document.getElementById('remove-teacher-photo-btn');

    if (photoUrl) {
        if (preview) {
            preview.src = photoUrl;
            preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        if (placeholder) placeholder.style.display = 'flex';
        if (removeBtn) removeBtn.style.display = 'none';
        currentTeacherPhotoBase64 = '';
        const fileInput = document.getElementById('teacher-photo-file-input');
        if (fileInput) fileInput.value = '';
    }
}

window.removeTeacherPhoto = function() {
    setTeacherPhotoPreview('');
};

// Render Table
function renderTable(dataToRender = teachers) {
    tableBody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        emptyState.classList.remove('hidden');
        tableResponsive.style.display = 'none';
        return;
    }
    
    emptyState.classList.add('hidden');
    tableResponsive.style.display = 'block';

    dataToRender.forEach((teacher, index) => {
        const row = document.createElement('tr');
        const photoHtml = teacher.photo ? 
            `<img src="${teacher.photo}" alt="${teacher.name}" style="width: 38px; height: 46px; object-fit: cover; border-radius: 6px; border: 1.5px solid #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.06); display: block; margin: 0 auto;">` :
            `<div style="width: 38px; height: 46px; border-radius: 6px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; color: #94a3b8; margin: 0 auto;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;

        row.innerHTML = `
            <td><span class="rank">${index + 1}</span></td>
            <td style="text-align: center;">${photoHtml}</td>
            <td><span class="grade-badge grade-b">${teacher.id}</span></td>
            <td style="font-weight: 700; color: var(--text-primary)">${teacher.name}</td>
            <td>${teacher.gender}</td>
            <td>${teacher.dob}</td>
            <td>${teacher.phone}</td>
            <td style="font-weight: 600; color: var(--primary)">${teacher.className}</td>
            <td style="display: flex; gap: 5px;">
                <button class="btn-icon" onclick="editTeacher('${teacher.id}')" title="កែប្រែទិន្នន័យ" style="color: var(--primary);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon" onclick="deleteTeacher('${teacher.id}', this)" title="លុបទិន្នន័យ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Save Data
function saveData() {
    localStorage.setItem(window.getKey('teacherProfiles'), JSON.stringify(teachers));
    renderTable();
}

// Handle Form Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('teacher-id').value.trim();
    const name = document.getElementById('teacher-name').value.trim();
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value.trim();
    const className = document.getElementById('class-name').value.trim();
    const photo = currentTeacherPhotoBase64 || '';
    
    if (editingTeacherId) {
        if (teachers.some(t => t.id === id && t.id !== editingTeacherId)) {
            alert('អត្តលេខនេះមានរួចហើយ! សូមប្រើអត្តលេខផ្សេង។');
            return;
        }
        const teacherIndex = teachers.findIndex(t => t.id === editingTeacherId);
        if (teacherIndex !== -1) {
            const existingPhoto = teachers[teacherIndex].photo || '';
            teachers[teacherIndex] = { id, name, gender, dob, phone, className, photo: photo || existingPhoto };
        }
        editingTeacherId = null;
        form.querySelector('button[type="submit"] span').textContent = 'រក្សាទុកទិន្នន័យ';
    } else {
        if (teachers.some(t => t.id === id)) {
            alert('អត្តលេខនេះមានរួចហើយ! សូមប្រើអត្តលេខផ្សេង។');
            return;
        }
        const newTeacher = { id, name, gender, dob, phone, className, photo };
        teachers.push(newTeacher);
    }
    
    saveData();
    form.reset();
    setTeacherPhotoPreview('');
    
    // Focus back on ID field
    document.getElementById('teacher-id').focus();
});

// Edit Teacher
window.editTeacher = function(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        document.getElementById('teacher-id').value = teacher.id;
        document.getElementById('teacher-name').value = teacher.name;
        document.getElementById('gender').value = teacher.gender;
        document.getElementById('dob').value = teacher.dob;
        document.getElementById('phone').value = teacher.phone;
        document.getElementById('class-name').value = teacher.className;
        
        currentTeacherPhotoBase64 = teacher.photo || '';
        setTeacherPhotoPreview(currentTeacherPhotoBase64);
        
        editingTeacherId = id;
        form.querySelector('button[type="submit"] span').textContent = 'កែប្រែទិន្នន័យ';
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Delete Teacher
window.deleteTeacher = function(id, btnElement) {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យគ្រូនេះមែនទេ?')) {
        const row = btnElement.closest('tr');
        row.classList.add('deleting');
        
        setTimeout(() => {
            teachers = teachers.filter(t => t.id !== id);
            saveData();
        }, 300); // Wait for animation to finish
    }
}

// Clear All Data
clearBtn.addEventListener('click', () => {
    if (teachers.length === 0) return;
    
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) {
        teachers = [];
        saveData();
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm) || 
        teacher.id.toLowerCase().includes(searchTerm) ||
        teacher.className.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredTeachers);
});

// Initial Render
renderTable();

// Data Array to hold school records
let schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];

// DOM Element for school form
const schoolForm = document.getElementById('school-form');

// Handle School Form Submit
if (schoolForm) {
    schoolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const districtOffice = document.getElementById('district-office').value.trim();
        const schoolCluster = document.getElementById('school-cluster').value.trim();
        const schoolName = document.getElementById('school-name').value.trim();
        const schoolProvince = document.getElementById('school-province').value.trim();
        const teachingLevel = document.getElementById('teaching-level').value;
        const teachingSubject = document.getElementById('teaching-subject').value.trim();
        const teachingHours = document.getElementById('teaching-hours').value.trim();
        
        const newSchoolRecord = { districtOffice, schoolCluster, schoolName, schoolProvince, teachingLevel, teachingSubject, teachingHours };
        
        schoolRecords.push(newSchoolRecord);
        localStorage.setItem(window.getKey('schoolRecords'), JSON.stringify(schoolRecords));
        
        // Sync with Syllabus Book and Attendance Headers
        if (schoolName) localStorage.setItem('attendance_custom_school', schoolName);
        if (districtOffice) localStorage.setItem('attendance_custom_district', districtOffice);
        if (schoolProvince) localStorage.setItem('attendance_custom_province', schoolProvince);
        
        alert('ទិន្នន័យសាលាត្រូវបានរក្សាទុកដោយជោគជ័យ! (School info saved successfully!)');
    });

    // Populate form with latest data on load
    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        if (latestSchool.districtOffice) document.getElementById('district-office').value = latestSchool.districtOffice;
        if (latestSchool.schoolCluster) document.getElementById('school-cluster').value = latestSchool.schoolCluster;
        if (latestSchool.schoolName) document.getElementById('school-name').value = latestSchool.schoolName;
        if (latestSchool.schoolProvince) document.getElementById('school-province').value = latestSchool.schoolProvince;
        if (latestSchool.teachingLevel) document.getElementById('teaching-level').value = latestSchool.teachingLevel;
        if (latestSchool.teachingSubject) document.getElementById('teaching-subject').value = latestSchool.teachingSubject;
        if (latestSchool.teachingHours) document.getElementById('teaching-hours').value = latestSchool.teachingHours;
    }
}

// Data Array to hold school gallery records
let galleryRecords = JSON.parse(localStorage.getItem(window.getKey('galleryRecords'))) || [];

// DOM Element for collection form (now used for gallery)
const collectionForm = document.getElementById('collection-form');

// Handle Gallery Form Submit
if (collectionForm) {
    collectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const galleryTitle = document.getElementById('gallery-title').value.trim();
        const galleryDate = document.getElementById('gallery-date').value;
        const galleryLocation = document.getElementById('gallery-location').value.trim();
        const galleryParticipants = document.getElementById('gallery-participants').value.trim();
        const galleryImage = document.getElementById('gallery-image').value.trim();
        const galleryDesc = document.getElementById('gallery-desc').value.trim();
        
        const newGalleryRecord = { galleryTitle, galleryDate, galleryLocation, galleryParticipants, galleryImage, galleryDesc };
        
        galleryRecords.push(newGalleryRecord);
        localStorage.setItem(window.getKey('galleryRecords'), JSON.stringify(galleryRecords));
        
        alert('កម្រងសាលាត្រូវបានរក្សាទុកដោយជោគជ័យ! (School gallery saved successfully!)');
        collectionForm.reset();
        renderGalleryTable();
    });
}

// Render Gallery Table
function renderGalleryTable() {
    const galleryTableBody = document.getElementById('gallery-table-body');
    const galleryEmptyState = document.getElementById('gallery-empty-state');
    
    if (!galleryTableBody) return;
    const galleryTableResponsive = galleryTableBody.closest('.table-responsive');
    
    galleryTableBody.innerHTML = '';
    
    if (galleryRecords.length === 0) {
        galleryEmptyState.classList.remove('hidden');
        galleryTableResponsive.style.display = 'none';
        return;
    }
    
    galleryEmptyState.classList.add('hidden');
    galleryTableResponsive.style.display = 'block';

    galleryRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="rank">${index + 1}</span></td>
            <td>${record.galleryDate}</td>
            <td style="font-weight: 700; color: var(--text-primary)">${record.galleryTitle}</td>
            <td>${record.galleryLocation}</td>
            <td>${record.galleryParticipants}</td>
            <td>
                <button class="btn-icon" onclick="deleteGalleryRecord(${index}, this)" title="លុបទិន្នន័យ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;
        galleryTableBody.appendChild(row);
    });
}

// Initial render for gallery
renderGalleryTable();

// Delete Gallery Record
window.deleteGalleryRecord = function(index, btnElement) {
    if (confirm('តើអ្នកពិតជាចង់លុបកម្រងនេះមែនទេ?')) {
        const row = btnElement.closest('tr');
        row.classList.add('deleting');
        
        setTimeout(() => {
            galleryRecords.splice(index, 1);
            localStorage.setItem(window.getKey('galleryRecords'), JSON.stringify(galleryRecords));
            renderGalleryTable();
        }, 300);
    }
}
