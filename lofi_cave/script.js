/* stations: 24/7 livestreams so playback never ends.
   claude's old id (YmQ7jRgf4f0) returned 403 from oembed = restricted/dead,
   replaced with chillhop's 24/7 radio (7NOSDKb0HlU). */
const stations = [
    { id: "grok",     name: "grok fm",        videoId: "jfKfPfyJRdk", emoji: "🚀", desc: "beats to understand the universe" },
    { id: "claude",   name: "claude fm",      videoId: "7NOSDKb0HlU", emoji: "🌲", desc: "music for thinking & building" },
    { id: "gpt",      name: "gpt vibes",      videoId: "5qap5aO4i9A", emoji: "🧠", desc: "creative flow & ideas" },
    { id: "deepseek", name: "deepseek radio", videoId: "HHKZmspyIgw", emoji: "🔍", desc: "deep focus & research" },
    { id: "gemini",   name: "gemini grooves", videoId: "4xDzrJKXOOY", emoji: "⭐", desc: "multimodal chill beats" },
];

let player = null;
let playerReady = false;
let started = false;      // user tapped through (we own a playback gesture)
let wantPlay = false;     // desired state, survives station switches
let pendingStation = null;

let currentIndex = 0;
try {
    const saved = parseInt(localStorage.getItem("loficave-station"), 10);
    if (!isNaN(saved) && saved >= 0 && saved < stations.length) currentIndex = saved;
} catch (e) { /* private mode */ }

const $ = (id) => document.getElementById(id);

/* ---------- youtube setup ---------- */

function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1, // needs `playlist` set per-video (done in loadStation)
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
        },
    });
}

function onPlayerReady(event) {
    playerReady = true;
    // restore volume
    let vol = 80, muted = false;
    try {
        vol = parseInt(localStorage.getItem("loficave-vol"), 10);
        if (isNaN(vol)) vol = 80;
        muted = localStorage.getItem("loficave-muted") === "1";
    } catch (e) { /* ignore */ }
    event.target.setVolume(vol);
    $("vol").value = vol;
    if (muted) event.target.mute();
    updateMuteIcon();
    renderPicker();
    renderStation();
    // user tapped before the api finished loading
    if (pendingStation !== null) {
        const idx = pendingStation;
        pendingStation = null;
        loadStation(idx);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        wantPlay = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        wantPlay = false;
    } else if (event.data === YT.PlayerState.ENDED && started) {
        // livestreams don't end; non-live uploads do — loop manually
        player.playVideo();
        return;
    } else if (event.data === YT.PlayerState.CUED && started && wantPlay) {
        player.playVideo();
        return;
    }
    updatePlayIcon();
    updateMediaSession();
}

function onPlayerError() {
    // restricted / deleted / embed-disabled video: skip instead of dead screen
    console.warn("station failed, skipping:", stations[currentIndex].videoId);
    loadStation(currentIndex + 1);
}

/* ---------- stations ---------- */

function loadStation(index) {
    currentIndex = ((index % stations.length) + stations.length) % stations.length;
    try { localStorage.setItem("loficave-station", String(currentIndex)); } catch (e) { /* ignore */ }
    const st = stations[currentIndex];
    renderStation();
    if (!playerReady || !player) { pendingStation = currentIndex; return; }
    // playlist=videoId makes `loop: 1` actually loop single non-live uploads
    player.loadVideoById({ videoId: st.videoId, suggestedQuality: "hd720" });
    if (started && wantPlay) player.playVideo();
    updateMediaSession();
}

function togglePlay() {
    if (!playerReady || !player || !started) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        wantPlay = true;
        player.playVideo();
    }
}

/* ---------- ui ---------- */

function renderStation() {
    const st = stations[currentIndex];
    $("channel-name").innerHTML =
        `<strong>${st.name} ${st.emoji}</strong><span class="desc">${st.desc}</span>`;
    document.title = `loficave • ${st.name} 🎧`;
    document.querySelectorAll(".station-card").forEach((el, i) => {
        el.classList.toggle("active", i === currentIndex);
    });
}

function renderPicker() {
    const nav = $("station-picker");
    nav.innerHTML = "";
    stations.forEach((st, i) => {
        const b = document.createElement("button");
        b.className = "station-card" + (i === currentIndex ? " active" : "");
        b.innerHTML = `<span class="st-emoji">${st.emoji}</span>` +
            `<span class="st-name">${st.name}</span>` +
            `<span class="st-desc">${st.desc}</span>`;
        b.addEventListener("click", () => {
            wantPlay = true;
            loadStation(i);
            nav.classList.add("hidden");
        });
        nav.appendChild(b);
    });
}

function updatePlayIcon() {
    const playing = playerReady && player &&
        player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING;
    $("play-btn").textContent = playing ? "❚❚" : "▶";
}

function updateMuteIcon() {
    const muted = playerReady && player && player.isMuted && player.isMuted();
    $("mute-btn").textContent = muted ? "🔇" : "🔊";
}

function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    const st = stations[currentIndex];
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${st.name} ${st.emoji}`,
            artist: "loficave • 24/7 lofi",
            album: st.desc,
        });
        navigator.mediaSession.setActionHandler("play", () => { wantPlay = true; player.playVideo(); });
        navigator.mediaSession.setActionHandler("pause", () => player.pauseVideo());
        navigator.mediaSession.setActionHandler("previoustrack", () => loadStation(currentIndex - 1));
        navigator.mediaSession.setActionHandler("nexttrack", () => loadStation(currentIndex + 1));
    } catch (e) { /* ignore */ }
}

/* ---------- events ---------- */

$("start-overlay").addEventListener("click", () => {
    $("start-overlay").style.display = "none";
    started = true;
    wantPlay = true;
    loadStation(currentIndex);
});

$("play-btn").addEventListener("click", togglePlay);
$("next-btn").addEventListener("click", () => { wantPlay = true; loadStation(currentIndex + 1); });
$("prev-btn").addEventListener("click", () => { wantPlay = true; loadStation(currentIndex - 1); });

$("stations-btn").addEventListener("click", () => {
    renderPicker();
    $("station-picker").classList.toggle("hidden");
});

$("mute-btn").addEventListener("click", () => {
    if (!playerReady || !player) return;
    if (player.isMuted()) player.unMute();
    else player.mute();
    try { localStorage.setItem("loficave-muted", player.isMuted() ? "1" : "0"); } catch (e) { /* ignore */ }
    updateMuteIcon();
});

$("vol").addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    if (!playerReady || !player) return;
    player.setVolume(v);
    if (v > 0 && player.isMuted()) player.unMute();
    try {
        localStorage.setItem("loficave-vol", String(v));
        localStorage.setItem("loficave-muted", player.isMuted() ? "1" : "0");
    } catch (err) { /* ignore */ }
    updateMuteIcon();
});

document.addEventListener("keydown", (e) => {
    if (!started) {
        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            $("start-overlay").click();
        }
        return;
    }
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    else if (e.code === "ArrowRight") { wantPlay = true; loadStation(currentIndex + 1); }
    else if (e.code === "ArrowLeft") { wantPlay = true; loadStation(currentIndex - 1); }
    else if (e.key === "m" || e.key === "M") { $("mute-btn").click(); }
});

// initial paint (player may not be ready yet)
renderPicker();
renderStation();
updatePlayIcon();
