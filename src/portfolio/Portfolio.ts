import { PortfolioListRow, PortfolioListRowSnapshot } from "./PortfolioListRow";
import { filter } from "../Utils";

const selector = {
    element: "portfolio-list-view[view-state-mode='LIST']",
    uiTableRows: "ui-table-body > " + PortfolioListRow.elementSelector
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

    private initializeRow(elem: Element): PortfolioListRow {
        const row = new PortfolioListRow(elem);
        this.rows[row.marketName] = row;
        return row;
    }

    private initializeRows() {
        const rowElements = this.element.querySelectorAll(selector.uiTableRows);
        for (const elem of rowElements)
            this.initializeRow(elem);
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, selector.uiTableRows)) {
            const element = mutation.element;
            const marketName = PortfolioListRow.tryGetMarketName(element);
            if (!marketName)
                continue;

            if (mutation.added == true) {
                if (this.rows[marketName])
                    continue;

                const row = this.initializeRow(element);
                this.setRowCompareSnapshot(row);
                console.debug("Portfolio row added: ", row.marketName);
            }
            else if (mutation.added == false) {
                this.rows[marketName].compareSnapshot = null;
                delete this.rows[marketName]
                console.debug("Portfolio row removed: ", marketName);
            }
        }
    }

    private setRowCompareSnapshot(row: PortfolioListRow) {
        row.compareSnapshot = this._compareSnapshot == null ? null : this._compareSnapshot[row.marketName];
    }

    private setRowCompareSnapshots() {
        for (const key in this.rows)
            this.setRowCompareSnapshot(this.rows[key]);
    }
}