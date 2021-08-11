import React from "react"
import AppSideBar from "./app-side-bar"
import { HasSend } from "../machines/fileMachine"
import { useMachine } from "@xstate/react"
import { pageMachine } from "../machines/pageMachine"
import NewEntryPage from "./page-new-entry"
import PersonSelect from "./person-select"
import HomePage from "./page-home"

const MainPage: React.FC<HasSend> = ({ xsend }) => {
    const [xpagecurrent, xpagesend] = useMachine(pageMachine)

    let page = <h1>PAGE NOT IMPLEMENTED</h1>

    if (xpagecurrent.matches('home')) {
        page = <HomePage />
    } else if (xpagecurrent.matches("add_entry")) {
        page = <NewEntryPage xpagesend={xpagesend} />
    }

    return (
        <div className="App">
            <AppSideBar xsend={xsend} xpagesend={xpagesend} />
            <header className="App-main-header">
                {page}
            </header>
        </div >
    )
}

export default MainPage
