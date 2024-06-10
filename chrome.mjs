import { channel } from 'diagnostics_channel';
import * as os from 'os';
import { execFileSync } from 'child_process';

export const RELEASE_CHANNELS = ["stable", "beta", "dev", "canary"];

export function getChromeExecutable(releaseChannel) {
    if (RELEASE_CHANNELS.indexOf(releaseChannel) < 0) {
        throw new Error('Unknown release channlel', channel);
    }
    const platform = os.platform();
    switch (platform) {
        case 'darwin': {
            switch (releaseChannel) {
                case 'stable': return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                case 'beta': return '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta';
                case 'dev': return '/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev';
                case 'canary': return '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
            }
        }
        case 'win32': {
            const baseDirectory = process.env['PROGRAMFILES'];
            switch (releaseChannel) {
                case 'stable': return `${baseDirectory}\\Google\\Chrome\\Application\\chrome.exe`;
                case 'beta': return `${baseDirectory}\\Google\\Chrome Beta\\Application\\chrome.exe`;
                case 'dev': return `${baseDirectory}\\Google\\Chrome SxS\\Application\\chrome.exe`;
                case 'canary': return `${baseDirectory}\\Google\\Chrome Dev\\Application\\chrome.exe`;
            }            
        }
        case 'linux': {
            switch (channel) {
                case 'stable': return '/opt/google/chrome/chrome';
                case 'beta': return '/opt/google/chrome-beta/chrome';
                case 'dev': return '/opt/google/chrome-unstable/chrome';
            }            
        }
        default: return null;
    }
}

export function getChromeVersion(path) {
    const versionString = execFileSync(path, ['--version'], {stdio: 'pipe', encoding: 'utf8'});
    const match = versionString.match(/(\d+).(\d+).(\d+).(\d+)/);
    if (!match) {
        throw new Error("Unable to find version string");
    }

    return [match[1], match[2], match[3], match[4]];
}

export function gteVersion(v1, v2) {
    for (let i = 0; i < 4; i++) {
        // v1 is smaller than v2.
        if (v1[i] < v2[i]) {
            return true;
        }

        // v1 is larger than v2.
        if (v1[i] > v2[i]) {
            return false;
        }
    }
    // All numbers are the same, return true.
    return true;
}