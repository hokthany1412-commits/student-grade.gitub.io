document.addEventListener('DOMContentLoaded', () => {
    loadSchoolInfo();
    loadTeacherProfile();
    loadCurrentDate();
    loadStudents();
    loadLogo();
});

function loadSchoolInfo() {
    if (typeof window.getKey !== 'function') return;
    const schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];
    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        
        let district = latestSchool.districtOffice || '...................';
        district = district.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*ស្រុក\s*/, '');
        district = district.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*/, '');
        district = district.replace(/^ស្រុក\s*/, '');
        
        document.getElementById('print-district').textContent = district;
        document.getElementById('print-district-2').textContent = district;
        
        let school = latestSchool.schoolName || '...................';
        document.getElementById('print-school').textContent = school;
        document.getElementById('print-school-2').textContent = school;
        
        if (latestSchool.commune) {
            document.getElementById('print-commune').textContent = latestSchool.commune;
        } else if (latestSchool.schoolCluster) {
            let cluster = latestSchool.schoolCluster.replace(/^កម្រង\s*/, '');
            document.getElementById('print-commune').textContent = cluster;
        } else {
            // Check custom commune saved in localStorage
            let customCommune = '';
            if (typeof window.getKey === 'function') {
                customCommune = localStorage.getItem(window.getKey('contactCommune'));
            } else {
                customCommune = localStorage.getItem('contactCommune');
            }
            if (customCommune) {
                document.getElementById('print-commune').textContent = customCommune;
            }
        }
        if (latestSchool.province) {
            document.getElementById('print-province').textContent = latestSchool.province;
        }
    }
}

function loadTeacherProfile() {
    if (typeof window.getKey !== 'function') return;
    const teacherProfiles = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    if (teacherProfiles.length > 0) {
        const mainTeacher = teacherProfiles[0];
        
        document.getElementById('print-teacher-name').textContent = mainTeacher.name || '.............................';
        document.getElementById('print-teacher-name-sign').textContent = mainTeacher.name || '.............................';
        
        if (mainTeacher.className) {
            let cName = mainTeacher.className.replace(/^ទី\s*/, '');
            document.getElementById('print-grade').textContent = cName;
            document.getElementById('print-grade-2').textContent = cName;
        }
        
        if (mainTeacher.phone) {
            let phoneStr = mainTeacher.phone;
            // Format phone beautifully if possible (e.g. 097 722 722 1)
            phoneStr = phoneStr.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
            document.getElementById('print-phone').textContent = phoneStr;
        }
    }
}

function loadCurrentDate(dateObj) {
    const today = new Date();
    const targetDate = dateObj || today;
    
    if (!dateObj) {
        const dateInput = document.getElementById('notice-date');
        if (dateInput && !dateInput.value) {
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        
        const monthInput = document.getElementById('absent-month');
        if (monthInput && !monthInput.value) {
            monthInput.value = today.getMonth() + 1;
        }
    }
    
    // Lunar Date
    if (typeof window.KhmerCalendar !== 'undefined' && typeof window.KhmerCalendar.toKhmerLunarDate === 'function') {
        const res = window.KhmerCalendar.toKhmerLunarDate(targetDate);
        if (res && res.lunarDateText) {
            let lunarStr = res.lunarDateText.replace('ត្រូវនឹង', '').trim();
            // Try to extract only the parts without the Solar date
            if (lunarStr.includes('ត្រូវនឹង')) {
                lunarStr = lunarStr.split('ត្រូវនឹង')[0].trim();
            } else {
                if (res.khmerLunarDate) lunarStr = res.khmerLunarDate;
            }
            document.getElementById('print-khmer-date').textContent = lunarStr;
        }
    } else {
        document.getElementById('print-khmer-date').textContent = 'ថ្ងៃ..........................ខែ....................ឆ្នាំ..................ស័ក ព.ស. ២៥....';
    }
    
    // Solar Date
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    
    const day = toKhmer(targetDate.getDate());
    const month = khmerMonths[targetDate.getMonth()];
    const year = toKhmer(targetDate.getFullYear());
    
    document.getElementById('print-solar-date').textContent = ` ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
    
    let customLocation = localStorage.getItem('parent_custom_location');
    if (customLocation) {
        document.getElementById('print-location').textContent = customLocation;
    }
}

function saveCustomLocation() {
    const text = document.getElementById('print-location').textContent.trim();
    localStorage.setItem('parent_custom_location', text);
}

function toggleReasonInputs() {
    const reason = document.getElementById('notice-reason').value;
    const absentGroup = document.getElementById('absent-input-group');
    const disciplineGroup = document.getElementById('discipline-input-group');
    
    if (reason === 'absent') {
        absentGroup.style.display = 'flex';
        disciplineGroup.style.display = 'none';
    } else if (reason === 'discipline') {
        absentGroup.style.display = 'none';
        disciplineGroup.style.display = 'flex';
    } else {
        absentGroup.style.display = 'none';
        disciplineGroup.style.display = 'none';
    }
}

function updateNotice() {
    const studentName = document.getElementById('student-name').value.trim();
    const reason = document.getElementById('notice-reason').value;
    const subReason = document.getElementById('discipline-sub-reason').value;
    const absentDays = document.getElementById('absent-days').value.trim();
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    let displayName = studentName || '........................................................';
    let displayGrade = document.getElementById('print-grade').textContent;
    let dynamicHTML = '';
    
    if (reason === 'absent') {
        let displayDays = absentDays ? toKhmer(absentDays) : '......';
        dynamicHTML = `
            <div class="text-green moul-font" style="text-align: center; margin: 15px 0;">សូមជម្រាបមក</div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>លោក លោកស្រីដែលជាអាណាព្យាបាលរបស់សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> ជាសិស្ស <span class="text-blue">ថ្នាក់ទី<span>${displayGrade}</span></span> បានជ្រាបថា ៖សិស្សមានឈ្មោះខាងលើនេះបានឈប់មិនឃើញមករៀនចំនួន </span><span class="text-blue-normal"> ${displayDays} </span><span> ថ្ងៃ មកហើយ ដោយខាងសាលាមិនបានដឹងមូលហេតុ ។</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>អាស្រ័យហេតុនេះ សូមលោក លោកស្រីជ្រាបជាព័ត៌មាន នឹងមេត្តាជួយផ្ដល់ដំណឹងតាមរយះសៀវភៅនេះ ដល់ ខ្ញុំបាទ/នាងខ្ញុំ ដោយក្តីអនុគ្រោះ ។</span>
        `;
    } else if (reason === 'slow') {
        dynamicHTML = `
            <div class="text-green moul-font" style="text-align: center; margin: 15px 0;">សូមគោរពមាតាបិតា/អ្នកអាណាព្យាបាល!</div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>សម្រាប់ខែនេះ សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> មានការយឺតយ៉ាវបន្តិចក្នុងការចាប់យកមេរៀនជារួម។ សូមលោកមាតាបិតាជួយជំរុញ និងរំលឹកគាត់ឱ្យមើលមេរៀនឡើងវិញនៅផ្ទះបន្ថែមទៀត ដើម្បីឱ្យគាត់អាចតាមទាន់មិត្តភក្ដិក្នុងថ្នាក់។</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>អាស្រ័យហេតុនេះ សូមលោក លោកស្រីជ្រាបជាព័ត៌មាន និងមេត្តាជួយផ្ដល់ដំណឹងតាមរយះសៀវភៅនេះ ដល់ ខ្ញុំបាទ/នាងខ្ញុំ ដោយក្តីអនុគ្រោះ ។</span>
        `;
    } else if (reason === 'outstanding') {
        dynamicHTML = `
            <div class="text-green moul-font" style="text-align: center; margin: 15px 0;">សូមគោរពមាតាបិតា/អ្នកអាណាព្យាបាល!</div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>សម្រាប់ខែនេះ សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> ទទួលបានលទ្ធផលសិក្សាល្អប្រសើរខ្លាំងណាស់។ គាត់ជាសិស្សឧស្សាហ៍ព្យាយាម ស្តាប់ដំបូន្មាន និងតែងតែបំពេញកិច្ចការបានល្អ។ លោកគ្រូ/នាងខ្ញុំសូមកោតសរសើរ និងសូមអរគុណដល់មាតាបិតាដែលតែងតែជួយអប់រំគាត់នៅផ្ទះ។</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>អាស្រ័យហេតុនេះ សូមលោក លោកស្រីជ្រាបជាព័ត៌មាន និងមេត្តាបន្តលើកទឹកចិត្តគាត់បន្ថែមទៀត។ សូមអរគុណ!</span>
        `;
    } else if (reason === 'discipline') {
        let textContent = "";
        
        if (subReason === 'health1') {
            textContent = `<span>មួយរយៈនេះ លោកគ្រូ/នាងខ្ញុំសង្កេតឃើញសិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> ហាក់មានអាការៈអស់កម្លាំង និងមានបញ្ហាសុខភាពនៅក្នុងម៉ោងរៀន។ សូមលោកប៉ាអ្នកម៉ាក់ជួយតាមដានសុខភាព និងការសម្រាករបស់គាត់បន្ថែម ដើម្បីឱ្យគាត់មានសុខភាពល្អ និងអាចរៀនសូត្របានពេញលេញ។</span>`;
        } else if (subReason === 'health2') {
            textContent = `<span>ថ្ងៃនេះ សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> មានអាការៈមិនសូវស្រួលខ្លួនទាល់តែសោះ។ ប្រសិនបើគាត់មានបញ្ហាសុខភាព ឬជំងឺប្រចាំកាយអ្វីមួយដែលសាលាគួរដឹង សូមមាតាបិតាមេត្តាជម្រាបមកលោកគ្រូ/នាងខ្ញុំ ដើម្បីងាយស្រួលក្នុងការយកចិត្តទុកដាក់ និងជួយមើលថែគាត់ពេលនៅសាលា។</span>`;
        } else if (subReason === 'discipline1') {
            textContent = `<span>សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> ជាសិស្សឆ្លាត ប៉ុន្តែថ្មីៗនេះគាត់ហាក់លេងច្រើនបន្តិច និងមិនសូវប្រមូលអារម្មណ៍ក្នុងការសិក្សានោះទេ។ សូមមាតាបិតាជួយអប់រំ និងរំលឹកគាត់បន្ថែមពីវិន័យក្នុងការសិក្សា ដើម្បីឱ្យគាត់កែប្រែទម្លាប់នេះ និងទទួលបានលទ្ធផលល្អឡើងវិញ។</span>`;
        } else if (subReason === 'discipline2') {
            textContent = `<span>ក្នុងខែនេះ សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> មិនសូវបានអនុវត្តតាមវិន័យថ្នាក់ និងតែងតែភ្លេចធ្វើកិច្ចការផ្ទះ។ សូមមាតាបិតាជួយចំណាយពេលពិនិត្យមើលសៀវភៅកិច្ចការរបស់គាត់ និងជួយជំរុញគាត់បន្ថែមនៅផ្ទះផង។ សូមអរគុណ!</span>`;
        } else if (subReason === 'moral1') {
            textContent = `<span>លោកគ្រូ/នាងខ្ញុំសង្កេតឃើញថា សិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> មានការប្រើប្រាស់ពាក្យសម្ដី និងអាកប្បកិរិយាមិនសូវសមរម្យជាមួយមិត្តភក្តិក្នុងថ្នាក់។ ដើម្បីការលូតលាស់ផ្លូវចិត្ត និងអត្តចរិតល្អរបស់គាត់ សូមលោកប៉ាអ្នកម៉ាក់ជួយណែនាំ និងអប់រំទូន្មានគាត់បន្ថែមពីសីលធម៌ក្នុងការរស់នៅ។</span>`;
        } else if (subReason === 'moral2') {
            textContent = `<span>ដោយសារសិស្សឈ្មោះ </span><span class="text-blue-normal">${displayName}</span><span> មានបញ្ហាមួយចំនួនពាក់ព័ន្ធនឹងអាកប្បកិរិយា និងសីលធម៌ទាក់ទងជាមួយវិន័យសាលា លោកគ្រូ/នាងខ្ញុំសូមគោរពអញ្ជើញមាតាបិតាមកជួបពិភាក្សានៅសាលានៅថ្ងៃទី <span class="text-blue-normal" style="min-width: 150px;">...................</span> ដើម្បីរួមគ្នាស្វែងរកដំណោះស្រាយ និងជួយកែតម្រូវគាត់ឱ្យបានទាន់ពេលវេលា។</span>`;
        }

        dynamicHTML = `
            <div class="text-green moul-font" style="text-align: center; margin: 15px 0;">សូមគោរពមាតាបិតា/អ្នកអាណាព្យាបាល!</div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${textContent}
        `;
    }
    
    document.getElementById('dynamic-reason-content').innerHTML = dynamicHTML;
    
    // Update the date at the bottom based on the selected date
    const dateInput = document.getElementById('notice-date');
    if (dateInput && dateInput.value) {
        loadCurrentDate(new Date(dateInput.value));
    }
    
    // Provide visual feedback
    const btn = document.querySelector('button[onclick="updateNotice()"]');
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'បានបញ្ចូល ✓';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    }
}

function loadStudents() {
    if (typeof window.getKey !== 'function') return;
    const studentProfiles = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];
    const select = document.getElementById('student-name');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Sort students by name
    studentProfiles.sort((a, b) => a.name.localeCompare(b.name, 'km'));
    
    studentProfiles.forEach(student => {
        const option = document.createElement('option');
        option.value = student.name;
        option.textContent = student.name;
        option.setAttribute('data-id', student.id);
        select.appendChild(option);
    });
}

function calculateAbsences() {
    const select = document.getElementById('student-name');
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption || !selectedOption.value) return;
    
    const studentId = selectedOption.getAttribute('data-id');
    if (!studentId) return;

    const monthSelect = document.getElementById('absent-month');
    let month = monthSelect ? parseInt(monthSelect.value) : new Date().getMonth() + 1;
    
    let year = new Date().getFullYear();
    const dateInput = document.getElementById('notice-date');
    if (dateInput && dateInput.value) {
        year = new Date(dateInput.value).getFullYear();
    }
    
    const storageKey = window.getKey(`attendance_${year}_${month}`);
    const attendanceData = JSON.parse(localStorage.getItem(storageKey)) || {};
    
    const studentAttendance = attendanceData[studentId] || {};
    let absentCount = 0;
    
    for (let day in studentAttendance) {
        if (studentAttendance[day] === 'អ' || studentAttendance[day] === 'A') absentCount++;
    }
    
    const absentInput = document.getElementById('absent-days');
    if (absentInput) absentInput.value = absentCount;
}

// Logo Management
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            // Update image source
            const img = document.getElementById('moeys-logo-img');
            if (img) {
                img.src = dataUrl;
                img.style.border = 'none';
            }
            // Save to localStorage so it persists
            if (typeof window.getKey === 'function') {
                localStorage.setItem(window.getKey('customSchoolLogo'), dataUrl);
            } else {
                localStorage.setItem('customSchoolLogo', dataUrl);
            }
        };
        reader.readAsDataURL(file);
    }
}

function loadLogo() {
    let savedLogo = null;
    if (typeof window.getKey === 'function') {
        savedLogo = localStorage.getItem(window.getKey('customSchoolLogo'));
    } else {
        savedLogo = localStorage.getItem('customSchoolLogo');
    }
    
    if (savedLogo) {
        const img = document.getElementById('moeys-logo-img');
        if (img) {
            img.src = savedLogo;
            img.style.border = 'none';
        }
    }
}
