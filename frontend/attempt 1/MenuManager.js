var appController = require('./AppController.js')

class MenuManager {
    constructor() {
        this.appController = appController;
        this.initMenuListeners();
    }

    initMenuListeners() {
        // Initialize listeners for menu item clicks
        const menuButtons = document.querySelectorAll('.menu-button'); // Assuming buttons have a 'menu-button' class
        menuButtons.forEach(button => {
            button.addEventListener('click', (event) => this.handleMenuClick(event));
        });
    }

    handleMenuClick(event) {
        const targetId = event.target.getAttribute('data-target'); // Assuming buttons have a 'data-target' attribute pointing to the id of the content to show
        this.showContentById(targetId);
    }

    static showTab(evt, tabName) {
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
            this.songs.forEach(song => {
                const songFullPath = `./audio_input/songs-mp3/${song.name}`;
                ipcRenderer.send('get-album-metadata', { songPath: songFullPath });
            });
            displayRatedAlbums();
        }
        } else {
            console.error(`The tab content element for '${tabName}' was not found.`);
        }
    }

    // You can add more methods here as needed for different UI interactions
}

const menuManager = new MenuManager();
module.exports = menuManager;