export class MusicPlayer {

    queue = [];
    currentlyPlaying = 0;

    repeat = true;

    /**
     * @type { HTMLAudioElement[] }
     */
    songs = [];

    constructor(files) {
        this.songs = files.map(file => new Audio(file));
        this.songs.forEach(song => {
            song.volume = 0.2
            song.addEventListener('ended', this.onEnded);
        })
    }

    playNextSong() {
        const nextIndex = this.currentlyPlaying + 1;
        const actualNextIndex = nextIndex <= this.songs.length ? nextIndex : 0;
        this.playSong(actualNextIndex);
    }

    onEnded() {
        if(this.repeat) {
            this.playNextSong();
        }
    }

    playSong(index) {
        this.currentlyPlaying = index;
        this.songs[index].play();
    }
}