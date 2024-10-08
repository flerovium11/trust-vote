import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './components/App'
import reportWebVitals from './reportWebVitals'
import './styles/index.scss'

if (
    !process.env.REACT_APP_ELECTION_START ||
    !process.env.REACT_APP_ELECTION_END
) {
    throw new Error(
        'Please specify the election start and end dates in the .env file'
    )
}

export const electionStartDate = new Date(process.env.REACT_APP_ELECTION_START)
export const electionEndDate = new Date(process.env.REACT_APP_ELECTION_END)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
