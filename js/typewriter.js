const words = ["Full Stack Python Developer", "AI/ML Engineer", "FastAPI Specialist", "Computer Vision Engineer"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const target = document.getElementById('typewriter');

function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
        target.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        target.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500);
    } else {
        setTimeout(type, isDeleting ? 50 : 100);
    }
}
type();