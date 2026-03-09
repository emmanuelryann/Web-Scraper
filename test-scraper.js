import puppeteer from 'puppeteer';

async function runTestScrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
    
    // Grabbing the title
    const pageTitle = await page.$eval('h1', el => el.innerText);
    console.log("Found Title:", pageTitle);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

runTestScrape();