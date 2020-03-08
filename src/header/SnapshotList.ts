import styles from "../main.scss";
import { SnapshotItem } from "./SnapshotItem";

export class SnapshotList {
    public readonly element: HTMLOListElement;
    private _selectedItem: SnapshotItem | null = null;
    private readonly items: { [time: number]: SnapshotItem } = {};

    constructor() {
        this.element = document.createElement("ol");
        this.element.className = styles.snapshotList;
    }

    public get selectedItem(): SnapshotItem | null {
        return this._selectedItem;
    }

    public set selectedItem(item: SnapshotItem | null) {
        if (item == this._selectedItem)
            return;

        if (item && this.items[item.date.getTime()] != item)
            throw new Error("Cannot select SnapshotItem because it's not part of the list.");

        if (this._selectedItem)
            this._selectedItem.selected = false;
        
        this._selectedItem = item;
        if (item)
            item.selected = true;
    }

    public add(...items: SnapshotItem[]) {
        for (const item of items.sort((a, b) => a.date.getTime() - b.date.getTime())) {
            const time = item.date.getTime();
            if (this.items[time])
                return;

            this.items[time] = item;
            this.element.prepend(item.element);
        }
    }

    public clear() {
        for (const time in this.items) {
            this.items[time].element.remove();
            delete this.items[time];
        }
    }

    public get(date: Date): SnapshotItem | null {
        return this.items[date.getTime()] ?? null;
    }
}