// Album.js
class Album {
    constructor(name, delegate) {
        this.name = name;
        this.delegate = delegate;
    }

    // Example method that needs to initiate an IPC call
    fetchAlbumDetails() {
        if (this.delegate && typeof this.delegate.fetchAlbumDetails === 'function') {
            this.delegate.fetchAlbumDetails(this.name);
        }
    }

    // Other album-related methods...
}
