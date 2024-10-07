module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
  ],
  coverageDirectory: process.env.COVERAGE_DIR,
  haste: {
    enableSymlinks: true,
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    // '**/*.{spec,test}.{ts,tsx}',
    // '**/*.unit.{spec,test}.{ts,tsx}',
    '**/*.integration.test.{ts,tsx}',
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // tsconfig: 'tsconfig.bazel.json',
        // KEEP IN SYNC WITH `tsconfig.bazel.json`
        tsconfig: {
          "allowSyntheticDefaultImports": true,
          "baseUrl": ".",
          "composite": false,
          "declaration": true,
          "emitDecoratorMetadata": true,
          "esModuleInterop": true,
          "experimentalDecorators": true,
          "forceConsistentCasingInFileNames": true,
          // "importHelpers": true,
          "incremental": true,
          "inlineSourceMap": true,
          // TODO: latest code doesn't build because the usage of `Blob` somewhere
          // in the dependency graph. By now we simply add "DOM" api, but ideally
          // we should figure out why this is being used at the server side.
          "lib": [
            "ESNext",
            "DOM"
          ],
          "module": "CommonJS",
          "moduleResolution": "Node",
          "resolveJsonModule": true,
          "rootDir": ".",
          // "skipDefaultLibCheck": false,
          // "skipLibCheck": false,
          "strict": true,
          "strictPropertyInitialization": true,
          "target": "ESNext"
          //"types": ["node"]
        },
      },
    ],
  },
  verbose: false,
};
