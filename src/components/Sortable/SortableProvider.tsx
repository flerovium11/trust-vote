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
    candidateId: number
    dragStart?: { width: number; height: number }
    containerId: string
}

export interface SortableContextValue {
    items: Item[]
    setItems: (items: Item[]) => void
}

interface SortableProviderProps extends PropsWithChildren {
    items: Item[]
}

export const SortableContext = createContext<SortableContextValue>({
    items: [],
    setItems: () => {},
})

export const SortableProvider: FC<SortableProviderProps> = (props) => {
    const [items, setItems] = useState<Item[]>(props.items)

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

        const handleTouchMove = (e: TouchEvent) => {
            if (document.body.querySelector('.sortable-item.dragging')) {
                e.preventDefault()
            }
        }

        window.addEventListener('touchend', handleMouseUp)
        window.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        })
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
                {props.children}
            </SortableContext.Provider>
        </MousePosProvider>
    )
}
