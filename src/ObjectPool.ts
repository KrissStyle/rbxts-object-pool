import { Logger } from '@rbxts/log'

export interface ObjectPoolOptions<T> {
	initialCapacity?: number
	expansionIncrement?: number

	factory: () => T
	onGet?: (object: T) => void
	onRelease?: (object: T) => void
	onDispose?: (object: T) => void

	//debug
	logger?: Logger
}

export class ObjectPool<T> {
	private readonly pool = new Array<T>()
	private readonly active = new Array<T>()

	public expansionIncrement: number

	private readonly factory: () => T
	private readonly onGet?: (object: T) => void
	private readonly onRelease?: (object: T) => void
	private readonly onDispose?: (object: T) => void

	public logger?: Logger

	private disposed = false

	constructor(options: ObjectPoolOptions<T>) {
		const { initialCapacity = 100, expansionIncrement = 20, factory, onGet, onRelease, onDispose, logger } = options

		this.expansionIncrement = expansionIncrement

		this.factory = factory
		this.onGet = onGet
		this.onRelease = onRelease
		this.onDispose = onDispose

		this.logger = logger

		for (let i = 0; i < initialCapacity; i++) {
			this.create()
		}
	}

	public availableSize(): number {
		return this.pool.size()
	}

	public activeSize(): number {
		return this.active.size()
	}

	public size(): number {
		return this.pool.size() + this.active.size()
	}

	private create() {
		if (this.disposed) throw this.logger?.Error('Object Pool is disposed')

		this.pool.push(this.factory())
	}

	public get(): T {
		if (this.disposed) throw this.logger?.Error('Object Pool is disposed')

		if (this.pool.isEmpty()) this.expand()

		const object = this.pool.pop() as T

		if (this.onGet) this.onGet(object)

		this.active.push(object)

		return object
	}

	public release(object: T) {
		if (!this.active.includes(object))
			throw this.logger?.Error('Unable to release object. {@Object} is not part of an Object Pool.', object)

		this.active.remove(this.active.findIndex((v) => v === object))

		if (this.onRelease) this.onRelease(object)

		if (this.disposed && this.onDispose) {
			this.onDispose(object)
			return
		}

		this.pool.push(object)
	}

	public getN(amount: number): T[] {
		if (this.disposed) throw this.logger?.Error('Object Pool is disposed')

		if (this.pool.size() < amount) this.expand(amount - this.pool.size())

		const objects = []

		for (let i = 0; i < amount; i++) {
			objects.push(this.get())
		}

		return objects
	}

	public releaseN(objects: T[]) {
		objects.forEach((object) => {
			this.release(object)
		})
	}

	public expand(increment: number = this.expansionIncrement) {
		if (this.disposed) throw this.logger?.Error('Object Pool is disposed')

		this.logger?.Debug(
			'Expanding Object Pool capacity by {Increment}. Expect capacity to be {@Capacity}',
			increment,
			this.size() + increment,
		)

		for (let i = 0; i < increment; i++) {
			this.create()
		}
	}

	public isDisposed(): boolean {
		return this.disposed
	}

	public dispose(disposeActive = false) {
		this.disposed = true

		this.logger?.Debug(
			'Destroying Object Pool with {@Pool}' + (disposeActive ? ' and {@Active}' : ''),
			this.pool,
			this.active,
		)

		this.pool.forEach((object, i) => {
			if (this.onDispose) this.onDispose(object)
			this.pool.remove(i)
		})

		this.active.forEach((object, i) => {
			if (disposeActive && this.onDispose) this.onDispose(object)
			this.pool.remove(i)
		})
	}
}
