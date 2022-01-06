import { Logger } from '@rbxts/log'
import { Workspace } from '@rbxts/services'

const cframeFarAway = new CFrame(0, 10e8, 0)

export type objectFactory<T extends Instance> = () => T

export class ObjectPool<T extends Instance = Instance> {
	private objectFactory: objectFactory<T>
	private pool = new Array<T>()
	private inUse = new Array<T>()

	public logger?: Logger
	public expansionIncrement = 10

	constructor(
		templateOrObjectFactory: T | objectFactory<T>,
		public capacity = 5,
		private poolParent: Instance = Workspace,
	) {
		this.objectFactory = typeIs(templateOrObjectFactory, 'Instance')
			? () => templateOrObjectFactory.Clone()
			: templateOrObjectFactory

		for (let i = 0; i < capacity; i++) {
			const object = this.objectFactory()

			if (object.IsA('BasePart')) {
				object.CFrame = cframeFarAway
				object.Anchored = true
			} else if (object.IsA('Model')) {
				object.SetPrimaryPartCFrame(cframeFarAway)
				object.PrimaryPart!.Anchored = true
			}
			object.Parent = poolParent

			this.pool.push(object)
		}
	}

	get(): T {
		this.logger?.Verbose('Getting object from Object Pool.')

		if (this.pool.isEmpty()) this.expand()

		const object = this.pool.pop() as T
		this.inUse.push(object)
		return object
	}

	release(object: T) {
		if (!this.inUse.includes(object)) {
			this.logger?.Error('Unable to release object. {@Object} is not part of an Object Pool.', object)
			return
		}

		this.inUse.remove(this.inUse.findIndex((v) => v === object))
		this.pool.push(object)

		if (object.IsA('BasePart')) {
			object.CFrame = cframeFarAway
			object.Anchored = true
		} else if (object.IsA('Model')) {
			object.SetPrimaryPartCFrame(cframeFarAway)
			object.PrimaryPart!.Anchored = true
		}
		object.Parent = this.poolParent
	}

	expand(increment?: number) {
		this.capacity += increment ?? this.expansionIncrement

		this.logger?.Verbose('Expanding Object Pool capacity to {Capacity}.', this.capacity)

		for (let i = 0; i < (increment ?? this.expansionIncrement); i++) {
			const object = this.objectFactory()

			if (object.IsA('BasePart')) {
				object.CFrame = cframeFarAway
				object.Anchored = true
			} else if (object.IsA('Model')) {
				object.SetPrimaryPartCFrame(cframeFarAway)
				object.PrimaryPart!.Anchored = true
			}
			object.Parent = this.poolParent

			this.pool.push(object)
		}
	}

	destroy(destroyInUse = false) {
		this.logger?.Verbose(
			'Destroying Object Pool with {@Pool}' + (destroyInUse ? ' and {@InUse}' : ''),
			this.pool,
			this.inUse,
		)

		this.pool.forEach((v, i) => {
			this.pool.remove(i)
			v.Destroy()
		})

		this.inUse.forEach((v, i) => {
			this.pool.remove(i)
			if (destroyInUse) v.Destroy()
		})

		// 🤷
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this = undefined
	}
}
