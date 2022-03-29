import CancellationTokenSource from "./CancellationTokenSource";

/**
 * A Promise like implementation that provides the ability to cancel the Promise in addition to the conventional then, catch, and finally methods.
 * The CancellablePromise requires a CancellationTokenSource to cancel the execution.
 */
export class CancellablePromise<TResult> {
    private _cts: CancellationTokenSource;

    private _result: TResult | null = null;

    private _error: any = null;

    private _onFullfilled: ((result: TResult) => any) | null = null;

    private _onRejected: ((error: any) => | any) | null = null;

    private _onFinally: (() => any) | null = null;

    private get _isCancelled(): boolean {
        return this._cts.token.isCancelled();
    }

    /**
     * Constructor that requires the function to be exectued with callbacks for resolve and reject
     * @param executor The required function to exectute
     * @param cts The CancellationTokenSource to cancel the request
     */
    constructor(executor: (resolve: (result: TResult) => any, reject: (error?: any) => any) => void, cts: CancellationTokenSource) {
        this._cts = cts;
        
        executor(async (result: TResult) => {
            if (this._isCancelled) return;
            this._result = result;
            await this._onFullfilled?.(result);
            if (this._isCancelled) return;
            this._onFinally?.();
        }, async (error: any) => {
            if (this._isCancelled) return;
            this._error = error;
            await this._onRejected?.(error);
            if (this._isCancelled) return;
            this._onFinally?.();
        });
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the CancellablePromise.
     * @param onfulfilled The callback to execute when the CancellablePromise is resolved.
\     * @returns A CancellablePromise for the completion of which ever callback is executed.
     */
    public then(onfullfilled: (result: TResult) => any): CancellablePromise<TResult> {
        this._onFullfilled = onfullfilled;
        if (this._result != null && !this._isCancelled) this._onFullfilled?.(this._result);
        return this;
    } 

    /**
     * Attaches a callback for only the rejection of the CancellablePromise.
     * @param onrejected The callback to execute when the CancellablePromise is rejected.
     * @returns A CancellablePromise for the completion of the callback.
     */
    public catch(onRejected: (error: any) => any): CancellablePromise<TResult> {
        this._onRejected = onRejected;
        if (this._error != null && !this._isCancelled) this._onRejected?.(this._error);
        return this;
    }

    /**
     * Attaches a callback for only the finally of the CancellablePromise.
     * @param onrejected The callback to execute when the CancellablePromise is rejected.
     * @returns A CancellablePromise for the completion of the callback.
     */
    public finally(onFinally: () => any): void {
        this._onFinally = onFinally;
    }

    /**
     * Cancels the CancellablePromise
     */
    public cancel(): void {
        this._cts.cancel();
    }
}
