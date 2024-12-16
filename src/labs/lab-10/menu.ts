import './menu.css';

function getInput(id: string, formatter: (value: number) => string): HTMLInputElement {
    const input = document.getElementById(id);

    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Element #${id} is not an <input>.`);
    }

    // See if the input has a span next to it, and attach a listener if it does
    const sibling = input.nextElementSibling;
    if (sibling instanceof HTMLSpanElement) {
        sibling.innerHTML = formatter(input.valueAsNumber);
        input.addEventListener('input', () => {
            sibling.innerHTML = formatter(input.valueAsNumber);
        });
    }

    return input;
}

// Replace hyphen with proper minus sign and add a degree symbol
const formatDegrees = (value: number) => value.toFixed(0).replace('-', '&minus;') + '&deg;';
// Add &nbsp to align with degree symbol in monospace font :)
const formatScalar = (value: number) => value.toFixed(2) + '&nbsp;';

export const menu = {
    azimuth: getInput('cam-azimuth', formatDegrees),
    altitude: getInput('cam-altitude', formatDegrees),
    radius: getInput('cam-radius', formatScalar),
};
