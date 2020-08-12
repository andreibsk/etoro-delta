import { PortfolioListCell, PortfolioListCellSnapshot, PortfolioListCellSelector } from "./PortfolioListCell";

type PortfolioListRowCells = {
    marketName: PortfolioListCell,
    profit?: PortfolioListCell,
    gain?: PortfolioListCell,
    fees?: PortfolioListCell,
    invested?: PortfolioListCell,
    netInvested?: PortfolioListCell,
    openRate?: PortfolioListCell,
    lastPrice?: PortfolioListCell
};

export type PortfolioListRowSnapshot = Omit<{
    [P in keyof PortfolioListRowCells]: PortfolioListCellSnapshot;
}, "marketName">;

export class PortfolioListRow {
    public static readonly elementSelector: string = ".ui-table-row-container";

    private readonly element: Element;
    private readonly cells: Readonly<PortfolioListRowCells>;

    constructor(element: Element) {
        if (!element.matches(PortfolioListRow.elementSelector))
            throw new Error("Element doesn't match a PortfolioListRow.");

        this.element = element;
        const marketName = PortfolioListCell.tryConstruct(this.element, "action", "market-name", false);
        if (!marketName)
            throw new Error("Element doesn't match a PortfolioListRow (market name not detected).");

        this.cells = {
            marketName: marketName,
            profit: PortfolioListCell.tryConstruct(this.element, "container-profit", "profit"),
            gain: PortfolioListCell.tryConstruct(this.element, "gain"),
            fees: PortfolioListCell.tryConstruct(this.element, "fees"),
            invested: PortfolioListCell.tryConstruct(this.element, "invested", "invested-value", "neutral"),
            netInvested: PortfolioListCell.tryConstruct(this.element, "total-amount", "total-amount", "neutral"),
            openRate: PortfolioListCell.tryConstruct(this.element, "open-rate", "avg-open-rate", "neutral"),
            lastPrice: PortfolioListCell.tryConstruct(this.element, "last-price")
        };
    }

    public set compareSnapshot(snapshot: PortfolioListRowSnapshot | null) {
        var cellKey: keyof PortfolioListRowCells;
        for (cellKey in this.cells) {
            if (cellKey == "marketName")
                continue;

            const rowCell = this.cells[cellKey];
            if (rowCell)
                rowCell.compareSnapshot = snapshot == null ? null : (snapshot[cellKey] ?? null);
        }
    }

    public get marketName(): string {
        return this.cells.marketName.valueString;
    }

    public static tryGetMarketName(rowElement: Element): string | null {
        if (!rowElement.matches(PortfolioListRow.elementSelector))
            return null;

        const marketNameCell = rowElement.querySelector(PortfolioListCellSelector.cell("market-name"));
        if (!marketNameCell)
            return null;

        return marketNameCell.textContent!.trim();
    }

    public createSnapshot(): PortfolioListRowSnapshot {
        var snapshot: Partial<PortfolioListRowSnapshot> = {};

        var key: keyof PortfolioListRowCells;
        for (key in this.cells) {
            if (key == "marketName")
                continue;

            const rowCell = this.cells[key];
            if (rowCell)
                snapshot[key] = rowCell.createSnapshot();
        }

        return snapshot as PortfolioListRowSnapshot;
    }
}