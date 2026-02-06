/** @type {import('detox').DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : 'trace',
  },
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/UnicornLearning.app',
      build:
        'xcodebuild -workspace ios/UnicornLearning.xcworkspace -scheme UnicornLearning -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/UnicornLearning.app',
      build:
        'xcodebuild -workspace ios/UnicornLearning.xcworkspace -scheme UnicornLearning -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro',
        os: 'iOS 26.2',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
  },
};
