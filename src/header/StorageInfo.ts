export class StorageInfo {
    private readonly valueElement: HTMLElement;

    public readonly element: HTMLElement;
    private _bytesInUse: number | null = null;
    private _bytesTotal: number | null = null;

    constructor() {
        this.element = document.createElement("div");
        this.valueElement = document.createElement("span");

        this.element.append("Storage usage: ");
        this.element.append(this.valueElement);
        this.updateInfo();
    }

    set bytesInUse(value: number | null) {
        this._bytesInUse = value;
        this.updateInfo();
    }

    set bytesTotal(value: number | null) {
        this._bytesTotal = value;
        this.updateInfo();
    }

    private updateInfo() {
        const usageKnown = this._bytesInUse != null && this._bytesTotal != null;

        this.valueElement.textContent = usageKnown
            ? ((this._bytesInUse! / this._bytesTotal!) * 100).toFixed(0) + "%"
            : "??";
        this.element.title = usageKnown
            ? (this._bytesInUse! / 1000).toFixed(2) + "/" + (this._bytesTotal! / 1000).toFixed() + " kB"
            : "";
    }
}