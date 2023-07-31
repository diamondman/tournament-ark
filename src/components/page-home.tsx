import React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Machine, assign, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";
import { QueryEntriesResult } from "../models"
import Button from '@material-ui/core/Button';
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


class ObjectSet<T> extends Set {
    add(elem: T) {
        return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has(elem: T) {
        return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
}

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

interface subpage {
    data: Array<QueryEntriesResult>,
    divisions: ReadonlyArray<Division>,
    methods: ReadonlyArray<Method>,
    entry_types: ReadonlyArray<EntryType>,
}


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

interface fullCategory {
    entry_type: number,
    division_id: number,
    method_id: number,
}

const FullClassificationHomeSubPage: React.FC<subpage> = ({ data, divisions, methods, entry_types }) => {
    let s = new ObjectSet<fullCategory>();
    data.map((elem) => {
        s.add({
            entry_type: elem.entry.entry_type,
            division_id: elem.entry.division_id,
            method_id: elem.entry.method_id
        })
    })

    let categories: Array<fullCategory> = [];
    s.forEach((category) => {
        categories.push(JSON.parse(category))
    })
    console.log(categories)

    const tables = categories.map((category) => {
        return <div>
            <table className="display-table">
                <tbody>
                    <tr>
                        <td>Group: Quilts</td>
                        <td style={{ textAlign: "right", paddingRight: "1em" }}>
                            Class: {category.entry_type}{methods[category.method_id-1].abbr}
                        </td>
                    </tr>
                    <tr>
                        <td>{entry_types[category.entry_type-1].first}</td>
                        <td style={{ textAlign: "right", paddingRight: "1em" }}>
                            {divisions[category.division_id-1].name}
                        </td>
                    </tr>
                    <tr>
                        <td>{entry_types[category.entry_type-1].second}</td>
                        <td style={{ textAlign: "right", paddingRight: "1em" }}>
                            {methods[category.method_id-1].name}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="display-table border-table padded-cell pagebreak-after" >
                <col width="10%" />
                <col width="45%" />
                <col width="15%" />
                <col width="15%" />
                <col width="15%" />
                <thead>
                    <tr>
                        <th>Exhibit<br />Tag</th>
                        <th>Entrant</th>
                        <th>Ribon</th>
                        <th>Champion/<br />Reserve<br /> Champion</th>
                        <th>Grand/<br />Reserve Grand<br /> Champion</th>
                    </tr>
                </thead>
                <tbody className="pagebreak">
                    {
                        data.filter((entry) => {
                            if (category.entry_type === entry.entry.entry_type
                                && category.division_id === entry.entry.division_id
                                && category.method_id === entry.entry.method_id) {
                                return true
                            }
                            return false;
                        }).map((entry) => {
                            return <tr>
                                <td className="pagebreak center-text">{entry.entry.identifier}</td>
                                <td>{entry.people.map((p) => p.name).join(", ")}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
            {/* </div> */}
            {/* <p style={{ pageBreakAfter: "always" }}>&nbsp;</p>
            <p style={{ pageBreakBefore: "always" }}>&nbsp;</p> */}
        </div>
    })

    return <React.Fragment>
        {tables}
    </React.Fragment>
}

export interface SubViewDropDownEntry {
    index: number;
    label: string;
    value: React.FC<subpage>;
}


const select_styles: StylesConfig<SubViewDropDownEntry, false> = {
    menu: (provided, state) => ({
        ...provided,
        backgroundColor: "rgb(128,128,128)",
    })
}


const subpage_dropdown_data: Array<SubViewDropDownEntry> = [
    { index: 0, label: "Show All Entries", value: DefaultHomeSubPage },
    { index: 1, label: "Show Entries by class + division + technique", value: FullClassificationHomeSubPage },
]

const HomePage: React.FC<{}> = () => {
    const [current] = useMachine(pageHomeMachineEntryMachine, { context: {
        query_results: [],
        divisions: [],
        methods: [],
        entry_types: [],
    }});

    const [subviewindex, setSubviewindex] = useState(0)
    //useState<React.FC<subpage>>(DefaultHomeSubPage)

    if (current.matches("fetching")) {
        return <div>LOADING</div>
    }

    console.log("WTF", current.context.query_results)

    return (
        <div>
            <div className="flex-row" style={{ width: "100%" }} id="main-page-settings">
                <Button variant="contained"
                    onClick={() => { window.print() }}
                >
                    Print
                </Button >
                <Select
                    className="drop-down-container"
                    options={subpage_dropdown_data}
                    styles={select_styles}
                    defaultValue={subpage_dropdown_data[0]}
                    onChange={(e) => {
                        if (e?.value === undefined) {
                            setSubviewindex(0);
                        } else {
                            setSubviewindex(e?.index)
                        }
                    }}
                />
            </div>
            <div id="section-to-print">
                {
                    React.createElement(subpage_dropdown_data[subviewindex].value,
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
export default HomePage;
