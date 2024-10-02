import { FC, useEffect, useState } from 'react'
import './Admin.scss'
import { supabase } from '../../supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Session } from '@supabase/supabase-js'
import { Button } from 'antd'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

interface AdminProps {}

export const Admin: FC<AdminProps> = ({}) => {
    const [session, setSession] = useState<Session | null>(null)
    const [voucherCount, setVoucherCount] = useState<number>(0)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const addVouchers = async () => {
        if (!voucherCount) return

        const vouchers = Array.from({ length: voucherCount }, () => ({
            code: Math.random().toString(36).substring(2, 7),
        }))

        const { data, error } = await supabase.from('voucher').insert(vouchers)

        if (error) {
            console.error('Error adding vouchers: ' + error.message)
        } else {
            console.log('Added vouchers: ', vouchers)
            createAndDownloadPdfWithVouchers(vouchers.map((v) => v.code))
        }
    }

    const createAndDownloadPdfWithVouchers = async (vouchers: string[]) => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height
        const margin = 5
        const columns = 6
        const rows = 8
        const cellWidth = (pageWidth - columns * margin) / columns
        const cellHeight = (pageHeight - rows * margin) / rows

        for (let i = 0; i < vouchers.length; i++) {
            const voucher = vouchers[i]
            const url = `https://wahl.gymgmunden.at/#/?v=${voucher}`
            const col = i % columns
            const row = Math.floor(i / columns) % rows

            const x = margin + col * cellWidth
            const y = margin + row * cellHeight

            // Add voucher code
            doc.setFontSize(12)
            doc.setCharSpace(2)
            doc.text(voucher, x + 5, y + 5)

            // Generate and add QR code
            try {
                const qrCodeDataUrl = await QRCode.toDataURL(url, {
                    width: 50,
                    margin: 0,
                })
                doc.addImage(qrCodeDataUrl, 'PNG', x + 5, y + 10, 20, 20)
            } catch (error) {
                console.error('Error generating QR code:', error)
            }

            // Add cell border
            doc.rect(x, y, cellWidth, cellHeight)

            // Start a new page if we've filled the current one
            // if (i > 0 && i % 6 === 5 && i !== vouchers.length - 1) {
            //     doc.addPage()
            // }
            if (
                i > 0 &&
                i % (rows * columns) === rows * columns - 1 &&
                i !== vouchers.length - 1
            ) {
                doc.addPage()
            }
        }

        doc.save('vouchers.pdf')
    }

    if (!session) {
        return (
            <div className="m-auto max-w-screen-md p-5">
                <Auth
                    supabaseClient={supabase}
                    showLinks={false}
                    appearance={{ theme: ThemeSupa }}
                    providers={[]}
                />
            </div>
        )
    } else {
        return (
            <div className="m-auto max-w-screen-md p-5">
                <h2>Add vouchers</h2>
                <input
                    type="number"
                    className="rounded outline-none p-3 w-24"
                    value={voucherCount || ''}
                    max={1000}
                    min={0}
                    onChange={(e) => setVoucherCount(parseInt(e.target.value))}
                />
                <br />
                <Button className="mt-3" onClick={addVouchers}>
                    Add
                </Button>
            </div>
        )
    }
}
