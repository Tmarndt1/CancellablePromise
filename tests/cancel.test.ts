import { CancellablePromise } from "../src/CancellablePromise";
import CancellationTokenSource from "../src/CancellationTokenSource";

test('resolve_success', async () => {
    let fn = jest.fn();

    let promise = new CancellablePromise<string>((resolve) => {
        resolve("Success");
    }, new CancellationTokenSource())
    .then(fn).catch(fn).finally(fn);
    
    await promise;

    expect(promise).resolves.toEqual("Success");
    expect(fn).toBeCalledTimes(2);
});

test('cancel_success', async () => {
    let fn = jest.fn();

    let promise = new CancellablePromise<string>((resolve) => {
        setTimeout(() => {
            resolve("Success")
        }, 500);
    }, new CancellationTokenSource())
    .then(fn).catch(fn).finally(fn);

    promise.cancel();
        
    expect(fn).toBeCalledTimes(0);
});