/* =========================================
   STATE & CONFIG
   ========================================= */
const state = {
    darkMode: false,
    currentPage: 'home'
};

/* =========================================
   INIT
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupNavigation();
    loadPage('home.html'); // Initial Load
    setupDockEffect();
});

/* =========================================
   THEME HANDLING
   ========================================= */
function initTheme() {
    const toggle = document.querySelector('.mode-holder');
    const logo = document.querySelector('.logo-img');
    
    toggle.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        document.body.classList.toggle('dark-mode');
        
        // Update Logo
        const logoSrc = state.darkMode ? 'assets/logo_L.png' : 'assets/logo_D.png';
        logo.src = logoSrc;
        
        // Update Toggle Icon
        toggle.querySelector('.mode-icon').textContent = state.darkMode ? '⚪️' : '⚫️';
    });
}

/* =========================================
   NAVIGATION (SPA)
   ========================================= */
function setupNavigation() {
    // Dock Links
    const dockLinks = document.querySelectorAll('.dock-holder span');
    
    dockLinks[0].addEventListener('click', () => navigate('about.html'));
    dockLinks[1].addEventListener('click', () => navigate('framework.html'));
    dockLinks[2].addEventListener('click', () => navigate('articles.html'));
    
    // Logo Link
    document.querySelector('.logo-holder').addEventListener('click', () => navigate('home.html'));
}

function navigate(page) {
    // 1. Fade out current content
    const main = document.getElementById('main-lx');
    main.style.opacity = '0';
    
    setTimeout(() => {
        loadPage(page);
    }, 400); // Wait for fade out
}

async function loadPage(fileName) {
    try {
        const response = await fetch(fileName);
        const html = await response.text();
        
        // Parse the HTML to extract only <main> content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('main').innerHTML;
        
        const mainContainer = document.getElementById('main-lx');
        mainContainer.innerHTML = content;
        
        // Reset Scroll
        window.scrollTo(0, 0);
        
        // Setup specific page logic
        if (fileName.includes('home')) setupHomeAnimation();
        setupScrollReveal();
        setupInternalLinks();
        
        // Fade in
        mainContainer.style.opacity = '1';
        
    } catch (error) {
        console.error('Error loading page:', error);
    }
}

function setupInternalLinks() {
    const links = document.querySelectorAll('#main-lx a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith('.html')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(href);
            });
        }
    });
}

/* =========================================
   SCROLL REVEAL (Hero Fade -> Content)
   ========================================= */
function setupScrollReveal() {
    const heroText = document.querySelector('.hero-text');
    const contentHolder = document.querySelector('.content-holder, .cotent-holder'); // Fix typo in about.html provided
    
    if (!contentHolder) return;

    // Initial check for content reveal
    const checkReveal = () => {
        const triggerPoint = window.innerHeight * 0.3;
        if (window.scrollY > triggerPoint) {
            contentHolder.classList.add('visible');
        } else {
            contentHolder.classList.remove('visible');
        }
        
        // Fade out hero text
        if(heroText) {
            const opacity = 1 - (window.scrollY / (window.innerHeight * 0.5));
            heroText.style.opacity = Math.max(0, opacity);
            heroText.style.transform = `scale(${1 + window.scrollY * 0.0005})`;
        }
    };

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Run once on load
}

/* =========================================
   HOME ANIMATION: LEIRASX -> LX
   ========================================= */
function setupHomeAnimation() {
    const hero = document.querySelector('.hero-text');
    if (!hero || hero.innerText !== 'LEIRASX') return;

    // 1. Split text into spans
    // L E I R A S X
    // 0 1 2 3 4 5 6
    const chars = hero.innerText.split('');
    hero.innerHTML = '';
    
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('letter-span');
        span.dataset.index = index;
        hero.appendChild(span);
    });

    const spans = hero.querySelectorAll('span');
    
    // 2. Animation on Scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight * 0.6; // Point where animation completes
        const progress = Math.min(scrollY / maxScroll, 1);
        
        // Target letters to hide: E(1), I(2), R(3), A(4), S(5)
        // Keep: L(0), X(6)
        
        // Calculate squeeze
        const marginReduction = progress * -0.6; // em units
        const opacityReduction = 1 - (progress * 1.5);
        
        spans.forEach((span, i) => {
            if (i > 0 && i < 6) {
                // The middle letters
                span.style.opacity = Math.max(0, opacityReduction);
                span.style.transform = `scale(${1 - progress}) blur(${progress * 5}px)`;
                
                // Squeeze them horizontally to zero width visually
                span.style.maxWidth = `${(1 - progress) * 100}px`; 
                // Move them closer to L
                span.style.marginLeft = `${progress * -20}px`;
                span.style.marginRight = `${progress * -20}px`;
            } else if (i === 6) {
                 // The 'X' needs to slide left to meet 'L'
                 // But since middle letters shrink, standard flow might handle it.
                 // Let's add slight negative margin to 'L' and 'X' to tighten the gap
                 span.style.marginLeft = `${progress * -10}px`;
            }
        });
        
        // Ensure "LX" stays centered or looks solid at end
        if (progress >= 1) {
            spans.forEach((span, i) => {
                if(i > 0 && i < 6) span.style.display = 'none';
            });
        } else {
             spans.forEach((span, i) => {
                if(i > 0 && i < 6) span.style.display = 'inline-block';
            });
        }
    });
}

/* =========================================
   DOCK MAGNIFICATION (Micro-interaction)
   ========================================= */
function setupDockEffect() {
    const dock = document.querySelector('.dock-holder');
    const items = dock.querySelectorAll('span');
    
    dock.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            
            // Calculate distance from mouse to item center
            const distance = Math.abs(mouseX - itemCenterX);
            const sensitivity = 150; // Range of effect
            
            if (distance < sensitivity) {
                const scale = 1 + (1 - distance / sensitivity) * 0.3; // Max scale 1.3
                item.style.transform = `scale(${scale})`;
                item.style.fontWeight = '700';
            } else {
                item.style.transform = 'scale(1)';
                item.style.fontWeight = '500';
            }
        });
    });
    
    dock.addEventListener('mouseleave', () => {
        items.forEach(item => {
            item.style.transform = 'scale(1)';
            item.style.fontWeight = '500';
        });
    });
}