import { HeaderControlPanel } from "./HeaderControlPanel";

const selector = {
    header: "header.a-header",
    toolbox: ".a-head-toolbox"
}

export class Header {
    public static readonly selector: string = selector.header;

    public readonly element: Element;
    public readonly controlPanel: HeaderControlPanel;

    constructor(element: Element) {
        if (!element.matches(selector.header))
            throw new Error("Element doesn't match a Header.");

        this.controlPanel = new HeaderControlPanel();
        element
            .querySelector(selector.toolbox)!
            .prepend(this.controlPanel.element);
    }
}