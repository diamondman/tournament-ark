import { Machine } from "xstate";

interface FileContent {

}

export type FileEvent = 
    | { type: "E_CLOSE" }
    | { type: "E_CREATE" }
    | { type: "E_OPEN" }

export interface HasSend {
    xsend: (event: FileEvent) => void;
}

export const fileMachine = Machine<FileContent, any, FileEvent>({
    id: "file",
    initial: "idle",
    context: {

    },
    states: {
        idle: {
            on: {
                E_CREATE: 'open',
                E_OPEN: 'open',
            },
        },
        open: {
            on: {
                E_CLOSE: 'idle',
            },
        },
    },
});








// interface FileStateSchema {
//     states: {
//        idle: {};
//        open: {};
//     }
// }