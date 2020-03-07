import { Delta } from "./Delta";
import styles from "./main.scss";
import { SyncEvent } from "ts-events";

const unitPrefix: string = "account-balance";
const eIdAttributeName = "automation-id";

const selector = {
    element: ".footer-unit",
    valueElement: ".footer-unit-value",

    unit: (s: string) => `[${eIdAttributeName}='${unitPrefix}-${s}']`
};

export type FooterUnitSnapshot = number;

export class FooterUnit {
    private readonly element: Element;
    private readonly valueElement: Element;
    private readonly valuePercentElement: Element | null;

    private delta: Delta | null;
    private _compareValue: number | null = null;
    private _compareValueTotal: number | null = null;
    private readonly displayDeltaPercent: boolean;
    private readonly valueObserver: MutationObserver;

    public readonly valueChanged = new SyncEvent<number>();

    constructor(parentElement: Element, name: string, displayDeltaPercent?: boolean, displayValuePercent?: boolean,
        compareValueTotal?: number) {

        const element = parentElement.querySelector(selector.element + selector.unit(name));
        const valueElement = element?.querySelector(selector.valueElement);

        if (!element || !valueElement)
            throw new Error("No element found that matches a FooterUnit.");

        this.element = element;
        this.valueElement = valueElement;
        this.displayDeltaPercent = displayDeltaPercent ?? false;
        this.valueObserver = new MutationObserver(() => this.onValueMutationObserved());
        this.valueObserver.observe(this.valueElement, { characterData: true, subtree: true });

        if (displayValuePercent) {
            const elem = document.createElement("span");
            elem.className = styles.footerUnitValuePercent;

            this.valueElement.appendChild(elem);
            this.valuePercentElement = elem;

            if (compareValueTotal)
                this.compareValueTotal = compareValueTotal;
        }
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }

    private set compareValue(value: number | null) {
        this._compareValue = value;

        if (value != null) {
            if (this.delta == null) {
                this.delta = new Delta();
                this.element.insertBefore(this.delta.element, this.valueElement.nextSibling);
            }

            this.updateDeltaValues();
        }
        else {
            if (this.delta != null) {
                this.delta.element.remove();
                this.delta = null;
            }
        }
    }

    public set compareValueTotal(value: number | null) {
        this._compareValueTotal = value;
        this.updateDeltaValues();
    }

    public get value(): number {
        return parseFloat(this.valueElement.childNodes[0].nodeValue!.trim().replace(/[$%<>,]/g, ""));
    }

    public set compareSnapshot(snapshot: FooterUnitSnapshot | null) {
        this.compareValue = snapshot;
    }

    public createSnapshot(): FooterUnitSnapshot {
        return this.value;
    }

    private onValueMutationObserved() {
        this.updateDeltaValues();
        this.valueChanged.post(this.value);
    }

    private updateDeltaValues() {
        if (this.delta != null) {
            const deltaValue = this.compareValue == null ? 0 : this.value - this._compareValue!;
            this.delta.value = deltaValue;

            if (this.displayDeltaPercent)
                this.delta.percentValue = this._compareValueTotal
                    ? deltaValue * 100 / this._compareValueTotal
                    : (this.value - this._compareValue!) * 100 / this._compareValue!;
        }

        if (this.valuePercentElement && this._compareValueTotal) {
            const valuePercent = this.value * 100 / this._compareValueTotal;
            this.valuePercentElement.textContent = valuePercent ? ` (${valuePercent.toFixed(2)}%)` : "";
        }
    }
}