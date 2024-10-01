import { FC, useContext, useEffect, useState } from 'react'
import { SortableContainer, SortableProvider } from '../../components/Sortable'
import { ArrowRightOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { supabase } from '../../supabase'
import {
    Item,
    SortableContext,
} from '../../components/Sortable/SortableProvider'
import { Button, Popconfirm, Skeleton } from 'antd'
import { setCookie, validateVoucher, ValidationState } from '../../utils'
import { useNavigate } from 'react-router-dom'
interface VoteProps {
    voucherValue: string
    setVoucherValue: (value: string) => void
}

export enum FetchState {
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export interface Candidate {
    id: number
    display_name: string
}

const minCandidates = 6

export const Vote: React.FC<VoteProps> = ({
    voucherValue,
    setVoucherValue,
}) => {
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [candidatesCount, setCandidatesCount] =
        useState<number>(minCandidates)
    const [fetchCandiatesState, setFetchCandidatesState] = useState<FetchState>(
        FetchState.LOADING
    )

    const navigate = useNavigate()

    useEffect(() => {
        const fetchCandiates = async () => {
            const { data, error } = await supabase
                .from('candidate')
                .select('id, display_name')

            if (error) {
                setFetchCandidatesState(FetchState.ERROR)
                return console.error('Database error: ' + error.message)
            }

            setCandidates(data)
            setCandidatesCount(Math.min(data.length, minCandidates))
            setFetchCandidatesState(FetchState.SUCCESS)
        }

        fetchCandiates()
    }, [])

    const onVote = async (items: Item[]) => {
        const state = await validateVoucher(voucherValue)

        if (state === ValidationState.INVALID) {
            setCookie(
                'info-message',
                'Voucher ungültig, bitte versuche es mit einem anderen',
                1
            )
            return navigate('/')
        }

        if (state === ValidationState.USED) {
            setCookie(
                'info-message',
                'Voucher bereits verwendet, bitte versuche es mit einem anderen',
                1
            )
            return navigate('/')
        }

        const { error } = await supabase
            .from('voucher')
            .update({ used: true })
            .eq('code', voucherValue)

        if (error) {
            console.error('Database error: ' + error.message)
            setCookie(
                'info-message',
                'Fehler beim Einlösen des Vouchers, bitte versuche es erneut',
                1
            )
            return navigate('/')
        }

        const voteCandidates = items.filter((item) => item.containerId === '2')

        if (voteCandidates.length !== candidatesCount) {
            setCookie(
                'info-message',
                `Du musst ${candidatesCount} Personen wählen`,
                1
            )
            return navigate('/vote')
        }

        for (let i = 0; i < voteCandidates.length; i++) {
            const { error } = await supabase.from('vote').insert({
                candidate_id: voteCandidates[i].candidateId,
                points: candidatesCount - i,
            })

            if (error) {
                console.error('Database error: ' + error.message)
                setCookie(
                    'info-message',
                    'Fehler beim Speichern der Stimme, bitte versuche es erneut',
                    1
                )
                return navigate('/')
            }
        }

        setVoucherValue('')
        navigate('/voted')
    }

    return (
        <div className="overflow-hidden min-h-screen relative p-6 max-w-screen">
            <div className="m-auto sm:max-w-xl">
                {fetchCandiatesState === FetchState.ERROR && (
                    <div className="text-red-500">
                        Kandidat*innen konnten nicht geladen werden, bitte lade
                        die Seite erneut.
                    </div>
                )}
                {(fetchCandiatesState === FetchState.SUCCESS ||
                    fetchCandiatesState === FetchState.LOADING) && (
                    <>
                        {candidates.length === 0 &&
                            fetchCandiatesState !== FetchState.LOADING && (
                                <div>
                                    Es gibt noch keine Kandidat*innen zu wählen
                                </div>
                            )}
                        {(candidates.length > 0 ||
                            fetchCandiatesState === FetchState.LOADING) && (
                            <>
                                <div className="mt-5 mb-5 text-lg">
                                    Ziehe die {candidatesCount} Personen nach
                                    rechts, die du gerne in der SV sehen willst.
                                    Ganz oben den/die Schulsprecher*in, dann
                                    den/die 1. Stellvertreter*in, usw.
                                </div>
                                {fetchCandiatesState === FetchState.LOADING && (
                                    <SortableProvider
                                        items={Array(6).fill({
                                            content: (
                                                <Skeleton
                                                    active
                                                    paragraph={false}
                                                    title={{
                                                        width: '100%',
                                                    }}
                                                />
                                            ),
                                            containerId: '1',
                                        })}
                                    >
                                        <div className="flex gap-3 min-h-80 overflow visible">
                                            <SortableContainer id="1" />
                                            <ArrowRightOutlined className="my-auto px-5 text-blue-700 hidden sm:block" />
                                            <SortableContainer
                                                id="2"
                                                maxItems={candidatesCount}
                                            />
                                        </div>
                                        <ConfirmButton
                                            className="mt-5"
                                            candidatesCount={candidatesCount}
                                            onConfirm={() => {}}
                                        />
                                    </SortableProvider>
                                )}
                                {fetchCandiatesState === FetchState.SUCCESS && (
                                    <SortableProvider
                                        items={candidates.map((candidate) => ({
                                            content: candidate.display_name,
                                            candidateId: candidate.id,
                                            containerId: '1',
                                        }))}
                                    >
                                        <div className="flex gap-3 min-h-80 overflow visible">
                                            <SortableContainer id="1" />
                                            <ArrowRightOutlined className="my-auto px-5 text-blue-700 hidden sm:block" />
                                            <SortableContainer
                                                id="2"
                                                maxItems={candidatesCount}
                                            />
                                        </div>
                                        <ConfirmButton
                                            className="mt-5"
                                            candidatesCount={candidatesCount}
                                            onConfirm={(items) => onVote(items)}
                                        />
                                    </SortableProvider>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

interface ConfirmButtonProps {
    candidatesCount: number
    onConfirm: (items: Item[]) => void
    className?: string
}

const ConfirmButton: FC<ConfirmButtonProps> = ({
    candidatesCount,
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
            onConfirm={() => onConfirm(items)}
        >
            <Button
                className={className}
                disabled={
                    items.filter((item) => item.containerId === '2').length <
                    candidatesCount
                }
            >
                Bestätigen
            </Button>
        </Popconfirm>
    )
}
