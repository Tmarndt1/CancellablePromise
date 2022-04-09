import { ICancellationTokenSource } from "./CancellationTokenSource";

/**
 * A Promise like implementation that provides the ability to cancel the Promise in addition to the conventional then, catch, and finally methods.
 * The CancellablePromise requires a CancellationTokenSource to cancel the execution.
 */
export class CancellablePromise<TResult> {
    private _cts: ICancellationTokenSource;

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
    constructor(executor: (resolve: (result: TResult) => any, reject: (error?: any) => any) => void, cts: ICancellationTokenSource) {
        this._cts = cts;
        
        executor(async (result: TResult) => {
            if (this._isCancelled) return;

            await new Promise<void>((resolve) => {
                this._onFullfilled?.(result);

                resolve();
            });

            this._result = result;

            if (this._isCancelled) return;

            this._onFinally?.();
        }, async (error: any) => {
            if (this._isCancelled) return;
            
            await new Promise<void>((resolve) => {
                this._onRejected?.(error);
                
                resolve();
            });

            this._error = error;

            if (this._isCancelled) return;
            
            this._onFinally?.();
        });
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the CancellablePromise.
     * @param onfulfilled The callback to execute when the CancellablePromise is resolved.
     * @returns A CancellablePromise for the completion of which ever callback is executed.
     */
    public then(onFullfilled: (result: TResult) => any): CancellablePromise<TResult> {
        if (this._result != null) {
            new Promise<void>(resolve => {
                onFullfilled?.(this._result as TResult);
                
                resolve();
            })
            .then(() => this._onFinally?.());
        }

        this._onFullfilled = onFullfilled;

        return this;
    } 

    /**
     * Attaches a callback for only the rejection of the CancellablePromise.
     * @param onrejected The callback to execute when the CancellablePromise is rejected.
     * @returns A CancellablePromise for the completion of the callback.
     */
    public catch(onRejected: (error: any) => any): CancellablePromise<TResult> {
        if (this._error != null) {
            new Promise<void>(resolve => {
                onRejected?.(this._error);
                
                resolve();
            })
            .then(() => this._onFinally?.());
        }

        this._onRejected = onRejected;

        return this;
    }

    /**
     * Attaches a callback for only the finally of the CancellablePromise.
     * @param onrejected The callback to execute when the CancellablePromise is rejected.
     * @returns A CancellablePromise for the completion of the callback.
     */
    public finally(onFinally: () => any): CancellablePromise<TResult> {
        this._onFinally = onFinally;

        return this;
    }

    /**
     * Cancels the CancellablePromise
     */
    public cancel(): void {
        this._cts.cancel();
    }
}