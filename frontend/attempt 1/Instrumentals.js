// Instrumentals.js

class Instrumentals {
    constructor() {
        // Initialization if needed
    }

    loadInstrumentalSongs(songs) {
        // Assume 'songs' is passed as a parameter
        const mainContentArea = document.getElementById('Instrumentals');
        mainContentArea.innerHTML = ''; // Clear previous content

        const promptText = document.createElement('p');
        promptText.innerText = "Select a song to separate into instrumentals:";
        mainContentArea.appendChild(promptText);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'song-button-container';
        mainContentArea.appendChild(buttonContainer);

        songs.forEach(song => {
            const songButton = document.createElement('button');
            songButton.textContent = song;
            songButton.className = 'song-button';
            songButton.addEventListener('click', () => {
                appController.separateSongToInstrumental(song); // Call AppController method
                songButton.disabled = true;
                songButton.textContent = `Processing ${song}...`;
            });
            buttonContainer.appendChild(songButton);
        });
    }

    handleInstrumentalCreated(songName, instrumentalPath) {
        console.log(`Instrumental created for ${songName}: ${instrumentalPath}`);
        // Update UI to reflect that instrumental has been created
    }

    handleSeparationFailed(error) {
        console.error('Separation failed:', error);
        // Update UI to reflect that the separation failed
    }
}

// Assuming this class needs to be used in other parts of the renderer process
module.exports = Instrumentals;
