const selectorFor = {
    cell: (s: string) => `[data-etoro-automation-id='portfolio-overview-table-body-cell-${s}']`,
    cellContainer: (s: string) => `[data-etoro-automation-id='portfolio-overview-table-cell-container-${s}']`
};

const selector = {
    portfolioListRow: ".ui-table-row-container",

    marketNameCell: selectorFor.cell("market-name"),
    profitCell: selectorFor.cell("profit"),
    gainCell: selectorFor.cell("gain"),
};

export class PortfolioListRow {
    public static readonly elementSelector: string = selector.portfolioListRow;

    private readonly element: Element;
    private readonly profitElement: Element;
    private readonly gainElement: Element;

    public readonly marketName: string;

    constructor(element: Element) {
        if (!element.matches(PortfolioListRow.elementSelector))
            throw new Error("Element doesn't match a PortfolioListRow.");

        this.element = element;
        this.marketName = this.element.querySelector(selector.marketNameCell).textContent.trim();
        this.profitElement = this.element.querySelector(selector.profitCell);
        this.gainElement = this.element.querySelector(selector.gainCell);
    }

    public get profit(): number {
        return parseFloat(this.profitElement.textContent.substring(1));
    }

    public get gain(): number {
        return parseFloat(this.gainElement.textContent);
    }
}