module.exports = function getArguments(count) {
    var max = 5;
    var min = 1;
    return Array.from(new Array(count), () => {
        Math.floor(Math.random() * (max - min) + min)
    });
};

module.exports = function getAsyncFunction(error) {
    var err = error || null;
    return sinon.spy((data, cb) => {
        setTimeout(() => cb(err, data), 200);
    })
};

module.exports = function getAsyncFunctions(count, error, withoutData) {
    var err = error || null;
    var data = withoutData || false;

    if (!count) {
        return [];
    }

    var functions = [];
    functions.push(sinon.spy(cb => {
        setTimeout(() => cb(err, 1), 200);
    }));
    for (var i = 1; i < count; i++) {
        if (!data) {
            functions.push(sinon.spy((data, cb) => {
                setTimeout(() => cb(null, data), 200);
            }));
        } else {
            functions.push(sinon.spy((cb) => {
                setTimeout(() => cb(null, 2), 200);
            }));
        }
    }

    return functions;
};
