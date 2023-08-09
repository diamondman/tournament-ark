import React from "react"
import AppSideBar from "./app-side-bar"
import { HasSend } from "../machines/fileMachine"
import { useMachine } from "@xstate/react"
import { pageMachine } from "../machines/pageMachine"
import NewEntryPage from "./page-new-entry"
import PageListEntries from "./page-list-entries"
import PageListCategories from "./page-list-categories"
import PageListEntryCards from "./page-list-entry-cards"
import HomePage from "./page-home"

const MainPage: React.FC<HasSend> = ({ xsend }) => {
    const [xpagecurrent, xpagesend] = useMachine(pageMachine)

    let page = <h1>PAGE NOT IMPLEMENTED</h1>

    if (xpagecurrent.matches('home')) {
        page = <HomePage />
    } else if (xpagecurrent.matches("list_entries")) {
        page = <PageListEntries />
    } else if (xpagecurrent.matches("list_categories")) {
        page = <PageListCategories />
    } else if (xpagecurrent.matches("list_entry_cards")) {
        page = <PageListEntryCards />
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
