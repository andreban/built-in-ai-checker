import * as fs from 'fs';
import 'colors';
import { getChromeExecutable, getChromeHome, getChromeVersion, getFlags, gteVersion } from '../chrome.mjs';

const ONE_GIGABYTE = 1024 * 1024 * 1024;
const MIN_AVAILABLE_DISK_SPACE = 22 * ONE_GIGABYTE; // 22 GB.
const MIN_CHROME_VERSION = [127, 0, 6512, 0];
const FLAG_OPTIMIZATION_GUIDE_ON_DEVICE_MODEL = {
    name: 'optimization-guide-on-device-model',
    requiredValue: 'optimization-guide-on-device-model@2',
    requiredValueName: 'Enabled BypassPerRequirement',
};
const FLAG_PROMPT_API_FOR_GEMINI_NANO = {
    name: 'prompt-api-for-gemini-nano',
    requiredValue: 'prompt-api-for-gemini-nano@1',
    requiredValueName: 'Enabled',
};

export function checkBrowser(channel) {
    const executablePath = getChromeExecutable(channel);

    // This Chrome channel is not installed.
    if (!fs.existsSync(executablePath)) {
        let message = `Chrome ${channel}: ${'NOT_FOUND'.gray}`;
        return {
            id: `browser/${channel}`,
            result: false,
            message: message,
            details: [],
        }        
    }

    const channelResult = checkChannel(channel);
    const browserVersionResult = checkBrowserVersion(channel, executablePath);
    const flagOptimizationGuideResult = checkBrowserFlag(channel, FLAG_OPTIMIZATION_GUIDE_ON_DEVICE_MODEL);
    const flagPromptApiResult = checkBrowserFlag(channel, FLAG_PROMPT_API_FOR_GEMINI_NANO);
    const storageAvailableResult = checkStorageAvailable(channel);

    const result = channelResult.result &&
            browserVersionResult.result &&
            flagOptimizationGuideResult.result &&
            flagPromptApiResult.result &&
            storageAvailableResult.result;

    let message = `Chrome ${channel}: ${result ? 'PASS'.green : 'FAIL'.red}`;
    return {
        id: `browser/${channel}`,
        result: true,
        message: message,
        details: [
            channelResult,
            browserVersionResult,
            flagOptimizationGuideResult,
            flagPromptApiResult,
            storageAvailableResult,
        ],
    }
}

function checkBrowserVersion(channel, executablePath) {
    const version = getChromeVersion(executablePath);
    const result = gteVersion(MIN_CHROME_VERSION, version);
    const message = result ?
        `${'[✓]'.green} version is ${version.join('.')}`:
        `${'[✗]'.red} version is ${version.join('.')}, but ${MIN_CHROME_VERSION.join('.')} version is required.`;

    return {
        id: `browser/${channel}/version`,
        result: result,
        message: message,
    }
}

function checkBrowserFlag(channel, flag) {
    const flags = getFlags(channel);
    const result = flags.some(f => f === flag.requiredValue);
    const message = result ?
        `${'[✓]'.green} flag ${flag.name} is set to ${flag.requiredValueName}.`:
        `${'[✗]'.red} flag ${flag.name} is NOT set to ${flag.requiredValueName}.`;

    return {
        id: `browser/${channel}/flag/${flag.name}`,
        result: result,
        message: message,
    }
}

function checkChannel(channel) {
    const result = channel == 'dev' || channel == 'canary';
    const message = result ? 
        `${'[✓]'.green} Channel is ${channel}.`:
        `${'[✗]'.red} Channel is ${channel}, but only dev and canary are supported.`;
    return {
        id: `browser/${channel}/channel`,
        result: result,
        message: message,
    }
}

function checkStorageAvailable(channel) {
    const chromeHome = getChromeHome(channel);
    const statFs = fs.statfsSync(chromeHome);
    const bytesfree = statFs.bavail * statFs.bsize;

    const result = bytesfree >= MIN_AVAILABLE_DISK_SPACE;
    const bytesFreeGB = (bytesfree / ONE_GIGABYTE).toFixed(2);
    const requiredFreeGB = (MIN_AVAILABLE_DISK_SPACE / ONE_GIGABYTE).toFixed(2);
    const message = result ?
        `${'[✓]'.green} ${chromeHome} has ${bytesFreeGB} GB free.` : `${'[✗]'.red} ${chromeHome} has ${bytesFreeGB} GB free, but required is ${requiredFreeGB} GB.`;

    return {
        id: `browser/${channel}/storage`,
        result: true,
        message: message,
    }
}
