document.addEventListener('DOMContentLoaded', () => {
    loadHpvMeta();
    
    // Listen for class change events
    window.addEventListener('classChanged', () => {
        loadHpvMeta();
        renderHPVReport();
    });

    // Initial render
    setTimeout(() => {
        renderHPVReport();
    }, 100);
});

function formatKhmerNumber(num) {
    if (num === null || num === undefined) return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, match => khmerDigits[parseInt(match)]);
}

function parseDateStr(dateStr) {
    if (!dateStr) return null;
    dateStr = dateStr.toString().trim();
    if (!dateStr) return null;

    let parts;
    if (dateStr.includes('-')) {
        parts = dateStr.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                return new Date(year, month, day);
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            }
        }
    } else if (dateStr.includes('/')) {
        parts = dateStr.split('/');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY/MM/DD
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                return new Date(year, month, day);
            } else {
                // DD/MM/YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parts[2].length === 4 ? parseInt(parts[2], 10) : parseInt('20' + parts[2], 10);
                return new Date(year, month, day);
            }
        }
    }
    return null;
}

function formatDateKhmer(dateStr) {
    if (!dateStr) return '';
    const dObj = parseDateStr(dateStr);
    if (!dObj || isNaN(dObj.getTime())) return dateStr;
    const day = dObj.getDate();
    const month = dObj.getMonth() + 1;
    const year = dObj.getFullYear();
    const dStr = day < 10 ? '0' + day : day.toString();
    const mStr = month < 10 ? '0' + month : month.toString();
    return `${formatKhmerNumber(dStr)}-${formatKhmerNumber(mStr)}-${formatKhmerNumber(year)}`;
}

function loadHpvMeta() {
    // 1. School Info from schoolRecords
    let schoolRecords = [];
    if (typeof window.getKey === 'function') {
        schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];
    } else {
        schoolRecords = JSON.parse(localStorage.getItem('schoolRecords')) || [];
    }

    let defaultSchool = '';
    let defaultDistrict = '';
    let defaultProvince = '';

    if (schoolRecords.length > 0) {
        const latestSchool = schoolRecords[schoolRecords.length - 1];
        defaultSchool = latestSchool.schoolName || '';
        let dist = latestSchool.districtOffice || '';
        dist = dist.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*ស្រុក\s*/, '');
        dist = dist.replace(/^ការិយាល័យអប់រំយុវជន\s*និងកីឡា\s*/, '');
        dist = dist.replace(/^ស្រុក\s*/, '');
        defaultDistrict = dist;
        defaultProvince = latestSchool.province || '';
    }

    // 2. Class Name
    let defaultClassName = '';
    if (window.classManager) {
        const currentClass = window.classManager.getActiveClass();
        if (currentClass && currentClass.name) {
            defaultClassName = currentClass.name;
        }
    }

    // 3. Teacher Profile
    let defaultTeacherName = '';
    let teacherProfiles = [];
    if (typeof window.getKey === 'function') {
        teacherProfiles = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    } else {
        teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles')) || [];
    }
    if (teacherProfiles.length > 0 && teacherProfiles[0].name) {
        defaultTeacherName = teacherProfiles[0].name;
    }

    // 4. Saved Meta from LocalStorage
    const savedMeta = JSON.parse(localStorage.getItem('hpv_report_meta') || '{}');

    const healthCenterEl = document.getElementById('meta-health-center');
    const districtEl = document.getElementById('meta-district');
    const provinceEl = document.getElementById('meta-province');
    const classEl = document.getElementById('meta-class');
    const schoolEl = document.getElementById('meta-school');
    const reporterEl = document.getElementById('meta-reporter');
    const dateEl = document.getElementById('meta-date');

    if (healthCenterEl) healthCenterEl.value = savedMeta.healthCenter || '';
    if (districtEl) districtEl.value = savedMeta.district || defaultDistrict;
    if (provinceEl) provinceEl.value = savedMeta.province || defaultProvince;
    if (classEl) classEl.value = defaultClassName || savedMeta.className || '';
    if (schoolEl) schoolEl.value = defaultSchool || savedMeta.school || '';
    if (reporterEl) reporterEl.value = savedMeta.reporter || defaultTeacherName;

    if (dateEl && !dateEl.value) {
        const now = new Date();
        const d = formatKhmerNumber(now.getDate());
        const m = formatKhmerNumber(now.getMonth() + 1);
        const y = formatKhmerNumber(now.getFullYear());
        dateEl.value = `${d}/${m}/${y}`;
    }
}

function saveHpvMeta() {
    const meta = {
        healthCenter: document.getElementById('meta-health-center')?.value || '',
        district: document.getElementById('meta-district')?.value || '',
        province: document.getElementById('meta-province')?.value || '',
        className: document.getElementById('meta-class')?.value || '',
        school: document.getElementById('meta-school')?.value || '',
        reporter: document.getElementById('meta-reporter')?.value || '',
        date: document.getElementById('meta-date')?.value || ''
    };
    localStorage.setItem('hpv_report_meta', JSON.stringify(meta));
}

function selectFilterMode(mode) {
    const selectEl = document.getElementById('filter-mode');
    if (selectEl) {
        selectEl.value = mode;
        renderHPVReport();
    }
}

function onFilterSelectChange() {
    renderHPVReport();
}

function updateActiveCardHighlight(currentMode) {
    const cards = [
        { id: 'card-age13-14', mode: 'age13_14' },
        { id: 'card-age9', mode: 'age9' },
        { id: 'card-missed', mode: 'missed' },
        { id: 'card-all-girls', mode: 'all_girls' }
    ];

    cards.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) {
            if (c.mode === currentMode) {
                el.classList.add('active-card');
            } else {
                el.classList.remove('active-card');
            }
        }
    });
}

function renderHPVReport() {
    if (!window.classManager) return;
    
    const studentsData = JSON.parse(localStorage.getItem(window.classManager.getKey('studentProfilesData'))) || [];
    const filterMode = document.getElementById('filter-mode')?.value || 'age13_14';
    const noteDobRangeEl = document.getElementById('note-dob-range');
    const reportTitleEl = document.getElementById('report-main-title');

    updateActiveCardHighlight(filterMode);

    // ----------------------------------------------------
    // Date ranges
    // ----------------------------------------------------
    // Group 1: 13 to 14 years old (Born 13-Aug-2011 to 12-Aug-2013)
    const g13_14Start = new Date(2011, 7, 13, 0, 0, 0, 0); // Aug 13, 2011
    const g13_14End = new Date(2013, 7, 12, 23, 59, 59, 999); // Aug 12, 2013
    
    // Group 2: 9 years old (Born 01-Nov-2016 to 09-Nov-2017)
    const g9Start = new Date(2016, 10, 1, 0, 0, 0, 0);  // Nov 1, 2016
    const g9End = new Date(2017, 10, 9, 23, 59, 59, 999);    // Nov 9, 2017
    
    // Group 3: Missed / 10 to 12 years old (Born 13-Aug-2013 to 31-Oct-2016)
    const gMissedStart = new Date(2013, 7, 13, 0, 0, 0, 0); // Aug 13, 2013
    const gMissedEnd = new Date(2016, 9, 31, 23, 59, 59, 999); // Oct 31, 2016

    const group13_14 = [];
    const group9 = [];
    const groupMissed = [];
    const allGirls = [];

    studentsData.forEach(student => {
        if (!student || !student.id) return;
        
        // Filter female students
        const gender = (student.gender || '').trim();
        if (gender !== 'ស្រី' && gender !== 'ស') return;
        
        allGirls.push(student);
        const dobDate = parseDateStr(student.dob);

        if (dobDate && !isNaN(dobDate.getTime())) {
            if (dobDate >= g13_14Start && dobDate <= g13_14End) {
                group13_14.push(student);
            } else if (dobDate >= g9Start && dobDate <= g9End) {
                group9.push(student);
            } else if (dobDate >= gMissedStart && dobDate <= gMissedEnd) {
                groupMissed.push(student);
            }
        }
    });

    // Sort function
    const sortFn = (a, b) => {
        let aId = parseInt(a.id) || 0;
        let bId = parseInt(b.id) || 0;
        if (aId && bId) return aId - bId;
        return (a.name || '').localeCompare(b.name || '', 'km');
    };

    group13_14.sort(sortFn);
    group9.sort(sortFn);
    groupMissed.sort(sortFn);
    allGirls.sort(sortFn);

    // Update Stat Cards Count
    const stat13_14El = document.getElementById('stat-count-13-14');
    const stat9El = document.getElementById('stat-count-9');
    const statMissedEl = document.getElementById('stat-count-missed');
    const statAllEl = document.getElementById('stat-count-all');

    if (stat13_14El) stat13_14El.innerText = formatKhmerNumber(group13_14.length);
    if (stat9El) stat9El.innerText = formatKhmerNumber(group9.length);
    if (statMissedEl) statMissedEl.innerText = formatKhmerNumber(groupMissed.length);
    if (statAllEl) statAllEl.innerText = formatKhmerNumber(allGirls.length);

    // Determine current title, footer notes, and total count
    let currentTitle = 'បញ្ជីសម្រង់ឈ្មោះកុមារីអាយុ១៣ឆ្នាំ ដល់១៤ឆ្នាំ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
    let totalStudents = 0;

    if (filterMode === 'age13_14') {
        currentTitle = 'បញ្ជីសម្រង់ឈ្មោះកុមារីអាយុ១៣ឆ្នាំ ដល់១៤ឆ្នាំ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
        totalStudents = group13_14.length;
        if (noteDobRangeEl) {
            noteDobRangeEl.innerHTML = 'កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១១ ដល់ ថ្ងៃទី១២ ខែសីហា ឆ្នាំ២០១៣</strong> (ក្រុមអាយុ ១៣ឆ្នាំ ដល់ ១៤ឆ្នាំ)';
        }
    } else if (filterMode === 'age9') {
        currentTitle = 'បញ្ជីសម្រង់ឈ្មោះកុមារីអាយុ៩ឆ្នាំ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
        totalStudents = group9.length;
        if (noteDobRangeEl) {
            noteDobRangeEl.innerHTML = 'កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០១៦ ដល់ ថ្ងៃទី០៩ ខែវិច្ឆិកា ឆ្នាំ២០១៧</strong> (ក្រុមអាយុ ៩ឆ្នាំ)';
        }
    } else if (filterMode === 'missed') {
        currentTitle = 'បញ្ជីសម្រង់ឈ្មោះកុមារីខកខានមិនបានចាក់ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
        totalStudents = groupMissed.length;
        if (noteDobRangeEl) {
            noteDobRangeEl.innerHTML = 'កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១៣ ដល់ ថ្ងៃទី៣១ ខែតុលា ឆ្នាំ២០១៦</strong> (ក្រុមខកខានមិនបានចាក់ អាយុ ១០-១២ឆ្នាំ)';
        }
    } else if (filterMode === 'all_eligible') {
        currentTitle = 'បញ្ជីសម្រង់ឈ្មោះ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
        totalStudents = group13_14.length + group9.length + groupMissed.length;
        if (noteDobRangeEl) {
            noteDobRangeEl.innerHTML = `
                <div style="margin-top: 3px;">
                    <div>• <strong>ក្រុមទី១ (អាយុ ១៣ ដល់ ១៤ឆ្នាំ)៖</strong> កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១១ ដល់ ថ្ងៃទី១២ ខែសីហា ឆ្នាំ២០១៣</strong></div>
                    <div style="margin-top: 2px;">• <strong>ក្រុមទី២ (អាយុ ៩ឆ្នាំ)៖</strong> កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០១៦ ដល់ ថ្ងៃទី០៩ ខែវិច្ឆិកា ឆ្នាំ២០១៧</strong></div>
                    <div style="margin-top: 2px;">• <strong>ក្រុមទី៣ (ខកខាន ១០-១២ឆ្នាំ)៖</strong> កុមារីមានថ្ងៃកំណើត <strong>ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១៣ ដល់ ថ្ងៃទី៣១ ខែតុលា ឆ្នាំ២០១៦</strong></div>
                </div>
            `;
        }
    } else {
        currentTitle = 'បញ្ជីសម្រង់ឈ្មោះកុមារីទាំងអស់ និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
        totalStudents = allGirls.length;
        if (noteDobRangeEl) {
            noteDobRangeEl.innerText = 'កុមារីទាំងអស់ក្នុងបញ្ជីឈ្មោះថ្នាក់រៀន';
        }
    }

    if (reportTitleEl) {
        reportTitleEl.innerText = currentTitle;
    }
    document.title = currentTitle;

    // Update count badge & total
    const countBadge = document.getElementById('student-count-badge');
    if (countBadge) {
        countBadge.innerText = formatKhmerNumber(totalStudents);
    }
    const totalCell = document.getElementById('total-students-cell');
    if (totalCell) {
        totalCell.innerText = `${formatKhmerNumber(totalStudents)} នាក់`;
    }

    const tbody = document.getElementById('hpv-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    function generateStudentRow(student, idx) {
        let parents = '';
        if (student.fatherName && student.motherName) {
            parents = `${student.fatherName} / ${student.motherName}`;
        } else if (student.fatherName || student.motherName) {
            parents = student.fatherName || student.motherName;
        } else {
            parents = student.guardian || student.guardianName || '';
        }

        const phone = student.phone || '';
        const village = student.currVillage || student.currentVillage || student.addressVillage || student.pobVillage || student.pob || '';
        const commune = student.currCommune || student.currentCommune || student.addressCommune || student.pobCommune || '';

        return `
            <tr>
                <td class="center">${formatKhmerNumber(idx + 1)}</td>
                <td class="left" style="font-weight: 500;">${student.name || ''}</td>
                <td class="center">${formatDateKhmer(student.dob)}</td>
                <td class="left">${parents}</td>
                <td class="center">${phone ? formatKhmerNumber(phone) : ''}</td>
                <td class="left">${village}</td>
                <td class="left">${commune}</td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center"></td>
            </tr>
        `;
    }

    if (filterMode === 'all_eligible') {
        // Section 1: 13-14 years old
        tbody.innerHTML += `
            <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="11" style="padding: 7px 10px; text-align: left; background: #fdf2f8; color: #9d174d; font-size: 0.95rem;">
                    <strong>១. ក្រុមអាយុ ១៣ ដល់ ១៤ឆ្នាំ</strong> (កើតពី ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១១ ដល់ ថ្ងៃទី១២ ខែសីហា ឆ្នាំ២០១៣) — ត្រូវផ្តល់វ៉ាក់សាំង HPV
                </td>
            </tr>
        `;
        if (group13_14.length === 0) {
            tbody.innerHTML += `<tr><td colspan="11" class="center" style="color: #64748b; padding: 10px;">មិនមានទិន្នន័យកុមារីក្នុងក្រុមនេះឡើយ</td></tr>`;
        } else {
            group13_14.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
        tbody.innerHTML += `
            <tr style="background: #f8fafc; font-weight: bold;">
                <td colspan="2" class="center" style="color: #db2777; padding: 5px;">សរុបក្រុមអាយុ ១៣-១៤ឆ្នាំ</td>
                <td class="center" style="color: #db2777;">${formatKhmerNumber(group13_14.length)} នាក់</td>
                <td colspan="8"></td>
            </tr>
        `;

        // Section 2: 9 years old
        tbody.innerHTML += `
            <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="11" style="padding: 7px 10px; text-align: left; background: #eff6ff; color: #1e40af; font-size: 0.95rem;">
                    <strong>២. ក្រុមអាយុ ៩ឆ្នាំ</strong> (កើតពី ថ្ងៃទី០១ ខែវិច្ឆិកា ឆ្នាំ២០១៦ ដល់ ថ្ងៃទី០៩ ខែវិច្ឆិកា ឆ្នាំ២០១៧) — ត្រូវផ្តល់វ៉ាក់សាំង HPV
                </td>
            </tr>
        `;
        if (group9.length === 0) {
            tbody.innerHTML += `<tr><td colspan="11" class="center" style="color: #64748b; padding: 10px;">មិនមានទិន្នន័យកុមារីក្នុងក្រុមនេះឡើយ</td></tr>`;
        } else {
            group9.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
        tbody.innerHTML += `
            <tr style="background: #f8fafc; font-weight: bold;">
                <td colspan="2" class="center" style="color: #0369a1; padding: 5px;">សរុបក្រុមអាយុ ៩ឆ្នាំ</td>
                <td class="center" style="color: #0369a1;">${formatKhmerNumber(group9.length)} នាក់</td>
                <td colspan="8"></td>
            </tr>
        `;

        // Section 3: Missed (10-12 years)
        tbody.innerHTML += `
            <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="11" style="padding: 7px 10px; text-align: left; background: #fffbeb; color: #92400e; font-size: 0.95rem;">
                    <strong>៣. ក្រុមអាយុ ១០ ដល់ ១២ឆ្នាំ</strong> (កើតពី ថ្ងៃទី១៣ ខែសីហា ឆ្នាំ២០១៣ ដល់ ថ្ងៃទី៣១ ខែតុលា ឆ្នាំ២០១៦) — ខកខានមិនបានចាក់វ៉ាក់សាំង HPV
                </td>
            </tr>
        `;
        if (groupMissed.length === 0) {
            tbody.innerHTML += `<tr><td colspan="11" class="center" style="color: #64748b; padding: 10px;">មិនមានទិន្នន័យកុមារីក្នុងក្រុមនេះឡើយ</td></tr>`;
        } else {
            groupMissed.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
        tbody.innerHTML += `
            <tr style="background: #f8fafc; font-weight: bold;">
                <td colspan="2" class="center" style="color: #b45309; padding: 5px;">សរុបក្រុមខកខាន ១០-១២ឆ្នាំ</td>
                <td class="center" style="color: #b45309;">${formatKhmerNumber(groupMissed.length)} នាក់</td>
                <td colspan="8"></td>
            </tr>
        `;

    } else if (filterMode === 'age13_14') {
        if (group13_14.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="center" style="color: #64748b; padding: 25px;">មិនមានទិន្នន័យកុមារីអាយុ ១៣ ដល់ ១៤ឆ្នាំឡើយ (កើតពី ១៣-សីហា-២០១១ ដល់ ១២-សីហា-២០១៣)</td></tr>`;
        } else {
            group13_14.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
    } else if (filterMode === 'age9') {
        if (group9.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="center" style="color: #64748b; padding: 25px;">មិនមានទិន្នន័យកុមារីអាយុ ៩ឆ្នាំឡើយ</td></tr>`;
        } else {
            group9.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
    } else if (filterMode === 'missed') {
        if (groupMissed.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="center" style="color: #64748b; padding: 25px;">មិនមានទិន្នន័យកុមារីខកខានមិនបានចាក់ឡើយ (អាយុ ១០-១២ឆ្នាំ)</td></tr>`;
        } else {
            groupMissed.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
    } else {
        if (allGirls.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="center" style="color: #64748b; padding: 25px;">មិនមានទិន្នន័យកុមារីក្នុងថ្នាក់ឡើយ</td></tr>`;
        } else {
            allGirls.forEach((st, idx) => {
                tbody.innerHTML += generateStudentRow(st, idx);
            });
        }
    }
}

function downloadPDF() {
    window.scrollTo(0, 0);
    
    const element = document.getElementById('print-area');
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    
    element.classList.add('pdf-export-mode');
    element.style.width = '1050px'; 
    element.style.maxWidth = '1050px';

    const reportTitleEl = document.getElementById('report-main-title');
    const titleText = reportTitleEl ? reportTitleEl.innerText : 'hpv-vaccination-report';

    const opt = {
        margin:       [8, 8, 8, 8],
        filename:     `${titleText.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('pdf-export-mode');
        element.style.width = originalWidth;
        element.style.maxWidth = originalMaxWidth;
    });
}

function downloadWord() {
    const element = document.getElementById('print-area');
    const reportTitleEl = document.getElementById('report-main-title');
    const title = reportTitleEl ? reportTitleEl.innerText : 'បញ្ជីសម្រង់ឈ្មោះកុមារី និងបញ្ជីផ្តល់វ៉ាក់សាំងការពារមហារីកមាត់ស្បូន (HPV)';
    
    const style = `
        <style>
            @page { size: landscape; margin: 1.5cm; }
            body { font-family: 'Battambang', Arial, sans-serif; font-size: 10pt; }
            .appendix-tag { color: #dc2626; font-weight: bold; font-size: 11pt; margin-bottom: 5px; }
            .report-main-title { font-family: 'Moul', cursive; font-size: 13pt; text-align: center; margin: 10px 0 15px 0; }
            .header-meta-grid { margin-bottom: 12px; font-size: 10pt; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 15px; }
            th, td { border: 1px solid black; padding: 6px 4px; font-size: 9.5pt; }
            th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
            .center { text-align: center; }
            .left { text-align: left; }
            .hpv-footer-info { margin-top: 15px; display: flex; justify-content: space-between; }
        </style>
    `;
    
    // Replace input tags with their values for Word export
    let clonedElement = element.cloneNode(true);
    const inputs = clonedElement.querySelectorAll('input');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || '...................................';
        span.style.borderBottom = '1px dotted black';
        span.style.padding = '0 5px';
        input.parentNode.replaceChild(span, input);
    });

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + title + "</title>" + style + "</head><body>";
    const footer = "</body></html>";
    const html = header + clonedElement.innerHTML + footer;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const filename = `${title.replace(/\s+/g, '_')}.doc`;
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
    }
    
    document.body.removeChild(downloadLink);
}

function downloadExcel() {
    const element = document.getElementById('print-area');
    const reportTitleEl = document.getElementById('report-main-title');
    const title = reportTitleEl ? reportTitleEl.innerText : 'HPV Vaccination Report';
    
    // Replace input tags with their values for Excel export
    let clonedElement = element.cloneNode(true);
    const inputs = clonedElement.querySelectorAll('input');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || ' ';
        input.parentNode.replaceChild(span, input);
    });

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Battambang', sans-serif; font-size: 10pt; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 0.5pt solid black; padding: 5px; }
                th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
                .center { text-align: center; }
                .left { text-align: left; }
            </style>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>HPV Report</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
        </head>
        <body>
            ${clonedElement.innerHTML}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/vnd.ms-excel'
    });
    
    const filename = `${title.replace(/\s+/g, '_')}.xls`;
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
    }
    
    document.body.removeChild(downloadLink);
}
