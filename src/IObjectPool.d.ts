/**
 * Defines an Object Pool
 */
export interface IObjectPool<T> {
	/**
	 * Gets an object from the pool
	 * @returns Object from the pool
	 */
	get(): T

	/**
	 * Releases an object to the pool
	 * @param object Object to release
	 */
	release(object: T): void

	/**
	 * Destroys the pool
	 */
	destroy(): void
}
