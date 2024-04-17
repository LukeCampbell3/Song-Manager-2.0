

class BottomBar {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.isPlaying = false; // Initialize to false
        
        // Bind event listeners to update isPlaying based on actual playback state
        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton(); // Make sure the button reflects the current state
        });
        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton(); // Make sure the button reflects the current state
        });
        this.audioPlayer.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton(); // Reflect when the song has ended
        });
    }

    playPauseSong() {
        if (!this.audioPlayer.src && songs.length > 0) {
            this.loadSong(songs[0], 0);
        } else {
            if (!this.isPlaying) {
                this.audioPlayer.play();
            } else {
                this.audioPlayer.pause();
            }
        }
    }
    
    
    updatePlayPauseButton() {
        const playButton = document.querySelector('.play-button');
        playButton.textContent = this.isPlaying ? 'Pause' : 'Play';
    }
    
    updateVolume(value) {
        audioPlayer.volume = value;
    }
}

const bottomBar = new BottomBar(document.getElementById('audioPlayer'));

module.exports = BottomBar;