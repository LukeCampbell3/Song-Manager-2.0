var SongManager = require('./SongManager.js')

class PlaybackUIManager {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.isPlaying = SongManager.isPlaying;
    }

    updatePlayPauseButton(isPlaying) {
        const playButton = document.querySelector('.play-button');
        if (isPlaying === true) {
            playButton.textContent = 'Pause';
        } else {
            playButton.textContent = 'Play';
        }
    }
    

    updateNowPlayingUI(songName) {
        const nowPlaying = document.getElementById('nowPlaying');
        nowPlaying.textContent = `Playing: ${songName}`;
    }

    updateAlbumArt(imageUrl) {
        const albumArtDiv = document.getElementById('Album-Art');
        if (imageUrl) {
            albumArtDiv.style.backgroundImage = `url('${imageUrl}')`;
            albumArtDiv.style.display = 'block';
        } else {
            console.error('No album art found');
            albumArtDiv.style.display = 'none';
        }
    }

    updateNowPlaying(songName) {
        const nowPlaying = document.getElementById('nowPlaying');
        nowPlaying.textContent = `Playing: ${songName}`;
    }
}

const playbackmanagerinstance = new PlaybackUIManager();
module.exports = playbackmanagerinstance;
