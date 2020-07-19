import { browser } from "webextension-polyfill-ts";
import { PortfolioListViewSnapshot } from "./portfolio";
import { AccountSnapshot } from "./footer";

type BytesUsage = { used: number, total: number };

export type Snapshot = {
    account: AccountSnapshot,
    portfolio: PortfolioListViewSnapshot
}

type StorageModel = {
    snapshots: number[],
    selectedSnapshot: number | null,

    virtualSnapshots: number[],
    virtualSelectedSnapshot: number | null,

    [snapshotKey: number]: Snapshot
}

class SyncStorage {
    public async getBytesUsage(): Promise<BytesUsage | null> {
        return await getBytesUsage();
    }

    public async getSnapshotDates(virtual: boolean): Promise<Date[]> {
        return this.getSnapshotDateTimes(virtual)
            .then(times => times.map(n => new Date(n)));
    }

    public async getSnapshot(date: Date): Promise<Snapshot | undefined> {
        return await get(snapshotKey(date));
    }

    public async addSnapshot(snapshot: Snapshot, virtual: boolean): Promise<Date> {
        const date = new Date();

        const snapshotDateTimes = await this.getSnapshotDateTimes(virtual);
        snapshotDateTimes.push(date.getTime());

        await set(
            virtual ? "virtualSnapshots" : "snapshots", snapshotDateTimes,
            snapshotKey(date), snapshot)

        return date;
    }

    public async removeSnapshot(date: Date): Promise<boolean>;
    public async removeSnapshot(date: Date, virtual: boolean): Promise<boolean>;
    public async removeSnapshot(date: Date, virtual?: boolean): Promise<boolean> {
        if (virtual === undefined)
            return this.removeSnapshot(date, false) || this.removeSnapshot(date, true);

        const time = date.getTime();
        const snapshotTimes = await this.getSnapshotDateTimes(virtual);
        const index = snapshotTimes.indexOf(time);
        if (index == -1)
            return false;

        const removedTimes = snapshotTimes.splice(index, 1);
        await set("snapshots", snapshotTimes);
        return await remove(...removedTimes);
    }

    public async setSelectedSnapshotDate(date: Date | null, virtual: boolean) {
        await set(virtual ? "virtualSelectedSnapshot" : "selectedSnapshot", date ? date.getTime() : null);
    }

    public async getSelectedSnapshotDate(virtual: boolean): Promise<Date | null> {
        const date = await get<Date>(virtual ? "virtualSelectedSnapshot" : "selectedSnapshot");
        return !date ? null : new Date(date);
    }

    private async getSnapshotDateTimes(virtual: boolean): Promise<number[]> {
        return await get<number[]>(virtual ? "virtualSnapshots" : "snapshots") ?? [];
    }
}

export const storage = new SyncStorage();

async function get<T>(key: keyof StorageModel): Promise<T | undefined> {
    const storage = await browser.storage.sync.get(normalizeKey(key));
    if (browser.runtime.lastError) {
        console.error("Failed to get object from storage:", browser.runtime.lastError?.message);
    }

    return storage[key];
}

async function getBytesUsage(keys?: null | string | string[]): Promise<BytesUsage | null> {
    const browser = (window as any).chrome;
    const sync = browser?.storage?.sync;
    if (!sync || !sync.getBytesInUse || !sync.QUOTA_BYTES)
        return null;

    return new Promise<BytesUsage>((resolve: (value: BytesUsage) => void, reject: (reason?: any) => void) => {
        sync.getBytesInUse(keys, (bytesInUse: number) => {
            if (browser.runtime.lastError)
                reject(browser.runtime.lastError);
            else
                resolve({ used: bytesInUse, total: sync.QUOTA_BYTES });
        });
    });
}

function normalizeKey(key: keyof StorageModel): string {
    return typeof key === "number" ? key.toString() : key;
}

async function remove(...keys: (keyof StorageModel)[]): Promise<boolean> {
    await browser.storage.sync.remove(keys.map(normalizeKey));

    if (browser.runtime.lastError) {
        console.error("Failed to remove object(s) from storage:", browser.runtime.lastError?.message);
        return false;
    }

    return true;
}

async function set<T1, T2>(key: keyof StorageModel, value: T1): Promise<void>;
async function set<T1, T2>(k1: keyof StorageModel, v1: T1, k2: keyof StorageModel, v2: T2): Promise<void>;
async function set<T1, T2>(k1: keyof StorageModel, v1: T1, k2?: keyof StorageModel, v2?: T2): Promise<void> {
    const items: any = {};
    items[normalizeKey(k1)] = v1;

    if (k2 && v2) {
        items[normalizeKey(k2)] = v2;
    }
    await browser.storage.sync.set(items);

    if (browser.runtime.lastError) {
        console.error("Failed to save object(s) to storage:", browser.runtime.lastError?.message);
    }
}

function snapshotKey(date: Date): number {
    return date.getTime();
}
