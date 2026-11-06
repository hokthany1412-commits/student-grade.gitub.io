// student-record-book.js
const STORAGE_KEY = 'studentProfilesData';
let students = JSON.parse(localStorage.getItem(window.getKey(STORAGE_KEY))) || [];

function formatDate(dateStr) {
    if (!dateStr) return '....................';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function formatNumber(num) {
    if (isNaN(num) || num === null || num === '') return '';
    return Number(Math.round(parseFloat(num) + 'e2') + 'e-2').toFixed(2);
}

// Load semester exam data and calculate rankings
function loadSemesterData(semNum) {
    const storageKey = semNum === 2 ? 'semester2ExamGrades' : 'semester1ExamGrades';
    const savedGrades = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];
    
    if (savedGrades.length === 0) return {};

    const examFields = [
        's_kh1', 's_kh2', 's_kh3', 's_kh4',
        's_ma', 's_sc', 's_so1', 's_es', 's_so2',
        's_ls', 's_pe', 's_art', 's_en'
    ];

    // Map exam fields to record book subjects
    // Record book subjects → exam fields mapping
    const subjectMap = {
        'សុខភាពធម៌ និងពលរដ្ឋ': 's_so1',
        'រឿងអាន និង មេសូត្រ': ['s_kh1', 's_kh3'],  // average of kh reading fields
        'គណិតវិទ្យា': 's_ma',
        'អក្សរផ្ចង់': 's_kh2',
        'គំនូរ និង ហត្ថកម្ម': 's_art',
        'សរសេរតាមអាន និង សំណួរ': 's_kh4',
        'តែងសេចក្តី': 's_es',
        'វិទ្យាសាស្ត្រអនុវត្ត': 's_sc',
        'ភូមិវិទ្យា': 's_so2',
        'ប្រវត្តិវិទ្យា': 's_ls',
        'អប់រំកាយ និង កីឡា': 's_pe',
        'ភាសាបរទេស': 's_en'
    };

    // Calculate monthly averages for each student
    const months = semNum === 2
        ? ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា']
        : ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];

    function calcMonthlyAvg(studentId) {
        let totalMonthlyAvg = 0;
        let monthsCount = 0;
        months.forEach(month => {
            const key = window.getKey(`studentGrades_${month}`);
            const monthlyData = JSON.parse(localStorage.getItem(key)) || [];
            const rec = monthlyData.find(s => String(s.id).trim() === String(studentId).trim());
            if (rec && rec.grades) {
                let sum = 0, count = 0;
                for (const k in rec.grades) {
                    const v = rec.grades[k];
                    if (v !== '' && v !== null && String(v).trim() !== '' && !isNaN(v)) {
                        sum += parseFloat(v);
                        count++;
                    }
                }
                if (count > 0) {
                    totalMonthlyAvg += parseFloat(formatNumber(sum / count));
                    monthsCount++;
                }
            }
        });
        return monthsCount > 0 ? totalMonthlyAvg / monthsCount : 0;
    }

    // Find max exam field count for consistent divisor
    let globalMaxCount = 0;
    savedGrades.forEach(s => {
        let count = 0;
        examFields.forEach(key => {
            const val = s.grades ? s.grades[key] : undefined;
            if (val !== '' && val !== null && val !== undefined && !isNaN(val)) count++;
        });
        if (count > globalMaxCount) globalMaxCount = count;
    });
    const divisor = globalMaxCount > 0 ? globalMaxCount : 1;

    // Calculate exam_avg, monthly_avg, sem_avg for each student
    let processedStudents = savedGrades.map(s => {
        let total = 0;
        if (s.grades) {
            examFields.forEach(key => {
                const val = s.grades[key];
                if (val !== '' && val !== null && val !== undefined && !isNaN(val)) {
                    total += parseFloat(val);
                }
            });
        }
        const exam_avg = total / divisor > 0 ? total / divisor : (s.exam_avg ? parseFloat(s.exam_avg) : 0);
        const calc_monthly = calcMonthlyAvg(s.id);
        const monthly_avg = calc_monthly > 0 ? calc_monthly : (s.monthly_avg ? parseFloat(s.monthly_avg) : 0);
        let sem_avg = 0;
        if (exam_avg > 0 && monthly_avg > 0) {
            sem_avg = (exam_avg + monthly_avg) / 2;
        } else if (exam_avg > 0) {
            sem_avg = exam_avg;
        } else if (monthly_avg > 0) {
            sem_avg = monthly_avg;
        }
        // Fallback to legacy pre-calculated sem_avg if both calculations fail
        if (sem_avg === 0 && s.sem_avg > 0) {
            sem_avg = parseFloat(s.sem_avg);
        }
        return { ...s, exam_avg, monthly_avg, sem_avg };
    });

    // Calculate rankings
    const sorted = [...processedStudents]
        .filter(s => s.sem_avg > 0)
        .sort((a, b) => b.sem_avg - a.sem_avg);
    let currentRank = 1;
    let previousAvg = null;
    sorted.forEach((student, index) => {
        if (student.sem_avg === previousAvg) {
            // same rank (tie)
        } else {
            currentRank = index + 1;
        }
        student.rank = currentRank;
        previousAvg = student.sem_avg;
    });

    // Build result map by student ID
    const result = {};
    processedStudents.forEach(s => {
        // Get individual subject scores from grades
        const subjectScores = {};
        for (const [subjectLabel, mapping] of Object.entries(subjectMap)) {
            if (Array.isArray(mapping)) {
                // Average of multiple fields
                const vals = mapping.map(k => s.grades ? parseFloat(s.grades[k]) : NaN).filter(n => !isNaN(n));
                subjectScores[subjectLabel] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            } else {
                const val = s.grades ? s.grades[mapping] : undefined;
                subjectScores[subjectLabel] = (val !== '' && val !== null && val !== undefined && !isNaN(val)) ? parseFloat(val) : null;
            }
        }

        const sortedEntry = sorted.find(x => x.id === s.id);
        result[s.id] = {
            subjectScores,
            exam_avg: s.exam_avg,
            monthly_avg: s.monthly_avg,
            sem_avg: s.sem_avg,
            rank: sortedEntry ? sortedEntry.rank : 0,
            totalStudents: sorted.length
        };
    });

    return result;
}

// Load semester attendance data
function loadSemesterAttendance(semNum) {
    const months = semNum === 2
        ? [4, 5, 6, 7, 8, 9]   // April to September
        : [10, 11, 12, 1, 2, 3]; // October to March

    const result = {};

    // Try multiple years
    const currentYear = new Date().getFullYear();
    const yearsToTry = [currentYear, currentYear - 1, currentYear + 1];

    students.forEach(student => {
        let totalP = 0, totalA = 0;
        months.forEach(monthNum => {
            for (const year of yearsToTry) {
                const scopedKey = window.getKey(`attendance_${year}_${monthNum}`);
                const legacyKey = `attendance_${year}_${monthNum}`;
                let data = JSON.parse(localStorage.getItem(scopedKey)) || JSON.parse(localStorage.getItem(legacyKey));
                if (data && data[student.id]) {
                    const sAttendance = data[student.id];
                    for (let day in sAttendance) {
                        if (day === 'holidays') continue;
                        const status = sAttendance[day];
                        if (status === 'ច' || status === 'P' || status === 'p' || status === 'C' || status === 'c' || status === 'ច្បាប់') totalP++;
                        else if (status === 'អ' || status === 'A' || status === 'a' || status === 'ឥតច្បាប់') totalA++;
                    }
                    break; // Found data for this month, stop trying other years
                }
            }
        });
        result[student.id] = { absP: totalP, absA: totalA };
    });

    return result;
}

function renderRecordBook() {
    const container = document.getElementById('book-container');
    const select = document.getElementById('student-select');
    const selectedId = select.value;
    const schoolYear = document.getElementById('school-year-input').value || '2025~2026';
    
    // Load school info
    const schoolRecords = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || [];
    const latestSchool = schoolRecords.length > 0 ? schoolRecords[schoolRecords.length - 1] : {};
    const customSchool = localStorage.getItem('attendance_custom_school') || latestSchool.schoolName || '';
    const customDistrict = localStorage.getItem('attendance_custom_district') || latestSchool.districtOffice || '';
    const customProvince = localStorage.getItem('attendance_custom_province') || '';
    
    let html = '';
    const studentsToRender = selectedId === 'all' ? students : students.filter(s => s.id === selectedId);
    
    if (studentsToRender.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">មិនមានទិន្នន័យសិស្សទេ</div>';
        return;
    }

    // Load semester data once
    const sem1Data = loadSemesterData(1);
    const sem2Data = loadSemesterData(2);
    const sem1Attendance = loadSemesterAttendance(1);
    const sem2Attendance = loadSemesterAttendance(2);

    // Calculate Annual Ranks dynamically
    const annualAvgs = [];
    students.forEach(student => {
        const s1 = sem1Data[student.id];
        const s2 = sem2Data[student.id];
        let avg = null;
        if (s1 && s1.sem_avg > 0 && s2 && s2.sem_avg > 0) avg = (s1.sem_avg + s2.sem_avg) / 2;
        else if (s1 && s1.sem_avg > 0) avg = s1.sem_avg;
        else if (s2 && s2.sem_avg > 0) avg = s2.sem_avg;
        
        if (avg !== null) annualAvgs.push({ id: student.id, avg });
    });
    annualAvgs.sort((a, b) => b.avg - a.avg);
    
    const annualRanks = {};
    let currentRank = 1, currentAvg = -1, tieCount = 0;
    annualAvgs.forEach((s, i) => {
        if (s.avg === currentAvg) {
            annualRanks[s.id] = currentRank;
            tieCount++;
        } else {
            currentRank = currentRank + tieCount;
            if (i === 0) currentRank = 1;
            annualRanks[s.id] = currentRank;
            currentAvg = s.avg;
            tieCount = 1;
        }
    });
    
    studentsToRender.forEach((student) => {
        let pob = '';
        if (student.pobVillage) pob += student.pobVillage + ' ';
        if (student.pobCommune) pob += student.pobCommune + ' ';
        if (student.pobDistrict) pob += student.pobDistrict + ' ';
        if (student.pobProvince) pob += student.pobProvince;
        if (!pob) pob = '.....................................';

        const subjects = [
            'សុខភាពធម៌ និងពលរដ្ឋ',
            'រឿងអាន និង មេសូត្រ',
            'គណិតវិទ្យា',
            'អក្សរផ្ចង់',
            'គំនូរ និង ហត្ថកម្ម',
            'សរសេរតាមអាន និង សំណួរ',
            'តែងសេចក្តី',
            'វិទ្យាសាស្ត្រអនុវត្ត',
            'ភូមិវិទ្យា',
            'ប្រវត្តិវិទ្យា',
            'អប់រំកាយ និង កីឡា',
            'ភាសាបរទេស'
        ];
        
        const summaryRows = [
            'សរុបពិន្ទុ',
            'មធ្យមភាគ',
            'មធ្យមភាគប្រចាំខែ',
            'មធ្យមភាគប្រចាំឆមាស',
            'លទ្ធផលចំណាត់ថ្នាក់'
        ];

        // Get this student's semester data
        const s1 = sem1Data[student.id] || null;
        const s2 = sem2Data[student.id] || null;
        const att1 = sem1Attendance[student.id] || { absP: 0, absA: 0 };
        const att2 = sem2Attendance[student.id] || { absP: 0, absA: 0 };

        const bc = '1px solid #3b82f6';
        const thS = `border:${bc};padding:4px;text-align:center;color:#2563eb;font-weight:bold;`;
        const tdS = `border:${bc};padding:4px;`;

        // Helper to get score for a subject in a semester
        function getSubjectScore(semData, subjectLabel) {
            if (!semData || !semData.subjectScores) return '';
            const val = semData.subjectScores[subjectLabel];
            if (val === null || val === undefined) return '';
            return formatNumber(val);
        }

        // Helper to get rank
        function getRank(semData) {
            if (!semData || !semData.rank) return '';
            return `${semData.rank}/${semData.totalStudents}`;
        }

        // ===== LANDSCAPE PAGE 1 =====
        html += `
        <div class="a4-landscape">
            <!-- PANE 1: Cover -->
            <div class="page-pane" style="justify-content: center; align-items: center; text-align: center; padding: 30px;">
                <div style="color: #2563eb; font-weight: bold; font-size: 14pt; font-family: 'Moul', cursive;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div style="color: #2563eb; font-weight: bold; font-size: 14pt; margin-bottom: 10px; font-family: 'Moul', cursive;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <div style="color: #2563eb; font-size: 16pt; margin-bottom: 40px;">★★★🕮★★★</div>
                <div style="color: #2563eb; font-weight: bold; font-size: 14pt; margin-bottom: 20px; font-family: 'Moul', cursive;">ក្រសួងអប់រំ យុវជន និង កីឡា</div>
                <div style="color: #2563eb; font-weight: bold; font-size: 24pt; margin-bottom: 20px; font-family: 'Moul', cursive;">សៀវភៅសិក្ខាគារិក</div>
                <div style="color: #2563eb; font-weight: bold; font-size: 14pt; margin-bottom: 40px; font-family: 'Moul', cursive;">បឋមសិក្សាចំណេះទូទៅ</div>
                
                <div style="width: 100px; border-bottom: 2px solid #000; margin: 0 auto 30px;"></div>
                <div style="font-size: 12pt; color: #2563eb; font-weight: bold;">ឆ្នាំសិក្សា ${schoolYear}</div>
            </div>

            <!-- PANE 2: Bio & School Years Table -->
            <div class="page-pane" style="padding: 15px;">
                <div style="text-align: left; font-size: 10pt; line-height: 2.2; margin-bottom: 20px;">
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">សាលាបឋមសិក្សា</span><span contenteditable="true" onblur="localStorage.setItem('attendance_custom_school', this.innerText)" style="flex:1;border-bottom:1px dotted #000;text-align:center;font-weight:bold;outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${customSchool}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;">
                        <span style="white-space:nowrap;margin-right:5px;">ឃុំ-សង្កាត់</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${student.currCommune||''}</span>
                        <span style="white-space:nowrap;margin:0 5px;">ស្រុក-ខណ្ឌ</span><span contenteditable="true" onblur="localStorage.setItem('attendance_custom_district', this.innerText)" style="flex:1;border-bottom:1px dotted #000;text-align:center;font-weight:bold;outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${customDistrict || student.currDistrict || ''}</span>
                        <span style="white-space:nowrap;margin:0 5px;">ខេត្ត-ក្រុង</span><span contenteditable="true" onblur="localStorage.setItem('attendance_custom_province', this.innerText)" style="flex:1;border-bottom:1px dotted #000;text-align:center;font-weight:bold;outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${customProvince || student.currProvince || ''}</span>
                    </div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">នាមត្រកូល និង នាមខ្លួន</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;font-weight:bold;font-size:12pt;">${student.name}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">ថ្ងៃ ខែ ឆ្នាំកំណើត</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${formatDate(student.dob)}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">ទីកន្លែងកំណើត</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${pob}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">ឈ្មោះឪពុក</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${student.fatherName||''}</span><span style="white-space:nowrap;margin-left:10px;">មុខរបរ</span><span style="flex:.5;border-bottom:1px dotted #000;text-align:center;">${student.fatherJob||''}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">ឈ្មោះម្តាយ</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${student.motherName||''}</span><span style="white-space:nowrap;margin-left:10px;">មុខរបរ</span><span style="flex:.5;border-bottom:1px dotted #000;text-align:center;">${student.motherJob||''}</span></div>
                    <div style="display:flex;align-items:flex-end;margin-bottom:8px;"><span style="white-space:nowrap;margin-right:10px;">អាសយដ្ឋានបច្ចុប្បន្ន</span><span style="flex:1;border-bottom:1px dotted #000;text-align:center;">${student.currVillage||''} ${student.currCommune||''}</span></div>
                </div>

                <div style="margin-top:auto;width:100%;">
                    <table style="width:100%;border-collapse:collapse;font-size:9pt;text-align:center;table-layout:fixed;">
                        <tr>
                            <th style="${thS}">ឆ្នាំសិក្សា</th>
                            <th style="${thS}">ថ្នាក់</th>
                            <th style="${thS}">គ្រឹះស្ថានសិក្សា</th>
                            <th style="${thS}">ថ្ងៃខែឆ្នាំចូល</th>
                            <th style="${thS}">ថ្ងៃខែឆ្នាំចេញ</th>
                            <th style="${thS}">អត្តលេខ</th>
                        </tr>
                        <tr><td style="${tdS}">${schoolYear}</td><td style="${tdS}"><span contenteditable="true" style="outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${window.classManager ? window.classManager.getActiveClass().name.replace('ថ្នាក់ទី ', '').replace('ថ្នាក់ទី', '').trim() : '5 ក'}</span></td><td style="${tdS}"><span contenteditable="true" style="outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${customSchool.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ)\s*/g, '').trim()}</span></td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}">${student.id}</td></tr>
                        <tr><td style="${tdS}">&nbsp;</td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td></tr>
                        <tr><td style="${tdS}">&nbsp;</td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td><td style="${tdS}"></td></tr>
                    </table>
                    <div style="text-align:center;margin-top:10px;font-size:10pt;">ឆ្នាំសិក្សា ${schoolYear}</div>
                </div>
            </div>
        </div>`;

        // ===== LANDSCAPE PAGE 2: Grades + Evaluation =====
        // Build subject rows with actual data
        let subjectRowsHtml = '';
        let s1Total = 0, s1Count = 0, s2Total = 0, s2Count = 0;
        
        subjects.forEach(s => {
            const score1 = getSubjectScore(s1, s);
            const score2 = getSubjectScore(s2, s);
            if (score1) { s1Total += parseFloat(score1); s1Count++; }
            if (score2) { s2Total += parseFloat(score2); s2Count++; }
            subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">${s}</td><td style="${tdS}padding:1px;text-align:center;">${score1}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${score2}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;
        });

        // Summary rows
        const s1SumDisplay = s1Count > 0 ? formatNumber(s1Total) : '';
        const s2SumDisplay = s2Count > 0 ? formatNumber(s2Total) : '';
        const s1AvgDisplay = s1 && s1.exam_avg > 0 ? formatNumber(s1.exam_avg) : '';
        const s2AvgDisplay = s2 && s2.exam_avg > 0 ? formatNumber(s2.exam_avg) : '';
        const s1MonthlyDisplay = s1 && s1.monthly_avg > 0 ? formatNumber(s1.monthly_avg) : '';
        const s2MonthlyDisplay = s2 && s2.monthly_avg > 0 ? formatNumber(s2.monthly_avg) : '';
        const s1SemDisplay = s1 && s1.sem_avg > 0 ? formatNumber(s1.sem_avg) : '';
        const s2SemDisplay = s2 && s2.sem_avg > 0 ? formatNumber(s2.sem_avg) : '';
        const s1RankDisplay = s1 && s1.rank > 0 ? getRank(s1) : '';
        const s2RankDisplay = s2 && s2.rank > 0 ? getRank(s2) : '';

        subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">សរុបពិន្ទុ</td><td style="${tdS}padding:1px;text-align:center;">${s1SumDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${s2SumDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;
        subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">មធ្យមភាគ</td><td style="${tdS}padding:1px;text-align:center;">${s1AvgDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${s2AvgDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;
        subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">មធ្យមភាគប្រចាំខែ</td><td style="${tdS}padding:1px;text-align:center;">${s1MonthlyDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${s2MonthlyDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;
        subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">មធ្យមភាគប្រចាំឆមាស</td><td style="${tdS}padding:1px;text-align:center;">${s1SemDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${s2SemDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;
        subjectRowsHtml += `<tr><td style="${tdS}text-align:left;color:#2563eb;font-weight:bold;padding:1px 3px;">លទ្ធផលចំណាត់ថ្នាក់</td><td style="${tdS}padding:1px;text-align:center;">${s1RankDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td><td style="${tdS}padding:1px;text-align:center;">${s2RankDisplay}</td><td style="${tdS}padding:1px;text-align:center;"></td></tr>`;

        html += `
        <div class="a4-landscape">
            <!-- PANE 3: Grades Table -->
            <div class="page-pane" style="padding:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:9pt;font-weight:bold;color:#2563eb;">
                    <div>នាមត្រកូល និង នាមខ្លួន <span style="color:#000;border-bottom:1px dotted #000;padding:0 5px;">${student.name}</span></div>
                    <div>ថ្នាក់ទី <span contenteditable="true" style="color:#000;outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${window.classManager ? window.classManager.getActiveClass().name.replace('ថ្នាក់ទី ', '').replace('ថ្នាក់ទី', '').trim() : '5 ក'}</span> ចំនួនសិស្ស <span style="color:#000;">${students.length}</span> នាក់</div>
                </div>
                
                <table style="width:100%;border-collapse:collapse;font-size:8pt;table-layout:fixed;flex:1;">
                    <colgroup>
                        <col style="width:36%;"><col style="width:16%;"><col style="width:16%;"><col style="width:16%;"><col style="width:16%;">
                    </colgroup>
                    <tr><th colspan="5" style="${thS}font-size:8.5pt;padding:2px;">ក. លទ្ធផលនៃការប្រឡងប្រចាំឆមាស</th></tr>
                    <tr>
                        <th rowspan="2" style="${thS}padding:2px;">មុខវិជ្ជា</th>
                        <th colspan="2" style="${thS}padding:2px;">ឆមាសទី ១</th>
                        <th colspan="2" style="${thS}padding:2px;">ឆមាសទី ២</th>
                    </tr>
                    <tr>
                        <th style="${thS}font-size:7.5pt;padding:2px;">ពិន្ទុ</th>
                        <th style="${thS}font-size:7.5pt;padding:2px;">ចំណាត់ថ្នាក់</th>
                        <th style="${thS}font-size:7.5pt;padding:2px;">ពិន្ទុ</th>
                        <th style="${thS}font-size:7.5pt;padding:2px;">ចំណាត់ថ្នាក់</th>
                    </tr>
                    ${subjectRowsHtml}
                    <tr><th colspan="5" style="${thS}font-size:8.5pt;padding:2px;">ខ. ចំនួនពេលអវត្តមាន</th></tr>
                    <tr>
                        <th colspan="2" style="${thS}font-size:7.5pt;padding:2px;">ឆមាសទី ១</th>
                        <th colspan="2" style="${thS}font-size:7.5pt;padding:2px;">ឆមាសទី ២</th>
                        <th rowspan="2" style="${thS}font-size:7.5pt;padding:2px;">សរុប</th>
                    </tr>
                    <tr>
                        <th style="${thS}font-size:7pt;padding:2px;">មានច្បាប់</th>
                        <th style="${thS}font-size:7pt;padding:2px;">គ្មានច្បាប់</th>
                        <th style="${thS}font-size:7pt;padding:2px;">មានច្បាប់</th>
                        <th style="${thS}font-size:7pt;padding:2px;">គ្មានច្បាប់</th>
                    </tr>
                    <tr>
                        <td style="${tdS}height:15px;padding:1px;text-align:center;">${att1.absP || ''}</td>
                        <td style="${tdS}padding:1px;text-align:center;">${att1.absA || ''}</td>
                        <td style="${tdS}padding:1px;text-align:center;">${att2.absP || ''}</td>
                        <td style="${tdS}padding:1px;text-align:center;">${att2.absA || ''}</td>
                        <td style="${tdS}padding:1px;text-align:center;">${(att1.absP + att1.absA + att2.absP + att2.absA) || ''}</td>
                    </tr>
                </table>
            </div>

            <!-- PANE 4: Evaluation -->
            <div class="page-pane" style="padding:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:9pt;font-weight:bold;color:#2563eb;">
                    <div>សាលា <span contenteditable="true" onblur="localStorage.setItem('attendance_custom_school', this.innerText)" style="border-bottom:1px dotted #000;padding:0 15px;outline:none;cursor:text;" title="ចុចទីនេះដើម្បីកែប្រែ">${customSchool || '.....................'}</span></div>
                    <div>ឆ្នាំសិក្សា <span style="color:#000;">${schoolYear}</span></div>
                </div>
                
                <table style="width:100%;border-collapse:collapse;font-size:9pt;flex:1;">
                    <tr><th colspan="3" style="${thS}padding:3px;">គ. វាយតម្លៃសិស្សលើការសិក្សា</th></tr>
                    <tr>
                        <th style="${thS}width:33%;padding:3px;">ឆមាសទី ១</th>
                        <th style="${thS}width:33%;padding:3px;">ឆមាសទី ២</th>
                        <th style="${thS}width:34%;padding:3px;">ប្រចាំឆ្នាំ</th>
                    </tr>
                    <tr>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">មធ្យមភាគឆមាស</td>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">មធ្យមភាគឆមាស</td>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">មធ្យមភាគប្រចាំឆ្នាំ</td>
                    </tr>
                    <tr>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${s1SemDisplay}</td>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${s2SemDisplay}</td>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${(s1 && s1.sem_avg > 0 && s2 && s2.sem_avg > 0) ? formatNumber((s1.sem_avg + s2.sem_avg) / 2) : (s1SemDisplay || s2SemDisplay)}</td>
                    </tr>
                    <tr>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">ចំណាត់ថ្នាក់</td>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">ចំណាត់ថ្នាក់</td>
                        <td style="${tdS}text-align:center;font-weight:bold;color:#2563eb;padding:3px;">ចំណាត់ថ្នាក់</td>
                    </tr>
                    <tr>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${s1RankDisplay}</td>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${s2RankDisplay}</td>
                        <td style="${tdS}text-align:center;font-size:11pt;font-weight:bold;padding:5px;">${annualRanks[student.id] ? `${annualRanks[student.id]}/${students.length}` : ''}</td>
                    </tr>
                    <tr><th colspan="3" style="${thS}padding:3px;">ឃ. លទ្ធផលប្រចាំឆ្នាំ</th></tr>
                    <tr>
                        <td colspan="3" style="${tdS}padding:8px;line-height:1.6;color:#2563eb;font-weight:bold;text-align:left;">
                            <div>ត្រូវបានឡើងថ្នាក់ទី............................................................</div>
                            <div>ត្រូវបានប្រឡងឡើងថ្នាក់ : មុខវិជ្ជាដែលត្រូវប្រឡង.......................</div>
                            <div>ត្រូវបានត្រួតថ្នាក់ទី......................ត្រូវរៀនត្រួតថ្នាក់ទី....................</div>
                        </td>
                    </tr>
                    <tr><th colspan="3" style="${thS}padding:3px;">ង org ការសរសើរ និង កំណត់សម្គាល់</th></tr>
                    <tr>
                        <td colspan="3" style="${tdS}padding:8px;">
                            <div style="display:flex;"><div style="width:50%;text-align:center;font-weight:bold;color:#2563eb;">ការសរសើរ</div><div style="width:50%;text-align:center;font-weight:bold;color:#2563eb;">កំណត់សម្គាល់</div></div>
                            <div style="height:35px;"></div>
                            <div style="text-align:center;margin-top:10px;">
                                <div style="color:#2563eb;font-weight:bold;font-size:9pt;">ថ្ងៃទី........ខែ........ឆ្នាំ២០........</div>
                                <div style="font-weight:bold;color:#2563eb;">គ្រូប្រចាំថ្នាក់</div>
                            </div>
                            <div style="height:20px;"></div>
                        </td>
                    </tr>
                    <tr><th colspan="3" style="${thS}padding:3px;">ច. មតិយោបល់របស់នាយកសាលា</th></tr>
                    <tr>
                        <td colspan="3" style="${tdS}padding:8px;">
                            <div style="height:25px;"></div>
                            <div style="text-align:center;margin-top:10px;">
                                <div style="color:#2563eb;font-weight:bold;font-size:9pt;">ថ្ងៃទី........ខែ........ឆ្នាំ២០........</div>
                                <div style="font-weight:bold;color:#2563eb;">នាយកសាលា</div>
                            </div>
                            <div style="height:20px;"></div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('student-select');
    
    students.sort((a, b) => {
        let numA = parseInt(a.id, 10);
        let numB = parseInt(b.id, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.id.localeCompare(b.id);
    });
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.id} - ${student.name}`;
        select.appendChild(option);
    });
    
    renderRecordBook();
});
