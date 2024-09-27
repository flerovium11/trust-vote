import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { countdownString } from '../../utils'
import './Countdown.scss'

interface CountdownProps {
   to: Date
}

export const Countdown: FC<CountdownProps> = ({ to }) => {
   const [remaining, setRemaining] = useState<string>(
      countdownString(new Date(), to)
   )

   const navigate = useNavigate()

   useEffect(() => {
      if (new Date() > to) {
         navigate('/')
      }

      const interval = setInterval(() => {
         setRemaining(countdownString(new Date(), to))
      }, 1000)

      return () => {
         clearInterval(interval)
      }
   }, [])

   return (
      <>
         <div className="flex content-center flex-wrap h-screen gap-3">
            <div className="w-full text-center text-gray-700 text-5xl">
               Wahl startet in
            </div>
            <div className="w-full text-center text-gray-500 text-8xl font-bold">
               {remaining}
            </div>
         </div>
      </>
   )
}
