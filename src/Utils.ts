export function findTarget(records: MutationRecord[], selector: string)
    : { element: Element, added: boolean } {

    for (const record of records) {
        for (const node of record.addedNodes) {
            if (!(node instanceof Element))
                break;

            if (node.matches(selector))
                return { element: node, added: true };

            const selected = node.querySelector(selector);
            if (selected)
                return { element: selected, added: true };
        }

        for (const node of record.removedNodes) {
            if (!(node instanceof Element))
                break;

            if (node.matches(selector))
                return { element: node, added: false };

            const selected = node.querySelector(selector);
            if (selected)
                return { element: selected, added: false };
        }
    }
}
