class Vocal {
    constructor(delegate) {
        this.delegate = delegate;
    }

    separateVocals(songName) {
        if (this.delegate && typeof this.delegate.separateVocals === 'function') {
            this.delegate.separateVocals(songName);
        } else {
            console.error("Delegate not set or doesn't support separating vocals.");
        }
    }

    // Additional methods related to vocals...
}
