// Function to handle all user inputs and bind them to the scene properties
export function handleInput(scene) {
    // Camera selection dropdown
    const cameraSelect = document.getElementById('cameraSelect');
    cameraSelect.addEventListener('change', (event) => {
        // Switch between overview and planet-focused cameras
        if (event.target.value === 'overview') {
            scene.activeCamera = scene.cameras.overviewCamera;
        } else if (event.target.value === 'planet') {
            scene.activeCamera = scene.cameras.planetCamera;
        }
    });

    // Orbit speed slider for Earth
    const earthSpeedSlider = document.getElementById('earthSpeedSlider');
    earthSpeedSlider.addEventListener('input', (event) => {
        // Update Earth orbit speed based on slider value
        const earth = scene.root.children.find(child => child.name === 'Earth');
        if (earth) {
            earth.orbitSpeed = parseFloat(event.target.value);
        }
    });

    // Orbit speed slider for Moon
    const moonSpeedSlider = document.getElementById('moonSpeedSlider');
    moonSpeedSlider.addEventListener('input', (event) => {
        // Update Moon orbit speed based on slider value
        const earth = scene.root.children.find(child => child.name === 'Earth');
        const moon = earth ? earth.children.find(child => child.name === 'Moon') : null;
        if (moon) {
            moon.orbitSpeed = parseFloat(event.target.value);
        }
    });

    // Visibility toggle for Earth
    const toggleEarth = document.getElementById('toggleEarth');
    toggleEarth.addEventListener('change', (event) => {
        const earth = scene.root.children.find(child => child.name === 'Earth');
        if (earth) {
            earth.visible = event.target.checked;
        }
    });

    // Visibility toggle for Moon
    const toggleMoon = document.getElementById('toggleMoon');
    toggleMoon.addEventListener('change', (event) => {
        const earth = scene.root.children.find(child => child.name === 'Earth');
        const moon = earth ? earth.children.find(child => child.name === 'Moon') : null;
        if (moon) {
            moon.visible = event.target.checked;
        }
    });
}
