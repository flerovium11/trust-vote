import {
    FC,
    useContext,
    useRef,
    useState,
    MouseEvent,
    useEffect,
    type TouchEvent,
    CSSProperties,
} from 'react'
import { SortableContext } from './SortableProvider'
import { SortableItem } from './SortableItem'
import { useMousePos } from './MousePosProvider'

interface SortableContainerProps {
    id: string
    maxItems?: number
}

let addAfterIndex: number

export const SortableContainer: FC<SortableContainerProps> = ({
    id,
    maxItems,
}) => {
    const { items, setItems } = useContext(SortableContext)
    const [placeholder, setPlaceholder] = useState<number | null | 'full'>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const mousePos = useMousePos()

    const shouldIStopMouseEventHandling = (pos: {
        x: number
        y: number
    }): boolean => {
        if (!containerRef.current) return true
        if (
            !document
                .elementsFromPoint(pos.x, pos.y)
                .includes(containerRef.current)
        ) {
            setPlaceholder(null)
            return true
        }

        return false
    }

    const handleDrop = () => {
        if (shouldIStopMouseEventHandling(mousePos)) return
        const dragItem = items.find((item) => item.dragStart)

        if (dragItem) {
            if (
                maxItems &&
                dragItem.containerId !== id &&
                items.filter((item) => item.containerId === id).length >=
                    maxItems
            )
                return

            setItems(
                [
                    ...items.slice(0, addAfterIndex + 1),
                    {
                        ...dragItem,
                        containerId: id,
                        dragStart: undefined,
                    },
                    ...items.slice(addAfterIndex + 1),
                ].filter((item) => !item.dragStart)
            )
        }

        setPlaceholder(null)
    }

    useEffect(() => {
        handleMove()
        window.addEventListener('touchend', handleDrop)
        window.addEventListener('mouseup', handleDrop)

        return () => {
            window.removeEventListener('touchend', handleDrop)
            window.removeEventListener('mouseup', handleDrop)
        }
    }, [mousePos])

    const handleMove = () => {
        if (shouldIStopMouseEventHandling(mousePos)) return

        const dragItem = items.find((item) => item.dragStart)

        if (dragItem) {
            if (
                maxItems &&
                dragItem.containerId !== id &&
                items.filter((item) => item.containerId === id).length >=
                    maxItems
            ) {
                setPlaceholder('full')
                return
            }

            let placeholderIndex = 1
            addAfterIndex = -1

            Array.from(containerRef.current!.children)
                .filter(
                    (c) =>
                        c.classList.contains('sortable-item') &&
                        !c.classList.contains('dragging')
                )
                .forEach((child, _) => {
                    const rect = child.getBoundingClientRect()
                    const center = rect.top + rect.height / 2

                    if (mousePos.y > center) {
                        placeholderIndex =
                            parseInt(
                                (
                                    child as HTMLDivElement
                                ).style.getPropertyValue('order')
                            ) + 1

                        addAfterIndex = parseInt(
                            (child as HTMLDivElement).dataset.id ?? '-1'
                        )
                    }
                })

            setPlaceholder(placeholderIndex)
        } else {
            setPlaceholder(null)
        }
    }

    let itemOrder = 0

    return (
        <div
            className="sortable-container flex flex-col gap-3"
            ref={containerRef}
        >
            {placeholder && (
                <div
                    className={
                        'placeholder' + (placeholder === 'full' ? ' full' : '')
                    }
                    style={
                        placeholder !== 'full'
                            ? { order: placeholder }
                            : ({
                                  '--message': `'Maximal ${maxItems} Personen'`,
                              } as CSSProperties)
                    }
                ></div>
            )}
            {items.map((item, index) => {
                if (item.containerId === id) {
                    itemOrder++
                    return (
                        <SortableItem
                            id={index}
                            item={item}
                            key={index}
                            style={{ order: itemOrder }}
                        />
                    )
                }
            })}
        </div>
    )
}
