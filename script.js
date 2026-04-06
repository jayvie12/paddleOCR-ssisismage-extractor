const statusDiv = document.getElementById('status');
const loader = document.getElementById('loader');
const ui = document.getElementById('ui');
const subTitle = document.getElementById('sub-title');
let results = [];

async function init() {
    try {
        // Check if the script tags actually loaded the 'ocr' object
        if (typeof ocr === 'undefined') {
            subTitle.innerText = "Connecting to AI files...";
            setTimeout(init, 1000);
            return;
        }

        subTitle.innerText = "Loading Model (15MB)...";
        
        // ADDED: Force a specific backend for better compatibility
        await ocr.init({
            backend: 'webgl' // You can change this to 'cpu' if it keeps hanging
        });
        
        loader.style.display = 'none';
        ui.style.display = 'block';
        subTitle.innerText = "Ready for Batch Upload";
    } catch (err) {
        console.error(err);
        subTitle.innerText = "Trying slower backup mode...";
        // Fallback to CPU if GPU (WebGL) fails
        try {
            await ocr.init({ backend: 'cpu' });
            loader.style.display = 'none';
            ui.style.display = 'block';
        } catch(e) {
            subTitle.innerText = "Error: Please use Chrome or Safari app.";
        }
    }
}

// Keep the rest of your fileToImage and downloadBtn logic the same
init();
