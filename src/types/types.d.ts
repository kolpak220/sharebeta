// global.d.ts or types.d.ts
export {};

declare global {
    interface Window {
        AndroidBridge?: {
            copyToClipboard(text: string): void;
            // Add other methods if you add them to WebAppInterface later
            // pasteFromClipboard?(): string;
        };
    }
}