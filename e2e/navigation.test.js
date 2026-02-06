const { device, element, by, expect, waitFor } = require('detox');

async function goToHome() {
  await waitFor(element(by.text('Skip'))).toBeVisible().withTimeout(5000);
  await element(by.text('Skip')).tap();
  await waitFor(element(by.text('Unicorn Learning!')))
    .toBeVisible()
    .withTimeout(5000);
}

describe('Navigation - Navigate to each game and back', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToHome();
  });

  it('should navigate to Numbers game and back', async () => {
    await waitFor(element(by.text('Numbers')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text('Numbers')).tap();

    await waitFor(element(by.text('Numbers')))
      .toBeVisible()
      .withTimeout(10000);

    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Addition game and back', async () => {
    await waitFor(element(by.text('Addition')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text('Addition')).tap();
    await waitFor(element(by.text('Addition')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Subtraction game and back', async () => {
    await waitFor(element(by.text('Subtraction')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Subtraction')).tap();
    await waitFor(element(by.text('Subtraction')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Pop Bubbles game and back', async () => {
    await waitFor(element(by.text('Pop Bubbles')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Pop Bubbles')).tap();
    await waitFor(element(by.text('Pop Bubbles')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Letters game and back', async () => {
    await waitFor(element(by.text('Letters')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Letters')).tap();
    await waitFor(element(by.text('Letters')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Find Letter game and back', async () => {
    await waitFor(element(by.text('Find Letter')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Find Letter')).tap();
    await waitFor(element(by.text('Find Letter')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Reading game and back', async () => {
    await waitFor(element(by.text('Reading')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Reading')).tap();
    await waitFor(element(by.text('Reading')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Shapes game and back', async () => {
    await waitFor(element(by.text('Shapes')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Shapes')).tap();
    await waitFor(element(by.text('Shapes')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Colors game and back', async () => {
    await waitFor(element(by.text('Colors')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Colors')).tap();
    await waitFor(element(by.text('Colors')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should navigate to Counting game and back', async () => {
    await waitFor(element(by.text('Counting')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
    await element(by.text('Counting')).tap();
    await waitFor(element(by.text('Counting')))
      .toBeVisible()
      .withTimeout(10000);
    await device.reloadReactNative();
    await goToHome();
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });
});
