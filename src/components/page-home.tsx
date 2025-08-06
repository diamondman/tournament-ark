import React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Machine, assign, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";
import { Division, Method, EntryType } from "../models";

interface EntryOptions {
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}
interface EntryTypeStatistics {
    count: number,
    division_id: number,
    division: string,
    entry_type: number,
    class: string,
    technique: string,
    method_id: number,
    method: string,
}

interface StatisticsQueryResult {
  entry_count: number,
  entrant_count: number,
  entry_type_stats: ReadonlyArray<EntryTypeStatistics>,
}


interface homePageMachineContext {
    query_results?: StatisticsQueryResult,
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

type HomePageEvent =
    | { type: "SELECT" }

export const pageHomeMachineEntryMachine = Machine<homePageMachineContext, any, HomePageEvent>({
    id: "home-fetch",
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
                src: (ctx) => invoke<StatisticsQueryResult | undefined>("query_statistics"),
                onDone: {
                    target: "main",
                    actions: assign({
                        query_results: (ctx, event: DoneInvokeEvent<StatisticsQueryResult | undefined>) => {
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

const DefaultHomeSubPage: React.FC<homePageMachineContext> = ({ query_results, divisions, methods, entry_types }) => {
    if(query_results === undefined)
    {
        return (
            <div>Database call failed.</div>
        )
    }
    return <div >
        <table className="display-table">
            <tbody>
                <tr>
                    <td>Entry Count:</td>
                    <td>{query_results.entry_count}</td>
                </tr>
                <tr>
                    <td>Participant Count:</td>
                    <td>{query_results.entrant_count}</td>
                </tr>
            </tbody>
        </table>
        <table className="display-table border-table padded-cell" >
            <col width="16%" />
            <col width="21%" />
            <col width="21%" />
            <col width="21%" />
            <col width="21%" />
            <thead>
                <tr>
                    <th>Count</th>
                    <th>Division</th>
                    <th>Class</th>
                    <th>Technique</th>
                    <th>Method</th>
                </tr>
            </thead>
            <tbody>
                {
                    query_results.entry_type_stats.map((entry) => {
                        return <tr>
                            <td>{entry.count}</td>
                            <td>{entry.division}</td>
                            <td>{entry.class}</td>
                            <td>{entry.technique}</td>
                            <td>{entry.method}</td>
                        </tr>
                    })
                }
            </tbody>
        </table>
    </div>
}


const HomePage: React.FC<{}> = () => {
    const [current] = useMachine(pageHomeMachineEntryMachine, { context: {
        query_results: undefined,
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
                        current.context
                    )
                }
            </div>
        </div>
    )
}



// query_entries
export default HomePage;
