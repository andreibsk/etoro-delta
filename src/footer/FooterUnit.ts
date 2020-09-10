import { Delta } from "../Delta";
import styles from "../main.scss";
import { SyncEvent } from "ts-events";

const unitPrefix: string = "account-balance";
const eIdAttributeName = "automation-id";

const selector = {
    element: ".footer-unit",
    valueElement: ".footer-unit-value",

    unit: (s: string) => `[${eIdAttributeName}='${unitPrefix}-${s}']`
};

// value only implies default currency of USD ($)
export type FooterUnitSnapshot = number | {
    value: number,
    currency: string
};

export class FooterUnit {
    private readonly element: Element;
    private readonly valueElement: Element;
    private readonly valuePercentElement: Element | null;

    private delta: Delta | null;
    private compareCurrency: string | null = null;
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
        this.updateDeltaValues();
    }

    public get compareValueTotal(): number | null {
        return this._compareValueTotal;
    }

    public set compareValueTotal(value: number | null) {
        this._compareValueTotal = value;
        this.updateDeltaValues();
    }

    public get customCurrency(): string | null {
        const c = this.valueElement.childNodes[0].nodeValue!.match(/[^\d]+/);
        return c && c[0] != "$" ? c[0] : null;
    }

    public get value(): number {
        return parseFloat(this.valueElement.childNodes[0].nodeValue!.match(/[\d,]+\.\d\d/)![0].replace(",", ""));
    }

    public set compareSnapshot(snapshot: FooterUnitSnapshot | null) {
        if (typeof snapshot === "number") {
            this.compareCurrency = null;
            this.compareValue = snapshot;
        }
        else {
            this.compareCurrency = snapshot?.currency ?? null;
            this.compareValue = snapshot?.value ?? null;
        }
    }

    public createSnapshot(): FooterUnitSnapshot {
        return this.customCurrency
            ? {
                value: this.value,
                currency: this.customCurrency
            }
            : this.value;
    }

    private onValueMutationObserved() {
        this.updateDeltaValues();
        this.valueChanged.post(this.value);
    }

    private updateDeltaValues() {
        if (this.compareValue != null && this.customCurrency === (this.compareCurrency ?? "$")) {
            if (this.delta == null) {
                this.delta = new Delta();
                this.element.insertBefore(this.delta.element, this.valueElement.nextSibling);
            }

            const deltaValue = this.compareValue == null ? 0 : this.value - this.compareValue;
            this.delta.value = deltaValue;

            if (this.displayDeltaPercent && this.compareValue)
                this.delta.percentValue = this.compareValueTotal
                    ? deltaValue * 100 / this.compareValueTotal
                    : (this.value - this.compareValue) * 100 / this.compareValue;

            if (this.valuePercentElement && this.compareValueTotal) {
                const valuePercent = this.value * 100 / this.compareValueTotal;
                this.valuePercentElement.textContent = valuePercent ? ` (${valuePercent.toFixed(2)}%)` : "";
            }
        }
        else {
            if (this.delta != null) {
                this.delta.element.remove();
                this.delta = null;
            }
        }
    }
}