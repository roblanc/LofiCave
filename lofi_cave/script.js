const channels = [
    { llm: "Grok",      name: "Grok FM",         videoId: "jfKfPfyJRdk", emoji: "🚀", desc: "beats to understand the universe" },
    { llm: "Claude",    name: "Claude FM",       videoId: "YmQ7jRgf4f0", emoji: "🌲", desc: "music for thinking & building" },
    { llm: "ChatGPT",   name: "GPT Vibes",       videoId: "5qap5aO4i9A",  emoji: "🧠", desc: "creative flow & ideas" },
    { llm: "DeepSeek",  name: "DeepSeek Radio",  videoId: "HHKZmspyIgw",  emoji: "🔍", desc: "deep focus & research" },
    { llm: "Gemini",    name: "Gemini Grooves",  videoId: "4xDzrJKXOOY",  emoji: "⭐", desc: "multimodal chill beats" }
];

let player;
let currentIndex = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('✅ YouTube player ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        console.log('▶️ Playing');
    }
}

function loadChannel(index) {
    currentIndex = index % channels.length;
    const ch = channels[currentIndex];

    player.loadVideoById(ch.videoId);
    
    document.getElementById('channel-name').innerHTML = 
        `<strong>${ch.llm} FM</strong><br>${ch.name} ${ch.emoji}<br><small>${ch.desc}</small>`;

    setTimeout(() => {
        player.playVideo();
    }, 1000);
}

// TAP TO START
document.getElementById('start-overlay').addEventListener('click', function() {
    this.style.display = 'none';
    loadChannel(0);
});

// Next station
document.getElementById('change-btn').addEventListener('click', () => {
    loadChannel(currentIndex + 1);
});

document.getElementById('hud').addEventListener('click', (e) => {
    if (e.target.id !== 'change-btn') {
        loadChannel(currentIndex + 1);
    }
});
