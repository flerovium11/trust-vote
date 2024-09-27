import {
    FC,
    createContext,
    PropsWithChildren,
    useState,
    ReactNode,
    useEffect,
    useRef,
} from 'react'
import { MousePosProvider } from './MousePosProvider'

import './Sortable.scss'

export interface Item {
    content: ReactNode
    dragStart?: { x: number; y: number }
    containerId: string
}

export interface SortableContextValue {
    items: Item[]
    setItems: (items: Item[]) => void
}

interface SortableProviderProps extends PropsWithChildren {
    _items: Item[]
}

export const SortableContext = createContext<SortableContextValue>({
    items: [],
    setItems: () => {},
})

export const SortableProvider: FC<SortableProviderProps> = ({
    _items,
    children,
}) => {
    const [items, setItems] = useState<Item[]>(_items)

    useEffect(() => {
        const handleMouseUp = () => {
            setItems(
                items.map((item) => {
                    return {
                        ...item,
                        dragStart: undefined,
                    }
                })
            )
        }

        window.addEventListener('touchend', handleMouseUp)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('touchend', handleMouseUp)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [items])

    return (
        <MousePosProvider>
            <SortableContext.Provider
                value={{
                    items: items,
                    setItems: setItems,
                }}
            >
                {children}
            </SortableContext.Provider>
        </MousePosProvider>
    )
}
