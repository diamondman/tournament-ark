export interface Person {
    id: number,
    name: string,
    addr: string,
    phone: string,
    email: string,
    attributes: string,
}

export interface Division {
    id: number,
    abbr: string,
    name: string,
}

export interface Method {
    id: number,
    abbr: string,
    name: string,
}

export interface EntryType {
    id: number,
    first: string,
    second: string,
}

export interface Entry {
    id: number,
    identifier: string,
    name: string,
    entry_type: number,
    division_id: number,
    method_id: number,
}

export interface QueryEntriesResult {
    division: Division,
    entry: Entry,
    entrytype: EntryType,
    method: Method,
    people: Person[],
}
