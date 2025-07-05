# ppsploit
WIP ps4 exploit chain on 11.02 
# what
yeah im rewriting everything okay (im switching to something diffrent: a type confusion thingy?)
# honestly imma give up. but i will say for pepole if u need to know about this - dumbButSkilledDev

# i'm gonna try to continue - djokcho
```
class MyFunction extends Function {
    constructor() {
        super();
        super.prototype = 1;
    }
}

function test1() {
    const f = new MyFunction();
    f.__defineGetter__("prototype", () => {}); // should throw
}

function test2(i) {
    const f = new MyFunction();
    try { f.__defineGetter__("prototype", () => {}); } catch {}
    f.prototype.x = i; // THIS cauases the OOM
}

test1();
test2(0);
```
