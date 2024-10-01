import { FC, useEffect, useRef, useState } from 'react'
import './Closed.scss'
import { useNavigate } from 'react-router-dom'
import { electionEndDate, electionStartDate } from '../..'
import { Skeleton } from 'antd'
import { Candidate, FetchState } from '../Vote/Vote'
import { supabase } from '../../supabase'

interface ClosedProps {}

interface Result extends Candidate {
    votes: number
    percentage: number
    relative: number
}

export const Closed: FC<ClosedProps> = (props) => {
    const navigate = useNavigate()
    const [results, setResults] = useState<Result[]>([])
    const [fetchResultsState, setFetchResultsState] = useState<FetchState>(
        FetchState.LOADING
    )

    useEffect(() => {
        const now = new Date()
        if (now < electionStartDate) {
            navigate('/closed')
        } else if (now < electionEndDate) {
            navigate('/')
        }

        const fetchCandiates = async () => {
            const { data, error } = await supabase.from('candidate').select(
                `
                    id, 
                    display_name,
                    votes:vote (points.sum())
                `
            )

            if (error) {
                setFetchResultsState(FetchState.ERROR)
                return console.error('Error fetching results: ' + error.message)
            }

            const withVotes = data.map((r: any) => ({
                ...r,
                votes: r.votes.length ? r.votes[0].sum ?? 0 : 0,
            }))

            const sum = Math.max(
                withVotes.reduce((acc: number, r: any) => acc + r.votes, 0),
                1
            )

            const max = Math.max(...withVotes.map((r: any) => r.votes))

            setResults(
                withVotes
                    .sort((a: any, b: any) => b.votes - a.votes)
                    .map((r: any) => ({
                        ...r,
                        percentage: r.votes / sum,
                        relative: r.votes / max,
                    }))
            )

            setFetchResultsState(FetchState.SUCCESS)
        }

        fetchCandiates()
    }, [])

    const colors = [
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a',
        '#d62728',
        '#ff9896',
        '#9467bd',
        '#c5b0d5',
        '#8c564b',
        '#c49c94',
        '#e377c2',
        '#f7b6d2',
        '#7f7f7f',
        '#c7c7c7',
        '#bcbd22',
        '#dbdb8d',
        '#17becf',
        '#9edae5',
    ]

    const pointsAPersonCanGive = (results.length / 2) * (1 + results.length)
    const totalVotes =
        results.reduce((acc, r) => acc + r.votes, 0) / pointsAPersonCanGive

    return (
        <>
            <div className="p-5 max-w-screen-md m-auto">
                <div className="text-gray-500 text-5xl">
                    Wahl vorbei. Danke fürs Mitmachen!
                </div>
                <div className="text-gray-400 mt-3">
                    Abgegebene Stimmen: {totalVotes}
                </div>
                <div className="mt-10 w-full m-auto">
                    {fetchResultsState === FetchState.ERROR && (
                        <div className="red-500">
                            Fehler beim Laden der Ergebnisse
                        </div>
                    )}
                    {fetchResultsState === FetchState.LOADING && (
                        <Skeleton active />
                    )}
                    {fetchResultsState === FetchState.SUCCESS && (
                        <div className="w-full">
                            {results.map((r, i) => (
                                <div
                                    key={r.id}
                                    className="flex justify-start gap-3 items-center mb-3"
                                >
                                    <div className="w-1/4">
                                        {r.display_name}
                                    </div>
                                    <div className="flex gap-3 items-center w-3/4">
                                        <div
                                            className="h-10 rounded"
                                            style={{
                                                backgroundColor: colors[i],
                                                width: `${r.relative * 100}%`,
                                            }}
                                        ></div>
                                        <div className="text-lg font-bold text-gray-500">
                                            {Math.round(r.percentage * 10000) /
                                                100}
                                            %
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
