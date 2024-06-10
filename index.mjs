import { getChromeExecutable, getChromeVersion, gteVersion } from './chrome.mjs';
import * as fs from 'fs';
import * as si from 'systeminformation';
import * as semver from 'semver';

const ONE_GIGABYTE = 1024 * 1024 * 1024;
const MIN_AVAILABLE_DISK_SPACE = 22 * ONE_GIGABYTE; // 22 GB.
const MIN_AVAILABLE_VRAM = 4 * ONE_GIGABYTE; // 4GB.
const MIN_MACOS_VERSION = "13.0.0";
const MIN_WINDOWS_VERSION = "10.0.0"; 
const MIN_CHROME_VERSION = [127, 0, 6512, 0];

const os = await si.osInfo();
const graphics = await si.graphics();
const fileSystems = await si.fsSize();
const chromes = findChromes();

console.log('Hardware Checks\n===============\n')
// Check if OS is supported.
const osSupported = ['darwin', 'windows', 'linux'].indexOf(os.platform) >= 0;
console.log(`OS: ${os.distro} => ${osSupported}`);

const osVersionSupported = checkMinOsVersion();
console.log(`OS Version: ${os.release} => ${osVersionSupported}`);

let vramSupported = false;
for (let controller of graphics.controllers) {
    const supported = checkAvailableVram(controller);
    if (!vramSupported && supported) {
        vramSupported = supported;
    }
    console.log(`VRAM: ${controller.vendor} / ${controller.model} / ${controller.bus} / ${controller.vramDynamic ? 'Dynamic' : controller.vram} => ${supported}`);
}
console.log(`VRAM => ${vramSupported}`)

const diskSpaceOk = fileSystems.find(fs => fs.available >= MIN_AVAILABLE_DISK_SPACE) !== undefined;
console.log(`Disk Space => ${diskSpaceOk}`);

console.log('\n\nBrowser Checks\n==============\n')
for (let chrome of findChromes()) {
    console.log(`Channel: ${chrome.channel}; version: ${chrome.version.join('.')}; supported: ${chrome.versionOk}`)
}

function findChromes() {
    return ['stable', 'beta', 'dev', 'canary']
        .map(channel => {
            const executablePath = getChromeExecutable(channel);
            return { channel: channel, executablePath: executablePath};
        })
        .filter(chrome => fs.existsSync(chrome.executablePath))
        .map(chrome => {
            const version = getChromeVersion(chrome.executablePath);
            const versionOk = gteVersion(MIN_CHROME_VERSION, version);
            return {...chrome, version: version, versionOk: versionOk};
        });    
}

function checkMinOsVersion() {
    switch (os.platform) {
        case 'linux': return true;
        case 'darwin': return semver.gte(semver.coerce(os.release), MIN_MACOS_VERSION);
        case 'windows': return semver.gte(semver.coerce(os.release), MIN_WINDOWS_VERSION);
        default: return false;    
    }    
}

function checkAvailableVram(controller) {
    return graphics.controllers.find(graphics => controller.vramDynamic || controller.vram >= MIN_AVAILABLE_VRAM) !== undefined;
}