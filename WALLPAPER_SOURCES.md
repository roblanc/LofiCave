# Wallpaper sources (LofiCave project)

Saved so adding a new radio station / wallpaper is one step.

## Where to grab wallpapers
- Pixel-art GIFs: https://wallpaperaccess.com/pixel-art-gif
- Pixel-art wallpapers (mp4/webp): https://moewalls.com/pixel-art/
- Local source folder (already used for claude/gpt/gemini/deepseek/kimi wallpapers):
  `~/Library/CloudStorage/GoogleDrive-dumitriurobert0@gmail.com/My Drive/01-Proiecte/Creativ/We Hired Someone to Put Us to Sleep/`

## How to add a station
1. Copy/convert wallpaper to `lofi_cave/gifs/<station-id>.gif` (id must match `stations[].id` in `lofi_cave/script.js` — `loadRoomGif` auto-loads `gifs/<id>.gif`).
2. Optimize large sources with ffmpeg palette conversion (see below).
3. Add a station entry in `lofi_cave/script.js` (`id`, `name`, `emoji`, `desc`, SomaFM stream, `theme`).
4. Commit to `main`, then sync `gh-pages` (live site is GitHub Pages: https://roblanc.github.io/LofiCave/).

## GIF optimization (ffmpeg)
```
ffmpeg -i IN.gif -vf "scale=900:-1,fps=8,palettegen=stats_mode=diff:max_colors=48" pal.png
ffmpeg -i IN.gif -i pal.png -lavfi "scale=900:-1,fps=8[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" OUT.gif
```
Start at scale 900/fps 8/48 colors; raise for static/short clips, lower for long mp4 wallpapers (11s loops → 800px/6fps).

## SomaFM direct streams in use
- Groove Salad (chill) `ice1.somafm.com/groovesalad-128-mp3`
- Lush (mellow) `ice1.somafm.com/lush-128-mp3`
- Deep Space One (ambient) `ice1.somafm.com/deepspaceone-128-mp3`
- Drone Zone (drones) `ice1.somafm.com/dronezone-128-mp3`
- Metaphysical (mystic ambient) `ice1.somafm.com/metaphysical-128-mp3`