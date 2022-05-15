import { ObjectPool, ObjectPoolOptions } from './ObjectPool'

const CFRAME_FAR_AWAY = new CFrame(0, 10e8, 0)

export type InstancePoolOptions<T extends Instance> = Omit<ObjectPoolOptions<T>, 'factory'> & {
	template: T
	parent?: Instance
}

export class InstancePool<T extends Instance> extends ObjectPool<T> {
	constructor(options: InstancePoolOptions<T>) {
		const { template, parent = game.Workspace, onRelease, onDispose } = options

		const store = (object: T) => {
			if (object.IsA('BasePart')) {
				object.CFrame = CFRAME_FAR_AWAY
				object.Anchored = true
			} else if (object.IsA('Model')) {
				object.SetPrimaryPartCFrame(CFRAME_FAR_AWAY)
				object.PrimaryPart!.Anchored = true
			}
			object.Parent = parent
		}

		super({
			...options,
			factory: () => {
				const object = template.Clone()
				store(object)
				return object
			},
			onRelease: (object) => {
				onRelease?.(object)

				store(object)
			},
			onDispose: (object) => {
				onDispose?.(object)

				object.Destroy()
			},
		})
	}
}
