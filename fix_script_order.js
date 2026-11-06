const fs = require('fs');
const htmlFiles = ['index.html', 'student-profile.html', 'grades.html', 'ranking.html', 'honor-roll.html', 'teacher.html', 'summary-report.html'];

htmlFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Remove the previously injected script tag at the bottom
    content = content.replace('<script src="classManager.js"></script>', '');
    
    // Inject it into the <head> before other scripts
    if (!content.includes('<script src="classManager.js"></script>')) {
        content = content.replace('</head>', '    <script src="classManager.js"></script>\n</head>');
    }
    
    fs.writeFileSync(f, content);
});
console.log('Fixed script loading order.');
