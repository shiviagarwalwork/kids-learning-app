const { device, element, by, expect, waitFor } = require('detox');

async function goToHome() {
  await waitFor(element(by.text('Skip'))).toBeVisible().withTimeout(5000);
  await element(by.text('Skip')).tap();
  await waitFor(element(by.text('Unicorn Learning!')))
    .toBeVisible()
    .withTimeout(5000);
}

async function goToSettings() {
  // Settings button is an icon with no text/testID - use coordinate tap
  // iPhone 17 Pro: button at top-right, approximately x=360, y=80
  await device.tap({ x: 360, y: 80 });
  await waitFor(element(by.text('Settings')))
    .toBeVisible()
    .withTimeout(5000);
}

describe('SettingsScreen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToHome();
    await goToSettings();
  });

  it('should display the Settings title', async () => {
    await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('should display the "Your Progress" section', async () => {
    await expect(element(by.text('Your Progress'))).toBeVisible();
  });

  it('should display progress stats (Stars, Points, Access)', async () => {
    await expect(element(by.text('Stars'))).toBeVisible();
    await expect(element(by.text('Points'))).toBeVisible();
    await expect(element(by.text('Access'))).toBeVisible();
  });

  it('should display the "Sound" section title', async () => {
    await expect(element(by.text('Sound'))).toBeVisible();
  });

  it('should display the Background Music toggle', async () => {
    await expect(element(by.text('Background Music'))).toBeVisible();
  });

  it('should display the Sound Effects toggle', async () => {
    await expect(element(by.text('Sound Effects'))).toBeVisible();
  });

  it('should display the Voice Narration toggle', async () => {
    await expect(element(by.text('Voice Narration'))).toBeVisible();
  });

  it('should toggle Background Music switch', async () => {
    const musicSwitch = element(by.type('RCTSwitch')).atIndex(0);
    await expect(musicSwitch).toBeVisible();
    await musicSwitch.tap();
    await musicSwitch.tap();
    await expect(musicSwitch).toBeVisible();
  });

  it('should toggle Sound Effects switch', async () => {
    const soundSwitch = element(by.type('RCTSwitch')).atIndex(1);
    await expect(soundSwitch).toBeVisible();
    await soundSwitch.tap();
    await soundSwitch.tap();
    await expect(soundSwitch).toBeVisible();
  });

  it('should toggle Voice Narration switch', async () => {
    const voiceSwitch = element(by.type('RCTSwitch')).atIndex(2);
    await expect(voiceSwitch).toBeVisible();
    await voiceSwitch.tap();
    await voiceSwitch.tap();
    await expect(voiceSwitch).toBeVisible();
  });

  it('should display the "About" section', async () => {
    await waitFor(element(by.text('About')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Privacy Policy button', async () => {
    await waitFor(element(by.text('Privacy Policy')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the Version label', async () => {
    await waitFor(element(by.text('Version')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the "Data" section with Reset button', async () => {
    await waitFor(element(by.text('Reset All Progress')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should display the footer text', async () => {
    await waitFor(element(by.text('Made with love for little learners')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');
  });

  it('should show Privacy Policy alert when tapped', async () => {
    await waitFor(element(by.text('Privacy Policy')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');

    await element(by.text('Privacy Policy')).tap();

    await waitFor(element(by.text('Privacy Policy')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.text('OK')).tap();
  });

  it('should show Reset Progress confirmation alert when tapped', async () => {
    await waitFor(element(by.text('Reset All Progress')))
      .toBeVisible()
      .whileElement(by.type('RCTScrollView'))
      .scroll(200, 'down');

    await element(by.text('Reset All Progress')).tap();

    await waitFor(element(by.text('Reset Progress?')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.text('Cancel')).tap();

    await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('should navigate back to Home when back button is tapped', async () => {
    // Back button is an icon at top-left, approximately x=42, y=80
    await device.tap({ x: 42, y: 80 });

    await waitFor(element(by.text('Unicorn Learning!')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
