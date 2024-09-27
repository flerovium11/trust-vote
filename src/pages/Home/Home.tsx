import { FC, useEffect, useState } from 'react'
import SingleDigitInput from '../../components/SingleCharInput'
import { supabase } from '../../supabase'
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons'
import './Home.scss'
import { useNavigate, useSearchParams } from 'react-router-dom'

enum ValidationState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    VALID = 'VALID',
    USED = 'USED',
    INVALID = 'INVALID',
}

interface HomeProps {
    voucherValue: string
    setVoucherValue: (value: string) => void
}

const voucherLength = 5

export const Home: FC<HomeProps> = ({ voucherValue, setVoucherValue }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

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

    const submitVoucher = async (value: string) => {
        setValidationState(ValidationState.LOADING)

        const { data, error } = await supabase
            .from('voucher')
            .select()
            .eq('code', parseInt(value))

        if (error) console.error('Database error: ' + error)

        if (error || data.length === 0) {
            setValidationState(ValidationState.INVALID)
            return
        }

        const voucher = data[0]

        if (voucher.used) {
            setValidationState(ValidationState.USED)
            return
        }

        setValidationState(ValidationState.VALID)

        setTimeout(() => navigate('/vote'), 1000)
    }

    return (
        <>
            <div className="w-full h-screen flex flex-wrap justify-center content-center gap-3">
                <div className="text-gray-600 w-full text-2xl text-center">
                    Gib deinen Voucher ein
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
