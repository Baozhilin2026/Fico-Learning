import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function findChrome() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
  ];

  const fs = await import('fs');
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  // Try to find using where command
  try {
    const chromePath = execSync('where chrome', { encoding: 'utf-8' }).trim().split('\n')[0];
    if (chromePath && fs.existsSync(chromePath)) {
      return chromePath;
    }
  } catch (e) {
    // Ignore error
  }

  // Try chrome.exe
  try {
    const chromePath = execSync('where chrome.exe', { encoding: 'utf-8' }).trim().split('\n')[0];
    if (chromePath && fs.existsSync(chromePath)) {
      return chromePath;
    }
  } catch (e) {
    // Ignore error
  }

  return null;
}

async function takeScreenshot() {
  const chromePath = await findChrome();

  if (!chromePath) {
    console.error('Chrome not found. Please install Google Chrome.');
    console.log('Trying to use Edge instead...');

    // Try Edge as fallback
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];

    const fs = await import('fs');
    for (const path of edgePaths) {
      if (fs.existsSync(path)) {
        console.log('Found Edge at:', path);
        return launchWithBrowser(path);
      }
    }

    console.error('Neither Chrome nor Edge found. Please install a browser.');
    return;
  }

  console.log('Found Chrome at:', chromePath);
  return launchWithBrowser(chromePath);
}

async function launchWithBrowser(executablePath) {
  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: false,
      args: ['--start-maximized', '--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for page to load
    await new Promise(r => setTimeout(r, 2000));

    console.log('Current URL:', page.url());

    // Navigate to interview page directly
    console.log('Navigating to /interview...');
    await page.goto('http://localhost:3000/interview', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the page to load completely
    await new Promise(r => setTimeout(r, 5000));

    // Try to find Q15 and scroll it into view
    console.log('Looking for Q15...');

    const q15Found = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const q15Element = elements.find(el => el.textContent && el.textContent.includes('Q15'));

      if (q15Element) {
        q15Element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      return false;
    });

    if (q15Found) {
      console.log('Q15 found and scrolled into view!');
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log('Q15 not found, scrolling through page...');
      // Scroll down a few times
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Expand answer sections to show tables
    console.log('Expanding answer sections...');
    await page.evaluate(() => {
      const collapseHeaders = document.querySelectorAll('.el-collapse-item__header');
      collapseHeaders.forEach((header, index) => {
        if (index < 10) {
          header.click();
        }
      });
    });

    await new Promise(r => setTimeout(r, 2000));

    // Take full page screenshot
    const screenshotPath = join(__dirname, 'interview-screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Take visible screenshot
    const visibleScreenshotPath = join(__dirname, 'interview-screenshot-visible.png');
    await page.screenshot({
      path: visibleScreenshotPath,
      fullPage: false
    });

    console.log(`Visible screenshot saved to: ${visibleScreenshotPath}`);

    // Get page info
    const pageInfo = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const tableData = Array.from(tables).map(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('th, td'));
          return cells.map(cell => cell.textContent.trim());
        });
      });

      return {
        tableCount: tables.length,
        tableData: tableData.slice(0, 2), // First 2 tables
        hasQ15: document.body.textContent.includes('Q15'),
        pageTitle: document.title,
        url: window.location.href
      };
    });

    console.log('Page Info:', JSON.stringify(pageInfo, null, 2));

    await browser.close();

    return pageInfo;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}

takeScreenshot().catch(console.error);
