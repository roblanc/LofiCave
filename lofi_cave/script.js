const channels = [
    { llm: "Grok",      name: "Grok FM",         videoId: "jfKfPfyJRdk", emoji: "🚀", desc: "beats to understand the universe" },
    { llm: "Claude",    name: "Claude FM",       videoId: "YmQ7jRgf4f0", emoji: "🌲", desc: "music for thinking & building" },
    { llm: "ChatGPT",   name: "GPT Vibes",       videoId: "5qap5aO4i9A",  emoji: "🧠", desc: "creative flow & ideas" },
    { llm: "DeepSeek",  name: "DeepSeek Radio",  videoId: "HHKZmspyIgw",  emoji: "🔍", desc: "deep focus & research" },
    { llm: "Gemini",    name: "Gemini Grooves",  videoId: "4xDzrJKXOOY",  emoji: "⭐", desc: "multimodal chill beats" },
    { llm: "Llama",     name: "Llama Beats",     videoId: "rPjez8z61rI",  emoji: "🦙", desc: "open & free spirit" },
    { llm: "Mistral",   name: "Mistral Waves",   videoId: "bsqfCU84MDI",  emoji: "🌊", desc: "elegant french lofi" },
    { llm: "o1",        name: "o1 Radio",        videoId: "OES93rX9rAU",  emoji: "🧩", desc: "reasoning & deep thoughts" }
];

let player;
let currentIndex = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: '',
        playerVars: {
            'autoplay': 0, 'controls': 0, 'loop': 1, 'modestbranding': 1,
            'rel': 0, 'showinfo': 0, 'iv_load_policy': 3, 'playsinline': 1
        },
        events: { 'onReady': onPlayerReady }
    });
}

function onPlayerReady() {
    console.log('✅ YouTube player ready');
}

function loadChannel(index) {
    currentIndex = index % channels.length;
    const ch = channels[currentIndex];

    // schimbă muzica + animația YouTube (japanese anime aesthetic)
    player.loadVideoById(ch.videoId);

    // HUD LLM-themed
    document.getElementById('channel-name').innerHTML = 
        `<strong>${ch.llm} FM</strong><br>${ch.name} ${ch.emoji}<br><small>${ch.desc}</small>`;

    // pornește automat
    setTimeout(() => player.playVideo(), 800);
}

document.getElementById('start-overlay').addEventListener('click', function() {
    this.style.display = 'none';
    loadChannel(0);
});

document.getElementById('change-btn').addEventListener('click', () => {
    loadChannel(currentIndex + 1);
});

// click oriunde pe HUD = next station
document.getElementById('hud').addEventListener('click', (e) => {
    if (e.target.id !== 'change-btn') loadChannel(currentIndex + 1);
});