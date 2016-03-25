'use strict';

module.exports.serial = function (fArray, callback) {
    if (fArray.length === 0) {
        callback(null, null);
    } else {
        var i = 0;
        fArray[i](cb);
    }

    function cb(err, data) {
        if (err) {
            callback(err);
        } else {
            i += 1;
            if (fArray.length > i) {
                fArray[i](data, cb);
            } else {
                callback(null, data);
            }
        }
    }
};

module.exports.parallel = function (fArray, callback) {
    if (fArray.length === 0) {
        callback(null, null);
    }

    var result = [];
    var i = 0;
    fArray.forEach(function (elem) {
        elem(cb);
    });

    function cb(error, data) {
        if (error) {
            callback(error);
        }

        result.push(data);
        if (result.length === fArray.length) {
            callback(error, result);
        }
    }
};

module.exports.map = function (vArray, func, callback) {
    if (vArray.length === 0) {
        callback(null, null);
    }
    var result = [];
    vArray.forEach(function (elem) {
        func(elem, function (error, data) {
            if (error) {
                callback(error);
            }
            result.push(data);
            if (result.length === vArray.length) {
                callback(error, result);
            }
        });
    });
};
