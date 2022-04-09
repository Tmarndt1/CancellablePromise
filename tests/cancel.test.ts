import { CancellablePromise } from "../src/CancellablePromise";
import CancellationTokenSource from "../src/CancellationTokenSource";

test('resolve_success', async () => {
    let fn1 = jest.fn();
    let fn2 = jest.fn();


    let promise = new CancellablePromise<string>((resolve) => {
        resolve("Resolved...");
    }, new CancellationTokenSource())
    .then(fn1).catch(fn2).finally(fn1);

    setTimeout(() => {
        expect(promise).resolves.toEqual("Resolved...");
        expect(fn1).toBeCalledTimes(2);
        expect(fn2).toBeCalledTimes(0);
    }, 500);
});

test('reject_success', async () => {
    let fn1 = jest.fn();
    let fn2 = jest.fn();

    let promise = new CancellablePromise<string>((resolve, reject) => {
        reject("Rejected...");
    }, new CancellationTokenSource())
    .then(fn1).catch(fn2).finally(fn2);

    expect(promise).rejects.toEqual("Rejected...");
});

test('cancel_success', async () => {
    let fn = jest.fn();

    new CancellablePromise<string>((resolve) => {
        setTimeout(() => {
            resolve("Success");
        }, 500);
    }, new CancellationTokenSource())
    .then(fn).catch(fn).finally(fn).cancel();

    setTimeout(() => {
        expect(fn).toBeCalledTimes(0);
    }, 500);
});

test('wait_test', async () => {
    let thenCalled: boolean = false;
    let finallyCalled: boolean = false;

    new CancellablePromise<string>((resolve) => {
        setTimeout(() => {
            resolve("Resolved...");
        }, 500);
    }, new CancellationTokenSource())
    .then(() => {
        thenCalled = true;
    })
    .finally(() => {
        if (thenCalled) finallyCalled = true;
    });

    setTimeout(() => {
        expect(thenCalled).toEqual(true);
        expect(finallyCalled).toEqual(true);
    }, 600);
});
