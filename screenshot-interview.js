import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for the page to load
    await page.waitForTimeout(2000);

    console.log('Current URL:', page.url());

    // Check if we're on the authorization page
    if (page.url().includes('/authorization')) {
      console.log('On authorization page, checking if already authenticated...');

      // Wait a bit to see if we get redirected
      await page.waitForTimeout(3000);
      console.log('URL after wait:', page.url());
    }

    // Navigate to interview page
    console.log('Navigating to /interview...');
    await page.goto('http://localhost:3000/interview', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Scroll down to find Q15
    console.log('Looking for Q15...');

    // Try to find Q15 by scrolling and searching
    let foundQ15 = false;
    let scrollCount = 0;
    const maxScrolls = 20;

    while (!foundQ15 && scrollCount < maxScrolls) {
      // Check if Q15 is visible in the page
      const q15Exists = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.some(el => el.textContent && el.textContent.includes('Q15'));
      });

      if (q15Exists) {
        console.log('Q15 found on page!');
        foundQ15 = true;

        // Scroll Q15 into view
        await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          const q15Element = elements.find(el => el.textContent && el.textContent.includes('Q15'));
          if (q15Element) {
            q15Element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

        await page.waitForTimeout(1000);
        break;
      }

      // Scroll down
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(1000);
      scrollCount++;
    }

    // If Q15 not found, try searching for any table content
    if (!foundQ15) {
      console.log('Q15 not found, looking for any table content...');
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
    }

    // Try to expand the answer section to see tables
    console.log('Attempting to expand answer sections...');
    await page.evaluate(() => {
      // Click on all collapse headers to expand answers
      const collapseHeaders = document.querySelectorAll('.el-collapse-item__header');
      collapseHeaders.forEach((header, index) => {
        if (index < 5) { // Expand first 5 items
          header.click();
        }
      });
    });

    await page.waitForTimeout(2000);

    // Take a screenshot
    const screenshotPath = join(__dirname, 'interview-screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Also take a screenshot of just the visible area
    const visibleScreenshotPath = join(__dirname, 'interview-screenshot-visible.png');
    await page.screenshot({
      path: visibleScreenshotPath,
      fullPage: false
    });

    console.log(`Visible screenshot saved to: ${visibleScreenshotPath}`);

    // Get some info about the page content
    const pageInfo = await page.evaluate(() => {
      const hasTables = document.querySelectorAll('table').length > 0;
      const tableCount = document.querySelectorAll('table').length;
      const questionTags = Array.from(document.querySelectorAll('.el-tag')).map(el => el.textContent).slice(0, 10);
      const hasQ15 = document.body.textContent.includes('Q15');

      return {
        hasTables,
        tableCount,
        questionTags,
        hasQ15,
        pageTitle: document.title,
        url: window.location.href
      };
    });

    console.log('Page Info:', JSON.stringify(pageInfo, null, 2));

  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot().catch(console.error);
