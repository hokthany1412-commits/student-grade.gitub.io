const fs = require('fs');
let rjs = fs.readFileSync('semester-ranking.js', 'utf8');

const newRenderRanking = `
// Render Table
function renderRanking() {
    document.getElementById('report-month').innerHTML = \`ចំណាត់ថ្នាក់ប្រចាំឆមាសទី១ <br><span style="font-size: 1.1rem; color: #1e293b;">(ផ្អែកលើ មធ្យមភាគ\${currentMode === 'exam' ? 'ប្រឡង' : 'ប្រចាំ'}ឆមាស)</span>\`;
    
    const tableBody = document.getElementById('ranking-body');
    tableBody.innerHTML = '';
    
    const rankedStudents = calculateRanks();
    
    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }
    
    const halfLength = Math.ceil(rankedStudents.length / 2);
    
    const buildCols = (student) => {
        if (!student) return '<td></td><td></td><td></td><td></td><td></td><td></td>';
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        let bg = '';
        if (student._tempRank === 1) bg = 'background-color: #fef08a;';
        else if (student._tempRank === 2) bg = 'background-color: #e2e8f0;';
        else if (student._tempRank === 3) bg = 'background-color: #fed7aa;';
        
        return \`
            <td style="text-align: center; font-weight: bold; \${bg}">\${student._tempRank}</td>
            <td style="text-align: left; padding-left: 5px; \${bg}">\${student.name}</td>
            <td style="text-align: center; \${bg}">\${student.gender}</td>
            <td style="text-align: center; font-weight: bold; \${bg}">\${avg ? avg.toFixed(2) : '0.00'}</td>
            <td style="text-align: center; \${bg}">\${student._tempRank}</td>
            <td style="text-align: center; \${bg}">\${student.grade || ''}</td>
        \`;
    };
    
    for (let i = 0; i < halfLength; i++) {
        const leftStudent = rankedStudents[i];
        const rightStudent = rankedStudents[i + halfLength];
        
        const tr = document.createElement('tr');
        tr.innerHTML = buildCols(leftStudent) + buildCols(rightStudent);
        tableBody.appendChild(tr);
    }
    
    // Update button styles
    const btnExam = document.getElementById('btn-rank-exam');
    const btnSem = document.getElementById('btn-rank-sem');
    if (btnExam && btnSem) {
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
    
    // Also update statistics!
    const totalStudents = rankedStudents.length;
    const isFemale = (g) => { const x = (g||'').trim(); return x==='ស្រី' || x==='ស' || x.toLowerCase()==='f'; };
    const totalFemale = rankedStudents.filter(s => isFemale(s.gender)).length;
    
    let elTotal = document.getElementById('stat-total');
    if (elTotal) elTotal.textContent = \`សិស្សដើមឆ្នាំសរុប = \${totalStudents} នាក់\`;
    let elTotalF = document.getElementById('stat-total-f');
    if (elTotalF) elTotalF.textContent = \`/ស្រី = \${totalFemale} នាក់\`;
}
`;

rjs = rjs.replace(/\/\/ Render Table[\s\S]*?(?=\/\/ Event Listeners)/, newRenderRanking);

// And fix the "ថ្នាក់ថ្នាក់ទី៥ក" issue.
rjs = rjs.replace(
    "if (classEl) classEl.textContent = `ថ្នាក់${cName} ឆ្នាំសិក្សា ២០២៥-២០២៦`;",
    "if (classEl) classEl.textContent = `${cName.includes('ថ្នាក់') ? cName : 'ថ្នាក់' + cName} ឆ្នាំសិក្សា ២០២៥-២០២៦`;"
);

fs.writeFileSync('semester-ranking.js', rjs);
console.log('Fixed DOM logic for table');
