const { ipcRenderer } = require('electron');
const SongManager = require('./SongManager.js');
const BottomBar = require('./BottomBar.js')

class MenuManager {
    constructor() {
        this.songManager = new SongManager();
        this.songs = [];
        this.setupListeners();
        const bottomBar = new BottomBar(this.songManager);
    }

    setupListeners() {
        this.loadSongs();
        document.addEventListener('DOMContentLoaded', () => this.requestSongs());
        ipcRenderer.on('get-songs-response', (event, songs) => {
        this.songs = songs;  // Store the songs received
        this.displaySongs(songs);  // Display songs right away or you could do this only when the tab is shown
        });
    }

    requestSongs() {
        ipcRenderer.send('get-songs');
    }

    static showTab(evt, tabName) {
        var i, tabcontent, tablinks;
    
        // Hide all tab contents
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            if (tabcontent[i]) {
                tabcontent[i].style.display = "none";
            }
        }
    
        // Remove "active" class from all tablinks and hide the dropdown if visible
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            if (tablinks[i]) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
        }
    
        // Show the current tab, and add an "active" class to the button that opened the tab
        const currentTabContent = document.getElementById(tabName);
        if (currentTabContent) {
            currentTabContent.style.display = "block";
            if (evt) {
                evt.currentTarget.className += " active";
            }
        if (tabName === 'songRatings') {
            displayRatings();
            displayRatedSongs();
        }
        if (tabName === 'albumRatings') {
            this.songs.forEach(song => {
                const songFullPath = `./audio_input/songs-mp3/${song.name}`;
                ipcRenderer.send('get-album-metadata', { songPath: songFullPath });
            });
            displayRatedAlbums();
        }
        } else {
            console.error(`The tab content element for '${tabName}' was not found.`);
        }
    }
    
    loadSongs() {
        document.addEventListener('DOMContentLoaded', () => {
            this.requestSongs(); // Ensuring songs are requested upon DOM load
        });
    }

    receiveSongs() {
        ipcRenderer.on('get-songs-response', (event, receivedSongs) => {

            const songsContainer = document.getElementById('Songs');

            if (!songsContainer) {
                console.error('songsContainer element not found in the DOM');
                return;
            }

            songsContainer.innerHTML = '';
            songs = receivedSongs;

            receivedSongs.forEach((song) => {
                const songEntry = this.songManager.createSongEntry(song);
                songsContainer.appendChild(songEntry);
            });
            this.showTab(null, 'Songs'); // Now calling non-statically
        });
    }
}

module.exports = MenuManager;
