import { FC, useContext, useEffect, useState } from 'react'
import { SortableContainer, SortableProvider } from '../../components/Sortable'
import {
    ArrowRightOutlined,
    LoadingOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import { supabase } from '../../supabase'
import { SortableContext } from '../../components/Sortable/SortableProvider'
import { Button, Popconfirm } from 'antd'

interface VoteProps {
    voucherValue: string
}

enum FetchState {
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

interface Candidate {
    display_name: string
}

const minCandidates = 3

export const Vote: React.FC<VoteProps> = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [fetchCandiatesState, setFetchCandidatesState] = useState<FetchState>(
        FetchState.LOADING
    )

    useEffect(() => {
        const fetchCandiates = async () => {
            const { data, error } = await supabase
                .from('candidate')
                .select('display_name')

            if (error) {
                setFetchCandidatesState(FetchState.ERROR)
                return console.error('Database error:' + error)
            }

            setCandidates(data)
            setFetchCandidatesState(FetchState.SUCCESS)
        }

        fetchCandiates()
    }, [])

    return (
        <div className="overflow-hidden h-screen relative p-6 max-w-screen">
            <div className="m-auto sm:max-w-xl">
                {fetchCandiatesState === FetchState.LOADING && (
                    <>
                        <LoadingOutlined /> &nbsp;Lade Kandidat*innen...
                    </>
                )}
                {fetchCandiatesState === FetchState.ERROR && (
                    <div className="text-red-500">
                        Kandidat*innen konnten nicht geladen werden, bitte lade
                        die Seite erneut.
                    </div>
                )}
                {fetchCandiatesState === FetchState.SUCCESS && (
                    <>
                        {candidates.length === 0 && (
                            <div>
                                Es gibt noch keine Kandidat*innen zu wählen
                            </div>
                        )}
                        {candidates.length > 0 && (
                            <>
                                <div className="mt-5 mb-5 text-lg">
                                    Ziehe die 6 Personen nach rechts, die du
                                    gerne in der SV sehen willst. Ganz oben
                                    den/die Schulsprecher*in, dann den/die 1.
                                    Stellvertreter*in, usw.
                                </div>
                                <SortableProvider
                                    _items={candidates.map((candidate) => ({
                                        content: candidate.display_name,
                                        containerId: '1',
                                    }))}
                                >
                                    <div className="flex gap-3 min-h-80 overflow visible">
                                        <SortableContainer id="1" />
                                        <ArrowRightOutlined className="my-auto px-5 text-blue-700 hidden sm:block" />
                                        <SortableContainer
                                            id="2"
                                            maxItems={minCandidates}
                                        />
                                    </div>
                                    <ConfirmButton
                                        className="mt-5"
                                        candidates={candidates}
                                        onConfirm={() => {}}
                                    />
                                </SortableProvider>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

interface ConfirmButtonProps {
    candidates: Candidate[]
    onConfirm: () => void
    className?: string
}

const ConfirmButton: FC<ConfirmButtonProps> = ({
    candidates,
    onConfirm,
    className,
}) => {
    const { items } = useContext(SortableContext)

    return (
        <Popconfirm
            title="Auswahl bestätigen"
            description="Bist du sicher dass du so wählen möchtest?"
            icon={<QuestionCircleOutlined className="text-red-500" />}
            okText="Absenden"
            cancelText="Abbrechen"
            placement="bottom"
            onConfirm={onConfirm}
        >
            <Button
                className={className}
                disabled={
                    items.filter((item) => item.containerId === '2').length <
                    Math.min(minCandidates, candidates.length)
                }
            >
                Bestätigen
            </Button>
        </Popconfirm>
    )
}
