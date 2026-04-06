import * as ocr from '@paddle-js-models/ocr';

let ocrModel;
let resultsBuffer = [];

// Initialize PaddleOCR Model
async function init() {
    console.log("Loading AI Model...");
    ocrModel = await ocr.load();
    console.log("Model Ready!");
}

async function processImages(files) {
    for (let file of files) {
        const img = await createImageBitmap(file);
        // The actual AI inference happens here on your phone
        const result = await ocrModel.recognize(img);
        
        const text = result.map(item => item.text).join(" ");
        const normalizedData = smartNormalize(text);
        resultsBuffer.push(normalizedData);
    }
    generateCSV();
}

// Your custom logic to merge different field names
function smartNormalize(text) {
    const data = { date: "", total: "", reference: "" };
    
    // Simple regex/keyword mapping (Local Logic)
    if (text.match(/(total|amt|amount|price)\s?[:]\s?([\d.]+)/i)) {
        data.total = text.match(/(total|amt|amount|price)\s?[:]\s?([\d.]+)/i)[2];
    }
    // Add more patterns as needed
    return data;
}

function generateCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Total,Reference\n";
    resultsBuffer.forEach(row => {
        csvContent += `${row.date},${row.total},${row.reference}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "extracted_data.csv");
    document.body.appendChild(link);
    link.click();
}

init();
