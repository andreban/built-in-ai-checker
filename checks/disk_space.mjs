const ONE_GIGABYTE = 1024 * 1024 * 1024;
const MIN_AVAILABLE_DISK_SPACE = 22 * ONE_GIGABYTE; // 22 GB.

export function checkDiskSpace(fileSystems) {
    const details = fileSystems.map(fs => {
        const result = fs.available >= MIN_AVAILABLE_DISK_SPACE;
        const available = (fs.available / ONE_GIGABYTE).toFixed(2);
        const required = (MIN_AVAILABLE_DISK_SPACE / ONE_GIGABYTE).toFixed(2);
        const message = result ?
            `${'[✓]'.green} ${fs.mount} has ${available} GB disk space free.` :
            `${'[!]'.yellow} ${fs.mount} has ${available} GB disk space free, but minimum required is ${required} GB.`;
        return {
            id: `fs/${fs.name}`,
            result: result,
            message: message,
        };
    });

    const result = details.some(detail => detail.result === true);
    const message = `Disk space: ${result ? 'PASS'.green : 'FAIL'.red}`;
    return {
        id: 'fs',
        result: result,
        message: message,
        details: details,
    }
}