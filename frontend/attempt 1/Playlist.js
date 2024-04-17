class Playlist {
    constructor(name) {
        this.id = `playlist-${Date.now()}`; // Unique ID for the playlist
        this.name = name;
        this.songs = []; // This will hold Song objects or song details
    }
  
    addSong(song) {
        this.songs.push(song);
        this.displaySongs('playlistSongsContainer'); // Assuming this method updates the display accordingly
    }    
  
    displaySongs(containerId) {
        const playlistContainer = document.getElementById(containerId);
        playlistContainer.innerHTML = ''; // Clear existing content
  
        const playlistNameHeader = document.createElement('h3');
        playlistNameHeader.textContent = this.name;
        playlistContainer.appendChild(playlistNameHeader);
  
        this.songs.forEach(song => {
            const songDiv = document.createElement('div');
            const songNameSpan = document.createElement('span');
            songNameSpan.textContent = song.name; // Assuming Song has a 'name' property
            songDiv.appendChild(songNameSpan);
  
            const playButton = document.createElement('button');
            playButton.textContent = 'Play';
            playButton.addEventListener('click', () => {
                // Assuming playSong is a method in Song class
                song.play(); 
            });
            songDiv.appendChild(playButton);
  
            playlistContainer.appendChild(songDiv);
        });
    }

    // Additional methods as needed...
}

const playlistinstance = new Playlist();
module.exports = playlistinstance;
