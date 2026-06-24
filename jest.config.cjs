/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/test/**/*.test.ts?(x)"],
    setupFiles: ["<rootDir>/test/setup-env.js"],
    setupFilesAfterEnv: ["<rootDir>/test/setup-env.js"],
    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                diagnostics: false,
                tsconfig: {
                    target: "ES2020",
                    module: "CommonJS",
                    moduleResolution: "Node",
                    jsx: "react-jsx",
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    isolatedModules: true,
                },
            },
        ],
    },
    moduleNameMapper: {
        "^next/link$": "<rootDir>/test/mocks/next-link.tsx",
        "^next/navigation$": "<rootDir>/test/mocks/next-navigation.ts",
        "^@repo/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
        "^@repo/middleware/(.*)$": "<rootDir>/packages/middleware/src/$1",
        "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    },
    clearMocks: true,
}
