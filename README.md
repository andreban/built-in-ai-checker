# Prompt API Checker

This project checks the device for compatibility with the Prompt API that Chrome is currently
experimenting with in early access.

## Running the checker
- Clone the repo and cd into the directory.
- Ensure Node.js 21.1.0 or above is installed.
- run `npm install`.
- run `npm start` to get a report.

## Checks performed

### Device checks
- Operating system is Windows, Linux or MacOS.
- Operating system version is at least Windows 10 or MacOS 13, there are no checks for Linux version.
- Device has at least 4GB Video RAM or dynamic VRAM.
- Device has at least 22GB of available disk space.

### Browser checks
- Chrome `dev` or `canary` channels are installed.
- The version of Chrome is at least `127.0.6512.0`.
- The `optimization-guide-on-device-model` flag is set to `Enabled BypassPerfRequirement`.
- The `prompt-api-for-gemini-nano` is set to `Enabled`.

