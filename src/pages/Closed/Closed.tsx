import { FC, useEffect } from 'react'
import './Closed.scss'
import { useNavigate } from 'react-router-dom'
import { electionEndDate, electionStartDate } from '../..'

interface ClosedProps {}

export const Closed: FC<ClosedProps> = (props) => {
   const navigate = useNavigate()

   useEffect(() => {
      const now = new Date()
      if (now < electionStartDate) {
         navigate('/closed')
      } else if (now < electionEndDate) {
         navigate('/')
      }
   }, [])

   return (
      <>
         <div className="flex content-center flex-wrap h-screen gap-3">
            <div className="w-full text-center text-gray-500 text-5xl">
               Wahl vorbei. Danke fürs Mitmachen!
            </div>
         </div>
      </>
   )
}
