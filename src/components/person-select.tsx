import React from "react";

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

import { assign, Machine, DoneInvokeEvent } from "xstate";
import { useMachine } from "@xstate/react";

import { invoke } from "@tauri-apps/api"

import { Person } from "../models";

interface personSelectMachineContext {
    person_id: number,
    person_name: string,
    person_addr: string,
    person_phone: string,
    person_email: string,

    possible_matches: Person[],
    onSelected: (p: Person) => void,
}

type personSelectEvent =
    | {
        type: "EDIT",
        name: string | undefined,
        addr: string | undefined,
        phone: string | undefined,
        email: string | undefined,
    }
    | { type: "SELECT" }


const personSelectMachine = Machine<personSelectMachineContext, any, personSelectEvent>({
    id: "personSelectMachine",
    initial: "idle",
    states: {
        idle: {
            on: {
                EDIT: {
                    target: "debounce",
                    actions: "EDIT_action"
                },
                SELECT: {
                    target: "finished",
                }
            },
        },
        debounce: {
            on: {
                EDIT: {
                    target: "debounce",
                    actions: "EDIT_action"
                }
            },
            after: {
                300: { target: "fetch" }
            },
        },
        fetch: {
            invoke: {
                src: (ctx) => {
                    return invoke<Person[]>('query_people',
                        {
                            patternId: 0, // 0 means Igonre for this field
                            patternName: (ctx.person_name === "") ? "" : "%" + ctx.person_name + "%",
                            patternAddr: (ctx.person_addr === "") ? "" : "%" + ctx.person_addr + "%",
                            patternPhone: (ctx.person_phone === "") ? "" : "%" + ctx.person_phone + "%",
                            patternEmail: (ctx.person_email === "") ? "" : "%" + ctx.person_email + "%",
                        });
                },
                onDone: {
                    target: "idle",
                    actions: assign({
                        possible_matches: (cx, event: DoneInvokeEvent<Person[]>) => {
                            console.log(event.data);
                            return event.data
                        }
                    }),
                },
                onError: {
                    target: "idle",
                    actions: (context, event) => {
                        alert(event.data)
                    }
                },
            }
        },
        finished: {
            type: "final",
            entry: (ctx) => {
                const p: Person = {
                    id: ctx.person_id, // 0 means create this in the DB
                    name: ctx.person_name,
                    addr: ctx.person_addr,
                    phone: ctx.person_phone,
                    email: ctx.person_email,
                    attributes: "",
                }
                ctx.possible_matches = [];
                ctx.onSelected(p)
            }
        }
    }
}, {
    actions: {
        // alert_done: (context, event) => {
        // },
        EDIT_action: () => { },
        // EDIT_action: assign({
        //     person_name: (ctx, event) => {
        //         return event.name === undefined ? ctx.person_name : event.name
        //     },
        //     person_addr: (ctx, event) => {
        //         return event.addr === undefined ? ctx.person_addr : event.addr
        //     },
        //     person_phone: (ctx, event) => {
        //         return event.phone === undefined ? ctx.person_phone : event.phone
        //     },
        //     person_email: (ctx, event) => {
        //         return event.email === undefined ? ctx.person_email : event.email
        //     },
        // }),
    }
})

interface PersonSelectParams {
    onSelected: (p: Person) => void,
}

const PersonSelect: React.FC<PersonSelectParams> = ({ onSelected }) => {
    const [current, send] = useMachine(personSelectMachine.withContext({
        person_id: 0,
        person_name: "",
        person_addr: "",
        person_phone: "",
        person_email: "",
        possible_matches: [],
        onSelected: onSelected,
    }));

    return (
        <div className="person-form-outer">
            <div className="person-form-row">
                Name: <input
                    type="text"
                    className="person-form-field"
                    value={current.context.person_name}
                    disabled={current.matches("finished")}
                    onChange={(e) => {
                        current.context.person_name = e.target.value;
                        send({
                            type: "EDIT",
                            name: e.target.value,
                            addr: undefined,
                            phone: undefined,
                            email: undefined,
                        })
                    }}
                />
                Addr: <input
                    type="text"
                    className="person-form-field"
                    value={current.context.person_addr}
                    disabled={current.matches("finished")}
                    onChange={(e) => {
                        current.context.person_addr = e.target.value;
                        send({
                            type: "EDIT",
                            name: undefined,
                            addr: e.target.value,
                            phone: undefined,
                            email: undefined,
                        })
                    }}
                />
            </div>

            <div className="person-form-row">
                <PhoneInput
                    placeholder="Enter phone number"
                    value={current.context.person_phone}
                    disabled={current.matches("finished")}
                    onChange={(e) => {
                        const num: string = e === undefined ? "" : e
                        current.context.person_phone = num;
                        send({
                            type: "EDIT",
                            name: undefined,
                            addr: undefined,
                            phone: num,
                            email: undefined,
                        })
                    }}
                />
                Email: <input
                    type="text"
                    className="person-form-field"
                    value={current.context.person_email}
                    disabled={current.matches("finished")}
                    onChange={(e) => {
                        current.context.person_email = e.target.value;
                        send({
                            type: "EDIT",
                            name: undefined,
                            addr: undefined,
                            phone: undefined,
                            email: e.target.value,
                        })
                    }}
                />
            </div>
            {(!current.matches("finished")) &&
                <div>
                    {(current.context.person_name
                        || current.context.person_addr
                        || current.context.person_phone
                        || current.context.person_email
                    ) &&
                        <div
                            className="person-form-possible-person"
                            onClick={() => {
                                current.context.person_id = 0
                                send({ type: "SELECT" })
                            }}>
                            CREATE NEW PERSON WITH ABOVE DETAILS
                        </div>
                    }
                    {
                        current.context.possible_matches.map((p) => {
                            return (<div
                                className="person-form-possible-person"
                                onClick={() => {
                                    current.context.person_id = p.id
                                    current.context.person_name = p.name
                                    current.context.person_addr = p.addr
                                    current.context.person_phone = p.phone
                                    current.context.person_email = p.email
                                    send({ type: "SELECT" })
                                }}
                                key={p.id}>
                                {p.name} {p.addr} {p.phone} {p.email}
                            </div>
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}

export default PersonSelect;
