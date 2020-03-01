import { Portfolio } from "./Portfolio";
import { SyncEvent } from "ts-events";
import { filter } from "./Utils";
import { Header } from "./Header";

export class UiLayout {
    public static readonly selector: string = "ui-layout";
    private static observerOptions: MutationObserverInit = { childList: true, subtree: true };

    private readonly element: Element;
    private readonly observer: MutationObserver;
    private portfolio?: Portfolio;
    private header?: Header;

    public readonly portfolioAdded = new SyncEvent<Portfolio>();
    public readonly portfolioRemoved = new SyncEvent<Portfolio>();

    public readonly headerAdded = new SyncEvent<Header>();
    public readonly headerRemoved = new SyncEvent<Header>();

    constructor(element: Element) {
        if (!element.matches(UiLayout.selector))
            throw new Error("Element doesn't match a UiLayout.");

        this.element = element;
        this.observer = new MutationObserver(m => this.onMutationObserved(m));

        const portfolioElement = element.querySelector(Portfolio.selector);
        if (portfolioElement)
            this.portfolio = new Portfolio(portfolioElement);

        const headerElement = element.querySelector(Header.selector);
        if (headerElement)
            this.header = new Header(headerElement);

        this.observer.observe(this.element, UiLayout.observerOptions);
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, Portfolio.selector, Header.selector)) {
            const element = mutation.element;

            if (element.matches(Portfolio.selector)) {
                if (mutation.added == true && element != this.portfolio?.element) {
                    this.portfolio = new Portfolio(element);
                    this.portfolioAdded.post(this.portfolio);
                }
                else if (mutation.added == false && this.portfolio != undefined) {
                    const view = this.portfolio;
                    this.portfolio = undefined;
                    this.portfolioRemoved.post(view);
                }
            }
            else if (element.matches(Header.selector)) {
                if (mutation.added == true && element != this.header?.element) {
                    this.header = new Header(element);
                    this.headerAdded.post(this.header);
                }
                else if (mutation.added == false && this.header != undefined) {
                    const view = this.header;
                    this.header = undefined;
                    this.headerRemoved.post(view);
                }
            }
        }
    }
}