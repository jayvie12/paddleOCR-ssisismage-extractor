// Use the global 'paddlejs' and 'ocr' objects provided by the CDN
const statusDiv = document.getElementById('status');
const subHeader = document.getElementById('sub-header');
const loader = document.getElementById('loader-spinner');
const mainUI = document.getElementById('main-ui');

async function startEngine() {
    try {
        // Wait for the library to exist in the window
        if (typeof ocr === 'undefined') {
            setTimeout(startEngine, 500); // Try again in half a second
            return;
        }

        await ocr.init(); 
        
        // Hide loader and show UI
        loader.style.display = 'none';
        subHeader.innerText = "Private Local Processing";
        mainUI.style.display = 'block';
        console.log("OCR Engine Loaded successfully.");

    } catch (err) {
        console.error("Initialization failed:", err);
        subHeader.innerText = "Error: Use a modern browser like Chrome/Safari";
    }
}

document.getElementById('imageInput').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    statusDiv.innerText = `Processing 0/${files.length}...`;
    let csvData = [["Date", "Total", "Raw Text"]];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = await createImageElement(file);
        
        // Inference
        const result = await ocr.recognize(img);
        const fullText = result.join(" ");
        
        // Simple extraction logic
        const total = (fullText.match(/(\d+\.\d{2})/) || ["0.00"])[0];
        csvData.push([new Date().toLocaleDateString(), total, fullText.substring(0, 50)]);

        statusDiv.innerText = `Processing ${i + 1}/${files.length}...`;
    }

    statusDiv.innerText = "Done! Download your CSV below.";
    setupDownload(csvData);
});

async function createImageElement(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function setupDownload(data) {
    const btn = document.getElementById('downloadBtn');
    btn.style.display = "block";
    btn.onclick = () => {
        const csvContent = data.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "tabulated_data.csv";
        a.click();
    };
}

// Kick off the loading process
startEngine();
