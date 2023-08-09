import { Machine } from "xstate";

interface PageContext {
    page: JSX.Element,
}

export type PageEvent =
    | { type: "PE_HOME" }
    | { type: "PE_LIST_ENTRIES" }
    | { type: "PE_LIST_CATEGORIES" }
    | { type: "PE_LIST_ENTRY_CARDS" }
    | { type: "PE_LIST_PEOPLE" }
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
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_LIST_PEOPLE: "list_people",
                PE_ADD_ENTRY: "add_entry",
                PE_OPTIONS: "options",
            },
        },
        list_entries: {
            on: {
                PE_HOME: "home",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_LIST_PEOPLE: "list_people",
                PE_ADD_ENTRY: "add_entry",
                PE_OPTIONS: "options",
            },
        },
        list_categories: {
            on: {
                PE_HOME: "home",
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_LIST_PEOPLE: "list_people",
                PE_ADD_ENTRY: "add_entry",
                PE_OPTIONS: "options",
            },
        },
        list_entry_cards: {
            on: {
                PE_HOME: "home",
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_PEOPLE: "list_people",
                PE_ADD_ENTRY: "add_entry",
                PE_OPTIONS: "options",
            },
        },
        list_people: {
            on: {
                PE_HOME: "home",
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_ADD_ENTRY: "add_entry",
                PE_OPTIONS: "options",
            },
        },
        options: {
            on: {
                PE_HOME: "home",
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_LIST_PEOPLE: "list_people",
                PE_ADD_ENTRY: "add_entry",
            },
        },
        add_entry: {
            on: {
                PE_HOME: "home",
                PE_LIST_ENTRIES: "list_entries",
                PE_LIST_CATEGORIES: "list_categories",
                PE_LIST_ENTRY_CARDS: "list_entry_cards",
                PE_LIST_PEOPLE: "list_people",
                PE_OPTIONS: "options",
            },
        },
    }
})
