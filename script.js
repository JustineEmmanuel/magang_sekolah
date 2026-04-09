// Global variable to store navbar element and its height
const NAVBAR = document.querySelector('.navbar');
let NAVBAR_HEIGHT_OFFSET = 0; // Akan dihitung secara dinamis saat DOMContentLoaded

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        // --- FIX FOR FIXED NAVBAR: Menggunakan offset dinamis ---
        // Gunakan offset yang sudah dihitung secara dinamis
        const offset = NAVBAR_HEIGHT_OFFSET || 100; // Fallback 100 jika offset belum terhitung
        
        if (target) {
            // Mengurangi posisi target dengan tinggi navbar agar tepat di bawah navbar
            const offsetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        // --- END FIX ---
    });
});

// Intersection Observer for Animations (Ini tetap ada)
const animationObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, animationObserverOptions);

// ====================================================================
// START: INTERSECTION OBSERVER UNTUK SCROLLSPY (PENGGANTI)
// ====================================================================

/**
 * Handler untuk Intersection Observer Scrollspy.
 * Mengaktifkan link navigasi berdasarkan section yang memasuki viewport.
 */
function handleIntersection(entries, observer) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Cari section yang paling atas/terbaru yang sedang intersecting
    let activeSectionId = '';

    // Iterasi TERBALIK. Prioritaskan section yang paling bawah di viewport (berarti yang paling baru dilihat)
    const reversedEntries = entries.slice().reverse(); 

    for (const entry of reversedEntries) {
        // Hanya cek entri yang berpotongan (intersecting)
        if (entry.isIntersecting) {
            // Gunakan entry.boundingClientRect.top untuk memeriksa apakah bagian atas section
            // sudah melewati garis tengah navbar (atau garis ambang batas).
            
            // Intersection Observer menggunakan 'threshold' atau 'rootMargin' untuk menentukan intersecting.
            // Dengan rootMargin negatif (-Npx), elemen dianggap intersecting HANYA JIKA bagian atasnya
            // SUDAH MASUK ke margin negatif tersebut (yaitu melewati Npx di bawah navbar).
            // Karena kita menggunakan offset, kita hanya perlu cek yang isIntersecting.
            
            activeSectionId = entry.target.id;
            break; 
        }
    }
    
    // Lakukan aktivasi link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Logika tambahan untuk "Home" saat di paling atas
    if (window.scrollY < (NAVBAR_HEIGHT_OFFSET || 100)) {
        navLinks.forEach(link => link.classList.remove('active'));
        const homeLink = document.querySelector('.nav-link[href="#home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
}

// Inisialisasi Intersection Observer untuk Scrollspy
const sections = document.querySelectorAll('section[id]');
let scrollspyObserver;


document.addEventListener('DOMContentLoaded', () => {
    // --- PERBAIKAN 1: Hitung tinggi navbar secara dinamis saat DOM siap ---
    if (NAVBAR) {
        NAVBAR_HEIGHT_OFFSET = NAVBAR.offsetHeight;
        // Tambahkan padding ekstra 10px untuk transisi highlight yang lebih mulus
        NAVBAR_HEIGHT_OFFSET += 10; 
    }
    // --- AKHIR PERBAIKAN 1 ---
    
    // Inisialisasi Observer Animasi
    const animateElements = document.querySelectorAll('.about-card, .service-card, .team-card, .contact-item, .stat-item, .regulation-item, .regulation-category');
    animateElements.forEach(el => {
        animationObserver.observe(el);
    });
    
    // Inisialisasi Observer Scrollspy
    // Atur rootMargin negatif di bagian atas (top) sebesar tinggi navbar
    const scrollspyObserverOptions = {
        root: null, // viewport
        threshold: 0, // Akan memicu saat elemen mulai/keluar dari root
        // Margin atas negatif akan membuat elemen harus melewati garis itu dulu sebelum dianggap intersecting
        rootMargin: `-${NAVBAR_HEIGHT_OFFSET}px 0px 0px 0px` 
    };

    scrollspyObserver = new IntersectionObserver(handleIntersection, scrollspyObserverOptions);
    
    // Mulai mengamati semua section
    sections.forEach(section => {
        scrollspyObserver.observe(section);
    });

    // --- PANGGIL INISIASI KALENDER ---
    initCalendar();
    // --- AKHIR PANGGILAN ---
});

// ====================================================================
// END: INTERSECTION OBSERVER UNTUK SCROLLSPY
// ====================================================================

// HAPUS TOTAL LOGIKA SCROLLSPY LAMA YANG MENGGUNAKAN window.addEventListener('scroll', ...)
// Blok ini sepenuhnya dihapus dan digantikan oleh Intersection Observer di atas.

// Form submission handling (TETAP)
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // ... (Logika Form Submission tetap sama) ...
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        if (!email || !message) {
            alert('Mohon lengkapi semua field!');
            e.preventDefault();
            return;
        }
        
        const replyToField = contactForm.querySelector('input[name="_replyto"]');
        if (replyToField) {
            replyToField.value = email;
        }
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
    });
}

// Handle success message from Formspree (TETAP)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showSuccessMessage();
    }
});

function showSuccessMessage() {
    // ... (Fungsi showSuccessMessage tetap sama) ...
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Terima kasih!</h3>
            <p>Pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda melalui email.</p>
            <button onclick="closeSuccessMessage()" class="btn btn-primary">Tutup</button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeSuccessMessage() {
    const successDiv = document.querySelector('.success-message');
    if (successDiv) {
        successDiv.remove();
    }
}

// Counter animation for stats (TETAP)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (target >= 100 ? '+' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (target >= 100 ? '+' : '');
        }
    }
    
    updateCounter();
}

// Trigger counter animation when stats section is visible (TETAP)
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-item h3');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent.replace(/\D/g, ''));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}


// BACK TO TOP BUTTON LOGIC (Pindahkan dari blok scroll lama)
window.addEventListener('scroll', () => {
    const backToTopBtn = document.querySelector('.back-to-top');
    const whatsappFloat = document.querySelector('.whatsapp-float');
    
    // Show/hide back to top button
    if (window.pageYOffset > 300) {
        if (backToTopBtn) backToTopBtn.style.display = 'flex';
        
        // Move WhatsApp button up to avoid collision
        if (whatsappFloat) whatsappFloat.classList.add('scrolled');
    } else {
        if (backToTopBtn) backToTopBtn.style.display = 'none';
        
        // Move WhatsApp button back to original position
        if (whatsappFloat) whatsappFloat.classList.remove('scrolled');
    }
});


// Add active class styles for navigation (TETAP)
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #2563eb !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// Loading screen (optional) (TETAP)
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add loaded class styles (TETAP)
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body:not(.loaded) {
        overflow: hidden;
    }
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #eba625ff;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    body:not(.loaded)::after {
        content: 'Sigma Samitra';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 2rem;
        font-weight: 700;
        z-index: 10000;
    }
`;
document.head.appendChild(loadingStyle);

// WhatsApp integration (TETAP)
function openWhatsAppDefault() {
    const phoneNumber = '6285220873877'; // Bandung number
    const message = 'Halo, saya tertarik dengan layanan konsultasi pajak dari Sigma Samitra.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Add WhatsApp button to contact form (TETAP)
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const whatsappBtn = document.createElement('button');
        whatsappBtn.type = 'button';
        whatsappBtn.className = 'btn btn-whatsapp';
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Chat WhatsApp';
        whatsappBtn.style.background = '#25D366';
        whatsappBtn.style.color = 'white';
        whatsappBtn.style.marginTop = '1rem';
        whatsappBtn.style.width = '100%';
        whatsappBtn.onclick = openWhatsAppDefault; 
        
        contactForm.appendChild(whatsappBtn);
    }
});

// Add hover effects for service cards (TETAP)
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Back to top button (TETAP)
const backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.className = 'back-to-top';
backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #d88d1dff;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
`;

document.body.appendChild(backToTopBtn);


// Back to top functionality (TETAP)
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect for back to top button (TETAP)
backToTopBtn.addEventListener('mouseenter', () => {
    backToTopBtn.style.transform = 'scale(1.1)';
    backToTopBtn.style.background = '#d88d1dff';
});

backToTopBtn.addEventListener('mouseleave', () => {
    backToTopBtn.style.transform = 'scale(1)';
    backToTopBtn.style.background = '#d88d1dff';
});

// Regulations section interactions (TETAP)
document.addEventListener('DOMContentLoaded', () => {
    const regulationItems = document.querySelectorAll('.regulation-item');
    regulationItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-reg')) {
                // Toggle expanded state
                item.classList.toggle('expanded');
            }
        });
    });
});

// Add expanded state styles for regulations (TETAP)
const regulationStyle = document.createElement('style');
regulationStyle.textContent = `
    .regulation-item.expanded {
        background: white !important;
        border-color: #d4af37;
        box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);
    }
    
    .regulation-item.expanded .regulation-content {
        transform: scale(1.02);
    }
`;
document.head.appendChild(regulationStyle);

// WhatsApp Floating Button Functions (TETAP)
function toggleWhatsAppDropdown() {
    const dropdown = document.getElementById('whatsappDropdown');
    dropdown.classList.toggle('show');
}

function openWhatsApp(phoneNumber, location) {
    const message = `Halo, saya tertarik dengan layanan konsultasi pajak dari Sigma Samitra ${location}.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    const dropdown = document.getElementById('whatsappDropdown');
    dropdown.classList.remove('show');
}

// Close WhatsApp dropdown when clicking outside (TETAP)
document.addEventListener('click', function(event) {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const dropdown = document.getElementById('whatsappDropdown');
    
    if (whatsappFloat && dropdown && !whatsappFloat.contains(event.target) && !event.target.closest('.whatsapp-button')) {
        dropdown.classList.remove('show');
    }
});

function openWhatsAppIntegration() {
    const phoneNumber = '6285220873877'; 
    const message = 'Halo, saya tertarik dengan layanan konsultasi pajak dari Sigma Samitra.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
// ====================================================================================
// START: KALENDER PERPAJAKAN LOGIC (TETAP)
// ====================================================================================

const TAX_CALENDAR_DATA = {
    PAYMENT_DEADLINES: {
        PPh_SETOR: 10,
        PPN_SETOR: 15,
    },
    
    HOLIDAYS: [
        // --- 2025 ---
        { date: '2025-01-01', name: 'Tahun Baru Masehi' },
        { date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW' },
        { date: '2025-03-29', name: 'Hari Suci Nyepi' },
        { date: '2025-04-01', name: 'Idul Fitri 1446 H' }, 
        { date: '2025-04-02', name: 'Cuti Bersama Idul Fitri' },
        { date: '2025-04-03', name: 'Cuti Bersama Idul Fitri' },
        { date: '2025-04-04', name: 'Cuti Bersama Idul Fitri' },
        { date: '2025-04-07', name: 'Cuti Bersama Idul Fitri' },
        { date: '2025-04-18', name: 'Wafat Yesus Kristus (Jumat Agung)' },
        { date: '2025-05-01', name: 'Hari Buruh Internasional' },
        { date: '2025-05-12', name: 'Hari Raya Waisak' },
        { date: '2025-05-13', name: 'Cuti Bersama Waisak' },
        { date: '2025-05-29', name: 'Kenaikan Yesus Kristus' },
        { date: '2025-05-30', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
        { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
        { date: '2025-06-09', name: 'Cuti Bersama Idul Adha' }, 
        { date: '2025-07-14', name: 'Hari Pajak Nasional' },
        { date: '2025-07-27', name: 'Tahun Baru Islam 1447 H' },
        { date: '2025-08-17', name: 'Hari Kemerdekaan RI' },
        { date: '2025-12-25', name: 'Hari Natal' },
        { date: '2025-12-26', name: 'Cuti Bersama Natal' },
        
        // --- 2026 ---
        { date: '2026-01-01', name: 'Tahun Baru Masehi' },
        { date: '2026-01-16', name: "Isra' Mi'raj Nabi Muhammad SAW" },
        { date: '2026-02-16', name: 'Cuti Bersama Imlek' },
        { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
        { date: '2026-03-18', name: 'Cuti Bersama Nyepi' },
        { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
        { date: '2026-03-20', name: 'Cuti Bersama Idul Fitri' },
        { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H' },
        { date: '2026-03-22', name: 'Hari Raya Idul Fitri 1447 H' },
        { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri' },
        { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri' },
        { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
        { date: '2026-05-01', name: 'Hari Buruh Internasional' },
        { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
        { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
        { date: '2026-05-27', name: 'Idul Adha 1447 H' },
        { date: '2026-05-28', name: 'Cuti Bersama Idul Adha' },
        { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE' },
        { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
        { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H' },
        { date: '2026-08-17', name: 'Hari Kemerdekaan RI' },
        { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
        { date: '2026-12-24', name: 'Cuti Bersama Natal' },
        { date: '2026-12-25', name: 'Hari Natal' },
    ],
    
    ANNUAL_REPORT: [
        { date: '03-31', name: 'Lapor SPT Tahunan PPh Orang Pribadi', class: 'event-lapor-spt' },
        { date: '04-30', name: 'Lapor SPT Tahunan PPh Badan', class: 'event-lapor-spt' },
    ],
    
    MONTH_NAMES: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
};


let currentDisplayDate = new Date();
currentDisplayDate.setFullYear(2025, currentDisplayDate.getMonth(), currentDisplayDate.getDate()); 

function isHolidayOrWeekend(dateObj) {
    const dayOfWeek = dateObj.getDay(); 
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true; 
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    return TAX_CALENDAR_DATA.HOLIDAYS.some(h => h.date === dateKey);
}

function getNextWorkingDay(dateObj) {
    let nextDate = new Date(dateObj);
    while (isHolidayOrWeekend(nextDate)) {
        nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
}

function getTaxEvents(dateObj) {
    const events = [];
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); 
    
    const holidayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = TAX_CALENDAR_DATA.HOLIDAYS.find(h => h.date === holidayKey);
    if (holiday) {
        events.push({ name: holiday.name, class: 'event-holiday' });
    } else if (isHolidayOrWeekend(dateObj)) {
    }

    const deadlines = TAX_CALENDAR_DATA.PAYMENT_DEADLINES;
    const originalPaymentDates = [deadlines.PPh_SETOR, deadlines.PPN_SETOR];
    
    originalPaymentDates.forEach(originalDay => {
        const originalDate = new Date(year, month, originalDay);
        if (originalDate.getMonth() === month) {
            const finalDate = getNextWorkingDay(originalDate);
            
            if (finalDate.toDateString() === dateObj.toDateString()) {
                if (originalDay === deadlines.PPh_SETOR) {
                    events.push({ name: 'Setor PPh (Tgl 10) - Akhir', class: 'event-pph' });
                }
                if (originalDay === deadlines.PPN_SETOR) {
                    events.push({ name: 'Setor PPN (Tgl 15) - Akhir', class: 'event-ppn' });
                }
            } else if (originalDate.toDateString() === dateObj.toDateString() && isHolidayOrWeekend(originalDate)) {
                if (originalDay === deadlines.PPh_SETOR) {
                    events.push({ name: `Setor PPh (Geser ke ${finalDate.getDate()})`, class: 'event-pph shift-warning' });
                }
                if (originalDay === deadlines.PPN_SETOR) {
                    events.push({ name: `Setor PPN (Geser ke ${finalDate.getDate()})`, class: 'event-ppn shift-warning' });
                }
            }
        }
    });

    const originalReportDate20 = new Date(year, month, 20);
    const finalReportDate20 = getNextWorkingDay(originalReportDate20);
    
    if (finalReportDate20.toDateString() === dateObj.toDateString()) {
        events.push({ name: 'Lapor SPT Masa PPh (Tgl 20)', class: 'event-lapor-spt' });
    }

    const originalReportDateLastDay = new Date(year, month, lastDayOfMonth);
    const finalReportDateLastDay = getNextWorkingDay(originalReportDateLastDay);
    
    if (finalReportDateLastDay.toDateString() === dateObj.toDateString()) {
        events.push({ name: 'Lapor SPT Masa PPN', class: 'event-lapor-spt' });
        events.push({ name: 'Lapor SPT Masa Bea Meterai', class: 'event-lapor-spt' });
    }
    
    TAX_CALENDAR_DATA.ANNUAL_REPORT.forEach(annualEvent => {
        const parts = annualEvent.date.split('-');
        const originalAnnualDate = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
        const finalAnnualDate = getNextWorkingDay(originalAnnualDate);

        if (finalAnnualDate.toDateString() === dateObj.toDateString()) {
             events.push({ name: annualEvent.name, class: annualEvent.class });
        }
    });

    return events;
}

function renderCalendar(startOfWeek) {
    const gridContainer = document.getElementById('date-grid-container');
    const monthDisplay = document.getElementById('current-month-display');
    if (!gridContainer || !monthDisplay) return;

    gridContainer.innerHTML = ''; 

    const monthToShow = new Date(startOfWeek);
    monthToShow.setDate(startOfWeek.getDate() + 3); 
    const currentMonth = TAX_CALENDAR_DATA.MONTH_NAMES[monthToShow.getMonth()];
    monthDisplay.textContent = `${currentMonth} ${monthToShow.getFullYear()}`;

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const day = currentDate.getDate();
        const events = getTaxEvents(currentDate);
        
        let dayClasses = 'calendar-day';
        
        if (currentDate.toDateString() === new Date().toDateString()) {
            dayClasses += ' today';
        }
        
        if (isHolidayOrWeekend(currentDate) && events.every(e => e.class !== 'event-pph' && e.class !== 'event-ppn' && e.class !== 'event-lapor-spt')) {
             dayClasses += ' weekend-day';
        }

        let dayHtml = `<div class="${dayClasses}" data-date="${currentDate.toISOString().substring(0, 10)}">`;
        dayHtml += `<div class="day-number">${day}</div>`;
        
        const sortedEvents = events.sort((a, b) => {
            if (a.class === 'event-holiday' && b.class !== 'event-holiday') return -1;
            if (a.class !== 'event-holiday' && b.class === 'event-holiday') return 1;
            return 0;
        });
        
        sortedEvents.forEach(event => {
            dayHtml += `<div class="due-info ${event.class}">${event.name}</div>`;
        });
        
        dayHtml += `</div>`;
        gridContainer.innerHTML += dayHtml;
    }
}


function changeWeek(direction) {
    currentDisplayDate.setDate(currentDisplayDate.getDate() + (direction * 7));
    
    const maxDate = new Date(2027, 0, 1);
    if (currentDisplayDate > maxDate) {
        currentDisplayDate.setDate(currentDisplayDate.getDate() - (direction * 7));
        alert('Data kalender perpajakan saat ini hanya tersedia hingga akhir tahun 2026.');
        return;
    }
    
    renderCalendar(currentDisplayDate);
}

function initCalendar() {
    const startOfWeek = new Date(currentDisplayDate);
    startOfWeek.setDate(currentDisplayDate.getDate() - startOfWeek.getDay());
    currentDisplayDate = startOfWeek; 
    
    renderCalendar(currentDisplayDate);
    
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeWeek(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeWeek(1));
    }

    const customStyle = document.createElement('style');
    customStyle.textContent = `
        .calendar-day.today {
            background-color: #e0f7fa; 
            border: 2px solid #00bcd4;
        }
        .calendar-day.weekend-day {
            background-color: #f9fafb;
        }
        .due-info {
            font-size: 0.75rem;
            padding: 3px 5px;
        }
        .due-info.shift-warning {
            background-color: #fce7f6 !important;
            color: #be185d !important;
            border-left: 3px solid #db2777 !important;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .day-of-week { display: none; }
            .calendar-header button { padding: 5px 10px; font-size: 1.2rem; }
            #date-grid-container { grid-template-columns: repeat(7, 1fr); gap: 5px; padding: 5px; }
            .calendar-day { min-height: 80px; padding: 3px; overflow: hidden; }
            .calendar-day .day-number { font-size: 1.1rem; }
            .due-info { font-size: 0.6rem; padding: 1px 2px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .calendar-day.today { border-width: 1px; }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
            .calendar-day { min-height: 100px; }
            .due-info { font-size: 0.7rem; }
        }
    `;
    document.head.appendChild(customStyle);
}