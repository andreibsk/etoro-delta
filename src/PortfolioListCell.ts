import { CellDelta } from "./CellDelta";

const cellPrefix: string = "portfolio-overview-table-body-cell";
const cellContainerPrefix: string = "portfolio-overview-table-cell-container-";
const eIdAttributeName = "data-etoro-automation-id";
const valueObserveOptions: MutationObserverInit = { characterData: true, subtree: true };

const selector = {
    portfolioListCellContainer: `[${eIdAttributeName}^='${cellContainerPrefix}']`,

    cell: (s: string) => `[${eIdAttributeName}='${cellPrefix}-${s}']`,
    cellContainer: (s: string) => `[${eIdAttributeName}='${cellContainerPrefix}${s}']`
};

export type PortfolioListCellSnapshot = string;

export class PortfolioListCell {
    private readonly element: Element;
    private readonly valueElement: Element;

    private cellDelta: CellDelta | null;
    private _compareValue: number | null = null;
    private readonly compareEnabled: boolean;
    private readonly compareObserver: MutationObserver;

    constructor(parentElement: Element, name: string, valueName?: string, compareEnabled: boolean = true) {
        const element = parentElement.querySelector(selector.cellContainer(name));
        const valueElement = this.element.querySelector(selector.cell(valueName ?? name));
        if (!element || !valueElement || valueElement.textContent == null)
            throw new Error("No element found that matches a PortfolioListCell.");

        this.element = element;
        this.valueElement = valueElement;``
        this.compareEnabled = compareEnabled;
        this.compareObserver = new MutationObserver((m, o) => this.onDeltaChanged(m, o));
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }

    private set compareValue(value: number | null) {
        if (!this.compareEnabled)
            return;

        this.compareObserver.disconnect();
        this._compareValue = value;

        if (value != null) {
            this.compareObserver.observe(this.valueElement, valueObserveOptions);
            if (this.cellDelta == null) {
                this.cellDelta = new CellDelta();
                this.element.appendChild(this.cellDelta.element);
            }
            this.cellDelta.value = this.value - value;
        }
        else {
            if (this.cellDelta != null) {
                this.cellDelta.element.remove();
                this.cellDelta = null;
            }
        }
    }

    public get value(): number {
        return parseFloat(this.valueString.replace(/[$%<>]/, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent!.trim();
    }

    public static elementSelector(name: string): string {
        return selector.cellContainer(name);
    }

    private onDeltaChanged(_m: MutationRecord[], _o: MutationObserver) {
        if (this.compareEnabled && this.cellDelta != null)
            this.cellDelta.value = this.compareValue == null ? 0 : this.value - this.compareValue;
    }

    public set compareSnapshot(snapshot: PortfolioListCellSnapshot | null) {
        const valueOrNot = snapshot ? parseFloat(snapshot) : NaN;
        this.compareValue = valueOrNot == NaN ? null : valueOrNot;
    }

    public createSnapshot(): PortfolioListCellSnapshot {
        return this.value == NaN ? this.valueString : this.value.toString();
    }
}