const Playlist = require('./Playlist'); // Ensure Playlist.js exports a class
const songManagerInstance = require('./SongManager.js');
const appControllerInstance = require('./AppController.js');

class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.playlistUL = document.getElementById('playlistList');
        this.songManager = songManagerInstance;
        this.appController = appControllerInstance;
        this.currentPlaylist = null;
    }

    initCreatePlaylistInput() {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'New Playlist Name';
        input.onkeydown = (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                e.preventDefault();
                this.createPlaylist(input.value.trim());
                input.value = ''; // Clear the input field
            }
        };
        li.appendChild(input);
        this.playlistUL.appendChild(li);
        input.focus(); // Automatically focus the input field for immediate typing
    }

    createPlaylist(name) {
        const newPlaylist = new Playlist(name); // Fixed to correctly refer to Playlist class
        this.playlists.push(newPlaylist);
        this.displayPlaylists();
    }

    displayPlaylists() {
        this.playlistUL.innerHTML = ''; // Clear the list before re-rendering
        this.initCreatePlaylistInput(); // Reinitialize the input field for new playlist creation
        this.playlists.forEach(playlist => {
            const li = document.createElement('li');
            li.textContent = playlist.name;
            li.id = playlist.id;
            li.addEventListener('click', () => {
                this.currentPlaylist = playlist; // Fixed to correctly refer to the playlist
                this.currentPlaylist.displaySongs('playlistSongsContainer');
                this.displayAllSongs();
            });
            this.playlistUL.appendChild(li);
        });
    }

    displayAllSongs() {
        const allSongsContainer = document.getElementById('allSongsContainer');
        allSongsContainer.innerHTML = '';

        const availableSongs = this.appController.loadSongs(); // Ensure this function returns the array of all songs

        availableSongs.forEach((song) => {
            const songEntry = document.createElement('div');
            songEntry.className = 'song-entry';
            const songName = document.createElement('span');
            songName.textContent = song.name;
            songEntry.appendChild(songName);

            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.addEventListener('click', () => {
                if (this.currentPlaylist) {
                    this.currentPlaylist.addSong(song);
                } else {
                    console.error('No playlist selected');
                }
            });
            songEntry.appendChild(addButton);
            allSongsContainer.appendChild(songEntry);
        });
    }
}

const playlistManagerInstance = new PlaylistManager();
module.exports = playlistManagerInstance;
