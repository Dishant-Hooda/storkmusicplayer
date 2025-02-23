let songs;
let currFolder

function truncateSongName(name, length = 10) {
    return name.length > length ? name.substring(0, length) + "..." : name;
}

function updateSongInfo(songName) {
    const songInfo = document.querySelector(".song-info");
    let truncatedName = songName.length > 80 ? songName.substring(0, 80) + "..." : songName;

    songInfo.setAttribute("data-fullname", songName);
    songInfo.textContent = truncatedName;

    // Remove animation initially
    songInfo.classList.remove("full-name");

    songInfo.addEventListener("mouseover", () => {
        songInfo.textContent = songInfo.dataset.fullname; // Show full name
        if (songName.length > 80) {
            songInfo.classList.add("full-name"); // Start scrolling only if long
        }
    });

    songInfo.addEventListener("mouseout", () => {
        songInfo.textContent = truncatedName; // Revert to truncated name
        songInfo.classList.remove("full-name"); // Stop scrolling
    });
}

async function getSongs(folder = "playlist1") {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;

    let listItems = div.querySelectorAll("#files li a"); // Select all links inside the list
    let songList = [];

    // Define valid audio file extensions
    const validExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];

    listItems.forEach((link) => {
        let songName = link.querySelector(".name")?.textContent.trim();
        let songUrl = link.href;

        if (songName && songUrl && songName !== "..") {
            // Check if the filename ends with a valid audio extension
            if (validExtensions.some(ext => songName.toLowerCase().endsWith(ext))) {
                let formattedName = songName;
                songList.push({ url: songUrl, name: formattedName });
            }
        }
    });
    return songList;
}


let currentAudio = null; // Store currently playing audio

const playMusic = (trackUrl, trackName) => {
    if (currentAudio) {
        currentAudio.pause(); // Pause the currently playing song
        currentAudio.currentTime = 0; // Reset time to start
    }
    currentAudio = new Audio(trackUrl); // Create new Audio instance
    currentAudio.play();
    play.src = "pause.svg"
    document.querySelector(".song-info").innerHTML = trackName
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

    currentAudio.addEventListener("timeupdate", () => {
        let currentTime = formatTime(currentAudio.currentTime);
        let duration = currentAudio.duration ? formatTime(currentAudio.duration) : "00:00";
        document.querySelector(".song-time").textContent = `${currentTime} / ${duration}`;
        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    });

};

const formatTime = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

function updateSongListUI() {
    let songUl = document.querySelector(".song-list ul");
    songUl.innerHTML = ""; // Clear previous list

    songs.forEach(song => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <img class="invert" src="music.svg" alt="music">
            <div class="info">
                <div class="song-name-container">
                    <div class="song-name" data-fullname="${song.name}">
                        ${truncateSongName(song.name)}
                    </div> 
                </div>
                <div class="artist">Artist</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="play">
            </div>
        `;

        // Add hover effect for long names
        let songNameDiv = listItem.querySelector(".song-name");
        songNameDiv.addEventListener("mouseover", () => {
            songNameDiv.textContent = songNameDiv.dataset.fullname;
        });
        songNameDiv.addEventListener("mouseout", () => {
            songNameDiv.textContent = truncateSongName(songNameDiv.dataset.fullname);
        });

        listItem.addEventListener("click", () => {
            playMusic(song.url, song.name);
        });

        songUl.appendChild(listItem);
    });
}


async function displayAlbums() {
    try {
        let response = await fetch(`http://127.0.0.1:5500/songs/`);
        let html = await response.text();

        let div = document.createElement("div");
        div.innerHTML = html;

        let playlists = Array.from(div.querySelectorAll("#files a.icon-directory"))
            .map(link => link.querySelector(".name").innerText.trim())
            .filter(name => name !== "..");

        console.log("Playlists Found:", playlists);

        let cardContainer = document.querySelector(".card-container"); // Assuming there's a div with this class
        cardContainer.innerHTML = ""; // Clear previous cards

        let playlistData = await Promise.all(playlists.map(async (playlist) => {
            let metaResponse;
            let metadata = {};
            let coverImage = `http://127.0.0.1:5500/songs/${playlist}/cover.jpg`; // Default cover image path
        
            // Try fetching metadata
            try {
                metaResponse = await fetch(`http://127.0.0.1:5500/songs/${playlist}/info.json`);
                if (!metaResponse.ok) throw new Error(`Metadata not found for ${playlist}`);
                metadata = await metaResponse.json();
            } catch (error) {
                console.warn(`Skipping metadata for ${playlist}:`, error.message);
            }
        
            // Check if cover.jpg exists
            try {
                let coverResponse = await fetch(coverImage, { method: "HEAD" }); // Check if file exists
                if (!coverResponse.ok) {
                    coverImage = 'https://via.placeholder.com/150'; // Use placeholder if cover.jpg not found
                }
            } catch (error) {
                console.warn(`No cover image for ${playlist}:`, error.message);
                coverImage = 'https://via.placeholder.com/150'; // Fallback
            }
        
            return {
                name: playlist,
                meta: metadata,
                coverImage: coverImage
            };
        }));
        

        console.log("Final Playlist Data:", playlistData);

        playlistData.forEach(({ name, meta, coverImage }) => {
            let card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-folder", name);
        
            card.innerHTML = `
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="38" height="38">
                        <circle cx="14" cy="16" r="14" fill="#1DB954"></circle>
                        <path d="M20.8906 16.846C20.5371 18.189 18.8667 19.138 15.5257 21.0361C12.296 22.8709 10.6812 23.7884 9.37983 23.4196C8.8418 23.2671 8.35159 22.9776 7.95624 22.5787C7 21.6139 7 19.7426 7 16C7 12.2574 7 10.3861 7.95624 9.42132C8.35159 9.02245 8.8418 8.73288 9.37983 8.58042C10.6812 8.21165 12.296 9.12907 15.5257 10.9639C18.8667 12.862 20.5371 13.811 20.8906 15.154C21.0365 15.7084 21.0365 16.2916 20.8906 16.846Z" fill="black"></path>
                    </svg>
                </div>
                <img src="${coverImage}" alt="Playlist Image">
                <h2>${meta.title || name}</h2>
                <p>${meta.description || "No description available"}</p>
            `;
        
            cardContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

async function main() {

    songs = await getSongs();

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];

    //display all the albums on the page 
    displayAlbums()

    for (const song of songs) {
        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <img class="invert" src="music.svg" alt="music">
            <div class="info">
                <div class="song-name-container">
                    <div class="song-name" data-fullname="${song.name}">
                        ${truncateSongName(song.name)}
                    </div> 
                </div>
                <div class="artist">Artist</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="play">
            </div>
        `;

        let songNameDiv = listItem.querySelector(".song-name");

        songNameDiv.addEventListener("mouseover", () => {
            songNameDiv.style.width = "max-content"; // Allow full width on hover
            songNameDiv.textContent = songNameDiv.dataset.fullname; // Show full name
        });

        songNameDiv.addEventListener("mouseout", () => {
            songNameDiv.style.width = ""; // Reset to default
            songNameDiv.textContent = truncateSongName(songNameDiv.dataset.fullname);
        });

        songUl.appendChild(listItem);

        listItem.addEventListener("click", () => {
            playMusic(song.url, song.name); // Use song.url instead of manually appending

        });

    }

    play.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play()
            play.src = "pause.svg"
        }
        else {
            currentAudio.pause()
            play.src = "play.svg"
        }
    }
    )

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentAudio.currentTime = (currentAudio.duration * percent) / 100
    })


    // add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left = 0
    }
    )
    document.querySelector(".hamburger-cross").addEventListener('click', () => {
        document.querySelector(".left").style.left = -100 + '%';
    }
    )

    document.querySelector("#previous").addEventListener("click", () => {
        let currentIndex = songs.findIndex(song => song.url === currentAudio.src);
        
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1].url, songs[currentIndex - 1].name);
        } else {
            console.log("Already at the first song");
        }
    });
    
    document.querySelector("#next").addEventListener("click", () => {
        console.log("Next clicked");
    
        let currentIndex = songs.findIndex(song => song.url === currentAudio.src);
        
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1].url, songs[currentIndex + 1].name);
        } else {
            console.log("Already at the last song");
        }
    });

    document.querySelector("#volume").addEventListener("click", () => {
        if (currentAudio) {
            if (currentAudio.volume > 0) {
                currentAudio.dataset.previousVolume = currentAudio.volume; // Save previous volume
                currentAudio.volume = 0;
                document.querySelector("#volume-slider").value = 0;
                document.querySelector("#volume").src = "mute.svg"; // Change icon
            } else {
                currentAudio.volume = currentAudio.dataset.previousVolume || 1; // Restore previous volume
                document.querySelector("#volume-slider").value = currentAudio.volume;
                document.querySelector("#volume").src = "volume.svg"; // Change back to volume icon
            }
        }
    });
    
    // Ensure the volume slider also updates the icon when manually changed
    document.querySelector("#volume-slider").addEventListener("input", (e) => {
        let volumeLevel = e.target.value;
        if (currentAudio) {
            currentAudio.volume = volumeLevel;
            document.querySelector("#volume").src = volumeLevel > 0 ? "volume.svg" : "mute.svg";
        }
    });


    //  load the playlist whenver the card is clicked 
    document.querySelector(".card-container").addEventListener("click", async (event) => {
        let card = event.target.closest(".card");
        if (card) {
            let folder = card.dataset.folder;
            if (folder) {
                songs = await getSongs(folder);
                updateSongListUI(); // Update the song list UI
            } else {
                console.error("No folder attribute found on card");
            }
        }
    });
    
    

}



main();
