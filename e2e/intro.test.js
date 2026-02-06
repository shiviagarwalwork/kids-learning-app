const { device, element, by, expect, waitFor } = require('detox');

describe('IntroScreen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the intro screen on app launch', async () => {
    await waitFor(element(by.text("Hi there, friend! I'm Siyara the Unicorn!")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display the Skip button', async () => {
    await expect(element(by.text('Skip'))).toBeVisible();
  });

  it('should advance through intro messages', async () => {
    await waitFor(element(by.text("Hi there, friend! I'm Siyara the Unicorn!")))
      .toBeVisible()
      .withTimeout(5000);

    await waitFor(element(by.text('Welcome to Unicorn Learning!')))
      .toBeVisible()
      .withTimeout(8000);
  });

  it('should show the "Let\'s Play!" button after the intro sequence', async () => {
    await waitFor(element(by.text("Let's Play!")))
      .toBeVisible()
      .withTimeout(20000);
  });

  it('should navigate to Home when "Skip" is tapped', async () => {
    await element(by.text('Skip')).tap();

    await waitFor(element(by.text('Unicorn Learning!')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to Home when "Let\'s Play!" is tapped', async () => {
    await waitFor(element(by.text("Let's Play!")))
      .toBeVisible()
      .withTimeout(20000);

    await element(by.text("Let's Play!")).tap();

    await waitFor(element(by.text('Unicorn Learning!')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
