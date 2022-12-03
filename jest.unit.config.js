module.exports = {
  preset: 'ts-jest',

  // collectCoverage: true,
  coverageDirectory: process.env.COVERAGE_DIR,
  coverageReporters: [ "text-summary", "lcov" ],
  haste: {
    enableSymlinks: true,
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '**/*.{test}.{ts,tsx}',
    // '**/*.unit.{spec,test}.{ts,tsx}',
    '!**/*.{integration}.{test}.{ts,tsx}',
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
          "composite": true,
          "declaration": true,
          "emitDecoratorMetadata": true,
          "esModuleInterop": true,
          "experimentalDecorators": true,
          "forceConsistentCasingInFileNames": true,
          // "importHelpers": true,
          "incremental": true,
          "inlineSourceMap": true,
          "lib": ["ESNext"],
          "module": "CommonJS",
          "moduleResolution": "Node",
          "resolveJsonModule": true,
          "rootDir": ".",
          // "skipDefaultLibCheck": false,
          // "skipLibCheck": false,
          "strict": false,
          "strictNullChecks": true,
          "strictPropertyInitialization": false,
          "target": "ESNext",
          // "types": ["Node"],
          "noImplicitAny": true,
          "noImplicitReturns": true,
        },
      },
    ],
  },
  verbose: false,
  coverageThreshold: {
    global: {
      // branches: 50,
      // functions: 15,
      // lines: 50,
      // statements: -10,
    },
  },
};
