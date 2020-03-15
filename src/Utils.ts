import moment, { CalendarSpec } from "moment";

export const pastOnlyShortCalendarFormat: CalendarSpec = {
    lastDay : '[Yesterday] LT',
    sameDay : 'LT',
    nextDay : '',
    lastWeek : 'dddd LT',
    nextWeek : '',
    sameElse : 'L LT'
};
export const pastOnlyCalendarFormat: CalendarSpec = {
    lastDay : '[Yesterday at] LT',
    sameDay : '[Today at] LT',
    nextDay : '',
    lastWeek : 'dddd [at] LT',
    nextWeek : '',
    sameElse : 'L LT'
};
moment.updateLocale("en", { calendar: pastOnlyCalendarFormat });

type FilteredMutation = {
    element: Element;
    added: boolean;
};

export function* filter(records: MutationRecord[], ...selectors: string[])
    : Generator<FilteredMutation, void> {

    const selector = selectors.join(", ");

    for (const record of records) {
        for (const node of record.removedNodes) {
            if (!(node instanceof Element))
                continue;

            if (node.matches(selector))
                yield { element: node, added: false };

            const children = node.querySelectorAll(selector);
            for (const child of children)
                yield { element: child, added: false };
        }
        for (const node of record.addedNodes) {
            if (!(node instanceof Element))
                continue;

            if (node.matches(selector))
                yield { element: node, added: true };

            const children = node.querySelectorAll(selector);
            for (const child of children)
                yield { element: child, added: true };
        }
    }
}
