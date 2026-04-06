// --- script.js ---
let ocrModel;
let resultsBuffer = [];

const statusDiv = document.getElementById('status');
const subHeader = document.getElementById('sub-header');
const loader = document.getElementById('loader-spinner');
const mainUI = document.getElementById('main-ui');

// 1. Diagnostic Start
async function startEngine() {
    console.log("Checking dependencies...");
    
    // Check if CDN scripts actually loaded
    if (typeof paddlejs === 'undefined' || typeof ocr === 'undefined') {
        subHeader.innerText = "Connection slow... retrying scripts.";
        setTimeout(startEngine, 3000); // Wait 3 seconds and try again
        return;
    }

    try {
        subHeader.innerText = "Waking up Mobile GPU...";
        
        // Timeout protection: If AI doesn't load in 15 seconds, show error
        const timeout = setTimeout(() => {
            if (!ocrModel) {
                subHeader.innerText = "Wait time exceeded. Try refreshing or use Chrome.";
                loader.style.borderColor = "red";
            }
        }, 15000);

        // Actual Initialization
        await ocr.init(); 
        
        clearTimeout(timeout);
        ocrModel = true; // Mark as ready
        
        // Success: Show UI
        loader.style.display = 'none';
        subHeader.innerText = "Private Local AI Active";
        mainUI.style.display = 'block';
        statusDiv.innerText = "Ready for batch processing.";

    } catch (err) {
        console.error("Inference Error:", err);
        subHeader.innerText = "Hardware not supported. Try turning off 'Battery Saver' mode.";
    }
}

// 2. Optimized Image Handling for Mobile
document.getElementById('imageInput').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    statusDiv.innerHTML = `<span class="processing">AI is reading ${files.length} images...</span>`;
    let csvRows = [["Date", "Extracted Data"]];

    for (let i = 0; i < files.length; i++) {
        try {
            const file = files[i];
            const img = await blobToImage(file);
            
            // Run recognition
            const result = await ocr.recognize(img);
            const text = result.join(" ").replace(/,/g, ""); // Clean commas for CSV
            
            csvRows.push([new Date().toLocaleDateString(), text]);
            statusDiv.innerText = `Processed ${i + 1} of ${files.length}`;
        } catch (ocrErr) {
            console.log("Skipping image " + i);
        }
    }

    statusDiv.innerText = "Batch Complete!";
    setupDownload(csvRows);
});

// Helper: Converts file to image safely on mobile
function blobToImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (f) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = f.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function setupDownload(data) {
    const btn = document.getElementById('downloadBtn');
    btn.style.display = "block";
    btn.onclick = () => {
        const content = data.map(row => row.join(",")).join("\n");
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Batch_Report_${Date.now()}.csv`;
        a.click();
    };
}

// Start
startEngine();
