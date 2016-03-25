const mocha = require('mocha');
const flow = require('../flow.js');
const sinon = require('sinon');
const chai = require('chai').should();
const sinonChai = require('sinon-chai');
const assert = require('assert');
require('chai').use(sinonChai);

describe('Tests for serial', () => {
    it('Should not work if got []', () => {
        var spy = sinon.spy();
        flow.serial([], spy);

        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(null, null);
    });

    it('Should call function once if got one function', (done) => {
        var spy = sinon.spy(() => {
            spy.should.have.been.calledOnce;
            done();
        });
        var f = getAsyncFunctions(1);

        flow.serial(f, spy);
    });

    it('Should call all functions once', (done) => {
        var spy = sinon.spy(() => {
            funcs[0].should.have.been.calledOnce;
            funcs[1].should.have.been.calledOnce;
            done();
        });
        var funcs = getAsyncFunctions(2);

        flow.serial(funcs, spy);
    });

    it('Should call functions in correct order', (done) => {
        var spy = sinon.spy(() => {
            funcs[1].should.have.been.calledAfter(funcs[0]);
            done();
        });
        var funcs = getAsyncFunctions(2);

        flow.serial(funcs, spy);
    });

    it('Should call second function with correct arguments', (done) => {
        var spy = sinon.spy(() => {
            funcs[1].args[0][0].should.be.equal(1);
            funcs[1].args[0][1].should.be.an.instanceof(Function);
            done();
        });
        var funcs = getAsyncFunctions(2);

        flow.serial(funcs, spy);
    });

    it ('Should return error', done => {
        var spy = sinon.spy(() => {
            spy.should.have.been.threw;
            done();
        });
        var funcs = getAsyncFunctions(2, new Error('test error'));

        flow.serial(funcs, spy);
    });

    it ('Should call first function with error and should not call second function', done => {
        var spy = sinon.spy(() => {
            funcs[1].should.have.been.callCount(0);
            done();
        });
        var funcs = getAsyncFunctions(2, new Error('test error'));

        flow.serial(funcs, spy);
    });
});

describe('Tests for parallel', () => {
    it('Should not work if got []', () => {
        var spy = sinon.spy();
        flow.parallel([], spy);

        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(null, null);
    });

    it('Should call function once if got one function', (done) => {
        var spy = sinon.spy(() => {
            spy.should.have.been.calledOnce;
            done();
        });
        var func = getAsyncFunctions(1);

        flow.parallel(func, spy);
    });

    it('Should call all functions once', (done) => {
        var spy = sinon.spy(() => {
            funcs[0].should.have.been.calledOnce;
            funcs[1].should.have.been.calledOnce;
            done();
        });
        var funcs = getAsyncFunctions(2, null, true);

        flow.parallel(funcs, spy);
    });

    it('Should return result when all functions fulfilled', (done) => {
        var spy = sinon.spy(() => {
            spy.should.have.been.calledAfter(funcs[0]);
            spy.should.have.been.calledAfter(funcs[1]);
            done();
        });
        var funcs = getAsyncFunctions(2, null, true);

        flow.parallel(funcs, spy);
    });

    it('Should return correct result', (done) => {
        var spy = sinon.spy((err, data) => {
            data.should.be.deep.equal([1, 2]);
            done();
        });
        var funcs = getAsyncFunctions(2, null, true);

        flow.parallel(funcs, spy);
    });

    it('Should return error', (done) => {
        var spy = sinon.spy(() => {
            spy.should.have.been.threw;
            if (spy.callCount === funcs.length) {
                done();
            }
        });
        var funcs = getAsyncFunctions(2, new Error('test error'), true);

        flow.parallel(funcs, spy);
    });

    it('Should call first function with error and should not call second function', done => {
        var spy = sinon.spy(() => {
            funcs[1].should.have.been.callCount(0);
            done();
        });
        var funcs = getAsyncFunctions(2, new Error('test error'), true);

        flow.serial(funcs, spy);
    });
});

describe('Tests for map', () => {
    it('Should not work if got []', () => {
        var spy = sinon.spy();
        flow.map([], getAsyncFunction(), spy);

        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(null, null);
    });

    it('Should call function with arguments in correct order', (done) => {
        var spy = sinon.spy(() => {
            func.should.have.been.calledWith(args[0]);
            func.should.have.been.calledWith(args[1]);
            func.should.have.been.calledWith(args[2]);
            done();
        });
        var args = getArguments(3);
        var func = getAsyncFunction();

        flow.map(args, func, spy);
    });

    it('Should return correct result', (done) => {
        var spy = sinon.spy(() => {
            spy.should.have.been.calledAfter(func);
            spy.args[0][1].should.be.deep.equal(args);
            done();
        });
        var args = getArguments(3);
        var func = getAsyncFunction();

        flow.map(args, func, spy);
    });

    it('Should return error', (done) => {
        var spy = sinon.spy((err) => {
            if (err) {
                spy.should.have.been.threw;
            }
            if (spy.callCount === args.length) {
                done();
            }
        });
        var args = getArguments(3);
        var func = getAsyncFunction(new Error('test error'));

        flow.map(args, func, spy);
    })
});

function getAsyncFunction(error) {
    var err = error || null;
    return sinon.spy((data, cb) => {
        setTimeout(() => cb(err, data), 200);
    })
}

function getArguments(count) {
    var args = [];
    var max = 5;
    var min = 1;
    for (var i = 0; i < count; i++) {
        args.push(Math.floor(Math.random() * (max - min)) + min);
    }
    return args;
}

function getAsyncFunctions(count, error, withoutData) {
    var err = error || null;
    var data = withoutData || false;

    if (count === 0) {
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
}
