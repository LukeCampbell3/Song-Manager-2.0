class RatingManager {
    constructor() {
        this.ratedSongs = [];
    }

    // Creates a rating element with stars for a song or album
    createRatingElement(item) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'rating-container';

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '☆'; // Unfilled star symbol
            star.dataset.rating = i;
            
            star.addEventListener('mouseover', () => this.updateStarDisplay(starsContainer, i));
            star.addEventListener('mouseout', () => this.updateStarDisplay(starsContainer, item.rating));
            star.addEventListener('click', () => this.setRating(item, i));

            starsContainer.appendChild(star);
        }

        this.updateStarDisplay(starsContainer, item.rating);
        return starsContainer;
    }

    // Updates the visual display of the stars based on the rating
    updateStarDisplay(starsContainer, rating) {
        const stars = starsContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.textContent = index < rating ? '★' : '☆'; // Filled or unfilled star
            star.style.color = index < rating ? 'gold' : 'grey';
        });
    }

    // Sets the rating for a song or album and updates the display
    setRating(item, rating) {
        item.rating = rating;

        // Assuming there's a mechanism to update the displayed list of rated songs/albums
        this.displayRatedItems();
    }

    // Displays the rated songs or albums (you might need to implement or adjust this method based on your UI)
    displayRatedItems() {
        const ratedUL = document.getElementById('ratedSongs'); // Ensure this is the correct ID for your list element
        ratedUL.innerHTML = ''; // Clear the existing list
    
        // Iterate over the ratedSongs array to display each rated song
        this.ratedSongs.forEach(song => {
            const ratedDiv = document.createElement('div');
            ratedDiv.className = 'song-entry';
    
            // Create a container for the song name
            const songNameContainer = document.createElement('div');
            songNameContainer.className = 'song-name';
            songNameContainer.textContent = song.name;
    
            // Use the existing createRatingElement method to generate the stars container
            // This ensures consistency with the event listeners and visual update logic
            const starsContainer = this.createRatingElement(song);
    
            // Append the song name and stars container to the ratedDiv
            ratedDiv.appendChild(songNameContainer);
            ratedDiv.appendChild(starsContainer);
    
            // Append the complete rated div to the ratedUL
            ratedUL.appendChild(ratedDiv);
        });
    }    
}

// Export the RatingManager class so it can be used elsewhere in your project
module.exports = RatingManager;
