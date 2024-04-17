class BottomBar {
    constructor(songManager) {
        this.songManager = songManager;  // Store the reference to the SongManager
    }

    updatePlayPauseButton() {
        const playButton = document.querySelector('.play-button');
        if (this.songManager && this.songManager.isPlaying) {
            playButton.textContent = 'Pause';
        } else {
            playButton.textContent = 'Play';
        }
    }

    nextSong() {
        this.songManager.currentSongIndex = (this.songManager.currentSongIndex + 1) % this.songManager.songs.length;
        this.loadSong(this.songManager.songs[this.songManager.currentSongIndex].name, this.songManager.currentSongIndex);
    }

    previousSong() {
        this.songManager.currentSongIndex = (this.songManager.currentSongIndex - 1 + this.songManager.songs.length) % this.songManager.songs.length;
        this.loadSong(this.songManager.songs[this.songManager.currentSongIndex].name, this.songManager.currentSongIndex);
    }

    updateVolume(value) {
        this.songManager.audioPlayer.volume = value;
    }

    updateNowPlaying(song) {
        const nowPlaying = document.getElementById('nowPlaying');
        nowPlaying.textContent = `Playing: ${song.replace(/\.[^/.]+$/, '')}`;
    }

    loadSong(songName, index) {
        this.songManager.audioPlayer.src = `../audio_input/songs-mp3/${songName}`;
        this.songManager.audioPlayer.play().then(() => {
            this.songManager.updateNowPlaying(songName);
        }).catch(error => {
            console.error("Playback failed", error);
        });
        this.songManager.currentSongIndex = index;
        this.songManager.isPlaying = true; // Update playing status
    }
}

module.exports = BottomBar;
