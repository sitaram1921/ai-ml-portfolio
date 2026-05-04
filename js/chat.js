const CHAT_API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/chat'
    : 'https://YOUR_VERCEL_URL/api/chat';

const chatBtn      = document.getElementById('chat-fab');
const chatBox      = document.getElementById('chat-box');
const chatClose    = document.getElementById('chat-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput    = document.getElementById('chat-input');
const chatSend     = document.getElementById('chat-send');
const chatMic      = document.getElementById('chat-mic');
const modePicker   = document.getElementById('chat-mode-picker');

let chatMode = null; // 'voice' or 'text'
let isSpeaking = false;
let currentUtterance = null;
let selectedVoice = null;

// Load best available voice
function loadBestVoice() {
    const preferred = [
        'Google UK English Male',
        'Microsoft Guy Online (Natural) - English (United States)',
        'Microsoft Brian Online (Natural) - English (United States)',
        'Microsoft Andrew Online (Natural) - English (United States)',
        'Microsoft Ryan Online (Natural) - English (United Kingdom)',
        'Google US English',
        'Microsoft Mark - English (United States)',
        'Microsoft David - English (United States)',
    ];
    const voices = window.speechSynthesis.getVoices();
    for (const name of preferred) {
        const match = voices.find(v => v.name === name);
        if (match) { selectedVoice = match; return; }
    }
    // Fallback: any male-named English voice
    selectedVoice = voices.find(v => v.lang.startsWith('en') && /male|guy|david|mark|brian|andrew|ryan/i.test(v.name))
        || voices.find(v => v.lang.startsWith('en-US'))
        || null;
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadBestVoice;
    loadBestVoice();
}

// Open / close
chatBtn.addEventListener('click', () => {
    chatBox.classList.toggle('open');
    if (chatBox.classList.contains('open') && !chatMode) {
        modePicker.classList.add('visible');
    }
});
chatClose.addEventListener('click', () => {
    chatBox.classList.remove('open');
    stopSpeaking();
});

// Mode selection
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        chatMode = btn.dataset.mode;
        modePicker.classList.remove('visible');
        modePicker.style.display = 'none';

        if (chatMode === 'voice') {
            chatMic.style.display = 'flex';
            chatBox.classList.add('voice-mode');
        } else {
            chatMic.style.display = 'none';
            chatBox.classList.remove('voice-mode');
        }

        appendMessage('bot', "Hey! I'm Sita Ram — ask me anything about my work, skills, or projects.");
    });
});

// Send on enter / button
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Voice input
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => chatMic.classList.add('listening');
    recognition.onend   = () => chatMic.classList.remove('listening');
    recognition.onresult = e => {
        chatInput.value = e.results[0][0].transcript;
        sendMessage();
    };
    chatMic.addEventListener('click', () => {
        if (chatMic.classList.contains('listening')) recognition.stop();
        else { stopSpeaking(); recognition.start(); }
    });
} else {
    chatMic.style.display = 'none';
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    chatSend.disabled = true;
    stopSpeaking();
    appendMessage('user', text);

    const typing = appendTyping();
    try {
        const res = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        typing.remove();
        const reply = data.reply || data.error || 'No response received.';
        const msgEl = appendMessage('bot', reply);
        if (chatMode === 'voice') speakText(reply, msgEl);
    } catch {
        typing.remove();
        appendMessage('bot', 'Connection error. Please try again.');
    } finally {
        chatSend.disabled = false;
        chatInput.focus();
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg-${role}`;
    if (role === 'bot') {
        div.innerHTML = `<span class="msg-text">${text}</span><button class="tts-btn" title="Listen"><i class="fas fa-volume-up"></i></button>`;
        div.querySelector('.tts-btn').addEventListener('click', () => {
            if (isSpeaking && currentUtterance?.text === text) stopSpeaking();
            else speakText(text, div);
        });
    } else {
        div.textContent = text;
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function appendTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function speakText(text, msgEl) {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    currentUtterance = utterance;
    isSpeaking = true;
    msgEl?.classList.add('speaking');
    utterance.onend = utterance.onerror = () => {
        isSpeaking = false;
        currentUtterance = null;
        msgEl?.classList.remove('speaking');
    };
    window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    document.querySelectorAll('.chat-msg.speaking').forEach(el => el.classList.remove('speaking'));
}
