const { ipcRenderer } = require('electron');
const WaveSurfer = require('wavesurfer.js');
var SongManager = require('./SongManager')
var playbackmanagerinstance = require('./PlaybackManager.js');
var menuManager = require('./MenuManager.js')
var BottomBar = require('./BottomBar.js')
var PlaylistManager = require('./PlaylistManager.js')

class AppController {
    constructor() {
        this.songs = [];
        this.albums = [];
        this.ratedSongs = [];
        this.ratedAlbums = [];
        this.currentSongIndex = -1;
        this.audioPlayer = document.getElementById('audioPlayer');
        // Initialize instances of other components
        this.menuManager = new menuManager;
        this.song = new Song();
        this.songManager = new SongManager(this.audioPlayer, {
            loadNextSong: () => this.loadNextSong(),
            loadPreviousSong: () => this.loadPreviousSong(),
        });
        this.bottomBar = new BottomBar(this.audioPlayer);
        this.playbackUIManager = new playbackmanagerinstance(this.audioPlayer);
        this.playlist = new Playlist();
        this.playlistManager = new PlaylistManager();
        this.ratingManager = new RatingManager();
        this.vocal = new Vocal(this);
        this.instrumentals = new Instrumentals(this);
        this.initializeUI();
        this.setupWaveSurfer();
        this.registerIpcListeners();
    }

    initializeUI() {
        // Initialize UI components, attach event listeners, etc.
        document.addEventListener('DOMContentLoaded', () => {
            this.loadSongs();
            const bottomBar = new BottomBar(document.getElementById('audioPlayer'));
            document.querySelector('.play-button').addEventListener('click', () => bottomBar.playPauseSong());
            document.querySelector('.next-button').addEventListener('click', () => this.songManager.loadNextSong());
            document.querySelector('.prev-button').addEventListener('click', () => this.songManager.loadPreviousSong());

            document.getElementById('playlist-btn').addEventListener('click', () => this.playlistManager.initCreatePlaylistInput());

            document.querySelector('.volume-control input').addEventListener('change', (event) => {
                bottomBar.updateVolume(event.target.value);
            });

        });
    }

    setupWaveSurfer() {
        // Initialize WaveSurfer instance
        this.waveSurfer = WaveSurfer.create({
            container: '#waveformContainer',
            waveColor: 'violet',
            progressColor: 'purple',
            cursorColor: 'navy',
            height: 50,
            barWidth: 2
        });

        // Example WaveSurfer event listener
        this.waveSurfer.on('ready', () => {
            this.waveSurfer.play();
        });
    }

    registerIpcListeners() {
        // Register ipcRenderer event listeners
        ipcRenderer.on('get-songs-response', (event, receivedSongs) => {
            // Convert song names into Song objects
            const songObjects = receivedSongs.map(songName => new Song(songName));
            
            // Now that we have an array of Song objects, we can display them
            this.songManager.displaySongs(songObjects);
            
            
        });

        ipcRenderer.on('instrumental-created', (event, { songName, instrumentalPath }) => {
            this.instrumentals.handleInstrumentalCreated(songName, instrumentalPath);
        });

        ipcRenderer.on('separation-failed', (event, error) => {
            this.instrumentals.handleSeparationFailed(error);
        });

        // Additional ipcRenderer event listeners...
    }

    loadSongs() {
        ipcRenderer.send('get-songs');
        ipcRenderer.once('get-songs-response', (event, receivedSongs) => {
            this.songs = receivedSongs.map(songName => new Song(songName));
            this.songManager.displaySongs(this.songs);
        });
    }

    showTab(tabId) {
        this.menuManager.showTab(null, tabId);
    }

    initializeApplication() {
        this.menuManager.initMenuListeners(); // Assuming MenuManager has a method to set up its listeners
        // Additional initialization as necessary
        // For example, setup listeners or UI updates for playlistManager, ratingManager, etc.
    }

    separateSongToInstrumental(songName) {
        ipcRenderer.send('separate-instrumental', songName);
    }

    // Additional methods...
}

const appControllerInstance = new AppController();
module.exports = appControllerInstance;
document.addEventListener('DOMContentLoaded', () => appController.initializeApplication());
