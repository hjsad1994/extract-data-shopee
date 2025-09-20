const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const csvFilePath = path.join(__dirname, 'shopee_comments.csv');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/extract', (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'HTML content is missing.' });
    }

    try {
        const $ = cheerio.load(html);
        const comments = [];
        
        // Find all comment text elements with class YNedDV
        $('.YNedDV').each((i, elem) => {
            const commentText = $(elem).text().trim();
            if (commentText && commentText.length > 5) {
                comments.push({ data: commentText });
            }
        });

        if (comments.length > 0) {
            const fileExists = fs.existsSync(csvFilePath);
            const isFileEmpty = fileExists ? fs.statSync(csvFilePath).size === 0 : true;

            const json2csvParser = new Parser({ fields: ['data'], header: isFileEmpty, quote: '' });
            const csv = json2csvParser.parse(comments);

            if (isFileEmpty) {
                fs.writeFileSync(csvFilePath, csv);
            } else {
                // The `json2csv` library does not add a newline at the end of the parsed CSV,
                // so we add it before appending to the file.
                fs.appendFileSync(csvFilePath, '\n' + csv);
            }
        }
        
        res.json({ message: 'Extraction successful', count: comments.length });

    } catch (error) {
        console.error('Extraction failed:', error);
        res.status(500).json({ error: 'Failed to extract comments from HTML.' });
    }
});

app.get('/api/download', (req, res) => {
    if (fs.existsSync(csvFilePath)) {
        res.download(csvFilePath, 'shopee_comments.csv', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            } else {
                // Auto-clear data after successful download
                try {
                    fs.unlinkSync(csvFilePath);
                    console.log('CSV file deleted after download');
                } catch (deleteErr) {
                    console.error('Error deleting CSV file after download:', deleteErr);
                }
            }
        });
    } else {
        res.status(404).json({ error: 'No data extracted yet. Perform an extraction first.' });
    }
});

app.post('/api/clear', (req, res) => {
    if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
        res.json({ message: 'Extraction data cleared.' });
    } else {
        res.json({ message: 'No data to clear.' });
    }
});

// API endpoint to clear data (can be called after merge operations)
app.post('/api/clear-after-merge', (req, res) => {
    if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
        res.json({ message: 'Data cleared after merge operation.' });
    } else {
        res.json({ message: 'No data to clear.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});