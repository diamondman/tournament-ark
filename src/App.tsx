import { listen } from '@tauri-apps/api/event'

import { useMachine } from "@xstate/react"
import { fileMachine } from "./machines/fileMachine"
import CreateOpenPage from "./components/page-create-open"
import MainPage from "./components/page-main"
import './App.css'
import { useEffect } from 'react'

interface Payload {
  message: string;
}

function App() {
  const [current, send] = useMachine(fileMachine, {
    devTools: true,
  })

  console.log(current)

  useEffect(
    () => {
      const unlisten = listen<Payload>('FILE_STATE_CHANGE', event => {
        if (event.payload.message === "CLOSE") {
          send({ type: 'E_CLOSE' });
        } else if (event.payload.message === "CREATE") {
          send({ type: 'E_CREATE' });
        } else if (event.payload.message === "OPEN") {
          send({ type: 'E_OPEN' });
        } else {
          console.log("Unknown message type " + event.payload.message);
        }
      })
      return () => {
        unlisten.then((unlisten_fn) => {
          unlisten_fn();
        })
      }
    },
    [send] // Only run this once.
  )

  let component = <h3>NOT IMPLEMENTED</h3>;

  if (current.matches('idle')) {
    component = <CreateOpenPage />;
  } else if (current.matches("open")) {
    component = <MainPage xsend={send}/>;
  }

  return (
    component
  )
}

export default App
