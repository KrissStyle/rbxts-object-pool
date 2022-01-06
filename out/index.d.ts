/// <reference types="@rbxts/types" />
export declare type objectFactory<T extends Instance> = () => T;
export declare class ObjectPool<T extends Instance = Instance> {
    private poolParent;
    private objectFactory;
    private pool;
    private inUse;
    expansionIncrement: number;
    constructor(templateOrObjectFactory: T | objectFactory<T>, capacity?: number, poolParent?: Instance);
    get(): T;
    release(object: T): void;
    expand(increment?: number): void;
    destroy(destroyInUse?: boolean): void;
}
