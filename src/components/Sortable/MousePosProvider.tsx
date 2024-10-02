import {
    useState,
    useEffect,
    FC,
    PropsWithChildren,
    useMemo,
    useContext,
    createContext,
} from 'react'
import { SortableContext } from './SortableProvider'

export const MousePosContext = createContext<{
    mousePos: { x: number; y: number }
}>({ mousePos: { x: 0, y: 0 } })

export const MousePosProvider: FC<PropsWithChildren> = ({ children }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }

        const handleTouch = (e: TouchEvent) => {
            setMousePos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            })
        }

        window.addEventListener('mousemove', handleMouse)
        window.addEventListener('mousedown', handleMouse)
        window.addEventListener('touchmove', handleTouch)
        window.addEventListener('touchstart', handleTouch)

        return () => {
            window.removeEventListener('mousemove', handleMouse)
            window.removeEventListener('touchmove', handleTouch)
            window.removeEventListener('mousedown', handleMouse)
            window.removeEventListener('touchstart', handleTouch)
        }
    }, [])

    const memoizedMousePosition = useMemo(() => ({ mousePos }), [mousePos])

    return (
        <MousePosContext.Provider value={memoizedMousePosition}>
            {children}
        </MousePosContext.Provider>
    )
}

export const useMousePos = () => {
    const context = useContext(MousePosContext)
    if (!context) {
        throw new Error('useMousePos must be used within a MousePosProvider')
    }
    return context.mousePos
}
