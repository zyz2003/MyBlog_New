#!/usr/bin/env node

/**
 * @my-blog/cli - CLI entry point
 */

import { initCLI, VERSION } from "./index";

console.log(`@my-blog/cli v${VERSION}`);
initCLI();
