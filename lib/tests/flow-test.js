'use strict';

const mocha = require('mocha');
const flow = require('../flow.js');
const sinon = require('sinon');
const chai = require('chai').should();
const sinonChai = require('sinon-chai');
const assert = require('assert');
const generate = require('./generateFunctions.js');
require('chai').use(sinonChai);

describe('Tests for serial', () => {
    it('Should not work if got []', () => {
        var spy = sinon.spy();
        flow.serial([], spy);

        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(null, null);
    });

    it('Should call function once if got one function', (done) => {
        var f = generate.getAsyncFunctions(1);

        flow.serial(f, sinon.spy(() => {
            spy.should.have.been.calledOnce;
            done();
        }));
    });

    it('Should call all functions once', (done) => {
        var funcs = generate.getAsyncFunctions(2);

        flow.serial(funcs, sinon.spy(() => {
            funcs[0].should.have.been.calledOnce;
            funcs[1].should.have.been.calledOnce;
            done();
        }));
    });

    it('Should call functions in correct order', (done) => {
        var funcs = generate.getAsyncFunctions(2);

        flow.serial(funcs, sinon.spy(() => {
            funcs[1].should.have.been.calledAfter(funcs[0]);
            done();
        }));
    });

    it('Should call second function with correct arguments', (done) => {
        var funcs = generate.getAsyncFunctions(2);

        flow.serial(funcs, sinon.spy(() => {
            funcs[1].args[0][0].should.be.equal(1);
            funcs[1].args[0][1].should.be.an.instanceof(Function);
            done();
        }));
    });

    it ('Should return error', (done) => {
        var funcs = generate.getAsyncFunctions(2, new Error('test error'));

        flow.serial(funcs, sinon.spy((err) => {
            if (err) {
                return;
            }

            spy.should.have.been.threw;
            done();
        }));
    });

    it ('Should call first function with error and should not call second function', (done) => {
        var funcs = generate.getAsyncFunctions(2, new Error('test error'));

        flow.serial(funcs, sinon.spy(() => {
            funcs[1].should.have.been.callCount(0);
            done();
        }));
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
        var func = generate.getAsyncFunctions(1);

        flow.parallel(func, sinon.spy(() => {
            spy.should.have.been.calledOnce;
            done();
        }));
    });

    it('Should call all functions once', (done) => {
        var funcs = generate.getAsyncFunctions(2, null, true);

        flow.parallel(funcs, sinon.spy(() => {
            funcs[0].should.have.been.calledOnce;
            funcs[1].should.have.been.calledOnce;
            done();
        }));
    });

    it('Should return result when all functions fulfilled', (done) => {
        var funcs = generate.getAsyncFunctions(2, null, true);

        flow.parallel(funcs, sinon.spy(() => {
            spy.should.have.been.calledAfter(funcs[0]);
            spy.should.have.been.calledAfter(funcs[1]);
            done();
        }));
    });

    it('Should return correct result', (done) => {
        var funcs = generate.getAsyncFunctions(2, null, true);

        flow.parallel(funcs, sinon.spy((err, data) => {
            data.should.be.deep.equal([1, 2]);
            done();
        }));
    });

    it('Should return error', (done) => {
        var funcs = generate.getAsyncFunctions(2, new Error('test error'), true);

        flow.parallel(funcs, sinon.spy((err) => {
            spy.should.have.been.threw; // ================================================================================
            if (spy.callCount === funcs.length) {
                done();
            }
        }));
    });

    it('Should call first function with error and should not call second function', (done) => {
        var funcs = generate.getAsyncFunctions(2, new Error('test error'), true);

        flow.serial(funcs, sinon.spy(() => {
            funcs[1].should.have.been.callCount(0);
            done();
        }));
    });
});

describe('Tests for map', () => {
    it('Should not work if got []', () => {
        var spy = sinon.spy();
        flow.map([], generate.getAsyncFunction(), spy);

        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith(null, null);
    });

    it('Should call function with arguments in correct order', (done) => {
        var args = generate.getArguments(3);
        var func = generate.getAsyncFunction();

        flow.map(args, func, sinon.spy(() => {
            func.should.have.been.calledWith(args[0]);
            func.should.have.been.calledWith(args[1]);
            func.should.have.been.calledWith(args[2]);
            done();
        }));
    });

    it('Should return correct result', (done) => {
        var args = generate.getArguments(3);
        var func = generate.getAsyncFunction();

        flow.map(args, func, sinon.spy(() => {
            spy.should.have.been.calledAfter(func);
            spy.args[0][1].should.be.deep.equal(args);
            done();
        }));
    });

    it('Should return error', (done) => {
        var args = generate.getArguments(3);
        var func = generate.getAsyncFunction(new Error('test error'));

        flow.map(args, func, sinon.spy((err) => {
            if (err) {
                spy.should.have.been.threw;
            }
            if (spy.callCount === args.length) {
                done();
            }
        }));
    })
});
