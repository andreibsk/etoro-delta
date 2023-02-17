import { Delta, Mode } from "../Delta";

const automationAttribute = "automation-id";
const cellPrefix: string = "portfolio-overview-table-body-cell";
const cellContainerPrefix: string = "portfolio-overview-table-cell-container-";
const valueObserveOptions: MutationObserverInit = { characterData: true, subtree: true };

const selector = {
    portfolioListCellContainer: `[${automationAttribute}^='${cellContainerPrefix}']`,

    cell: (s: string) => `[${automationAttribute}='${cellPrefix}-${s}']`,
    cellContainer: (s: string) => `[${automationAttribute}='${cellContainerPrefix}${s}']`
};

export const PortfolioListCellSelector = selector;
export type PortfolioListCellSnapshot = number;

export class PortfolioListCell {
    private readonly container: Element | null;
    private readonly valueElement: Element;

    private cellDelta: Delta | null;
    private _compareValue: number | null = null;
    private readonly compare: false | Mode;
    private readonly compareObserver: MutationObserver;

    private constructor(container: Element | null, valueElement: Element, compare: false | Mode = "positiveNegative") {
        this.container = container;
        this.valueElement = valueElement;
        this.compare = compare;
        this.compareObserver = new MutationObserver((m, o) => this.onDeltaChanged(m, o));
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }

    private set compareValue(value: number | null) {
        if (!this.compare || !this.container)
            return;

        this.compareObserver.disconnect();
        this._compareValue = value;

        if (value != null) {
            this.compareObserver.observe(this.valueElement, valueObserveOptions);
            if (this.cellDelta == null) {
                this.cellDelta = new Delta({ mode: this.compare });
                this.container.appendChild(this.cellDelta.element);
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
        return parseFloat(this.valueString.replace(/[$%<>,]/g, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent!.trim();
    }

    public static tryConstruct(parentElement: Element, name: string, compare?: false | Mode): PortfolioListCell | undefined {
        const valueElement = parentElement?.querySelector(selector.cell(name));
        const container = valueElement?.closest(".et-table-info");

        return (compare == false || container) && valueElement && valueElement.textContent != null
            ? new PortfolioListCell(container ?? null, valueElement, compare)
            : undefined;
    }

    private onDeltaChanged(_m: MutationRecord[], _o: MutationObserver) {
        if (this.compare && this.cellDelta != null)
            this.cellDelta.value = this.compareValue == null ? 0 : this.value - this.compareValue;
    }

    public set compareSnapshot(snapshot: PortfolioListCellSnapshot | null) {
        this.compareValue = snapshot;
    }

    public createSnapshot(): PortfolioListCellSnapshot {
        return this.value;
    }
}