import { Portfolio } from "./PortfolioListView";
import { SyncEvent } from "ts-events";
import { filter } from "./Utils";

export class UiLayout {
    public static readonly selector: string = "ui-layout";
    private static observerOptions: MutationObserverInit = { childList: true, subtree: true };

    private readonly element: Element;
    private readonly observer: MutationObserver;
    private portfolio?: Portfolio;

    public readonly portfolioAdded = new SyncEvent<Portfolio>();
    public readonly portfolioRemoved = new SyncEvent<Portfolio>();

    constructor(element: Element) {
        if (!element.matches(UiLayout.selector))
            throw new Error("Element doesn't match a UiLayout.");

        this.element = element;
        this.observer = new MutationObserver(m => this.onMutationObserved(m));

        const portfolioElement = element.querySelector(Portfolio.selector);
        if (portfolioElement)
            this.portfolio = new Portfolio(portfolioElement);
        else
            this.observer.observe(this.element, UiLayout.observerOptions);
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, Portfolio.selector)) {
            if (mutation?.added == true && mutation.element != this.portfolio?.element) {
                this.portfolio = new Portfolio(mutation.element);
                this.portfolioAdded.post(this.portfolio);
            }
            else if (mutation?.added == false && this.portfolio != undefined) {
                const view = this.portfolio;
                this.portfolio = undefined;
                this.portfolioRemoved.post(view);
            }
        }
    }
}