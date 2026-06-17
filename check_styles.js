const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1500);

  const rects = await page.evaluate(() => {
    const shopLink = Array.from(document.querySelectorAll('.nav-link')).find(el => el.textContent.includes('SHOP'));
    const hero = document.querySelector('.hero');
    const editorial = document.querySelector('.hero-editorial');
    const content = document.querySelector('.hero-editorial-content');
    const button = document.querySelector('.btn-primary');

    return {
      shopLink: shopLink ? shopLink.getBoundingClientRect() : null,
      hero: hero ? hero.getBoundingClientRect() : null,
      editorial: editorial ? editorial.getBoundingClientRect() : null,
      content: content ? content.getBoundingClientRect() : null,
      button: button ? button.getBoundingClientRect() : null,
      bodyWidth: document.body.clientWidth,
      computedStyles: {
        hero: window.getComputedStyle(hero).display,
        editorial: {
          display: window.getComputedStyle(editorial).display,
          paddingLeft: window.getComputedStyle(editorial).paddingLeft,
          paddingRight: window.getComputedStyle(editorial).paddingRight,
          marginLeft: window.getComputedStyle(editorial).marginLeft,
          alignItems: window.getComputedStyle(editorial).alignItems,
        },
        content: {
          width: window.getComputedStyle(content).width,
          maxWidth: window.getComputedStyle(content).maxWidth,
          marginLeft: window.getComputedStyle(content).marginLeft,
        }
      }
    };
  });

  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
