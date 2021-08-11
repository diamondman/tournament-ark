import { Machine } from "xstate";

interface PageContext {
    page: JSX.Element,
}

export type PageEvent =
    | { type: "PE_HOME" }
    | { type: "PE_ADD_ENTRY" }
    | { type: "PE_OPTIONS" }

export interface HasPageSend {
    xpagesend: (event: PageEvent) => void;
}

export const pageMachine = Machine<PageContext, any, PageEvent>({
    id: "page_select",
    initial: "home",
    states: {
        home: {
            on: {
                PE_OPTIONS: "options",
                PE_ADD_ENTRY: "add_entry",
            },
        },
        options: {
            on: {
                PE_HOME: "home",
                PE_ADD_ENTRY: "add_entry",
            },
        },
        add_entry: {
            on: {
                PE_HOME: "home",
                PE_OPTIONS: "options",
            },
        },
    }
})