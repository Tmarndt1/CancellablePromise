import { CancellablePromise } from "../src/CancellablePromise";
import CancellationTokenSource from "../src/CancellationTokenSource";

test('test1', async () => {
    let promise = new CancellablePromise<string>((resolve) => {
        resolve("Success")
    }, new CancellationTokenSource());

    expect(promise).resolves.toEqual("Success");
});