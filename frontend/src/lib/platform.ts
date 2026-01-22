// Platform detection - Web compatible version
export const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
export const isIOS = false; // Only for actual iOS app builds
export const isAndroid = false; // Only for actual Android app builds
export const isMobile = false; // For web/desktop version, always false

