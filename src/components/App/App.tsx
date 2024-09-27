import { FC, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { electionStartDate, electionEndDate } from '../../index'

import Home from '../../pages/Home'
import Countdown from '../../pages/Countdown'
import Closed from '../../pages/Closed'
import Vote from '../../pages/Vote'

import './App.scss'

interface AppProps {}

export const App: FC<AppProps> = ({}) => {
   const [voucherValue, setVoucherValue] = useState<string>('')

   const navigate = useNavigate()

   useEffect(() => {
      const now = new Date()
      if (now > electionEndDate) {
         navigate('/closed')
      } else if (now < electionStartDate) {
         navigate('/countdown')
      }
   }, [])

   return (
      <>
         <Routes>
            <Route
               path="/"
               element={
                  <Home
                     voucherValue={voucherValue}
                     setVoucherValue={setVoucherValue}
                  />
               }
            />
            <Route
               path="/vote"
               element={<Vote voucherValue={voucherValue} />}
            />
            <Route
               path="/countdown"
               element={<Countdown to={electionStartDate} />}
            />
            <Route path="/closed" element={<Closed />} />
         </Routes>
      </>
   )
}
