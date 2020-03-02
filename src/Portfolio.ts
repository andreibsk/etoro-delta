import { PortfolioListRow, PortfolioListRowSnapshot } from "./PortfolioListRow";
import { filter } from "./Utils";

const selector = {
    element: ".p-portfolio",
    uiTableBody: "ui-table-body"
}

type PortfolioListRows = {
    [key: string]: PortfolioListRow
};

export type PortfolioListViewSnapshot = {
    [P in keyof PortfolioListRows]: PortfolioListRowSnapshot;
}

export class Portfolio {
    public static readonly selector: string = selector.element;

    public readonly element: Element;

    private readonly rows: PortfolioListRows;
    private readonly observer: MutationObserver;
    private _compareSnapshot: PortfolioListViewSnapshot | null = null;

    constructor(element: Element) {
        if (!element.matches(Portfolio.selector))
            throw new Error("Element doesn't match a PortfolioListView.");

        this.element = element;
        this.observer = new MutationObserver(m => this.onMutationObserved(m));

        this.rows = {};
        this.initializeRows();

        this.observer.observe(this.element, { childList: true, subtree: true });
    }

    public set compareSnapshot(snapshot: PortfolioListViewSnapshot | null) {
        this._compareSnapshot = snapshot;
        this.setRowCompareSnapshots();
    }

    public createSnapshot(): PortfolioListViewSnapshot {
        var snapshot: Partial<PortfolioListViewSnapshot> = {};

        var key: keyof PortfolioListRows;
        for (key in this.rows)
            snapshot[key] = this.rows[key].createSnapshot();

        return snapshot as PortfolioListViewSnapshot;
    }

    private initializeRows() {
        const rowElements = this.element.querySelectorAll(selector.uiTableBody + " > " + PortfolioListRow.elementSelector);
        for (const elem of rowElements) {
            const row = new PortfolioListRow(elem);
            this.rows[row.marketName] = row;
        }
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, selector.uiTableBody)) {
            if (mutation.added == true) {
                console.debug("Table body added.");
                this.initializeRows();
                this.setRowCompareSnapshots();
            }
            else if (mutation.added == false) {
                console.debug("Table body removed.");
                for (const row in this.rows)
                    delete this.rows[row];
            }
        }
    }

    private setRowCompareSnapshots() {
        var key: keyof PortfolioListRows;
        for (key in this.rows)
            this.rows[key].compareSnapshot = this._compareSnapshot == null ? null : this._compareSnapshot[key];
    }
}