class ChipButton {

    amount;

    onClick;

    button;

    constructor(amount, imageURL) {
        const SIZE_PX = 104;
        const button = document.createElement('button');
        button.classList.add('chip-button');
        button.style.width = SIZE_PX + 'px';
        button.style.height = SIZE_PX + 'px';
        if(imageURL) {
            const img = document.createElement('img');
            img.src = imageURL;
            img.width = SIZE_PX;
            img.height = SIZE_PX;
            img.style.position = 'absolute';
            img.style.top = '0px';
            img.style.left = '0px';
            const label = document.createElement('span');
            label.classList.add('chip-number');
            label.innerHTML = amount;
            button.append(img);
            button.append(label);
        } else {
            button.style.borderRadius = '100px';
            button.style.background = 'green';
            button.style.border = '6px dashed white';
            button.style.width = '104px';
            button.style.height = '104px';
            button.style.fontSize = '2rem';
            button.innerHTML = amount;
        }
        button.addEventListener('click', () => {
            if(this.onClick) {
                this.onClick(amount);
            }
        })

        this.button = button;
    }

    setActive() {
        this.button.classList.add('active-chip');
    }

    setInactive() {
        this.button.classList.remove('active-chip');
    }
}

export { ChipButton };