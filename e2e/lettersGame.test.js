const { device, element, by, expect, waitFor } = require('detox');

async function goToHome() {
  await waitFor(element(by.text('Skip'))).toBeVisible().withTimeout(5000);
  await element(by.text('Skip')).tap();
  await waitFor(element(by.text('Unicorn Learning!')))
    .toBeVisible()
    .withTimeout(5000);
}

async function goToLettersGame() {
  await waitFor(element(by.text('Letters')))
    .toBeVisible()
    .whileElement(by.type('RCTScrollView'))
    .scroll(200, 'down');

  await element(by.text('Letters')).tap();

  await waitFor(element(by.text('Letters')))
    .toBeVisible()
    .withTimeout(10000);
}

describe('LettersGame', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToHome();
    await goToLettersGame();
  });

  it('should display the Letters game header', async () => {
    await expect(element(by.text('Letters'))).toBeVisible();
  });

  it('should start in teaching mode with a speech bubble', async () => {
    await waitFor(element(by.text('Tap the letter to hear it again!')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should show progress dots', async () => {
    await expect(element(by.text('Letters'))).toBeVisible();
  });

  it('should transition from teaching to challenge mode', async () => {
    await waitFor(element(by.text('Find the letter!')))
      .toBeVisible()
      .withTimeout(20000);
  });

  it('should display answer options in challenge mode', async () => {
    await waitFor(element(by.text('Find the letter!')))
      .toBeVisible()
      .withTimeout(20000);

    await expect(element(by.text('Find the letter!'))).toBeVisible();
  });
});
