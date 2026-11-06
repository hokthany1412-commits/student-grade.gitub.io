const fs = require('fs');
const htmlFiles = ['index.html', 'student-profile.html', 'grades.html', 'ranking.html', 'honor-roll.html', 'teacher.html', 'summary-report.html'];

htmlFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('classManager.js')) {
        content = content.replace('</body>', '<script src="classManager.js"></script>\n    <script>\n        if (window.classManager && document.getElementById("global-class-selector")) {\n            window.classManager.renderClassSelector("global-class-selector");\n        }\n    </script>\n</body>');
        
        if (f === 'index.html') {
             content = content.replace('<div class="nav-actions">', '<div class="nav-actions">\n                <div id="global-class-selector" style="margin-right: 15px;"></div>');
        } else {
             content = content.replace('<div class="logo-area">', '<div class="logo-area">\n                <div id="global-class-selector" style="margin-right: 15px;"></div>');
        }
        
        fs.writeFileSync(f, content);
    }
});
console.log('HTML files updated.');
