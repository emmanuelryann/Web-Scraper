import puppeteer from 'puppeteer';

async function universalEngine(url, options = { contentType: 'text', keyword: '' }) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 1. CONTENT SELECTION: Decide what to grab
        let data = {};
        
        if (options.contentType === 'text' || options.contentType === 'both') {
            // Grab all text from the main body
            const rawText = await page.$eval('body', el => el.innerText);
            
            // 2. KEYWORD EXTRACTION: Filter the text
            if (options.keyword) {
                const sentences = rawText.split(/[.!?]+/);
                data.matches = sentences.filter(s => 
                    s.toLowerCase().includes(options.keyword.toLowerCase())
                );
            } else {
                data.fullText = rawText.substring(0, 1000); // Limit for testing
            }
        }

        if (options.contentType === 'images' || options.contentType === 'both') {
            data.images = await page.$$eval('img', imgs => imgs.map(img => img.src));
        }

        return data;

    } catch (error) {
        console.error("Engine Error:", error);
    } finally {
        await browser.close();
    }
}

// TEST IT: Search for "Prototype" on a page
(async () => {
    const results = await universalEngine('https://developer.mozilla.org/en-US/docs/Web/JavaScript', {
        contentType: 'both', // Testing both text and images!
        keyword: 'prototype'
    });

    console.log("--- SCRAPE RESULTS ---");
    console.log("Keyword Matches:", results.matches);
    console.log("Images Found:", results.images ? results.images.length : 0);
})();