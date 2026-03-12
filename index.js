import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json()); // Allows the server to read JSON from the frontend

async function universalEngine(url, options) {
    const browser = await puppeteer.launch({ headless: "new" }); // "new" is production-ready
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const data = await page.evaluate((opts) => {
            const results = {};
            const container = document.querySelector('main') || document.querySelector('article') || document.querySelector('body');
            
            if (opts.contentType === 'text' || opts.contentType === 'both') {
                const rawText = container ? container.innerText : "";
                const sentences = rawText.split(/[.!?\n]+/);
                results.matches = sentences
                    .map(s => s.trim())
                    .filter(s => s.toLowerCase().includes(opts.keyword.toLowerCase()));
            }

            if (opts.contentType === 'images' || opts.contentType === 'both') {
                results.images = Array.from(document.querySelectorAll('img')).map(img => img.src);
            }
            return results;
        }, options);

        return data;
    } finally {
        await browser.close();
    }
}

// THE API ROUTE
app.post('/api/scrape', async (req, res) => {
    const { url, keyword, contentType } = req.body;

    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const data = await universalEngine(url, { keyword, contentType });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Scraping failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`--- SERVER STARTED ---`);
    console.log(`Listening on: http://localhost:${PORT}`);
    console.log(`To stop the server: Press CTRL + C`);
    console.log(`-----------------------`);
});

process.on('uncaughtException', (err) => {
    console.error('🔥 CRASH DETECTED:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION:', reason);
});