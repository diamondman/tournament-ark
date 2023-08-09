import React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Machine, assign, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";
import { QueryEntriesResult } from "../models"
import Select, { StylesConfig } from 'react-select'
import { Division, Method, EntryType } from "../models";
import { useState } from "react";

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

export interface FilterDivisionDropDownEntry {
    index: number;
    label: string;
    value: number;
}

const filter_division_select_styles: StylesConfig<FilterDivisionDropDownEntry, false> = {
    menu: (provided, state) => ({
        ...provided,
        backgroundColor: "rgb(128,128,128)",
    })
}

interface subpage {
    data: Array<QueryEntriesResult>,
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}

const EntryCardHomeSubPage: React.FC<subpage> = ({ data, divisions, methods, entry_types }) => {
    const num_per_page = 2;

    const [filter_division_index, setfilter_division_index] = useState(0)

    let filter_division_dropdown_data: Array<FilterDivisionDropDownEntry> = [
        { index: 0, label: "Show All Divisions", value: 0 }
    ]
    divisions.forEach((division, i_div) => {
        filter_division_dropdown_data.push(
            { index: i_div + 1, label: `Show Only ${division.name} (${division.abbr})`, value: division.id }
        )
    })

    const sorted_data = [...data].sort((a, b) => {
        const ia = parseInt(a.entry.identifier)
        const ib = parseInt(b.entry.identifier)
        if (ia < ib) return -1;
        if (ia > ib) return 1;
        return 0;
    }).filter((entry) => {
        if (filter_division_index === 0) {
            return true;
        }
        if (filter_division_dropdown_data[filter_division_index].value === entry.entry.division_id) {
            return true
        }
        return false;
    })

    if (sorted_data.length === 0) { // Protect against /0.
        return <div>No entries available.</div>;
    }

    const num_pages = Math.ceil(sorted_data.length/num_per_page);

    //return <div>{num_pages}</div>;
    //const d_iter = sorted_data[Symbol.iterator]();

    var i_entry = 0;
    return <div>
        <div className="flex-row" style={{ width: "100%" }} id="main-page-settings">
            <Select
                className="drop-down-container"
                options={filter_division_dropdown_data}
                styles={filter_division_select_styles}
                defaultValue={filter_division_dropdown_data[filter_division_index]}
                onChange={(e) => {
                    if (e?.value === undefined) {
                        setfilter_division_index(0);
                    } else {
                        setfilter_division_index(e?.index)
                    }
                }}
            />
        </div>
        <div className="entry-card-list">
            {
                Array(num_pages).fill(0).map((_, page_num) => {
                    const page_style = "entry-card-list-page" + (page_num === (num_pages-1) ? "" : " pagebreak-after");
                    return <div className={page_style}>
                        {
                            Array(num_per_page).fill(0).map((_) => {
                                //const {value: entry, done} = d_iter.next();

                                //return <div>--{tmp++} {done?"true":"false"}</div>
                                if(i_entry > (sorted_data.length-1)){
                                    return <div className="entry-card"></div>
                                }

                                const entry = sorted_data[i_entry++];

                                return <div className="entry-card">
                                    <div className="card-field identifier">{entry.entry.identifier}</div>
                                    <div className="card-field name">{entry.entry.name}</div>
                                    <div className="card-field people">{entry.people.map((p) => p.name).join(", ")}</div>
                                    <div className="card-field division">{entry.division.name}</div>
                                    <div className="card-field method">{entry.method.name}</div>
                                </div>
                            })
                        }

                        {/* <p style={{ pageBreakAfter: "always" }}>&nbsp;</p> */}
                    </div>
                })
            }
        </div>
    </div>
}

const PageListEntryCards: React.FC<{}> = () => {
    const [current] = useMachine(pageHomeMachineEntryMachine, { context: {
        query_results: [],
        divisions: [],
        methods: [],
        entry_types: [],
    }});

    if (! current.matches("main")) {
        return <div>LOADING</div>
    }

    console.log("PageListEntryCards Query Results:", current.context.query_results)

    return (
        <div>
            <div id="section-to-print">
                {
                    React.createElement(EntryCardHomeSubPage,
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
export default PageListEntryCards;
