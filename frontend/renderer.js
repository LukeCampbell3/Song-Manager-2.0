
//LIBRARIES
const { ipcRenderer } = require('electron');
const WaveSurfer = require('wavesurfer.js');


//VARIABLES
let audioPlayer = document.getElementById('audioPlayer');
let currentSongIndex = -1; // To keep track of the currently playing song index
let songs = []; // This should be filled with song names when they are loaded
let isPlaying = false;
let albums = [];
let ratings = { value: 0 };
let ratedSongs = [];    // Array to store rated songs
let ratedAlbums = [];
let playlists = [];
let isPlaylistActive = false;

/*
    This portion initializes the tabs and displays for html
    This portion continues until line 127 
    (This will be marked)
*/
// This function is called when a tab button is clicked
function showTab(evt, tabName) {
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
        songs.forEach(songName => {
            const songFullPath = `./audio_input/songs-mp3/${songName}`;
            ipcRenderer.send('get-album-metadata', { songPath: songFullPath });
        });
        displayRatedAlbums();
    }
    } else {
        console.error(`The tab content element for '${tabName}' was not found.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.play-button');
    const nextBtn = document.querySelector('.next-button');
    const prevBtn = document.querySelector('.prev-button');

    showTab(null, 'Home');
    audioPlayer = document.getElementById('audioPlayer');
    setInterval(() => {
        updateAllContainers();
    }, 5000); // Update every 5 seconds

    // Load songs as soon as the app is ready
    ipcRenderer.send('get-songs'); 

    // Attach event listeners to tabs
    const tabButtons = document.querySelectorAll('.tablinks');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (event) => showTab(event, btn.getAttribute('data-tab')));
    });

    console.log('Buttons:', { playBtn, nextBtn, prevBtn });  // Check if buttons are correctly selected

    playBtn.addEventListener('click', playPauseSong);
    nextBtn.addEventListener('click', () => {
        if (isPlaylistActive) {
            nextSongPlaylist();
        } else {
            nextSong();
        }
    });
    prevBtn.addEventListener('click', () => {
        if (isPlaylistActive) {
            previousSongPlaylist();
        } else {
            previousSong();
        }
    });
});

function loadSongs() {
    // Ensure the DOM is fully loaded before trying to access elements
    const songsContainer = document.getElementById('songsContainer');
        
    if (songsContainer) {
            // Check if the songs are already displayed
        if (songsContainer.style.display === 'block') {
            // If yes, hide them
            songsContainer.style.display = 'none';
        } else {
            // If no, show them and request the songs if they haven't been loaded yet
            songsContainer.style.display = 'block';
            if (songsContainer.innerHTML.trim() === '') {
                ipcRenderer.send('get-songs');
            }
        }
            // Ensure the "Songs" tab is activated
        showTab(null, 'Songs');
    } else {
        console.error('songsContainer element not found in the DOM');
        ipcRenderer.send('get-songs');
    }
}

ipcRenderer.on('get-songs-response', (event, receivedSongs) => {
    // Assume songsContainer exists in the main content area
    const songsContainer = document.getElementById('Songs');
    const playlistContainer = document.getElementById('Playlists')

    // Make sure songsContainer is found, otherwise log error
    if (!songsContainer || !playlistContainer) {
        console.error('songsContainer / playlistContainer element not found in the DOM');
        return;
    }

    // Clear existing songs and initialize the songs array
    songsContainer.innerHTML = '';
    songs = receivedSongs;

    // Create elements for each song with waveforms
    receivedSongs.forEach((song) => {
        const songEntry = createSongEntry(song);
        songsContainer.appendChild(songEntry);
    });
    
});


//  End of initialized portion


/*
    This portion handles the songs display and functionality
    This portion continues until line 341
    (This will be maked as well)
*/
//This function creates a song entry for each song that is detected from 'get-album-art'.
function createSongEntry(song) {
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
            playButton.addEventListener('click', () => playSong(song));
            albumContainer.append(albumSongTitle, playButton)
        });
        showTab(null, 'Album-Art'); // This will handle displaying the tab content
    });
        
    
    // Play button
    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play';
    playBtn.addEventListener('click', () => playSong(song));
    songDiv.appendChild(playBtn);

    // "..." button
    const moreOptionsBtn = document.createElement('button');
    moreOptionsBtn.textContent = '...';
    // Add event listener for more options
    // moreOptionsBtn.addEventListener('click', () => { /* Your code for more options */ });
    songDiv.appendChild(moreOptionsBtn);
    
    
    return songDiv;
}

// this plays song objects
function playSong(song, playlistId = null) {
    const songIndex = songs.findIndex(s => s === song);
    if (audioPlayer.src !== `../audio_input/songs-mp3/${song}`) {
        stopCurrentSong(); // Stop the currently playing song
        audioPlayer.src = `../audio_input/songs-mp3/${song}`; // Set the new song
        audioPlayer.load();
        currentSongIndex = songIndex; // Update the current song index
        isPlaying = true; // Set the new song as playing
        audioPlayer.play().then(() => {
            updateNowPlaying(song); // Playback success
        }).catch(error => {
            console.error("Playback failed", error);
        });
    } else {
        togglePlayPause(); // Handle play/pause if the song is already loaded
    }

    if (playlistId) {
        currentPlaylist = getPlaylistById(playlistId);
        currentPlaylistIndex = currentPlaylist.songs.findIndex(s => s.name === song);
        isPlaylistActive = true;
    } else {
        isPlaylistActive = false;
    }

    updatePlayPauseButton();
}



// Function to stop the currently playing song
function stopCurrentSong() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false; // Update isPlaying when the song stops
}

// this plays the path for the song (its really more for vocals and instrumentals)
function playSongPath(songPath) {
    if (audioPlayer.src !== songPath) {
        // If the selected song is different from the currently playing song
        stopCurrentSong(); // Stop the currently playing song
        audioPlayer.src = songPath; // Set the new song
        audioPlayer.load(); // Load the new source
        isPlaying = true; // Set the new song as playing
        audioPlayer.play().then(() => {
            // Playback success
            updateNowPlayingPath(songPath); // Update this function to handle a path instead of a song name
        }).catch(error => {
            console.error("Playback failed", error);
        });
    } else {
        // If the selected song is the same as the currently playing song, just toggle play/pause
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
    }

    // Update the play/pause button's appearance
    updatePlayPauseButton();
}

function playPauseSong() {
    if (!isPlaying) {
        audioPlayer.play().then(() => {
            isPlaying = true;
        }).catch(error => {
            console.error("Toggle play failed", error);
        });
    } else {
        audioPlayer.pause();
        isPlaying = false;
    }
}

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseButton();
        });
    } else {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
    }
}

function updatePlayPauseButton() {
    const playBtn = document.querySelector('.play-button');
    playBtn.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9658;'; // Play or pause symbols
}


function nextSong() {
    if (isPlaylistActive) {
        nextSongPlaylist();
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length; // Loop to the start if at the end
        loadSongIndex(songs[currentSongIndex], currentSongIndex);
    }
}

function previousSong() {
    if (isPlaylistActive) {
        nextSongPlaylist();
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Loop to the end if at the start
        loadSongIndex(songs[currentSongIndex], currentSongIndex);
    }
}

function updateVolume(value) {
    audioPlayer.volume = value;
}

function loadSongIndex(songName, index) {
    if (!audioPlayer) {
        audioPlayer = new Audio();
    }
    currentSongIndex = index;
    audioPlayer.src = `../audio_input/songs-mp3/${songName}`;
    audioPlayer.play().then(() => {
        updateNowPlaying(songName);
    }).catch(error => {
        console.error("Playback failed", error);
    });
}

function updateNowPlaying(song) {
    const nowPlaying = document.getElementById('nowPlaying');
    if (isPlaylistActive) {
        nowPlaying.textContent = `Playing from playlist: ${song}`;
    } else {
        nowPlaying.textContent = `Playing: ${song}`;
    }
}


function updateNowPlayingPath(songPath) {
    const nowPlaying = document.getElementById('nowPlaying');
    const songName = extractSongName(songPath); // Extract the song name from the path

    if (isPlaylistActive) {
        nowPlaying.textContent = `Playing from playlist: ${songName}`;
    } else {
        nowPlaying.textContent = `Playing: ${songName}`;
    }
}


function extractSongName(filePath) {
    // Split the path using the platform-specific separator
    const pathParts = filePath.split(path.sep);

    // Get the file name without the extension
    let fileNameWithExtension = pathParts[pathParts.length - 1];
    let fileName = path.basename(fileNameWithExtension, path.extname(fileNameWithExtension));

    // Determine the type based on the presence of specific words in the file name
    let type = '';
    if (fileName.toLowerCase().includes('instrumental')) {
        type = 'Instrumental';
    } else if (fileName.toLowerCase().includes('vocal')) {
        type = 'Vocal';
    } else if (fileName.toLowerCase().includes('(C)')) {
        type = 'Clean';
    }

    // The parent directory name is the song name
    let songName = pathParts[pathParts.length - 2]; // Parent directory

    // Return the formatted song name
    return `${songName} - ${type}`;
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize the audio player
    audioPlayer = document.getElementById('audioPlayer');

    // Load songs as soon as the app is ready
    ipcRenderer.send('get-songs');

    // Event listener for the Home tab
    const homeTab = document.getElementById('home');
    if (homeTab) {
        homeTab.addEventListener('click', () => showTab(null, 'Home'));
    }

    // Event listener for the Songs tab, which includes toggling the dropdown
    const songsTab = document.getElementById('songs-tab');
    if (songsTab) {
        songsTab.addEventListener('click', () => {
            showTab(null, 'Songs');
        });
    }

    // Adjusted: Directly call showTab for the default tab without using querySelector
    showTab(null, 'Home');
});
//  End of Songs portion
//  This could also be sub divided into the bottom bar portion as well because skip/previous/play/pause is what it handles


/*
    This portion handles the python logic that splits a .mp3 into an instrumental file
    This portion ends at line 435
    (this)
*/
ipcRenderer.on('seperate-instrumental', (event, { songName, instrumentalPath }) => {
    const buttonContainer = document.querySelector('.song-button-container');
    const downloadButton = document.createElement('button');
    downloadButton.textContent = `Download ${songName} Instrumental`;
    downloadButton.addEventListener('click', () => {
        ipcRenderer.send('download-file', instrumentalPath);
    });

    // Find the button for this song and replace it with the download button
    document.querySelectorAll('.song-button').forEach(button => {
        if (button.textContent.includes(`Processing ${songName}`)) {
            buttonContainer.replaceChild(downloadButton, button);
        }
    });
});

function loadInstrumentalSongs() {
    const mainContentArea = document.getElementById('Instrumentals');
    mainContentArea.innerHTML = '';

    const promptText = document.createElement('p');
    promptText.innerText = "Select a song to separate into vocals:";
    mainContentArea.appendChild(promptText);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'song-button-container';
    mainContentArea.appendChild(buttonContainer);

    // Assuming 'songs' is an array of song names (strings)
    songs.forEach((song) => {
        const songButton = document.createElement('button');
        songButton.textContent = song; // 'song' is the song name
        songButton.className = 'song-button';
        ipcRenderer.send('get-instrumentals', song);
        console.log('Requesting instrumental tracks for:', song);

        songButton.addEventListener('click', () => {

            // Optionally disable the button to prevent multiple clicks
            songButton.disabled = true;
            ipcRenderer.send('separate-instrumental', song);
            songButton.textContent = `Processing ${song}...`;
        });
        buttonContainer.appendChild(songButton);
    });

    // Container for displaying songs with available vocals
    const vocalsContainer = document.createElement('div');
    vocalsContainer.className = 'instrumentals-container';
    mainContentArea.appendChild(vocalsContainer);
}

ipcRenderer.on('get-instrumentals-response', (event, { song, exists, instrumentalPath }) => {
    const vocalsContainer = document.getElementById('Instrumentals');

    if (exists) {
        const songEntry = document.createElement('div');
        songEntry.className = 'song-entry';
        songEntry.textContent = `${song} - Instrumental Track Available`;

        const moveBtn = document.createElement('button');
        moveBtn.textContent = 'Move to songs';
        moveBtn.addEventListener('click', () => {
            ipcRenderer.send('move-song-to-mp3', instrumentalPath);
        });
        songEntry.appendChild(moveBtn);

        vocalsContainer.appendChild(songEntry);
    } else {
        console.log(`No vocal track available for ${song}`);
        // Optionally handle the case when vocal track doesn't exist
    }
});

ipcRenderer.on('separation-failed', (event, { songName, error }) => {
    console.error(`Failed to create instrumental for ${songName}: ${error}`);
    // Update the UI to show that the separation failed
});

// Function to call Python logic via IPC for song separation
function separateSongToInstrumental(songName) {
    // Format the expected instrumental file path
    const instrumentalPath = `../audio_input/vocals_instrumentals/${songName} instrumental.wav`;

    // Disable the button for this song to prevent multiple clicks
    document.querySelectorAll('.song-button').forEach(button => {
        if (button.textContent === songName) {
            button.disabled = true;
            button.textContent = `Processing ${songName}...`;
        }
    });

    // Send an IPC message to the main process to separate the instrumental
    ipcRenderer.send('start-separation', { songName, instrumentalPath });
}


function createInstrumentalButtons() {
    const mainContentArea = document.getElementById('main-content');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'song-button-container';
    mainContentArea.appendChild(buttonContainer);

    songs.forEach((song) => {
        const songButton = document.createElement('button');
        songButton.textContent = song;
        songButton.className = 'song-button';
        songButton.addEventListener('click', () => {
            songButton.textContent = `Processing ${song}...`; // Update button text to show processing
            separateSongToInstrumental(song); // Call the processing function
        });
        buttonContainer.appendChild(songButton);
    });
}


// VOCALS
ipcRenderer.on('separate-vocal', (event, { songName, vocalPath }) => {
    const buttonContainer = document.querySelector('.song-button-container');
    const downloadButton = document.createElement('button');
    downloadButton.textContent = `Download ${songName} Vocal`;
    downloadButton.addEventListener('click', () => {
        ipcRenderer.send('download-file', vocalPath);
    });

    // Find the button for this song and replace it with the download button
    document.querySelectorAll('.song-button').forEach(button => {
        if (button.textContent.includes(`Processing ${songName}`)) {
            buttonContainer.replaceChild(downloadButton, button);
        }
    });
});

ipcRenderer.on('separation-failed', (event, { songName, error }) => {
    console.error(`Failed to create instrumental for ${songName}: ${error}`);
    // Update the UI to show that the separation failed
});


function loadVocalSongs() {
    const mainContentArea = document.getElementById('Vocals');
    mainContentArea.innerHTML = '';

    const promptText = document.createElement('p');
    promptText.innerText = "Select a song to separate into vocals:";
    mainContentArea.appendChild(promptText);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'song-button-container';
    mainContentArea.appendChild(buttonContainer);

    // Assuming 'songs' is an array of song names (strings)
    songs.forEach((song) => {
        const songButton = document.createElement('button');
        songButton.textContent = song; // 'song' is the song name
        songButton.className = 'song-button';
        ipcRenderer.send('get-vocals', song);
        console.log('Requesting vocal tracks for:', song);

        songButton.addEventListener('click', () => {

            // Optionally disable the button to prevent multiple clicks
            songButton.disabled = true;
            ipcRenderer.send('separate-instrumental', song);
            songButton.textContent = `Processing ${song}...`;
        });
        buttonContainer.appendChild(songButton);
    });

    // Container for displaying songs with available vocals
    const vocalsContainer = document.createElement('div');
    vocalsContainer.className = 'vocals-container';
    mainContentArea.appendChild(vocalsContainer);
}

ipcRenderer.on('get-vocals-response', (event, { song, exists, vocalPath }) => {
    const vocalsContainer = document.getElementById('Vocals');

    if (exists) {
        const songEntry = document.createElement('div');
        songEntry.className = 'song-entry';
        songEntry.textContent = `${song} - Vocal Track Available`;

        const moveBtn = document.createElement('button');
        moveBtn.textContent = 'Move to songs';
        moveBtn.addEventListener('click', () => {
            ipcRenderer.send('move-song-to-mp3', vocalPath);
        });
        songEntry.appendChild(moveBtn);

        vocalsContainer.appendChild(songEntry);
    } else {
        console.log(`No vocal track available for ${song}`);
        // Optionally handle the case when vocal track doesn't exist
    }
});

// Function to call Python logic via IPC for song separation
function separateSongToVocal(songName) {
    // Format the expected instrumental file path
    const vocalsPath = `../audio_input/vocals_instrumentals/${songName} vocals.wav`;

    // Disable the button for this song to prevent multiple clicks
    document.querySelectorAll('.song-button').forEach(button => {
        if (button.textContent === songName) {
            button.disabled = true;
            button.textContent = `Processing ${songName}...`;
        }
    });

    // Send an IPC message to the main process to separate the instrumental
    ipcRenderer.send('separate-vocal', { songName, vocalsPath });
}
















window.getSongsForPlaylist = function(playlistId, callback) {
    ipcRenderer.send('get-songs', playlistId); // Request songs based on playlistId
    ipcRenderer.once('get-songs-response', (event, songs) => {
        if (typeof callback === 'function') {
            callback(songs); // Invoke the callback with the songs
        }
    });
};

// Function to display playlists
function displayplaylists() {
  const playlistUL = document.getElementById('playlistList');
  playlistUL.innerHTML = '';

  playlists.forEach((playlist) => {
    const li = document.createElement('li');
    li.textContent = playlist.name;
    li.id = playlist.id;
    li.addEventListener('click', function() { 
      displayPlaylistSongs(playlist);
      displayAllSongs(playlist.id);

    });

    playlistUL.appendChild(li);
  });
}

// Function to add a new, editable playlist item
function createPlaylist() {
  const playlistUL = document.getElementById('playlistList');

  const li = document.createElement('li');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'New Playlist Name';
  input.onkeydown = function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
      e.preventDefault();

      // Generate a unique ID for the new playlist
      const playlistId = `playlist-item-${playlists.length}-${Date.now()}`;
      const playlist = {
        id: playlistId,
        name: this.value.trim(),
        songs: [] // Initialize an empty array for songs
      };

      playlists.push(playlist); // Push the new object to the playlists array
      displayplaylists(); // Refresh the playlist display
      this.value = ''; // Optionally clear the input field
    }
  };

  li.appendChild(input);
  playlistUL.appendChild(li);
  input.focus(); // Automatically focus the input field for immediate typing
}

// Function to display the songs for the clicked playlist
function displayPlaylistSongs(playlist) {
  console.log('Received playlist:', playlist); // Log the playlist object received
  const playlistContainer = document.getElementById('playlistSongsContainer'); // This is where the playlist's songs should be displayed
  playlistContainer.innerHTML = '';

  // Display the name of the playlist - this can be a heading or similar
  const playlistNameHeader = document.createElement('h3');
  playlistNameHeader.textContent = playlist.name;
  playlistContainer.appendChild(playlistNameHeader);

  // Now, iterate over the songs of the playlist and create elements for them
  if (playlist && playlist.songs) {
        playlist.songs.forEach((song) => {
            const songDiv = document.createElement('div');
            const songNameSpan = document.createElement('span');
            songNameSpan.textContent = song.name; // Assumes each song has a 'name' property
            songDiv.appendChild(songNameSpan);

            // Create and append the play button for each song
            const playButton = document.createElement('button');
            playButton.textContent = 'Play';
            playButton.addEventListener('click', () => {
                playSong(song.name, playlist.id); // Use song.name or the appropriate identifier for playSong
            });
            songDiv.appendChild(playButton);

            playlistContainer.appendChild(songDiv);
        });
    } else {
        console.error('Invalid playlist or songs array:', playlist);
    }
}

function displayAllSongs(playlistId) {
  const container = document.getElementById('allSongsContainer');
  container.innerHTML = ''; // Clear existing content
  
  songs.forEach((songName) => {
    const songDiv = document.createElement('div');
    songDiv.textContent = songName; // Directly use the songName string
    
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.addEventListener('click', () => {
      const song = { name: songName }; // Create a song object to be compatible with your existing code
      addSongToPlaylist(playlistId, song);
    });

    songDiv.appendChild(addButton);
    container.appendChild(songDiv);
  });
}

function addSongToPlaylist(playlistId, song) {
  const playlist = getPlaylistById(playlistId);
  if (playlist && !playlist.songs.includes(song)) {
    playlist.songs.push(song);
  }
}

function playPlaylistSong(songName, playlistId = null) {
    if (playlistId) {
        currentPlaylist = getPlaylistById(playlistId);
        currentPlaylistIndex = currentPlaylist.songs.findIndex(s => s.name === songName);
        isPlaylistActive = true;
    }
    audioPlayer.src = `../audio_input/songs-mp3/${songName}`;
    audioPlayer.load();
    audioPlayer.play().then(() => {
        updateNowPlaying(songName);
    }).catch(error => {
        console.error("Playback failed", error);
    });
}


function nextSongPlaylist() {
    if (currentPlaylist && currentPlaylist.songs.length > 0) {
        currentPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.songs.length;
        playPlaylistSong(currentPlaylist.songs[currentPlaylistIndex].name, currentPlaylist.id);
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playPlaylistSong(songs[currentSongIndex], null);
    }
}

function previousSongPlaylist() {
    if (currentPlaylist && currentPlaylist.songs.length > 0) {
        currentPlaylistIndex = (currentPlaylistIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length;
        playPlaylistSong(currentPlaylist.songs[currentPlaylistIndex].name, currentPlaylist.id);
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playPlaylistSong(songs[currentSongIndex], null);
    }
}


function getPlaylistById(playlistId) {
  return playlists.find(p => p.id === playlistId);
}

function addSongToPlaylist(playlistId, song) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
      playlist.songs.push(song); // Assuming 'song' is a string or object representing the song
      displayPlaylistSongs(playlist); // Refresh the display; ensure this function is suited for your setup
  }
}





// Function to create a rating element with stars
function songRatingElement(song) {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'rating-container';

    // Create 5 stars, each with an event listener that sets the rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '☆'; // Unfilled star symbol
        star.dataset.rating = i; // Store the rating value on the element for easy access
        
        // Change star appearance on hover
        star.addEventListener('mouseover', function() {
            updateStarDisplay(starsContainer, i); // Update display to show rating on hover
        });

        // Reset star appearance when not hovered
        star.addEventListener('mouseout', function() {
            updateStarDisplay(starsContainer, song.rating); // Reset display to actual rating when not hovering
        });

        // Set the rating when the star is clicked
        star.addEventListener('click', function() {
            song.rating = i; // Update the song object's rating property
            updateStarDisplay(starsContainer, i); // Update display to reflect the clicked rating
            // Update the rating in the `ratings` object and perform any other logic as needed
            //ratings[song.name] = i;
            setRating(song, i);
        });

        starsContainer.appendChild(star);
    }

    // Set the initial display based on the song's current rating
    updateStarDisplay(starsContainer, song.rating);

    return starsContainer;
}

// Function to update the visual display of stars
function updateStarDisplay(starsContainer, rating) {
    const stars = starsContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★'; // Filled star symbol
            star.style.color = 'gold'; // Gold color for filled star
        } else {
            star.textContent = '☆'; // Unfilled star symbol
            star.style.color = 'grey'; // Grey color for unfilled star
        }
    });
}

function setRating(songName, rating) {
    // Check if the song already has a rating and update it
    const existingSongIndex = ratedSongs.findIndex(ratedSong => ratedSong.name === songName);
    if (existingSongIndex !== -1) {
        ratedSongs[existingSongIndex].rating = rating; // Update existing rating
    } else {
        // Add a new song rating
        ratedSongs.push({ name: songName, rating: rating });
    }

    // Update the display
    displayRatedSongs();
}

// Call this function to display ratings for all songs
function displayRatings() {
    const ratingUL = document.getElementById('ratingSongs');
    ratingUL.innerHTML = '';

    songs.forEach((song) => {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-entry';
        songDiv.textContent = song; // Assuming 'song' is a string or has a 'name' property

        

        const rateElement = songRatingElement(song);

        songDiv.appendChild(rateElement);

        ratingUL.appendChild(songDiv);
    });
}

function displayRatedSongs() {
    const ratedUL = document.getElementById('ratedSongs'); // Ensure this is the correct ID for your list element
    ratedUL.innerHTML = ''; // Clear the existing list

    // Display the rated songs with their ratings
    ratedSongs.forEach(song => {
        const ratedDiv = document.createElement('div');
        ratedDiv.className = 'song-entry';

        // Create a container for the song name
        const songNameContainer = document.createElement('div');
        songNameContainer.className = 'song-name';
        songNameContainer.textContent = song.name; 

        // Create a container for the star ratings
        const starsContainer = document.createElement('div');
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = i <= song.rating ? '★' : '☆'; // Filled or empty star based on rating
            star.style.color = i <= song.rating ? 'gold' : 'grey'; // Color the stars appropriately
            starsContainer.appendChild(star);
        }

        ratedDiv.appendChild(songNameContainer);

        // Append the stars container to the rated div
        ratedDiv.appendChild(starsContainer);
        
        // Append the complete rated div to the rated UL
        ratedUL.appendChild(ratedDiv);
    });
}


function albumRatingElement(album) {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'rating-container';

    // Create 5 stars, each with an event listener that sets the rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '☆'; // Unfilled star symbol
        star.dataset.rating = i; // Store the rating value on the element for easy access
        
        // Change star appearance on hover
        star.addEventListener('mouseover', function() {
            updateStarDisplay(starsContainer, i); // Update display to show rating on hover
        });

        // Reset star appearance when not hovered
        star.addEventListener('mouseout', function() {
            updateStarDisplay(starsContainer, album.rating); // Reset display to actual rating when not hovering
        });

        // Set the rating when the star is clicked
        star.addEventListener('click', function() {
            updateStarDisplay(starsContainer, i); // Update display to reflect the clicked rating
            // Update the rating in the `ratings` object and perform any other logic as needed
            //ratings[song.name] = i;
            setAlbumRating(album.name, i);
        });

        starsContainer.appendChild(star);
    }

    // Set the initial display based on the song's current rating
    updateStarDisplay(starsContainer, album.rating);

    return starsContainer;
}

// IPC response handler in renderer.js
ipcRenderer.on('album-metadata-response', (event, { success, metadata }) => {
    if (success) {
        const albumName = metadata.album;
        let album = ratedAlbums.find(a => a.name === albumName);
        if (!album) {
            // Create the album without an initial rating
            album = { name: albumName }; // Removed the rating initialization
            ratedAlbums.push(album);
        }
        // Display albums without waiting for a rating
        displayRatedAlbums(); // Consider renaming this function if it also handles unrated albums
    } else {
        console.error('Failed to fetch album metadata');
    }
});

function setAlbumRating(albumName, newRating) {
    const existingAlbumIndex = ratedAlbums.findIndex(album => album.name === albumName);
    if (existingAlbumIndex !== -1) {
        // Access the album using the index and then update its rating
        ratedAlbums[existingAlbumIndex].rating = newRating;
    } else {
        // If the album doesn't exist in ratedAlbums, add it
        ratedAlbums.push({ name: albumName, rating: newRating });
    }
    displayRatedAlbums(); // Refresh display to reflect the new rating
}

function displayRatedAlbums() {
    const ratedAlbumsContainer = document.getElementById('ratedAlbums');
    ratedAlbumsContainer.innerHTML = '';

    ratedAlbums.forEach(album => {
        const albumEntry = document.createElement('div');
        albumEntry.className = 'album-entry';

        const albumNameContainer = document.createElement('div');
        albumNameContainer.className = 'album-name';
        albumNameContainer.textContent = album.name;

        const starsContainer = albumRatingElement(album); // Ensure this function handles albums without ratings

        albumEntry.appendChild(albumNameContainer);
        albumEntry.appendChild(starsContainer);

        ratedAlbumsContainer.appendChild(albumEntry);
    });
}


// CLEAN

function loadCleanSongs() {
    const mainContentArea = document.getElementById('Clean');
    mainContentArea.innerHTML = '';

    const promptText = document.createElement('p');
    promptText.innerText = "Select a song to make a clean song:";
    mainContentArea.appendChild(promptText);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'song-button-container';
    mainContentArea.appendChild(buttonContainer);

    // Assuming 'songs' is an array of song names (strings)
    songs.forEach((song) => {
        const songButton = document.createElement('button');
        songButton.textContent = song; // 'song' is the song name
        songButton.className = 'song-button';
        ipcRenderer.send('get-clean-songs', song);
        console.log('Requesting clean tracks for:', song);

        songButton.addEventListener('click', () => {

            // Optionally disable the button to prevent multiple clicks
            songButton.disabled = true;
            ipcRenderer.send('cleanse', song);
            songButton.textContent = `Processing ${song}...`;
        });
        buttonContainer.appendChild(songButton);
    });

    // Container for displaying songs with available vocals
    const cleanContainer = document.createElement('div');
    cleanContainer.className = 'clean-container';
    mainContentArea.appendChild(cleanContainer);
}

ipcRenderer.on('get-clean-response', (event, { song, exists, cleanPath }) => {
    const vocalsContainer = document.getElementById('Clean');

    if (exists) {
        const songEntry = document.createElement('div');
        songEntry.className = 'song-entry';
        songEntry.textContent = `${song} - Clean Track Available`;

        const moveBtn = document.createElement('button');
        moveBtn.textContent = 'Move to songs';
        moveBtn.addEventListener('click', () => {
            ipcRenderer.send('move-clean-song', cleanPath);
        });
        songEntry.appendChild(moveBtn);

        vocalsContainer.appendChild(songEntry);
    } else {
        console.log(`No clean track available for ${song}`);
        // Optionally handle the case when vocal track doesn't exist
    }
});

/*
ipcRenderer.on('update-files-response', (event, data) => {
    // Assuming data is structured as {song, instrumentals, vocals, cleans}
    if (data.instrumentals.length > 0) {
        updateUI('instrumentals-container', data.instrumentals);
    }
    if (data.vocals.length > 0) {
        updateUI('vocals-container', data.vocals);
    }
    if (data.cleans.length > 0) {
        updateUI('clean-container', data.cleans);
    }
});
*/

function updateAllContainers() {
    loadSongs();
    loadCleanSongs();   // Reload clean songs
    loadInstrumentalSongs(); // Reload instrumental songs
    loadVocalSongs();   // Reload vocal songs
}
  