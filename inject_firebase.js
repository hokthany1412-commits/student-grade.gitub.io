const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\User\\.gemini\\antigravity-ide\\scratch\\student-grade-system';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const scriptsToInject = `
    <!-- Firebase Cloud Sync -->
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js"></script>
    <script src="firebase-config.js"></script>
    <script src="db-sync.js"></script>
</head>`;

let count = 0;
files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only inject if it doesn't already have firebase
    if (!content.includes('firebase-config.js')) {
        content = content.replace('</head>', scriptsToInject);
        fs.writeFileSync(filePath, content);
        count++;
        console.log(`Injected into ${f}`);
    }
});

console.log(`Finished injecting into ${count} HTML files.`);
