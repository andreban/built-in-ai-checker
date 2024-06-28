import * as si from 'systeminformation';
import { checkOperatingSystem } from './checks/operating_system.mjs';
import { checkVideoControllers } from './checks/video_controllers.mjs';
import { checkBrowser } from './checks/browser.mjs';

const os = await si.osInfo();
const graphics = await si.graphics();
const osResult = checkOperatingSystem(os);

console.log(`• ${osResult.message}`);
for (const detail of osResult.details) {
    console.log(`\t• ${detail.message}`);
}

const videoControllersResult = checkVideoControllers(graphics);
console.log(`\n• ${videoControllersResult.message}`);
for (const detail of videoControllersResult.details) {
    console.log(`\t• ${detail.message}`);
}

for (const channel of ['stable', 'beta', 'dev', 'canary']) {
    const browserResult = checkBrowser(channel);
    console.log(`\n• ${browserResult.message}`);
    for (const detail of browserResult.details) {
        console.log(`\t• ${detail.message}`);
    }
}
