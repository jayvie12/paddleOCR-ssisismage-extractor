let ocrModel;
let resultsBuffer = [];

// 1. Initialize the AI when the page loads
async function initOCR() {
    const status = document.getElementById('status');
    try {
        status.innerText = "Loading AI models... please wait.";
        // Initialize the paddlejs ocr
        ocrModel = await ocr.init(); 
        status.innerText = "AI Ready! Select your images.";
    } catch (e) {
        console.error(e);
        status.innerText = "Error loading AI. Check your internet connection.";
    }
}

// 2. Handle the file selection
document.getElementById('imageInput').addEventListener('change', async (event) => {
    const files = event.target.files;
    const status = document.getElementById('status');
    const downloadBtn = document.getElementById('downloadBtn');

    if (files.length === 0) return;

    status.innerHTML = `<span class="processing">Processing ${files.length} images...</span>`;
    resultsBuffer = []; // Clear previous data

    for (let i = 0; i < files.length; i++) {
        try {
            const file = files[i];
            const imageUrl = URL.createObjectURL(file);
            
            // Create a temporary image element for the AI to "see"
            const img = new Image();
            img.src = imageUrl;
            
            await new Promise((resolve) => {
                img.onload = async () => {
                    // RUN THE AI
                    const result = await ocr.recognize(img);
                    const text = result.join(" ");
                    
                    // NORMALIZE (Your smart logic)
                    const data = smartNormalize(text);
                    resultsBuffer.push(data);
                    
                    status.innerText = `Processed ${i + 1} of ${files.length}...`;
                    URL.revokeObjectURL(imageUrl); // Clean up memory
                    resolve();
                };
            });
        } catch (err) {
            console.error("Error on image " + i, err);
        }
    }

    status.innerText = "All images processed!";
    downloadBtn.style.display = "block";
});

function smartNormalize(text) {
    // Look for numbers that look like prices
    const priceMatch = text.match(/(\d+\.\d{2})/); 
    // Look for dates
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);

    return {
        date: dateMatch ? dateMatch[0] : "N/A",
        total: priceMatch ? priceMatch[0] : "0.00",
        raw: text.substring(0, 50) + "..." // Small preview
    };
}

function downloadCSV() {
    let csv = "Date,Total,Preview\n";
    resultsBuffer.forEach(row => {
        csv += `${row.date},${row.total},"${row.raw.replace(/"/g, '""')}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_export_${new Date().getTime()}.csv`;
    a.click();
}

document.getElementById('downloadBtn').addEventListener('click', downloadCSV);

// Start the engine
initOCR();
