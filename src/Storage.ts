import { browser } from "webextension-polyfill-ts";
import { PortfolioListViewSnapshot } from "./Portfolio";
import { AccountSnapshot } from "./EtAccountBalanceFooter";

function snapshotKey(date: Date): number {
    return date.getTime();
}

export type Snapshot = {
    account: AccountSnapshot,
    portfolio: PortfolioListViewSnapshot
}

type StorageModel = {
    snapshots: number[],
    selectedSnapshot: number | null,

    [snapshotKey: number]: Snapshot
}

class SyncStorage {
    public async getSnapshotDates(): Promise<Date[]> {
        return this.getSnapshotDateTimes()
            .then(times => times.map(n => new Date(n)));
    }

    public async getSnapshot(date: Date): Promise<Snapshot | undefined> {
        return await get(snapshotKey(date));
    }

    public async addSnapshot(snapshot: Snapshot): Promise<Date> {
        const date = new Date();

        const snapshotDateTimes = await this.getSnapshotDateTimes();
        snapshotDateTimes.push(date.getTime());

        await set(
            "snapshots", snapshotDateTimes,
            snapshotKey(date), snapshot)

        return date;
    }

    public async setSelectedSnapshotDate(date: Date | null) {
        await set("selectedSnapshot", date ? date.getTime() : null);
    }

    public async getSelectedSnapshotDate(): Promise<Date | null> {
        const date = await get<Date>("selectedSnapshot");
        return !date ? null : new Date(date);
    }

    private async getSnapshotDateTimes(): Promise<number[]> {
        return await get<number[]>("snapshots") ?? [];
    }
}

export const storage = new SyncStorage();

async function get<T>(key: keyof StorageModel): Promise<T | undefined> {
    const storage = await browser.storage.sync.get(key.toString());
    return storage[key];
}

async function set<T1, T2>(key: keyof StorageModel, value: T1): Promise<void>;
async function set<T1, T2>(k1: keyof StorageModel, v1: T1, k2: keyof StorageModel, v2: T2): Promise<void>;
async function set<T1, T2>(k1: keyof StorageModel, v1: T1, k2?: keyof StorageModel, v2?: T2): Promise<void> {
    const items: any = {};
    items[k1] = v1;

    if (k2 && v2)
        items[k2] = v2;

    await browser.storage.sync.set(items);
}
