import { FC } from 'react'
import { CheckOutlined } from '@ant-design/icons'
import './Voted.scss'

interface VotedProps {}

export const Voted: FC<VotedProps> = () => {
    return (
        <>
            <div className="flex content-center flex-wrap h-screen max-w-screen-lg m-auto gap-3 p-4">
                <div className="w-full text-center text-gray-500 text-2xl">
                    Danke fürs Mitmachen! Deine Stimme wurde erfolgreich
                    abgegeben. <CheckOutlined className="text-green-500" />
                </div>
                <div className="w-full text-center text-gray-500 text-lg">
                    Du kannst diese Seite jetzt schließen.
                </div>
            </div>
        </>
    )
}
