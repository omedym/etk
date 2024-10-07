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
    '**/*.{spec,test}.{ts,tsx}',
    // '**/*.unit.{spec,test}.{ts,tsx}',
    '!**/*.{integration,service}.{spec,test}.{ts,tsx}',
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
          "jsx": "react",
          "module": "CommonJS",
          "moduleResolution": "Node",
          "resolveJsonModule": true,
          "rootDir": ".",
          // "skipDefaultLibCheck": false,
          "skipLibCheck": true,
          "strict": true,
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
