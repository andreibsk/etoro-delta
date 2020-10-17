import { FooterUnit, FooterUnitSnapshot } from "./FooterUnit";
import { SyncEvent } from "ts-events";

type FooterUnits = {
    profit: FooterUnit,
    total: FooterUnit
};
export type AccountSnapshot = {
    [P in keyof FooterUnits]: FooterUnitSnapshot
};

export class EtAccountBalanceFooter {
    public static readonly selector: string = "et-account-balance";

    public readonly element: Element;
    private readonly amountUnit: FooterUnit;
    private readonly units: FooterUnits;
    public readonly customDeltaValueChanged = new SyncEvent<number | null>();

    constructor(element: Element) {
        if (!element.matches(EtAccountBalanceFooter.selector))
            throw new Error("Element doesn't match a Footer.");

        this.element = element;
        this.amountUnit = new FooterUnit(element, "amount-unit");
        this.units = {
            profit: new FooterUnit(element, "profit-unit", {
                displayDeltaPercent: true,
                displayValuePercent: true,
                compareValueTotal: this.amountUnit.value
            }),
            total: new FooterUnit(element, "amount-total", {
                displayDeltaPercent: true,
                customDeltaEnabled: true,
                onCustomDeltaValueChanged: v => this.customDeltaValueChanged.post(v)
            })
        };
        this.amountUnit.valueChanged.attach(value => this.units.profit.compareValueTotal = value);
    }

    public set compareSnapshot(snapshot: AccountSnapshot | null) {
        var key: keyof FooterUnits;
        for (key in this.units)
            this.units[key].compareSnapshot = snapshot == null ? null : snapshot[key];
    }

    public get customDeltaValue(): number | null {
        return this.units.total.customDeltaValue;
    }
    public set customDeltaValue(value: number | null) {
        this.units.total.customDeltaValue = value;
    }

    public createSnapshot(): AccountSnapshot {
        var snapshot: Partial<AccountSnapshot> = {};

        var key: keyof FooterUnits;
        for (key in this.units)
            snapshot[key] = this.units[key].createSnapshot();

        return snapshot as AccountSnapshot;
    }
}