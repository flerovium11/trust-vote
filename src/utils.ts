import { supabase } from './supabase'

export const countdownString = (from: Date, to: Date): string => {
    const diff = to.getTime() - from.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export const setCookie = (name: string, value: string, days: number): void => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`
}

export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
    return null
}

export enum ValidationState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    VALID = 'VALID',
    USED = 'USED',
    INVALID = 'INVALID',
}

export const validateVoucher = async (
    value: string
): Promise<ValidationState> => {
    const { data, error } = await supabase
        .from('voucher')
        .select()
        .eq('code', value)

    if (error) console.error('Database error: ' + error.message)

    if (error || data.length === 0) {
        return ValidationState.INVALID
    }

    const voucher = data[0]

    if (voucher.used) {
        return ValidationState.USED
    }

    return ValidationState.VALID
}
