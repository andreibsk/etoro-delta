import { FooterUnit, FooterUnitSnapshot } from "./FooterUnit";

type FooterUnits = {
    profit: FooterUnit,
    total: FooterUnit
};
export type AccountSnapshot = {
    [P in keyof FooterUnits]: FooterUnitSnapshot;
};

export class EtAccountBalanceFooter {
    public static readonly selector: string = "et-account-balance";

    public readonly element: Element;
    private readonly units: FooterUnits;

    constructor(element: Element) {
        if (!element.matches(EtAccountBalanceFooter.selector))
            throw new Error("Element doesn't match a Footer.");

        this.element = element;
        this.units = {
            profit: new FooterUnit(element, "profit-unit"),
            total: new FooterUnit(element, "amount-total", true)
        };
    }

    public set compareSnapshot(snapshot: AccountSnapshot | null) {
        var key: keyof FooterUnits;
        for (key in this.units)
            this.units[key].compareSnapshot = snapshot == null ? null : snapshot[key];
    }

    public createSnapshot(): AccountSnapshot {
        var snapshot: Partial<AccountSnapshot> = {};

        var key: keyof FooterUnits;
        for (key in this.units)
            snapshot[key] = this.units[key].createSnapshot();

        return snapshot as AccountSnapshot;
    }
}