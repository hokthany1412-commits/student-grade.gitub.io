const bgThemes = {
    'default': {
        color: '#f8fafc',
        image: 'radial-gradient(at 40% 20%, hsla(210, 100%, 95%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 90%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 95%, 1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340, 100%, 96%, 1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22, 100%, 92%, 1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242, 100%, 95%, 1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343, 100%, 96%, 1) 0px, transparent 50%)'
    },
    'ocean': {
        color: '#f0f9ff',
        image: 'radial-gradient(at 40% 20%, hsla(198, 100%, 90%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(212, 100%, 92%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(180, 100%, 94%, 1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(225, 100%, 95%, 1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(190, 100%, 92%, 1) 0px, transparent 50%)'
    },
    'sunset': {
        color: '#fff7ed',
        image: 'radial-gradient(at 40% 20%, hsla(28, 100%, 90%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(349, 100%, 92%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(45, 100%, 90%, 1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(320, 100%, 95%, 1) 0px, transparent 50%)'
    },
    'nature': {
        color: '#f0fdf4',
        image: 'radial-gradient(at 40% 20%, hsla(142, 70%, 90%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(100, 70%, 92%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(160, 70%, 94%, 1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(60, 70%, 90%, 1) 0px, transparent 50%)'
    }
};

window.bgThemes = bgThemes;

// Load saved theme on load
function loadSettings() {
    const navColor = localStorage.getItem('theme_navbar');
    const bgThemeName = localStorage.getItem('theme_bg_name') || 'default';
    const customBgColor = localStorage.getItem('theme_bg_custom_color');
    
    if (navColor) {
        document.documentElement.style.setProperty('--navbar-bg', navColor);
    }
    
    if (bgThemeName === 'custom' && customBgColor) {
        document.documentElement.style.setProperty('--bg-main-color', customBgColor);
        document.documentElement.style.setProperty('--bg-main-image', 'none');
    } else {
        const theme = bgThemes[bgThemeName] || bgThemes['default'];
        document.documentElement.style.setProperty('--bg-main-color', theme.color);
        document.documentElement.style.setProperty('--bg-main-image', theme.image);
    }
}

// Initialize theme immediately before page renders
loadSettings();
