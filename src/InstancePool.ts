import { Workspace } from '@rbxts/services'
import { ObjectPool, ObjectPoolOptions } from './ObjectPool'

const cframeFarAway = new CFrame(0, 10e8, 0)

export interface InstancePoolOptions<T extends Instance = Instance> extends Omit<ObjectPoolOptions<T>, 'factory'> {
	template: T
	parent?: Instance
}

export class InstancePool<T extends Instance = Instance> extends ObjectPool<T> {
	public parent: Instance

	constructor(options: InstancePoolOptions<T>) {
		const { template, parent, onRelease, onDispose } = options

		super({
			...options,
			factory: () => this.store(template.Clone()),
			onRelease: (object) => {
				if (onRelease) onRelease(object)

				this.store(object)
			},
			onDispose: (object) => {
				if (onDispose) onDispose(object)

				object.Destroy()
			},
		})

		this.parent = parent ?? Workspace
	}

	private store(object: T) {
		if (object.IsA('BasePart')) {
			object.CFrame = cframeFarAway
			object.Anchored = true
		} else if (object.IsA('Model')) {
			object.SetPrimaryPartCFrame(cframeFarAway)
			object.PrimaryPart!.Anchored = true
		}

		object.Parent = this.parent

		return object
	}
}
