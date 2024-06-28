const MIN_AVAILABLE_VRAM = 4096; // VRAM is reported in megabytes.

export function checkVideoControllers(graphics) {
    const details = graphics.controllers.map(checkAvailableVram);
    const result = details.some(detail => detail.result === true);
    const message = `Video RAM: ${result ? 'PASS'.green : 'FAIL'.red}`;
    
    return {
        id: 'graphics',
        result: result,
        details: details,
        message: message,
    }
}

function checkAvailableVram(controller) {
    const result = controller.vramDynamic || controller.vram >= MIN_AVAILABLE_VRAM;
    const controllerName = `${controller.vendor}-${controller.model}-${controller.bus}`;
    const controllerMemory = `${controller.vramDynamic ? 'Dynamic' : controller.vram}`;

    const message = result ?
        `${'[✓]'.green} ${controllerName} memory is ${controllerMemory}` :
        `${'[!]'.yellow} ${controllerName} memory is ${controllerMemory}, but at least ${MIN_AVAILABLE_VRAM} is required`;
    return {
        id: 'graphics/vram',
        result: result,
        message: message,
    };
}