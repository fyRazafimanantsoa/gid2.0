import { test, expect } from '@playwright/test';

test('open gallery, add template and verify editor shows template title', async ({ page, context }) => {
  // Listen to console messages
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit more
  await page.waitForTimeout(2000);
  
  // Check for #root element
  const root = page.locator('#root');
  console.log('Root element found:', await root.count() > 0);
  
  // Get HTML  
  const html = await page.content();
  const hasReact = html.includes('React');
  const hasRoot = html.includes('id="root"');
  const hasApp = html.includes('App');
  console.log('HTML contains React:', hasReact);
  console.log('HTML contains root:', hasRoot);
  console.log('HTML contains App:', hasApp);
  console.log('HTML length:', html.length);
  
  // Check if there are any elements at all
  const allElements = await page.locator('*').count();
  console.log('Total elements on page:', allElements);
  
  // Get root element HTML
  const rootHtml = await root.innerHTML();
  console.log('Root innerHTML length:', rootHtml.length);
});
