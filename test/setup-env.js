// React 19 expects test environments that use act() to opt in before React DOM loads.
// Keeping this in setupFilesAfterEnv ensures RTL/userEvent interactions do not emit act-environment warnings.
globalThis.IS_REACT_ACT_ENVIRONMENT = true
global.IS_REACT_ACT_ENVIRONMENT = true
