import React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Machine, assign, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";
import { QueryEntriesResult } from "../models"
import { Division, Method, EntryType } from "../models";

interface EntryOptions {
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

interface homePageMachineContext {
    query_results: Array<QueryEntriesResult>,
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

interface subpage {
    data: Array<QueryEntriesResult>,
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

type HomePageEvent =
    | { type: "SELECT" }

export const pageHomeMachineEntryMachine = Machine<homePageMachineContext, any, HomePageEvent>({
    id: "new_entry_form",
    initial: "fetching1",
    states: {
        fetching1: {
            invoke: {
                src: (ctx) => invoke<EntryOptions>('list_entry_options'),
                onDone: {
                    target: "fetching2",
                    actions: assign({
                        divisions: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.divisions;
                        },
                        methods: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.methods;
                        },
                        entry_types: (ctx, event: DoneInvokeEvent<EntryOptions>) => {
                            return event.data.entry_types;
                        },
                    }),
                }
            },
        },
        fetching2: {
            invoke: {
                src: (ctx) => invoke<Array<QueryEntriesResult>>("query_entries", {
                    entryId: 0,
                    entryIdentifier: "",
                    entryName: "",
                    entryTypeId: 0,
                    entryDivisionId: 0,
                    entryMethodId: 0,
                    personId: 0,
                }),
                onDone: {
                    target: "main",
                    actions: assign({
                        query_results: (ctx, event: DoneInvokeEvent<Array<QueryEntriesResult>>) => {
                            console.log("query_entries", event.data)
                            return event.data
                        }
                    })
                }
            },
        },
        main: {
            on: {
            }
        },
    }
})

const DefaultHomeSubPage: React.FC<subpage> = ({ data, divisions, methods, entry_types }) => {

    return (
        <table className="display-table border-table">
            <thead>
                <tr>
                    <th>TAG</th>
                    <th>Name</th>
                    <th>Class1</th>
                    <th>Class2</th>
                    <th>Method</th>
                    <th>Division</th>
                    <th>Creator(s)</th>
                </tr>
            </thead>
            <tbody>
                {
                    [...data].sort((a, b) => {
                        const ia = parseInt(a.entry.identifier)
                        const ib = parseInt(b.entry.identifier)
                        if (ia < ib) return -1;
                        if (ia > ib) return 1;
                        return 0;
                    }).map((entry) => {
                        return <tr>
                            <td>{entry.entry.identifier}</td>
                            <td>{entry.entry.name}</td>
                            <td>{entry.entrytype.first}</td>
                            <td>{entry.entrytype.second}</td>
                            <td>{entry.method.name} ({entry.method.abbr})</td>
                            <td>{entry.division.name} ({entry.division.abbr})</td>
                            <td>{entry.people.map((p) => p.name).join(", ")}</td>
                        </tr>
                    })
                }
            </tbody>
        </table>
    )
}

const PageListEntries: React.FC<{}> = () => {
    const [current] = useMachine(pageHomeMachineEntryMachine, { context: {
        query_results: [],
        divisions: [],
        methods: [],
        entry_types: [],
    }});

    if (! current.matches("main")) {
        return <div>LOADING</div>
    }

    console.log("PageListEntries Query Results:", current.context.query_results)

    return (
        <div>
            <div id="section-to-print">
                {
                    React.createElement(DefaultHomeSubPage,
                        {
                            data: current.context.query_results,
                            divisions: current.context.divisions,
                            methods: current.context.methods,
                            entry_types: current.context.entry_types,
                        }
                    )
                }
            </div>
        </div>
    )
}
// query_entries
export default PageListEntries;
