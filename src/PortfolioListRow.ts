export class PortfolioListRow {
    public static readonly selector: string = ".ui-table-row-container";
    public static readonly tableBodySelector: string = "ui-table-body";

    private readonly element: Element;
    private readonly marketNameElement: Element;
    private readonly profitElement: Element;
    private readonly gainElement: Element;

    constructor(element: Element) {
        if (!element.matches(PortfolioListRow.selector))
            throw new Error("Element doesn't match a PortfolioListRow.");

        this.element = element;

        const cellSelector = 
            (name: string) => `[data-etoro-automation-id='portfolio-overview-table-body-cell-${name}']`;

        this.marketNameElement = this.element.querySelector(cellSelector("market-name"));
        this.profitElement = this.element.querySelector(cellSelector("profit"));
        this.gainElement = this.element.querySelector(cellSelector("gain"));
    }

    public get marketName(): string {
        return this.marketNameElement.textContent.trim();
    }

    public get profit(): number {
        return parseFloat(this.profitElement.textContent.substring(1));
    }

    public get gain(): number {
        return parseFloat(this.gainElement.textContent);
    }

    public static parseAll(tableBodyElement: Element): PortfolioListRow[] {
        if (!tableBodyElement.matches(this.tableBodySelector))
            throw new Error("Element doesn't match a tableBody.");

        return Array.from(
            tableBodyElement.querySelectorAll(PortfolioListRow.selector),
            elem => new PortfolioListRow(elem));
    }
}