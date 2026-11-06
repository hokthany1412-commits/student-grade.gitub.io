// Yearbook Memory Board Logic System
let activeRowIndex = null;
let activeMemberIndex = null;
let currentBorderStyle = localStorage.getItem('yearbook_border_style') || 'images/praise_frame_style_1.png';
let currentPaperSize = localStorage.getItem('yearbook_paper_size') || 'a4';

let yearbookState = {
    header: {
        hierarchyLine1: "ក្រសួងអប់រំ យុវជន និងកីឡា",
        hierarchyLine2: "ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកសន្ទុក",
        hierarchyLine3: "សាលាបឋមសិក្សា ផ្លុង",
        country: "ព្រះរាជាណាចក្រកម្ពុជា",
        motto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
        title: "កម្រងអនុស្សាវរីយ៍",
        subtitle: "សិស្សានុសិស្សសាលាបឋមសិក្សា ផ្លុង ឆ្នាំសិក្សា ២០២៥-២០២៦",
        leftLogo: "images/moeys-logo.png"
    },
    rows: []
};

// 1. Load Real Classroom Data from LocalStorage & Split Rows Dynamically
function loadCurrentClassData() {
    const studentKey = window.classManager ? window.classManager.getKey('studentProfilesData') : 'studentProfilesData';
    const teacherKey = window.classManager ? window.classManager.getKey('teacherProfiles') : 'teacherProfiles';
    const schoolRecKey = window.classManager ? window.classManager.getKey('schoolRecords') : 'schoolRecords';

    let savedStudents = [];
    try {
        const sRaw = localStorage.getItem(studentKey);
        if (sRaw) savedStudents = JSON.parse(sRaw);
    } catch(e) {}

    if (!savedStudents || savedStudents.length === 0) {
        const months = ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា'];
        for (const m of months) {
            const gKey = window.classManager ? window.classManager.getKey(`studentGrades_${m}`) : `studentGrades_${m}`;
            const gRaw = localStorage.getItem(gKey);
            if (gRaw) {
                try {
                    const gList = JSON.parse(gRaw);
                    if (Array.isArray(gList) && gList.length > 0) {
                        savedStudents = gList;
                        break;
                    }
                } catch(e) {}
            }
        }
    }

    let savedTeachers = [];
    try {
        const tRaw = localStorage.getItem(teacherKey);
        if (tRaw) savedTeachers = JSON.parse(tRaw);
    } catch(e) {}

    let schoolRec = {};
    try {
        const rRaw = localStorage.getItem(schoolRecKey);
        if (rRaw) schoolRec = JSON.parse(rRaw);
    } catch(e) {}

    const activeClass = window.classManager ? window.classManager.getActiveClass() : null;
    const currentClassName = activeClass ? activeClass.name : 'ថ្នាក់ទី ៥ ក';
    const academicYear = (window.classManager && window.classManager.getCurrentAcademicYearName) ? window.classManager.getCurrentAcademicYearName() : '២០២៥-២០២៦';
    const schoolName = schoolRec.schoolName || 'សាលាបឋមសិក្សា ផ្លុង';
    const districtName = schoolRec.district || 'ស្រុកសន្ទុក';

    let homeroomTeacher = null;
    if (savedTeachers && savedTeachers.length > 0) {
        homeroomTeacher = savedTeachers.find(t => t.className === currentClassName || (activeClass && t.assignedClassId === activeClass.id)) || savedTeachers[0];
    }
    if (!homeroomTeacher && schoolRec && (schoolRec.teacherName || schoolRec.teacher)) {
        homeroomTeacher = {
            name: schoolRec.teacherName || schoolRec.teacher,
            role: "គ្រូបន្ទុកថ្នាក់",
            photo: schoolRec.teacherPhoto || ""
        };
    }
    if (!homeroomTeacher) {
        homeroomTeacher = {
            name: "អ្នកគ្រូ ស៊ុន ស្រីមុំ",
            role: "គ្រូបន្ទុកថ្នាក់",
            photo: ""
        };
    }

    const state = {
        header: {
            hierarchyLine1: "ក្រសួងអប់រំ យុវជន និងកីឡា",
            hierarchyLine2: `ការិយាល័យអប់រំ យុវជន និងកីឡា ${districtName}`,
            hierarchyLine3: schoolName,
            country: "ព្រះរាជាណាចក្រកម្ពុជា",
            motto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            title: "កម្រងអនុស្សាវរីយ៍",
            subtitle: `សិស្សានុសិស្ស ${currentClassName} · ${schoolName} ឆ្នាំសិក្សា ${academicYear}`,
            leftLogo: "images/moeys-logo.png"
        },
        rows: []
    };

    // --- ជួរទី១: គ្រូបន្ទុកថ្នាក់ ១ រូបគត់ (ចំកណ្តាល) ---
    state.rows.push({
        id: "row-homeroom-teacher",
        cssClass: "row-single-teacher",
        expectedCount: 1,
        members: [
            {
                name: homeroomTeacher.name,
                role: homeroomTeacher.role || homeroomTeacher.position || "គ្រូបន្ទុកថ្នាក់",
                photo: homeroomTeacher.photo || ""
            }
        ]
    });

    let dutiesData = {};
    const dutiesKey = window.classManager ? window.classManager.getKey('studentDutiesData') : 'studentDutiesData';
    try {
        const dRaw = localStorage.getItem(dutiesKey) || localStorage.getItem('studentDutiesData');
        if (dRaw) dutiesData = JSON.parse(dRaw);
    } catch(e) {}

    // Find student photo by name helper
    const getStudentPhoto = (studentName) => {
        if (!studentName) return "";
        const found = savedStudents.find(s => s.name && s.name.trim() === studentName.trim());
        return (found && found.photo) ? found.photo : "";
    };

    // Determine 3 class leaders (President, Vice 1, Vice 2) from student duties or fallback
    let presidentName = dutiesData['role-president'] || (savedStudents[0] ? savedStudents[0].name : "ប្រធានថ្នាក់");
    let vice1Name = dutiesData['role-vice1'] || (savedStudents[1] ? savedStudents[1].name : "អនុប្រធានទី១");
    let vice2Name = dutiesData['role-vice2'] || (savedStudents[2] ? savedStudents[2].name : "អនុប្រធានទី២");

    const leaderNamesSet = new Set([presidentName.trim(), vice1Name.trim(), vice2Name.trim()]);

    // --- ជួរទី២: ប្រធានថ្នាក់, អនុប្រធានទី១, អនុប្រធានទី២ (៣ នាក់គត់) ---
    state.rows.push({
        id: "row-class-leaders",
        cssClass: "row-class-leaders",
        expectedCount: 3,
        members: [
            {
                name: presidentName,
                role: "ប្រធានថ្នាក់",
                roleType: "monitor",
                photo: getStudentPhoto(presidentName)
            },
            {
                name: vice1Name,
                role: "អនុប្រធានទី១",
                roleType: "vice-1",
                photo: getStudentPhoto(vice1Name)
            },
            {
                name: vice2Name,
                role: "អនុប្រធានទី២",
                roleType: "vice-2",
                photo: getStudentPhoto(vice2Name)
            }
        ]
    });

    // --- សិស្សដែលនៅសល់ (មិនរួមបញ្ចូលប្រធាន និងអនុប្រធាន ដើម្បីកុំឱ្យជាន់ឈ្មោះគ្នា) ---
    const remainingStudents = savedStudents.filter(s => s.name && !leaderNamesSet.has(s.name.trim()));
    const totalRemaining = remainingStudents.length;

    const isPortrait = currentPaperSize.includes('portrait');

    if (totalRemaining > 0) {
        let numRows = 1;
        if (isPortrait) {
            // In portrait, split into 4-6 balanced rows (max 6-8 per row)
            if (totalRemaining <= 10) numRows = 2;
            else if (totalRemaining <= 20) numRows = 3;
            else if (totalRemaining <= 32) numRows = 4;
            else numRows = 5;
        } else {
            // In landscape, maximum 3 rows to fit nicely
            if (totalRemaining <= 10) numRows = 1;
            else if (totalRemaining <= 26) numRows = 2;
            else numRows = 3;
        }

        const perRow = Math.ceil(totalRemaining / numRows);

        for (let i = 0; i < totalRemaining; i += perRow) {
            const chunk = remainingStudents.slice(i, i + perRow);
            const rowMembers = chunk.map((s, idx) => ({
                name: s.name || `សិស្ស ${i + idx + 4}`,
                role: "សិស្ស",
                photo: s.photo || ""
            }));

            state.rows.push({
                id: `row-students-${Math.floor(i / perRow) + 1}`,
                cssClass: "row-students-dynamic",
                expectedCount: rowMembers.length,
                members: rowMembers
            });
        }
    }

    return state;
}

// 2. Render Yearbook to DOM
function renderYearbook() {
    const elH1 = document.getElementById('displayHierarchyLine1');
    const elH2 = document.getElementById('displayHierarchyLine2');
    const elH3 = document.getElementById('displayHierarchyLine3');
    const elCountry = document.getElementById('displayCountryTitle');
    const elMotto = document.getElementById('displayCountryMotto');
    const elTitle = document.getElementById('displayMainTitle');
    const elSubtitle = document.getElementById('displaySubTitle');

    if (elH1) elH1.textContent = yearbookState.header.hierarchyLine1 || "ក្រសួងអប់រំ យុវជន និងកីឡា";
    if (elH2) elH2.textContent = yearbookState.header.hierarchyLine2 || "ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកសន្ទុក";
    if (elH3) elH3.textContent = yearbookState.header.hierarchyLine3 || "សាលាបឋមសិក្សា ផ្លុង";

    if (elCountry) elCountry.textContent = yearbookState.header.country;
    if (elMotto) elMotto.textContent = yearbookState.header.motto;
    if (elTitle) elTitle.textContent = yearbookState.header.title;
    if (elSubtitle) elSubtitle.textContent = yearbookState.header.subtitle;

    const isPortrait = currentPaperSize.includes('portrait');
    const borderImgEl = document.getElementById('yearbookBorderImg');
    if (borderImgEl) {
        // Use true rotated portrait frame if portrait mode is active
        let borderPath = currentBorderStyle;
        if (isPortrait) {
            const fileName = currentBorderStyle.split('/').pop();
            borderPath = `images/portrait_${fileName}`;
        }
        borderImgEl.src = borderPath;
        borderImgEl.onerror = () => { borderImgEl.src = currentBorderStyle; };
    }

    const container = document.getElementById('photoRowsContainer');
    if (!container) return;
    container.innerHTML = '';

    const studentRowsCount = yearbookState.rows.filter(r => r.cssClass === 'row-students-dynamic').length;

    yearbookState.rows.forEach((row, rIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = `photo-row ${row.cssClass}`;

        const countInRow = row.members.length;

        row.members.forEach((member, mIdx) => {
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.title = `ចុចដើម្បីកែសម្រួល៖ ${member.name} (${member.role || ''})`;
            card.onclick = () => openMemberModal(rIdx, mIdx);

            if (row.cssClass === 'row-students-dynamic') {
                if (isPortrait) {
                    if (countInRow <= 6) {
                        card.style.width = '12%';
                        card.style.maxWidth = '68px';
                    } else if (countInRow <= 9) {
                        card.style.width = '9.5%';
                        card.style.maxWidth = '55px';
                    } else {
                        card.style.width = '7.5%';
                        card.style.maxWidth = '45px';
                    }
                } else {
                    if (studentRowsCount === 3) {
                        if (countInRow <= 8) {
                            card.style.width = '7.5%';
                            card.style.maxWidth = '60px';
                        } else if (countInRow <= 14) {
                            card.style.width = '5.8%';
                            card.style.maxWidth = '48px';
                        } else {
                            card.style.width = '5%';
                            card.style.maxWidth = '42px';
                        }
                    } else if (studentRowsCount === 2) {
                        if (countInRow <= 8) {
                            card.style.width = '8.5%';
                            card.style.maxWidth = '70px';
                        } else if (countInRow <= 14) {
                            card.style.width = '6.8%';
                            card.style.maxWidth = '56px';
                        } else {
                            card.style.width = '5.6%';
                            card.style.maxWidth = '46px';
                        }
                    } else {
                        if (countInRow <= 6) {
                            card.style.width = '10%';
                            card.style.maxWidth = '85px';
                        } else {
                            card.style.width = '7.5%';
                            card.style.maxWidth = '64px';
                        }
                    }
                }
            }

            const photoContent = member.photo ? 
                `<img src="${member.photo}" alt="${member.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                 <div class="photo-placeholder-icon" style="display:none;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>` :
                `<div class="photo-placeholder-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;

            let roleClass = '';
            if (member.role === 'ប្រធានថ្នាក់') roleClass = 'role-monitor';
            else if (member.role === 'អនុប្រធានទី១') roleClass = 'role-vice-1';
            else if (member.role === 'អនុប្រធានទី២') roleClass = 'role-vice-2';

            card.innerHTML = `
                <div class="photo-box">
                    ${photoContent}
                </div>
                <div class="profile-name">${member.name}</div>
                ${member.role ? `<div class="profile-role ${roleClass}">${member.role}</div>` : ''}
            `;

            rowEl.appendChild(card);
        });

        container.appendChild(rowEl);
    });
}

// 3. Change Border Style
function changeBorderStyle(stylePath) {
    currentBorderStyle = stylePath;
    localStorage.setItem('yearbook_border_style', stylePath);
    renderYearbook();
}

// 4. Change Paper Size (A4 Landscape, A4 Portrait, A3 Landscape, A3 Portrait)
function changePaperSize(size) {
    currentPaperSize = size;
    localStorage.setItem('yearbook_paper_size', size);
    const canvas = document.getElementById('yearbookContainer');
    if (!canvas) return;
    
    canvas.classList.remove('size-a3', 'size-a4-portrait', 'size-a3-portrait');
    
    if (size === 'a4-portrait') {
        canvas.classList.add('size-a4-portrait');
    } else if (size === 'a3') {
        canvas.classList.add('size-a3');
    } else if (size === 'a3-portrait') {
        canvas.classList.add('size-a3-portrait');
    }

    // Re-calculate balanced rows for the selected layout
    yearbookState = loadCurrentClassData();
    renderYearbook();
}

// 5. Print function that handles @page dynamically for Landscape vs Portrait
function printYearbook() {
    let printStyleEl = document.getElementById('yearbook-print-style');
    if (!printStyleEl) {
        printStyleEl = document.createElement('style');
        printStyleEl.id = 'yearbook-print-style';
        document.head.appendChild(printStyleEl);
    }

    if (currentPaperSize === 'a4-portrait') {
        printStyleEl.textContent = `@media print { @page { size: A4 portrait; margin: 0; } }`;
    } else if (currentPaperSize === 'a3-portrait') {
        printStyleEl.textContent = `@media print { @page { size: A3 portrait; margin: 0; } }`;
    } else if (currentPaperSize === 'a3') {
        printStyleEl.textContent = `@media print { @page { size: A3 landscape; margin: 0; } }`;
    } else {
        printStyleEl.textContent = `@media print { @page { size: A4 landscape; margin: 0; } }`;
    }

    window.print();
}

// 6. Member Modal Handlers
function openMemberModal(rIdx, mIdx) {
    activeRowIndex = rIdx;
    activeMemberIndex = mIdx;
    const member = yearbookState.rows[rIdx].members[mIdx];

    document.getElementById('modalMemberTitle').textContent = `កែសម្រួលព័ត៌មាន៖ ជួរទី ${rIdx + 1} - លេខ ${mIdx + 1}`;
    document.getElementById('inputMemberName').value = member.name || '';
    document.getElementById('inputMemberRole').value = member.role || '';
    document.getElementById('inputMemberPhoto').value = member.photo || '';
    document.getElementById('inputMemberPhotoFile').value = '';

    const selectRole = document.getElementById('selectStudentRole');
    if (['គ្រូបន្ទុកថ្នាក់', 'ប្រធានថ្នាក់', 'អនុប្រធានទី១', 'អនុប្រធានទី២'].includes(member.role)) {
        selectRole.value = member.role;
    } else if (!member.role) {
        selectRole.value = "";
    } else {
        selectRole.value = "other";
    }

    document.getElementById('memberEditModal').style.display = 'flex';
}

function handleRoleSelectChange(val) {
    const inputRole = document.getElementById('inputMemberRole');
    if (val === 'other') {
        inputRole.focus();
    } else {
        inputRole.value = val;
    }
}

function closeMemberModal() {
    document.getElementById('memberEditModal').style.display = 'none';
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        document.getElementById('inputMemberPhoto').value = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function saveMemberData() {
    if (activeRowIndex === null || activeMemberIndex === null) return;
    const name = document.getElementById('inputMemberName').value.trim();
    const role = document.getElementById('inputMemberRole').value.trim();
    const photo = document.getElementById('inputMemberPhoto').value.trim();

    yearbookState.rows[activeRowIndex].members[activeMemberIndex].name = name || `សមាជិក ${activeMemberIndex + 1}`;
    yearbookState.rows[activeRowIndex].members[activeMemberIndex].role = role;
    yearbookState.rows[activeRowIndex].members[activeMemberIndex].photo = photo;

    closeMemberModal();
    renderYearbook();
}

// 7. Header Modal Handlers
function openEditHeaderModal() {
    document.getElementById('inputHierarchyLine1').value = yearbookState.header.hierarchyLine1 || "ក្រសួងអប់រំ យុវជន និងកីឡា";
    document.getElementById('inputHierarchyLine2').value = yearbookState.header.hierarchyLine2 || "ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកសន្ទុក";
    document.getElementById('inputHierarchyLine3').value = yearbookState.header.hierarchyLine3 || "សាលាបឋមសិក្សា ផ្លុង";

    document.getElementById('inputCountryTitle').value = yearbookState.header.country;
    document.getElementById('inputCountryMotto').value = yearbookState.header.motto;
    document.getElementById('inputMainTitle').value = yearbookState.header.title;
    document.getElementById('inputSubTitle').value = yearbookState.header.subtitle;
    document.getElementById('headerEditModal').style.display = 'flex';
}

function closeHeaderModal() {
    document.getElementById('headerEditModal').style.display = 'none';
}

function saveHeaderData() {
    yearbookState.header.hierarchyLine1 = document.getElementById('inputHierarchyLine1').value.trim();
    yearbookState.header.hierarchyLine2 = document.getElementById('inputHierarchyLine2').value.trim();
    yearbookState.header.hierarchyLine3 = document.getElementById('inputHierarchyLine3').value.trim();

    yearbookState.header.country = document.getElementById('inputCountryTitle').value.trim();
    yearbookState.header.motto = document.getElementById('inputCountryMotto').value.trim();
    yearbookState.header.title = document.getElementById('inputMainTitle').value.trim();
    yearbookState.header.subtitle = document.getElementById('inputSubTitle').value.trim();
    closeHeaderModal();
    renderYearbook();
}

// 8. Export JSON Data
function exportYearbookJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(yearbookState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `yearbook_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// 9. Export Yearbook as High-Resolution Image (PNG/JPG)
async function exportYearbookImage() {
    const canvasEl = document.getElementById('yearbookContainer');
    if (!canvasEl) return;

    const exportBtn = document.getElementById('btnExportImg');
    const origText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
        exportBtn.innerHTML = '⏳ កំពុងទាញយករូបភាព...';
        exportBtn.disabled = true;
    }

    const activeClass = window.classManager ? window.classManager.getActiveClass() : null;
    const className = activeClass ? activeClass.name.replace(/\s+/g, '_') : 'ថ្នាក់ទី៥';
    const filename = `កម្រងអនុស្សាវរីយ៍_${className}_${Date.now()}.png`;

    try {
        // Strategy 1: Use domtoimage if available
        if (typeof domtoimage !== 'undefined') {
            try {
                const scale = 2;
                const style = {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: canvasEl.offsetWidth + 'px',
                    height: canvasEl.offsetHeight + 'px'
                };
                const param = {
                    width: canvasEl.offsetWidth * scale,
                    height: canvasEl.offsetHeight * scale,
                    style: style,
                    bgcolor: '#ffffff'
                };
                const dataUrl = await domtoimage.toPng(canvasEl, param);
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                link.remove();
                return;
            } catch(domErr) {
                console.warn('domtoimage failed, trying html2canvas fallback:', domErr);
            }
        }

        // Strategy 2: html2canvas with optimal settings
        const canvas = await html2canvas(canvasEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: false,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 15000
        });

        // Convert canvas safely
        let dataUrl = '';
        try {
            dataUrl = canvas.toDataURL('image/png', 0.98);
        } catch(canvasErr) {
            // If tainted, create a blob link
            canvas.toBlob((blob) => {
                if (blob) {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = blobUrl;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                }
            }, 'image/png', 0.98);
            return;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error('Error exporting image:', err);
        // Direct print fallback advice if browser blocks file URI canvas saving
        alert('សូមអភ័យទោស ប្រព័ន្ធបានជួបឧបសគ្គក្នុងការ Save រូបភាពផ្ទាល់! លោកគ្រូ-អ្នកគ្រូអាចចុចប៊ូតុង "បោះពុម្ព (Print)" ហើយជ្រើសរើស "Save as PDF" ឬប្រើ Print Screen ដើម្បីទទួលបានរូបភាពច្បាស់ល្អ!');
    } finally {
        if (exportBtn) {
            exportBtn.innerHTML = origText;
            exportBtn.disabled = false;
        }
    }
}

// 10. Export Yearbook as PDF
function exportYearbookPDF() {
    const canvasEl = document.getElementById('yearbookContainer');
    if (!canvasEl) return;

    const isPortrait = currentPaperSize.includes('portrait');
    const isA3 = currentPaperSize.includes('a3');

    const opt = {
        margin: [0, 0, 0, 0],
        filename: `កម្រងអនុស្សាវរីយ៍_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
            unit: 'mm',
            format: isA3 ? 'a3' : 'a4',
            orientation: isPortrait ? 'portrait' : 'landscape'
        }
    };

    html2pdf().set(opt).from(canvasEl).save();
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const borderSelect = document.getElementById('borderStyleSelect');
    if (borderSelect && currentBorderStyle) {
        borderSelect.value = currentBorderStyle;
    }
    const paperSelect = document.getElementById('paperSizeSelect');
    if (paperSelect && currentPaperSize) {
        paperSelect.value = currentPaperSize;
    }
    changePaperSize(currentPaperSize);
});
