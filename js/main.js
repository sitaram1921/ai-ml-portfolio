// Cursor Arrow
const cursorArrow = document.getElementById('cursor-arrow');
window.addEventListener('mousemove', (e) => {
    cursorArrow.style.left = (e.clientX - 2) + 'px';
    cursorArrow.style.top = (e.clientY - 2) + 'px';
});

// Loader & Scroll Reveal
window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('loader').style.display = 'none'; }, 2000);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if(entry.target.id === 'skills') {
                const bars = entry.target.querySelectorAll('.skill-bar-fill');
                bars.forEach(bar => bar.style.width = bar.dataset.percent);
            }
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// PDF.js Thumbnails
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    document.querySelectorAll('.cert-card[data-type="pdf"]').forEach(async card => {
        const canvas = card.querySelector('.cert-canvas');
        if (!canvas) return;
        try {
            const pdf = await pdfjsLib.getDocument(card.dataset.file).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.45 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        } catch {
            canvas.closest('.cert-popup').innerHTML = '<div class="cert-popup-placeholder"><i class="fas fa-file-certificate"></i></div>';
        }
    });
}

// Certifications Filter
document.querySelectorAll('.cert-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cert-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.cert-card').forEach(card => {
            card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
        });
    });
});

// Certificate Modal
const modal = document.getElementById('cert-modal');
const modalContent = document.getElementById('cert-modal-content');
document.querySelectorAll('.cert-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.cert-card');
        const file = card.dataset.file;
        const type = card.dataset.type;
        modalContent.innerHTML = type === 'pdf'
            ? `<iframe src="${file}"></iframe>`
            : `<img src="${file}" alt="Certificate">`;
        modal.classList.add('open');
    });
});
document.getElementById('cert-modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
    modalContent.innerHTML = '';
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('open');
        modalContent.innerHTML = '';
    }
});

// Navbar Scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    const progress = document.getElementById('scroll-progress');
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    progress.style.width = scrollPercent + "%";
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});