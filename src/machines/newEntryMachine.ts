import { Machine, assign, DoneInvokeEvent } from "xstate";
import { invoke } from "@tauri-apps/api"
import { PageEvent } from "./pageMachine"

import { Division, Method, EntryType, Person } from "../models"


interface EntryOptions {
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

export interface DropDownEntry {
    label: string;
    value: number;
}

export interface NewEntryContext {
    category_data: Array<DropDownEntry>;
    division_data: Array<DropDownEntry>;
    method_data: Array<DropDownEntry>;
    person1: Person | undefined;
    person2: Person | undefined;

    xpagesend: (event: PageEvent) => void;

    entry_identifier: string,
    entry_name: string,
    selected_category: number | undefined,
    selected_division: number | undefined,
    selected_method: number | undefined,
}

export type NewEntryEvent =
    | { type: "CANCEL" }
    | { type: "SUBMIT" }
    | { type: "NOOP" }

interface HasDataString {
    data: string
}

export const newEntryMachine = Machine<NewEntryContext, any, NewEntryEvent>({
    id: "new_entry_form",
    initial: "fetching",
    states: {
        fetching: {
            invoke: {
                src: (ctx) => invoke<EntryOptions>('list_entry_options'),
                onDone: {
                    target: "main",
                    actions: assign({
                        category_data: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.entry_types.map((e) => {
                                return {
                                    value: e.id,
                                    label: "(" + e.id + ") " + e.first + ":" + e.second,
                                }
                            })
                        },
                        division_data: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.divisions.map((e) => {
                                return {
                                    value: e.id,
                                    label: "(" + e.abbr + ") " + e.name,
                                }
                            })
                        },
                        method_data: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.methods.map((e) => {
                                return {
                                    value: e.id,
                                    label: "(" + e.abbr + ") " + e.name,
                                }
                            })
                        },
                    }),
                }
            },
        },
        main: {
            on: {
                CANCEL: "done",
                SUBMIT: "write_to_db",
            }
        },
        write_to_db: {
            invoke: {
                src: (ctx) => {
                    console.log("ctx.entry_name:", ctx.entry_name);
                    const new_people: Array<Person> = [
                        ctx.person1 as Person
                    ]
                    if (ctx.person2 !== undefined) {
                        new_people.push(ctx.person2)
                    }
                    return invoke<EntryOptions>('insert_update_entry',
                        {
                            newEntryIdentifier: ctx.entry_identifier,
                            newEntryName: ctx.entry_name,
                            newEntryType: ctx.selected_category,
                            newDivisionId: ctx.selected_division,
                            newMethodId: ctx.selected_method,
                            newEntryPeople: new_people,
                        })
                },
                onDone: "done",
                onError: {
                    target: "main",
                    actions: (context, event: DoneInvokeEvent<HasDataString>) => {
                        alert(event.data)
                    },
                },
            },
        },
        done: {
            type: "final",
            entry: "go_home",
        },
    }
},
    {
        actions: {
            go_home: (context, event) => {
                context.xpagesend({ type: "PE_HOME" })
            },

        },
    }
)
