const Song = require('./Song');
const PlaybackUIManager = require('./PlaybackManager').PlaybackUIManager; // Adjust based on actual export

class SongManager {
    constructor(audioPlayer) {
        this.songs = [];
        this.audioPlayer = audioPlayer;
        this.currentSongIndex = -1;
        this.isPlaying = false;
        this.playbackUIManager = new PlaybackUIManager(this.audioPlayer); // Ensure this is the correct reference
    }

    displaySongs(songs) {
        this.songs = songs;
        const songsContainer = document.getElementById('songsContainer');
        songsContainer.innerHTML = '';
        this.songs.forEach((song) => {
            const songEntry = this.createSongEntry(song);
            songsContainer.appendChild(songEntry);
        });
        songsContainer.style.display = 'block';
    }

    createSongEntry(song) {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-entry';
        const songTitle = document.createElement('span');
        songTitle.textContent = song.name;
        songDiv.appendChild(songTitle);
        songTitle.addEventListener('click', () => {
            this.playbackUIManager.updateAlbumArt(song.albumArtUrl); // Ensure this method exists
        });
        const playBtn = document.createElement('button');
        playBtn.textContent = 'Play';
        playBtn.addEventListener('click', () => this.playSong(song));
        songDiv.appendChild(playBtn);
        return songDiv;
    }

    playSong(song) {
        if (this.audioPlayer.src !== song.filePath) {
            this.audioPlayer.src = song.filePath;
            this.audioPlayer.load();
            this.audioPlayer.play().then(() => {
                this.isPlaying = true;
            }).catch(error => {
                console.error("Playback failed", error);
            });
        } else {
            if (this.audioPlayer.paused) {
                this.audioPlayer.play();
                this.isPlaying = true;
            } else {
                this.audioPlayer.pause();
                this.isPlaying = false;
            }
        }
        this.playbackUIManager.updatePlayPauseButton(this.isPlaying);
        this.playbackUIManager.updateNowPlaying(song.name);
    }
}

const songManagerInstance = new SongManager();
module.exports = songManagerInstance;
