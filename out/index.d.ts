/// <reference types="@rbxts/types" />
import { Logger } from '@rbxts/log';
export declare type objectFactory<T extends Instance> = () => T;
export declare class ObjectPool<T extends Instance = Instance> {
    capacity: number;
    private poolParent;
    private objectFactory;
    private pool;
    private inUse;
    logger?: Logger;
    expansionIncrement: number;
    constructor(templateOrObjectFactory: T | objectFactory<T>, capacity?: number, poolParent?: Instance);
    get(): T;
    release(object: T): void;
    expand(increment?: number): void;
    destroy(destroyInUse?: boolean): void;
}
