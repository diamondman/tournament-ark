import React from "react"
import { invoke } from '@tauri-apps/api/tauri'

const CreateOpenPage: React.FC<{}> = () => {
  return (
    <React.Fragment>
      <div className="App">
        <header className="App-header">
          <button className="App-button"
            onClick={() => {invoke('create_db');}}>
            🆕 Create New Tournament.
          </button>

          <button className="App-button"
            onClick={() => {invoke('open_db');}}>
            📂 Open Existing Tournament.
          </button>
        </header>
      </div>
    </React.Fragment>
  )
}

export default CreateOpenPage
