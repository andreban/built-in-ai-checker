import * as semver from 'semver';
import 'colors';

const MIN_MACOS_VERSION = "13.0.0";
const MIN_WINDOWS_VERSION = "10.0.0"; 

export function checkOperatingSystem(os) {
    const osPlatformResult = checkOsPlatform(os);
    const osVersionResult = checkMinOsVersion(os);
    const result = osPlatformResult.result && osVersionResult.result;
    const message = `Operating System: ${result ? 'PASS'.green : 'FAIL'.red}`;

    return {
        id: 'os',
        result: message,
        message: message,
        details: [
            osVersionResult,
            osPlatformResult,
        ],
    }
}

function checkOsPlatform(os) {
    const result =  ['darwin', 'windows', 'linux'].indexOf(os.platform) >= 0;
    const message = result ?
        `${'[✓]'.green} Operating System is ${os.platform}` :
        `${'[✗]'.red} OSs darwin (MacOS), windows and linux are supported but found ${os.platform}`;
    return {
        id: 'os/platform',
        result: result,
        message: message,
    };
}

function checkMinOsVersion(os) {
    let osVersionResult = false;
    switch (os.platform) {
        case 'linux':  {
            osVersionResult = true;
            break;
        }
           
        case 'darwin': {
            osVersionResult = semver.gte(semver.coerce(os.release), MIN_MACOS_VERSION);
            break;
        }

        case 'windows': {
            osVersionResult = semver.gte(semver.coerce(os.release), MIN_WINDOWS_VERSION);
            break;
        }
        default: {
            osVersionResult = false;
            break
        };    
    }

    const message = osVersionResult ?
         `${'[✓]'.green} ${os.distro} version is ${os.release}` :
         `${'[✗]'.red} minium version for ${os.distro} is ${minVersion} but found ${os.release}`;

    return {
        id: 'os/version',
        result: osVersionResult,
        message: message,
    };
}
