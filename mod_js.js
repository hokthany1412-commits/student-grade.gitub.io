const fs = require('fs');

const rankingJsContent = `
let currentMode = 'exam'; // 'exam' or 'sem'
const storageKey = 'semester1ExamGrades';
let students = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

// Calculate rankings based on mode
function calculateRanks() {
    // Filter out students without average > 0
    let validStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val > 0;
    });
    
    // Sort descending
    validStudents.sort((a, b) => {
        const valA = currentMode === 'exam' ? a.exam_avg : a.sem_avg;
        const valB = currentMode === 'exam' ? b.exam_avg : b.sem_avg;
        return valB - valA;
    });
    
    let currentRank = 1;
    let previousVal = null;
    let tieCount = 0;
    
    validStudents.forEach((student, index) => {
        const val = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        if (val === previousVal) {
            tieCount++;
        } else {
            currentRank = index + 1;
            tieCount = 0;
        }
        student._tempRank = currentRank;
        previousVal = val;
    });
    
    return validStudents;
}

// Render Table
function renderRanking() {
    document.getElementById('report-title').innerHTML = \`បញ្ជីរាយនាមសិស្សតាមចំណាត់ថ្នាក់ - ប្រចាំឆមាសទី១ <br><span style="font-size: 1.1rem; color: #1e293b;">(ផ្អែកលើ មធ្យមភាគ\${currentMode === 'exam' ? 'ប្រឡង' : 'ប្រចាំ'}ឆមាស)</span>\`;
    
    const tableBody = document.getElementById('ranking-body');
    tableBody.innerHTML = '';
    
    const rankedStudents = calculateRanks();
    
    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }
    
    rankedStudents.forEach((student) => {
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        const tr = document.createElement('tr');
        
        // Highlight top 3
        if (student._tempRank === 1) tr.style.backgroundColor = '#fef08a';
        else if (student._tempRank === 2) tr.style.backgroundColor = '#e2e8f0';
        else if (student._tempRank === 3) tr.style.backgroundColor = '#fed7aa';
        
        tr.innerHTML = \`
            <td style="text-align: center; font-weight: bold;">\${student._tempRank}</td>
            <td style="text-align: center;">\${student.id}</td>
            <td style="text-align: left;">\${student.name}</td>
            <td style="text-align: center;">\${student.gender}</td>
            <td style="text-align: center; font-weight: bold;">\${avg ? avg.toFixed(2) : '0.00'}</td>
            <td style="text-align: center;">\${student.grade || ''}</td>
        \`;
        tableBody.appendChild(tr);
    });
    
    // Update button styles
    const btnExam = document.getElementById('btn-rank-exam');
    const btnSem = document.getElementById('btn-rank-sem');
    if (currentMode === 'exam') {
        btnExam.style.backgroundColor = '#3b82f6';
        btnExam.style.color = 'white';
        btnSem.style.backgroundColor = '#cbd5e1';
        btnSem.style.color = 'black';
    } else {
        btnSem.style.backgroundColor = '#3b82f6';
        btnSem.style.color = 'white';
        btnExam.style.backgroundColor = '#cbd5e1';
        btnExam.style.color = 'black';
    }
}

// Event Listeners
document.getElementById('btn-rank-exam').addEventListener('click', () => {
    currentMode = 'exam';
    renderRanking();
});
document.getElementById('btn-rank-sem').addEventListener('click', () => {
    currentMode = 'sem';
    renderRanking();
});

// Setup metadata
document.addEventListener('DOMContentLoaded', () => {
    const records = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || {};
    const t = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    const teacher = t.length > 0 ? t[0] : null;
    
    document.getElementById('school-name').textContent = records.schoolName || 'សាលាបឋមសិក្សា....';
    document.getElementById('class-name').textContent = records.className || window.classManager.getActiveClass().name;
    document.getElementById('teacher-name').textContent = teacher ? teacher.name : '..................................';
    
    const d = new Date();
    document.getElementById('current-date').textContent = \`ថ្ងៃទី \${d.getDate()} ខែ \${d.getMonth() + 1} ឆ្នាំ \${d.getFullYear()}\`;
    
    renderRanking();
});
`;

fs.writeFileSync('semester-ranking.js', rankingJsContent);

const honorRollJsContent = `
let currentMode = 'exam'; // 'exam' or 'sem'
const storageKey = 'semester1ExamGrades';
let students = JSON.parse(localStorage.getItem(window.getKey(storageKey))) || [];

// Render Honor Roll
function renderHonorRoll() {
    const titleElement = document.querySelector('.certificate-title h2');
    titleElement.innerHTML = \`តារាងកិត្តិយស - ប្រចាំឆមាសទី១ <br><span style="font-size: 1.1rem; color: #1e293b;">(ផ្អែកលើ មធ្យមភាគ\${currentMode === 'exam' ? 'ប្រឡង' : 'ប្រចាំ'}ឆមាស)</span>\`;
    
    // Filter and sort
    let validStudents = students.filter(s => {
        const val = currentMode === 'exam' ? s.exam_avg : s.sem_avg;
        return val > 0;
    });
    
    validStudents.sort((a, b) => {
        const valA = currentMode === 'exam' ? a.exam_avg : a.sem_avg;
        const valB = currentMode === 'exam' ? b.exam_avg : b.sem_avg;
        return valB - valA;
    });
    
    // Calculate ranks
    let currentRank = 1;
    let previousVal = null;
    let tieCount = 0;
    
    validStudents.forEach((student, index) => {
        const val = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        if (val === previousVal) {
            tieCount++;
        } else {
            currentRank = index + 1;
            tieCount = 0;
        }
        student._tempRank = currentRank;
        previousVal = val;
    });
    
    // Get top 5 ranks
    const topStudents = validStudents.filter(s => s._tempRank <= 5);
    const container = document.getElementById('honor-roll-container');
    container.innerHTML = '';
    
    if (topStudents.length === 0) {
        container.innerHTML = '<div style="width: 100%; text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</div>';
        return;
    }
    
    // 1st place in middle (order: 2, 1, 3 for top 3)
    const rank1 = topStudents.filter(s => s._tempRank === 1);
    const rank2 = topStudents.filter(s => s._tempRank === 2);
    const rank3 = topStudents.filter(s => s._tempRank === 3);
    const rank4 = topStudents.filter(s => s._tempRank === 4);
    const rank5 = topStudents.filter(s => s._tempRank === 5);
    
    // Display layout: row 1 (2, 1, 3), row 2 (4, 5)
    let topRowHTML = '';
    let bottomRowHTML = '';
    
    const buildCard = (student, rankNum, color) => {
        if (!student) return '';
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        return \`
            <div class="honor-card \${rankNum === 1 ? 'rank-1' : ''}" style="border: 3px solid \${color};">
                <div class="rank-badge" style="background-color: \${color};">លេខ \${rankNum}</div>
                <div class="student-photo">
                    <img src="\${student.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.name) + '&background=random'}" alt="\${student.name}">
                </div>
                <div class="student-info">
                    <div class="student-name">\${student.name}</div>
                    <div class="student-score">មធ្យមភាគ៖ \${avg ? avg.toFixed(2) : '0.00'}</div>
                </div>
            </div>
        \`;
    };
    
    // Row 1
    rank2.forEach(s => topRowHTML += buildCard(s, 2, '#94a3b8')); // Silver
    rank1.forEach(s => topRowHTML += buildCard(s, 1, '#eab308')); // Gold
    rank3.forEach(s => topRowHTML += buildCard(s, 3, '#cd7f32')); // Bronze
    
    // Row 2
    rank4.forEach(s => bottomRowHTML += buildCard(s, 4, '#3b82f6')); // Blue
    rank5.forEach(s => bottomRowHTML += buildCard(s, 5, '#8b5cf6')); // Purple
    
    if (topRowHTML) container.innerHTML += \`<div class="honor-row">\${topRowHTML}</div>\`;
    if (bottomRowHTML) container.innerHTML += \`<div class="honor-row">\${bottomRowHTML}</div>\`;
    
    // Update button styles
    const btnExam = document.getElementById('btn-hr-exam');
    const btnSem = document.getElementById('btn-hr-sem');
    if (currentMode === 'exam') {
        btnExam.style.backgroundColor = '#eab308';
        btnExam.style.color = 'black';
        btnSem.style.backgroundColor = '#cbd5e1';
        btnSem.style.color = 'black';
    } else {
        btnSem.style.backgroundColor = '#eab308';
        btnSem.style.color = 'black';
        btnExam.style.backgroundColor = '#cbd5e1';
        btnExam.style.color = 'black';
    }
}

// Event Listeners
document.getElementById('btn-hr-exam').addEventListener('click', () => {
    currentMode = 'exam';
    renderHonorRoll();
});
document.getElementById('btn-hr-sem').addEventListener('click', () => {
    currentMode = 'sem';
    renderHonorRoll();
});

document.addEventListener('DOMContentLoaded', () => {
    const records = JSON.parse(localStorage.getItem(window.getKey('schoolRecords'))) || {};
    const t = JSON.parse(localStorage.getItem(window.getKey('teacherProfiles'))) || [];
    const teacher = t.length > 0 ? t[0] : null;
    
    document.getElementById('school-name').textContent = records.schoolName || 'សាលាបឋមសិក្សា....';
    document.getElementById('class-name').textContent = records.className || window.classManager.getActiveClass().name;
    document.getElementById('teacher-name').textContent = teacher ? teacher.name : '..................................';
    
    renderHonorRoll();
});
`;

fs.writeFileSync('semester-honor-roll.js', honorRollJsContent);

console.log('JS files modified');
