type Resolver = () => void

export class Lock {
    private _locked: boolean = false
    private _waiting: Resolver[] = []

    async acquire(): Promise<void> {
        if (!this._locked) {
            this._locked = true
            return
        }

        await new Promise<void>((resolve) => {
            this._waiting.push(resolve)
        })

        this._locked = true
    }

    release(): void {
        if (this._waiting.length > 0) {
            const resolve = this._waiting.shift()
            if (resolve) {
                resolve()
            }
        } else {
            this._locked = false
        }
    }

    async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
        await this.acquire()
        try {
            return await fn()
        } finally {
            this.release()
        }
    }
}