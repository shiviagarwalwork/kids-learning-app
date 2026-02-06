const { device, element, by, expect, waitFor } = require('detox');

describe('HomeScreen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.text('Skip'))).toBeVisible().withTimeout(5000);
    await element(by.text('Skip')).tap();
    await waitFor(element(by.text('Unicorn Learning!')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display the app title', async () => {
    await expect(element(by.text('Unicorn Learning!'))).toBeVisible();
  });

  it('should display the stars counter', async () => {
    await expect(element(by.text('Stars'))).toBeVisible();
  });

  it('should display the speech bubble', async () => {
    await expect(element(by.text("Let's play and learn!"))).toBeVisible();
  });

  // --- Math Games section ---
  it('should display the "Math Games" section title', async () => {
    await expect(element(by.text('Math Games'))).toBeVisible();
  });

  it('should display the Numbers game tile', async () => {
    await expect(element(by.text('Numbers'))).toBeVisible();
  });

  it('should display the Addition game tile', async () => {
    await expect(element(by.text('Addition'))).toBeVisible();
  });

  it('should display the Subtraction game tile', async () => {
    await waitFor(element(by.text('Subtraction')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Pop Bubbles game tile', async () => {
    await waitFor(element(by.text('Pop Bubbles')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  // --- Reading Games section ---
  it('should display the "Reading Games" section title', async () => {
    await waitFor(element(by.text('Reading Games')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Letters game tile', async () => {
    await waitFor(element(by.text('Letters')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Find Letter game tile', async () => {
    await waitFor(element(by.text('Find Letter')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Reading game tile', async () => {
    await waitFor(element(by.text('Reading')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Shapes game tile', async () => {
    await waitFor(element(by.text('Shapes')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  // --- Fun Learning section ---
  it('should display the "Fun Learning" section title', async () => {
    await waitFor(element(by.text('Fun Learning')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Colors game tile', async () => {
    await waitFor(element(by.text('Colors')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Counting game tile', async () => {
    await waitFor(element(by.text('Counting')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  // --- Friends section ---
  it('should display the friends section', async () => {
    await waitFor(element(by.text('Tap to meet our Friends!')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });
});
