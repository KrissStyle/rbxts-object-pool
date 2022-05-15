import { assertNotDestroyed, warnAlreadyDestroyed } from '@rbxts/destroyed-instance-logging'
import { IObjectPool } from './IObjectPool'

export interface ObjectPoolOptions<T> {
	initialSize?: number
	expansionIncrement?: number

	factory: () => T
	onGet?: (object: T) => void
	onRelease?: (object: T) => void
	onDispose?: (object: T) => void
}

export class ObjectPool<T> implements IObjectPool<T> {
	public expansionIncrement: number

	private readonly inactive
	private readonly active
	private readonly factory
	private readonly onGet
	private readonly onRelease
	private readonly onDispose

	private isDestroyed = false

	constructor({
		initialSize = 10,
		expansionIncrement = 5,
		factory,
		onGet,
		onRelease,
		onDispose,
	}: ObjectPoolOptions<T>) {
		this.inactive = new Array<T>(initialSize)
		this.active = new Array<T>()

		this.expansionIncrement = expansionIncrement

		this.factory = factory
		this.onGet = onGet
		this.onRelease = onRelease
		this.onDispose = onDispose

		for (let i = 0; i < initialSize; i++) {
			this.inactive.push(factory())
		}
	}

	public inactiveSize(): number {
		return this.inactive.size()
	}

	public activeSize(): number {
		return this.active.size()
	}

	public totalSize(): number {
		return this.inactive.size() + this.active.size()
	}

	public get(): T {
		assertNotDestroyed(this.isDestroyed, this)
		if (this.inactive.isEmpty()) this.expand()

		const object = this.inactive.pop() as T
		this.active.push(object)
		this.onGet?.(object)
		return object
	}

	public release(object: T) {
		assert(this.active.includes(object), 'Object is not part of the pool')
		assert(!this.inactive.includes(object), 'Object has already been released to the pool')

		this.active.remove(this.active.findIndex((v) => v === object))
		if (!this.isDestroyed) this.inactive.push(object)
		this.onRelease?.(object)
		if (this.isDestroyed) this.onDispose?.(object)
	}

	public expand(increment: number = this.expansionIncrement) {
		assertNotDestroyed(this.isDestroyed, this)
		assert(increment >= 0, 'Increment must be greater than 0')

		warn(`Expanding pool capacity by ${increment}. New capacity is ${this.totalSize() + increment}`)

		for (let i = 0; i < increment; i++) {
			this.inactive.push(this.factory())
		}
	}

	public destroy() {
		if (this.isDestroyed) {
			warnAlreadyDestroyed(this)
			return
		}
		this.isDestroyed = true

		if (this.onDispose) {
			for (const object of this.inactive) {
				this.onDispose(object)
			}
		}

		this.inactive.clear()
	}
}
