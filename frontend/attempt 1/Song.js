class Song {
    constructor(name, rating = 0) {
        this.name = name;
        this.rating = rating;
        // Assuming the songs are located in a specific directory
        this.filePath = `../audio_input/songs-mp3/${this.name}`;
    }

}

const songInstance = new Song();
module.exports = songInstance;