# 🎵 Stork Music Player

A sleek, self-contained **offline music player** built entirely with HTML, CSS, and JavaScript. Designed for personal use, Stork Music Player allows you to organise your songs into playlists with custom cover images and metadata — no external APIs or backend required.

> Created by [Dishant Hooda](https://github.com/Dishant-Hooda)

---

## 🚀 Features

- 🎧 Play, pause, skip, and seek music
- 📁 Organize songs into multiple playlists
- 🖼️ Add custom cover images and metadata for each playlist
- 🔄 Loop, shuffle (if implemented)
- 🧠 Fully offline and API-free
- 🎨 Clean, responsive, and minimal UI

---

## 📂 Playlist Structure

To create a playlist, make a new folder inside the `songs/` directory with the following structure:

songs/
└── Playlist1/
    ├── song1.mp3
    ├── song2.mp3
    ├── cover.jpg
    └── info.json




### 📄 Sample `info.json` Format

```json
{
  "title": "Chill Vibes",
  "description": "Relax and unwind with this mellow playlist."
}

🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript 

📦 Setup Instructions
Clone the repository:

bash

git ```clone https://github.com/Dishant-Hooda/storkmusicplayer.git```
cd storkmusicplayer
Add your music:

Go to the songs/ folder.

Create folders for each playlist with .mp3 or any supported music file, a cover.jpg, and an info.json.

Run the app:

Open index.html in any browser.

Enjoy your offline music experience!

