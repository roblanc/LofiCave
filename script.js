/* stations: 24/7 direct audio streams — no YouTube, no pre-roll ads.
   grok     -> Nightride FM (synthwave)
   claude   -> SomaFM Groove Salad (chill beats)
   gpt      -> SomaFM Lush (mellow)
   deepseek -> SomaFM Deep Space One (deep ambient)
   gemini   -> SomaFM Drone Zone (ambient drones)
   kimi     -> SomaFM Synphaera (mystic ambient) */
const stations = [
    { id: "grok",     name: "grok fm",        emoji: "🚀", desc: "synthwave to understand the universe", stream: "https://stream.nightride.fm/nightride.mp3",
      theme: { sky: ["#1a0533", "#3b0f54"], star: "#ff9ad9", glow: "#b14bff" } },
    { id: "claude",   name: "claude fm",      emoji: "🌲", desc: "chill beats for thinking & building", stream: "https://ice1.somafm.com/groovesalad-128-mp3",
      theme: { sky: ["#0b1e14", "#173d24"], star: "#ffe3b3", glow: "#ffb86b" } },
    { id: "gpt",      name: "gpt vibes",      emoji: "🧠", desc: "mellow flow & fresh ideas", stream: "https://ice1.somafm.com/lush-128-mp3",
      theme: { sky: ["#02222b", "#054a5a"], star: "#c8f6ff", glow: "#3fd8c7" } },
    { id: "deepseek", name: "deepseek radio", emoji: "🔍", desc: "deep focus & research", stream: "https://ice1.somafm.com/deepspaceone-128-mp3",
      theme: { sky: ["#040a24", "#0d2058"], star: "#d8e9ff", glow: "#5b8cff" } },
    { id: "gemini",   name: "gemini grooves", emoji: "⭐", desc: "ambient drift & stargazing", stream: "https://ice1.somafm.com/dronezone-128-mp3",
      theme: { sky: ["#150826", "#33205e"], star: "#f6ecff", glow: "#a78bfa" } },
    { id: "kimi",     name: "kimi radio",   emoji: "🍄", desc: "mystic beats & a glowing forest", stream: "https://ice1.somafm.com/synphaera-128-mp3",
      theme: { sky: ["#02100c", "#0e3524"], star: "#eaffdc", glow: "#57e6a0" } },
];

const audio = document.getElementById("audio");
let currentIndex = 0;
try {
    const saved = parseInt(localStorage.getItem("loficave-station"), 10);
    if (!isNaN(saved) && saved >= 0 && saved < stations.length) currentIndex = saved;
} catch (e) { /* private mode */ }

let started = false;   // user tapped through (we own a playback gesture)
let wantPlay = false;  // desired state, survives station switches
let retryTimer = null;
let retriedCurrent = false;

const $ = (id) => document.getElementById(id);

/* ---------- stations ---------- */

function loadStation(index, autoplay) {
    currentIndex = ((index % stations.length) + stations.length) % stations.length;
    try { localStorage.setItem("loficave-station", String(currentIndex)); } catch (e) { /* ignore */ }
    const st = stations[currentIndex];
    clearTimeout(retryTimer);
    retriedCurrent = false;
    applyTheme(st.theme);
    renderStation();
    loadRoomGif(st);
    audio.src = st.stream;
    audio.load();
    if (autoplay || (started && wantPlay)) playAudio();
    updateMediaSession();
}

/* per-room looping gif (gifs/<station-id>.gif), lofi.cafe style.
   probe first so a missing file never shows a broken image —
   canvas night-sky stays as the fallback background. */
const gifEl = $("room-gif");

function loadRoomGif(st) {
    gifEl.classList.remove("on");
    const probe = new Image();
    probe.onload = () => {
        if (stations[currentIndex].id !== st.id) return; // user switched meanwhile
        gifEl.src = "gifs/" + st.id + ".gif";
        gifEl.classList.add("on");
    };
    probe.onerror = () => { /* keep canvas fallback */ };
    probe.src = "gifs/" + st.id + ".gif";
}

function playAudio() {
    wantPlay = true;
    const p = audio.play();
    if (p && p.catch) p.catch((err) => {
        console.warn("playback blocked:", err && err.name);
        setStatus("click to play 🔊");
    });
    updatePlayIcon();
}

function pauseAudio() {
    wantPlay = false;
    audio.pause();
    updatePlayIcon();
}

function togglePlay() {
    if (!started) { started = true; loadStation(currentIndex, true); return; }
    if (audio.paused) playAudio();
    else pauseAudio();
}

function setStatus(text) {
    const st = stations[currentIndex];
    $("channel-name").innerHTML =
        `<strong>${st.name} ${st.emoji}</strong><span class="desc">${text}</span>`;
}

/* ---------- audio events ---------- */

audio.addEventListener("playing", () => {
    wantPlay = true;
    clearTimeout(retryTimer);
    retriedCurrent = false;
    renderStation();
    updatePlayIcon();
    updateMediaSession();
});

audio.addEventListener("pause", () => {
    if (wantPlay && started) return; // transient (station switch), icon follows play()
    updatePlayIcon();
});

audio.addEventListener("waiting", () => setStatus("buffering…"));
audio.addEventListener("canplay", () => { if (audio.paused && wantPlay && started) playAudio(); });

audio.addEventListener("error", () => {
    console.warn("stream failed:", stations[currentIndex].stream);
    if (!started) return;
    if (!retriedCurrent) {
        // one retry on the same station (network hiccup), then skip ahead
        retriedCurrent = true;
        setStatus("reconnecting…");
        retryTimer = setTimeout(() => loadStation(currentIndex, true), 3000);
    } else {
        setStatus("station offline, skipping…");
        retryTimer = setTimeout(() => loadStation(currentIndex + 1, true), 1500);
    }
});

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
        b.style.setProperty("--card-glow", st.theme.glow);
        b.innerHTML = `<span class="st-emoji">${st.emoji}</span>` +
            `<span class="st-name">${st.name}</span>` +
            `<span class="st-desc">${st.desc}</span>`;
        b.addEventListener("click", () => {
            loadStation(i, true);
            nav.classList.add("hidden");
        });
        nav.appendChild(b);
    });
}

function updatePlayIcon() {
    $("play-btn").textContent = (!audio.paused) ? "❚❚" : "▶";
}

function updateMuteIcon() {
    renderVol();
}

/* segmented block volume (10 blocks, click to set), lofi.cafe style */
const VOL_SEGS = 10;

function setVol(v, muted) {
    audio.volume = Math.min(1, Math.max(0, v));
    if (typeof muted === "boolean") audio.muted = muted;
    else if (v > 0 && audio.muted) audio.muted = false;
    try {
        localStorage.setItem("loficave-vol", String(Math.round(audio.volume * 100)));
        localStorage.setItem("loficave-muted", audio.muted ? "1" : "0");
    } catch (err) { /* ignore */ }
    renderVol();
}

function renderVol() {
    const el = $("vol-segs");
    if (!el) return;
    el.innerHTML = "";
    const level = audio.muted ? 0 : Math.round(audio.volume * VOL_SEGS);
    for (let i = 1; i <= VOL_SEGS; i++) {
        const s = document.createElement("span");
        s.textContent = "▮";
        if (i <= level) s.className = "on";
        s.addEventListener("click", () => setVol(i / VOL_SEGS));
        el.appendChild(s);
    }
    el.setAttribute("aria-valuenow", String(level));
}

function toggleMute() {
    setVol(audio.volume, !audio.muted);
}

function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    const st = stations[currentIndex];
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${st.name} ${st.emoji}`,
            artist: "loficave • 24/7 ad-free lofi",
            album: st.desc,
        });
        navigator.mediaSession.setActionHandler("play", playAudio);
        navigator.mediaSession.setActionHandler("pause", pauseAudio);
        navigator.mediaSession.setActionHandler("previoustrack", () => loadStation(currentIndex - 1, true));
        navigator.mediaSession.setActionHandler("nexttrack", () => loadStation(currentIndex + 1, true));
    } catch (e) { /* ignore */ }
}

/* ---------- animated night-sky background ---------- */

const canvas = $("bg");
const ctx = canvas.getContext("2d");
let stars = [];
let meteors = [];
let activeTheme = stations[currentIndex].theme;
const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function sizeCanvas() {
    canvas.width = Math.floor(window.innerWidth * (window.devicePixelRatio || 1));
    canvas.height = Math.floor(window.innerHeight * (window.devicePixelRatio || 1));
    seedStars();
}

function seedStars() {
    const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 9000));
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: (Math.random() * 1.6 + 0.4) * (window.devicePixelRatio || 1),
            speed: Math.random() * 0.12 + 0.02,
            phase: Math.random() * Math.PI * 2,
            twinkle: Math.random() * 0.03 + 0.005,
        });
    }
}

function applyTheme(theme) {
    activeTheme = theme;
    document.documentElement.style.setProperty("--accent", theme.glow);
    document.documentElement.style.setProperty("--sky1", theme.sky[0]);
    document.documentElement.style.setProperty("--sky2", theme.sky[1]);
}

function drawSky(t) {
    const w = canvas.width, h = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, activeTheme.sky[0]);
    g.addColorStop(1, activeTheme.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // moon glow
    const mx = w * 0.78, my = h * 0.24, mr = Math.min(w, h) * 0.16;
    const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 3);
    mg.addColorStop(0, activeTheme.glow + "55");
    mg.addColorStop(1, "transparent");
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fdf6e388";
    ctx.beginPath();
    ctx.arc(mx, my, mr * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // stars
    for (const s of stars) {
        const a = 0.45 + 0.55 * Math.abs(Math.sin(t * s.twinkle + s.phase));
        ctx.globalAlpha = a;
        ctx.fillStyle = activeTheme.star;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduceMotion) {
            s.y += s.speed;
            if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
        }
    }
    ctx.globalAlpha = 1;

    // occasional shooting star
    if (!reduceMotion && Math.random() < 0.006 && meteors.length < 2) {
        meteors.push({ x: Math.random() * w * 0.7 + w * 0.15, y: -20, vx: -7, vy: 4, life: 1 });
    }
    meteors = meteors.filter((m) => m.life > 0);
    for (const m of meteors) {
        m.x += m.vx; m.y += m.vy; m.life -= 0.02;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
        grad.addColorStop(0, "#ffffff" + Math.floor(220 * m.life).toString(16).padStart(2, "0"));
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
        ctx.stroke();
    }
}

function loop(t) {
    drawSky(t * 0.001);
    if (!reduceMotion && !document.hidden) requestAnimationFrame(loop);
}

window.addEventListener("resize", sizeCanvas);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !reduceMotion) requestAnimationFrame(loop);
});

/* ---------- events ---------- */

/* browsers block sound until a user gesture, so start on the first
   interaction anywhere (no "tap to start" overlay). if that gesture is
   on a control (play/volume), don't autoplay — its own handler takes over. */
function kickstart(e) {
    if (started) return;
    started = true;
    const onControl = e && e.target && e.target.closest &&
        e.target.closest("button, #vol-segs");
    loadStation(currentIndex, !onControl);
}

function isControl(el) {
    return el && el.closest && el.closest("button, a, #vol-segs, #station-picker");
}

/* tap the background: left = previous station, right = next station,
   center = toggle the stream (stop/resume). first tap starts audio
   (browser policy). taps on controls keep working normally. */
function handleTap(e) {
    if (isControl(e.target)) return;
    if (!started) { kickstart(e); return; }
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w * 0.4) loadStation(currentIndex - 1, true);
    else if (x > w * 0.6) loadStation(currentIndex + 1, true);
    else togglePlay();
}
window.addEventListener("click", handleTap);

$("play-btn").addEventListener("click", togglePlay);
$("next-btn").addEventListener("click", () => loadStation(currentIndex + 1, true));
$("prev-btn").addEventListener("click", () => loadStation(currentIndex - 1, true));

$("stations-btn").addEventListener("click", () => {
    renderPicker();
    $("station-picker").classList.toggle("hidden");
});

$("change-link").addEventListener("click", () => {
    renderPicker();
    $("station-picker").classList.toggle("hidden");
});

$("vol-segs").addEventListener("keydown", (e) => {
    const step = 1 / VOL_SEGS;
    if (e.code === "ArrowRight" || e.code === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setVol(audio.volume + step); }
    else if (e.code === "ArrowLeft" || e.code === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setVol(audio.volume - step); }
});

document.addEventListener("keydown", (e) => {
    if (!started) {
        kickstart(e);
        return;
    }
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    else if (e.code === "ArrowRight") { loadStation(currentIndex + 1, true); }
    else if (e.code === "ArrowLeft") { loadStation(currentIndex - 1, true); }
    else if (e.key === "m" || e.key === "M") { toggleMute(); }
});

// initial paint (no autoplay until the user taps)
(function init() {
    let vol = 80, muted = false;
    try {
        const v = parseInt(localStorage.getItem("loficave-vol"), 10);
        if (!isNaN(v)) vol = v;
        muted = localStorage.getItem("loficave-muted") === "1";
    } catch (e) { /* ignore */ }
    audio.volume = vol / 100;
    audio.muted = muted;
    renderVol();
    applyTheme(stations[currentIndex].theme);
    loadRoomGif(stations[currentIndex]);
    sizeCanvas();
    renderPicker();
    renderStation();
    updateMuteIcon();
    updatePlayIcon();
    requestAnimationFrame(loop);
})();
