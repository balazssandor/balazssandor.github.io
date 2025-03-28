// Google Analytics Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-4C1RKZ9MLK');

// Track custom clicks
function trackClick(category, action, label) {
    console.log(`Tracking: ${category} - ${action} - ${label}`);
    gtag('event', action, {
        'event_category': category,
        'event_label': label
    });
}

// Toggle between light and dark mode
function toggleTheme() {
    const html = document.documentElement;
    const isDarkMode = html.classList.contains('dark-mode');
    const themeToggle = document.querySelector('.theme-toggle');

    if (isDarkMode) {
        html.classList.remove('dark-mode');
        themeToggle.innerHTML = '🌙';
        localStorage.setItem('theme', 'light');
        trackClick('Theme', 'Switch', 'Light');
    } else {
        html.classList.add('dark-mode');
        themeToggle.innerHTML = '☀️';
        localStorage.setItem('theme', 'dark');
        trackClick('Theme', 'Switch', 'Dark');
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 20,
            behavior: 'smooth'
        });
        trackClick('Navigation', 'SectionPreview', sectionId);
    }
}

// Section visibility tracking
const sectionViewTimes = {};
const sectionStartTimes = {};

function trackSectionView(sectionId, isVisible) {
    if (isVisible) {
        // Section came into view - start the timer
        sectionStartTimes[sectionId] = new Date().getTime();
        // Track section visibility start
        gtag('event', 'section_view_start', {
            'event_category': 'Engagement',
            'event_label': sectionId
        });
    } else if (sectionStartTimes[sectionId]) {
        // Section went out of view - calculate duration
        const endTime = new Date().getTime();
        const duration = endTime - sectionStartTimes[sectionId];

        // Add to total time for this section
        sectionViewTimes[sectionId] = (sectionViewTimes[sectionId] || 0) + duration;

        // Track section visibility end with duration
        gtag('event', 'section_view_end', {
            'event_category': 'Engagement',
            'event_label': sectionId,
            'value': Math.round(duration / 1000) // Convert to seconds
        });

        // Reset start time
        delete sectionStartTimes[sectionId];
    }
}

// Track scroll depth percentages
function trackScrollDepth() {
    const scrollTop = window.pageYOffset;
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    ) - window.innerHeight;
    const scrollPercent = Math.floor((scrollTop / docHeight) * 100);

    // Track at 25%, 50%, 75% and 100% scroll depth
    const milestones = [25, 50, 75, 100];

    milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !window['scrollDepth' + milestone]) {
            window['scrollDepth' + milestone] = true;
            gtag('event', 'scroll_depth', {
                'event_category': 'Engagement',
                'event_label': milestone + '%'
            });
        }
    });
}

// Track time spent on page
let pageLoadTime = new Date().getTime();
let timeOnPage = 0;
let timeTrackingInterval;

function startTimeTracking() {
    timeTrackingInterval = setInterval(() => {
        timeOnPage = Math.floor((new Date().getTime() - pageLoadTime) / 1000);

        // Track time spent every 30 seconds
        if (timeOnPage % 30 === 0 && timeOnPage > 0) {
            gtag('event', 'time_on_page', {
                'event_category': 'Engagement',
                'event_label': timeOnPage + ' seconds',
                'value': timeOnPage
            });
        }
    }, 1000);
}

// Update scroll progress bar
function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set theme based on localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');

    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark-mode');
        themeToggle.innerHTML = '🌙';
    } else {
        document.documentElement.classList.add('dark-mode');
        themeToggle.innerHTML = '☀️';
    }

    // Start tracking time spent on page
    startTimeTracking();

    // Show back to top button when scrolling
    window.addEventListener('scroll', function() {
        const backToTop = document.querySelector('.back-to-top');
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Track scroll depth
        trackScrollDepth();

        // Update scroll progress
        updateScrollProgress();
    });

    // Add animation to sections on scroll
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            console.log("Section visible:", entry.target.id); // Debug
            trackSectionView(entry.target.id, true);

            // Add staggered animations to children with animate-in class
            const animatedElements = entry.target.querySelectorAll('.animate-in');
            animatedElements.forEach((el, index) => {
                // Add a delay based on index for staggered effect
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 100); // 100ms delay between each element
            });
        } else {
            trackSectionView(entry.target.id, false);
        }
    });
}, { threshold: 0.1 });
    sections.forEach(section => {
        observer.observe(section);
        // Debug log
        console.log("Observing section:", section.id);
    });

    // Track initial page view with all relevant attributes
    gtag('event', 'page_view', {
        'event_category': 'Page Interaction',
        'event_label': document.title,
        'page_path': window.location.pathname,
        'page_title': document.title,
        'screen_resolution': `${window.innerWidth}x${window.innerHeight}`
    });

    // Track when user is about to leave the page
    window.addEventListener('beforeunload', function() {
        // Final time on page tracking
        const finalTimeOnPage = Math.floor((new Date().getTime() - pageLoadTime) / 1000);

        gtag('event', 'exit_page', {
            'event_category': 'Engagement',
            'event_label': 'Total time: ' + finalTimeOnPage + ' seconds',
            'value': finalTimeOnPage
        });

        // Track any sections still being viewed
        Object.keys(sectionStartTimes).forEach(sectionId => {
            trackSectionView(sectionId, false);
        });

        // Show total time spent on each section
        console.log('Time spent on sections (seconds):',
            Object.keys(sectionViewTimes).reduce((acc, sectionId) => {
                acc[sectionId] = Math.floor(sectionViewTimes[sectionId] / 1000);
                return acc;
            }, {})
        );

        clearInterval(timeTrackingInterval);
    });
});
