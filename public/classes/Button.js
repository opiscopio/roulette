class Button {

    button;

    constructor(imageURL, size = 48, label) {
        this.button = document.createElement('button');
        this.button.style.display = 'flex';
        this.button.style.flexDirection = 'column';
        this.button.style.alignItems = 'center';
        this.button.style.gap = '4px';
        const image = document.createElement('img');
        image.src = imageURL;
        image.width = size;
        image.height = size;

        this.button.append(image);

        if(label) {
            const labelElement = document.createElement('span');
            labelElement.innerHTML = label;
            labelElement.style.fontWeight = 'medium';
    
            this.button.append(labelElement);
        }


    }
}

export { Button };