class ToggleButton {

    button = document.createElement('button');
    image = document.createElement('img');
    toggled = false;

    toggledImage;
    untoggledImage;

    /**
     * @type { ((toggled: boolean) => void) | undefined }
     */
    onToggle;

    constructor(untoggledImageURL, toggledImageURL, size) {
        this.toggledImage = toggledImageURL;
        this.untoggledImage = untoggledImageURL;

        this.button.append(this.image);
        this.button.style.width = size;
        this.button.style.height = size;

        this.button.addEventListener('click', () => {
            this.toggle();
        })

        this.render();
    }

    render() {
        if(this.toggled) {
            this.image.src = this.toggledImage;
        } else {
            this.image.src = this.untoggledImage;
        }
    }

    toggle(){
        this.toggled = !this.toggled;
        if(this.onToggle) {
            this.onToggle(this.toggled);
        }
        this.render();
    }
}

export { ToggleButton };