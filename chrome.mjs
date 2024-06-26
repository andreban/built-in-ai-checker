import { channel } from 'diagnostics_channel';
import * as os from 'os';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

// Chrome's user profile directory base path on Windows.
const ENV_LOCAL_APP_DATA = 'LOCALAPPDATA';
const ENV_PROGRAM_FILES = 'PROGRAMFILES';

export const RELEASE_CHANNELS = ["stable", "beta", "dev", "canary"];

export function getChromeExecutable(releaseChannel) {
    if (RELEASE_CHANNELS.indexOf(releaseChannel) < 0) {
        throw new Error('Unknown release channel', channel);
    }
    const platform = os.platform();
    switch (platform) {
        case 'darwin': {
            switch (releaseChannel) {
                case 'stable': return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
                case 'beta': return ['/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta'];
                case 'dev': return ['/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev'];
                case 'canary': return ['/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'];
            }
        }
        case 'win32': {
            const localAppData = process.env[ENV_LOCAL_APP_DATA];
            const baseDirectory = process.env[ENV_PROGRAM_FILES];
            switch (releaseChannel) {
                case 'stable': return [
                    `${baseDirectory}\\Google\\Chrome\\Application\\chrome.exe`,
                    `${localAppData}\\Google\\Chrome\\Application\\chrome.exe`,
                ];
                case 'beta': return [
                    `${baseDirectory}\\Google\\Chrome Beta\\Application\\chrome.exe`,
                    `${localAppData}\\Google\\Chrome Beta\\Application\\chrome.exe`,
                ];
                case 'dev': return [
                    `${baseDirectory}\\Google\\Chrome Dev\\Application\\chrome.exe`,
                    `${localAppData}\\Google\\Chrome Dev\\Application\\chrome.exe`,
                ];
                case 'canary': return [
                    `${baseDirectory}\\Google\\Chrome SxS\\Application\\chrome.exe`,
                    `${localAppData}\\Google\\Chrome SxS\\Application\\chrome.exe`,
                ];
            }            
        }
        case 'linux': {
            switch (releaseChannel) {
                case 'stable': return ['/opt/google/chrome/chrome'];
                case 'beta': return ['/opt/google/chrome-beta/chrome'];
                case 'dev': return ['/opt/google/chrome-unstable/chrome'];
            }            
        }
        default: return null;
    }
}

export function getChromeVersion(path) {
    let versionString;
    // On Windows, chrome.exe does not have a --version flag, and instead launches the browser.
    if (os.platform() === 'win32') {
        versionString = execFileSync('powershell.exe', [`(Get-Item "${path}").VersionInfo`], {stdio: 'pipe', encoding: 'utf8'});
    } else {
        versionString = execFileSync(path, ['--version'], {stdio: 'pipe', encoding: 'utf8'});
    }    

    const match = versionString.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
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

export function getChromeHome(channel) {
    const platform = os.platform();
    const home = os.homedir();
    
    switch (platform) {
        case 'darwin': {
            switch (channel) {
                case 'stable': return `${home}/Library/Application\ Support/Google/Chrome`;
                case 'beta': return `${home}/Library/Application\ Support/Google/Chrome Beta`;
                case 'dev': return `${home}/Library/Application\ Support/Google/Chrome Dev`;
                case 'canary': return `${home}/Library/Application\ Support/Google/Chrome Canary`;
            }
        }
        case 'win32': {
            const localAppData = process.env[ENV_LOCAL_APP_DATA];
            switch (channel) {
                case 'stable': return `${localAppData}\\Google\\Chrome\\User Data`;
                case 'beta': return `${localAppData}\\Google\\Chrome Beta\\User Data`;
                case 'dev': return `${localAppData}\\Google\\Chrome Dev\\User Data`;
                case 'canary': return `${localAppData}\\Google\\Chrome SxS\\User Data`;
            }
        }
        case 'linux': {
            switch (channel) {
                case 'stable': return `${home}/.config/google-chrome`;
                case 'beta': return `${home}/.config/google-chrome-beta`;
                case 'dev': return `${home}/.config/google-chrome-unstable`;
            }
        }
    }

    return null;
}
export function getFlags(channel) {
    const chromeHome = getChromeHome(channel);
    const localStateFilePath = chromeHome + '/Local State';

    if (!fs.existsSync(localStateFilePath)) {
        throw new Error('Unable to find flags file ' + localStateFilePath);
    }

    const localStateFileContent = fs.readFileSync(localStateFilePath, {encoding: 'utf-8'});
    const localStateJson = JSON.parse(localStateFileContent);
    return localStateJson.browser['enabled_labs_experiments'] || [];
}
