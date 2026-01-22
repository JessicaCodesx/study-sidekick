// Platform-specific database exports
import { isMobile } from './platform';

// Always use mobile database for iOS app
export * from './db-mobile';

// For web compatibility, re-export from web
if (!isMobile) {
  export {
    // Re-export the original IndexedDB functions
    initDB as initDBWeb,
    add as addWeb,
    get as getWeb,
    getAll as getAllWeb,
    update as updateWeb,
    remove as removeWeb,
  } from './db-web';
}
