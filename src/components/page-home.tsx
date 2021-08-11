import React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Machine, assign, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";
import { QueryEntriesResult } from "../models"
import Button from '@material-ui/core/Button';

interface homePageMachineContext {
    query_results: Array<QueryEntriesResult>,
}

type HomePageEvent =
    | { type: "SELECT" }


export const newpageHomeMachineEntryMachine = Machine<homePageMachineContext, any, HomePageEvent>({
    id: "new_entry_form",
    initial: "fetching",
    states: {
        fetching: {
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



const HomePage: React.FC<{}> = ({ }) => {
    const [current, send] = useMachine(newpageHomeMachineEntryMachine.withContext({
        query_results: [],
    }));

    if (current.matches("fetching")) {
        return <div>LOADING</div>
    }

    console.log("WTF", current.context.query_results)

    return (
        <div>
            <Button variant="contained"
                onClick={() => { window.print() }}
            >
                Print
            </Button >
            <table id="section-to-print">
                <tr>
                    <th>TAG</th>
                    <th>Name</th>
                    <th>Class1</th>
                    <th>Class2</th>
                    <th>Method</th>
                    <th>Division</th>
                    <th>Creator(s)</th>
                </tr>
                {
                    current.context.query_results.map((entry) => {
                        return <tr>
                            <td>{entry.entry.identifier}</td>
                            <td>{entry.entry.name}</td>
                            <td>{entry.entrytype.first}</td>
                            <td>{entry.entrytype.second}</td>
                            <td>{entry.method.name} ({entry.method.abbr})</td>
                            <td>{entry.division.name} ({entry.division.abbr})</td>
                            <td>{entry.people.map((p)=>p.name).join(", ")}</td>
                        </tr>
                    })
                }
            </table>
        </div>
    )
}
// query_entries
export default HomePage;
