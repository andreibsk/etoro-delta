import { Portfolio } from "./portfolio";
import { SyncEvent } from "ts-events";
import { filter } from "./Utils";
import { Header } from "./header";
import { EtAccountBalanceFooter } from "./footer";

export class UiLayout {
    public static readonly selector: string = "ui-layout";
    private static observerOptions: MutationObserverInit = { childList: true, subtree: true };

    private readonly element: Element;
    private readonly observer: MutationObserver;
    private portfolio?: Portfolio;
    private header?: Header;
    private footer?: EtAccountBalanceFooter;

    public readonly portfolioAdded = new SyncEvent<Portfolio>();
    public readonly portfolioRemoved = new SyncEvent<Portfolio>();

    public readonly headerAdded = new SyncEvent<Header>();
    public readonly headerRemoved = new SyncEvent<Header>();

    public readonly footerAdded = new SyncEvent<EtAccountBalanceFooter>();
    public readonly footerRemoved = new SyncEvent<EtAccountBalanceFooter>();

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

        const footerElement = element.querySelector(EtAccountBalanceFooter.selector);
        if (footerElement)
            this.footer = new EtAccountBalanceFooter(footerElement);

        this.observer.observe(this.element, UiLayout.observerOptions);
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, Portfolio.selector, Header.selector, EtAccountBalanceFooter.selector)) {
            const element = mutation.element;

            if (element.matches(Portfolio.selector)) {
                if (mutation.added == true && !this.portfolio) {
                    this.portfolio = new Portfolio(element);
                    this.portfolioAdded.post(this.portfolio);
                }
                else if (mutation.added == false && this.portfolio) {
                    const obj = this.portfolio;
                    this.portfolio = undefined;
                    this.portfolioRemoved.post(obj);
                }
            }
            else if (element.matches(Header.selector)) {
                if (mutation.added == true && element != this.header?.element) {
                    this.header = new Header(element);
                    this.headerAdded.post(this.header);
                }
                else if (mutation.added == false && this.header != undefined) {
                    const obj = this.header;
                    this.header = undefined;
                    this.headerRemoved.post(obj);
                }
            }
            else if (element.matches(EtAccountBalanceFooter.selector)) {
                if (mutation.added == true && element != this.footer?.element) {
                    this.footer = new EtAccountBalanceFooter(element);
                    this.footerAdded.post(this.footer);
                }
                else if (mutation.added == false && this.footer != undefined) {
                    const obj = this.footer;
                    this.footer = undefined;
                    this.footerRemoved.post(obj);
                }
            }
        }
    }
}