const element = /** @type { HTMLElement } */ (document.getElementById('game'));
const tournamentElement =  /** @type { HTMLElement } */ (document.getElementById('tournament'));
const menu = /** @type { HTMLElement } */ (document.getElementById('menu'));

const singleGame = new Roulette(element);
const tournamentGame = new Roulette(tournamentElement, 'tournament');

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
            showSection(tournamentElement);
            // setTimeout(() => {
                tournamentGame.restart();
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