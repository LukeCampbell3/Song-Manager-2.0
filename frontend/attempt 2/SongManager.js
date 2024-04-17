const Song = require('./Song.js');  // Assuming Song.js handles song details
const BottomBar = require('./BottomBar.js')

class SongManager {
    constructor() {
        this.songs = [];
        this.audioPlayer = document.getElementById('audioPlayer');  // Assuming there's an <audio> tag with this ID
        this.currentSongIndex = -1;
        this.isPlaying = false;
        this.bottomBar = new BottomBar(this);  // This needs to be instantiated somewhere else or passed in
    }

    static createSongEntry(song) {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-entry';
    
        // Set the song title, removing the file extension
        const songTitle = document.createElement('span');
        songTitle.textContent = song.name; // Update this to use the song.name property
        songTitle.textContent = song.replace(/\.[^/.]+$/, '');
        songDiv.appendChild(songTitle);
    
        // Add onclick event to the song title to update the album art
        songTitle.addEventListener('click', () => {
        
            // Construct the full path to the song file
            const songFullPath = `./audio_input/songs-mp3/${songTitle.textContent}.mp3`;
        
            // Request the album art from the main process
            ipcRenderer.send('get-album-art', songFullPath);
    
            // Wait for the album art reply
            ipcRenderer.once('album-art-reply', (event, image) => {
                // Get the container for the album art and its parent
                const albumArtDiv = document.getElementById('Album-Art');
                const albumContainer = document.getElementById('albumSong'); 
    
                // Ensure the container is cleared (if you plan to add anything else to it later)
                albumContainer.innerHTML = '';
                if (image) {
                    // When the image is received, set it as the background of the albumContainer
                    albumContainer.style.backgroundImage = `url('${image}')`;
                    albumContainer.style.backgroundSize = 'cover'; // Ensure the image covers the div
                    albumContainer.style.backgroundPosition = 'center'; // Center the background image
    
                    // Make both the albumContainer and its parent visible
                    albumContainer.style.display = 'block'; // This might be unnecessary depending on your CSS
                    albumArtDiv.style.display = 'block'; // Make sure the parent div is also made visible
                } else {
                    console.error('No album art found');
                    // Optionally handle the case when no album art is found
                }
                const albumSongTitle = document.createElement('span');
                albumSongTitle.textContent = `${songTitle.textContent = song.replace(/\.[^/.]+$/, '')}`
                const playButton = document.createElement('button');
                playButton.textContent = 'Play';
                playButton.addEventListener('click', () => this.playSong(song));
                albumContainer.append(albumSongTitle, playButton)
            });
            showTab(null, 'Album-Art'); // This will handle displaying the tab content
        });
            
        // Play button
        const playBtn = document.createElement('button');
        playBtn.textContent = 'Play';
        playBtn.addEventListener('click', () => this.playSong(song));
        songDiv.appendChild(playBtn);
    
        // "..." button
        const moreOptionsBtn = document.createElement('button');
        moreOptionsBtn.textContent = '...';
        // Add event listener for more options
        // moreOptionsBtn.addEventListener('click', () => { /* Your code for more options */ });
        songDiv.appendChild(moreOptionsBtn);
        
        this.playSong(song);
        
        return songDiv;
    }

    playSong(song) {
        const songIndex = this.songs.findIndex(s => s === song);
        if (this.audioPlayer.src !== song.filepath) {
            // If the selected song is different from the currently playing song
            this.stopCurrentSong(); // Stop the currently playing song
            this.audioPlayer.src = song.filepath; // Set the new song
            this.currentSongIndex = songIndex; // Update the current song index
            this.isPlaying = true; // Set the new song as playing
            this.audioPlayer.play().then(() => {
                // Playback success
                this.bottomBar.updateNowPlaying(song);
            }).catch(error => {
                console.error("Playback failed", error);
            });
        } else {
            // If the selected song is the same as the currently playing song, just toggle play/pause
            if (this.audioPlayer.paused) {
                this.audioPlayer.play();
                if (window.waveform) {
                    window.waveform.play();
                }
                this.isPlaying = true;
            } else {
                this.audioPlayer.pause();
                if (window.waveform) {
                    window.waveform.pause();
                }
                this.isPlaying = false;
            }
        }
    
        // Update the play/pause button's appearance
        this.bottomBar.updatePlayPauseButton();
    }

    stopCurrentSong() {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        this.isPlaying = false; // Update isPlaying when the song stops
    }
}

module.exports = SongManager;