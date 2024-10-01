import { FC, useEffect, useState } from 'react'
import SingleDigitInput from '../../components/SingleCharInput'
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    CloseCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import './Home.scss'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
    getCookie,
    setCookie,
    validateVoucher,
    ValidationState,
} from '../../utils'

interface HomeProps {
    voucherValue: string
    setVoucherValue: (value: string) => void
}

const voucherLength = 5

export const Home: FC<HomeProps> = ({ voucherValue, setVoucherValue }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const [info, setInfo] = useState<string | null>(null)
    const location = useLocation()

    const [validationState, setValidationState] = useState<ValidationState>(
        ValidationState.IDLE
    )

    const handleVoucherInput = (value: string): void => {
        setVoucherValue(value)
        setValidationState(ValidationState.IDLE)

        if (value.length === voucherLength) submitVoucher(value)
    }

    useEffect(() => {
        const urlVoucher = searchParams.get('v')

        if (urlVoucher && urlVoucher.length === voucherLength) {
            setTimeout(() => handleVoucherInput(urlVoucher), 500)
        }
    }, [])

    useEffect(() => {
        if (getCookie('info-message')) {
            setInfo(getCookie('info-message'))
            setCookie('info-message', '', -1)
        }
    }, [location])

    const submitVoucher = async (value: string) => {
        setValidationState(ValidationState.LOADING)

        if (value === '@dmin') {
            setTimeout(() => navigate('/admin'), 1000)
            return setValidationState(ValidationState.VALID)
        }

        const state = await validateVoucher(value)
        setValidationState(state)

        if (state === ValidationState.VALID) {
            setTimeout(() => navigate('/vote'), 1000)
        }
    }

    return (
        <>
            {info && (
                <div
                    className="fixed slide-in left-1/2 -translate-x-1/2 max-w-screen bg-red-700 rounded-lg p-3 text-white select-none"
                    onClick={(e) => {
                        e.currentTarget?.classList.add('slide-out')
                        setTimeout(
                            () =>
                                e.currentTarget?.classList.remove('slide-out'),
                            500
                        )
                    }}
                >
                    <WarningOutlined />
                    &nbsp;{info}
                </div>
            )}
            <div className="w-full h-screen flex flex-wrap justify-center content-center gap-3">
                <div className="text-gray-600 w-full text-2xl text-center">
                    Gib deinen Voucher ein
                </div>
                <div className="text-gray-400 fixed bottom-3 left-1/2 -translate-x-1/2">
                    Bei Problemen oder Fragen bitte über Teams an Ennio Binder
                    wenden.
                </div>
                <div className="relative text-2xl">
                    <SingleDigitInput
                        length={voucherLength}
                        value={voucherValue}
                        onInput={handleVoucherInput}
                        disabled={[
                            ValidationState.LOADING,
                            ValidationState.VALID,
                        ].includes(validationState)}
                        state={
                            validationState === ValidationState.VALID
                                ? 'success'
                                : [
                                      ValidationState.INVALID,
                                      ValidationState.USED,
                                  ].includes(validationState)
                                ? 'error'
                                : undefined
                        }
                    />
                    {validationState === ValidationState.LOADING && (
                        <LoadingOutlined className="absolute right-[-1.75em] top-[0.4em]" />
                    )}
                    {validationState === ValidationState.VALID && (
                        <CheckCircleOutlined className="absolute right-[-1.75em] top-[0.4em] text-green-500" />
                    )}
                    {validationState === ValidationState.USED && (
                        <>
                            <ExclamationCircleOutlined className="absolute right-[-1.75em] top-[0.4em] text-red-500" />
                            <span className="text-red-500 absolute bottom-[-2em] text-lg">
                                Voucher schon verwendet
                            </span>
                        </>
                    )}
                    {validationState === ValidationState.INVALID && (
                        <CloseCircleOutlined className="absolute right-[-1.75em] top-[0.4em] text-red-500" />
                    )}
                </div>
            </div>
        </>
    )
}
