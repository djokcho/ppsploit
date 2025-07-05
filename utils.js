// utils.js - Enhanced with PS4-safe inspection
function log(msg, type = 'info') {
    const colors = {
        info: '#00ff00',
        warn: '#ffff00',
        error: '#ff0000',
        debug: '#00ffff',
        memory: '#ff00ff'
    };
    
    const logDiv = document.getElementById('log');
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}`;
    
    const msgElement = document.createElement('div');
    msgElement.style.color = colors[type] || '#ffffff';
    msgElement.textContent = `[${timestamp}] ${msg}`;
    logDiv.appendChild(msgElement);
    
    void msgElement.offsetHeight;
}

// PS4-safe object inspection
window.debugMemory = {
    hexView: function(buffer) {
        try {
            const view = new Uint8Array(buffer);
            let output = '';
            for (let i = 0; i < Math.min(view.length, 16); i++) {
                output += view[i].toString(16).padStart(2, '0') + ' ';
            }
            log(`Memory: ${output}`, 'memory');
        } catch (e) {
            log(`HexView failed: ${e}`, 'error');
        }
    },
    
    inspectObject: function(obj) {
        try {
            if (!obj) {
                log("Object is null/undefined", 'debug');
                return;
            }
            
            log(`Object type: ${typeof obj}`, 'debug');
            
            // Safe constructor check
            if (obj.constructor) {
                log(`Constructor: ${obj.constructor.name || 'unnamed'}`, 'debug');
            }
            
            // Safe properties listing
            try {
                const props = Object.getOwnPropertyNames(obj);
                log(`Properties: ${props.slice(0, 5).join(', ')}${props.length > 5 ? '...' : ''}`, 'debug');
            } catch (e) {
                log(`Property enumeration failed: ${e}`, 'debug');
            }
        } catch (e) {
            log(`Inspection failed: ${e}`, 'error');
        }
    }
};