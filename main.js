import { MusicPlayer } from './classes/MusicPlayer.js';
import { Player } from './classes/Player.js';
import { Roulette } from './classes/Roulette.js';
import { TournamentRoulette } from './classes/TournamentRoulette.js';

const element = /** @type { HTMLElement } */ (document.getElementById('game'));
const tournamentElement =  /** @type { HTMLElement } */ (document.getElementById('tournament'));
const menu = /** @type { HTMLElement } */ (document.getElementById('menu'));

const singleGame = new Roulette(element);
const tournamentGame = new TournamentRoulette(tournamentElement);

const nameInput = /** @type { HTMLInputElement } */ (document.getElementById('name-input'));

const music = new MusicPlayer([
    './res/music/background-biscuit-bliss.mp3',
    './res/music/background-jazz.mp3'
]);


music.repeat = true;

const initialClickListener = () => {
    music.playSong(0);
    document.removeEventListener('click', initialClickListener);
}

document.addEventListener('click', initialClickListener);

const showSection = (_element) => {
    let elements = [
        menu,
        tournamentElement,
        element
    ]

    elements = elements.filter(__element => __element !== _element); 
    elements.forEach((__element) => {
        __element.style.display = 'none';
    })
    _element.style.display = 'flex';
}

singleGame.onLeave = () => {
    showSection(menu);
};

tournamentGame.onLeave = () => {
    showSection(menu);
};

const modes = {
    single: {
        onStart: () => {          
            showSection(element);
            // setTimeout(() => {
                singleGame.restart();
            // }, 200)
        }
    },
    tournament: {
        onStart: () => {
            console.log(nameInput.value);
            const player = new Player(
                nameInput.value,
                5
            );
            // setTimeout(() => {
            tournamentGame.setCurrentPlayer(player);
            tournamentGame.login(player).then(() => {
                showSection(tournamentElement);
                tournamentGame.restart();
            }).catch(() => {
                alert('Could not connect');
            });
            // }, 200)
        }
    }
}

const playButtons = document.getElementById('modes-list')?.querySelectorAll('button');

playButtons?.forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.dataset.type;
        modes[mode].onStart();
    })
})