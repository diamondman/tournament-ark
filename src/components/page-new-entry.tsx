import React from "react"
import { HasPageSend } from "../machines/pageMachine"
import Select, { StylesConfig } from 'react-select'
import Button from '@mui/material/Button';
import { newEntryMachine } from "../machines/newEntryMachine";
import { useMachine } from "@xstate/react";
// import Form from "react-bootstrap/Form";
import { useState } from "react";
import PersonSelect from "./person-select"
import { Person, DropDownEntry } from "../models";


const NewEntryPage: React.FC<HasPageSend> = ({ xpagesend }) => {
    const [xnewcurrent, xnewsend] = useMachine(newEntryMachine, { context: {
        category_data: [],
        division_data: [],
        method_data: [],
        person1: undefined,
        person2: undefined,

        xpagesend: xpagesend,

        entry_identifier: "",
        entry_name: "",
        selected_category: undefined,
        selected_division: undefined,
        selected_method: undefined,
    }});
    console.log("CONTEXT", xnewcurrent.context)

    const [name, setName] = useState(xnewcurrent.context.entry_name)
    const [, setCategory] = useState(xnewcurrent.context.selected_category)
    const [, setDivision] = useState(xnewcurrent.context.selected_division)
    const [, setMethod] = useState(xnewcurrent.context.selected_method)
    const [identifier, setidentifier] = useState(xnewcurrent.context.entry_identifier)
    const [, setNoOp] = useState<Person|undefined>(undefined)

    const select_styles: StylesConfig<DropDownEntry, false> = {
        menu: (provided, state) => ({
            ...provided,
            backgroundColor: "rgb(128,128,128)",
        })
    }

    if (xnewcurrent.matches("fetching")) {
        return <div>LOADING</div>
    }

    const can_submit = (
        (xnewcurrent.context.entry_name !== "")
        && (xnewcurrent.context.selected_category !== undefined)
        && (xnewcurrent.context.selected_division !== undefined)
        && (xnewcurrent.context.selected_method !== undefined)
        && (xnewcurrent.context.entry_identifier !== "")
        && (xnewcurrent.context.person1 !== undefined)
    );

    return (
        <div className="form">
            <h1>NEW ENTRY</h1>
            Entry Name: <input
                type="text"
                className="text-form"
                value={name}
                onChange={(e) => {
                    console.log("NAME CHANGE:", e.target.value);
                    xnewcurrent.context.entry_name = e.target.value
                    setName(e.target.value);
                }}
            />
            Category: <Select
                options={xnewcurrent.context.category_data}
                styles={select_styles}
                onChange={(e) => {
                    xnewcurrent.context.selected_category = e?.value
                    setCategory(e?.value)
                }}
            />
            Division: <Select
                options={xnewcurrent.context.division_data}
                styles={select_styles}
                onChange={(e) => {
                    xnewcurrent.context.selected_division = e?.value
                    setDivision(e?.value)
                }}
            />
            Method: <Select
                options={xnewcurrent.context.method_data}
                styles={select_styles}
                onChange={(e) => {
                    xnewcurrent.context.selected_method = e?.value
                    setMethod(e?.value)
                }}
            />
            Identifier: <input
                type="text"
                className="text-form"
                value={identifier}
                onChange={(e) => {
                    console.log("NAME CHANGE:", e.target.value);
                    xnewcurrent.context.entry_identifier = e.target.value
                    setidentifier(e.target.value);
                }}
            />

            Person 1:
            <PersonSelect onSelected={(p) => {
                xnewcurrent.context.person1 = p;
                setNoOp(p)
            }} />
            Person 2:
            <PersonSelect onSelected={(p) => {
                xnewcurrent.context.person2 = p;
                setNoOp(p)
            }} />

            <br />
            <Button
                variant="contained"
                onClick={(e) => { xnewsend("SUBMIT") }}
                disabled={!can_submit}
            >
                Submit
            </Button>
        </div>
    )
}

export default NewEntryPage
