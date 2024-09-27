import {
    useState,
    useEffect,
    FC,
    PropsWithChildren,
    useMemo,
    useContext,
    createContext,
} from 'react'

export const MousePosContext = createContext<{
    mousePos: { x: number; y: number }
}>({ mousePos: { x: 0, y: 0 } })

export const MousePosProvider: FC<PropsWithChildren> = ({ children }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY })
        }

        const handleTouchMove = (e: TouchEvent) => {
            setMousePos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            })
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('touchmove', handleTouchMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('touchmove', handleTouchMove)
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
