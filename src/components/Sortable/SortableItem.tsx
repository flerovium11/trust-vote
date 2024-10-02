import { FC, CSSProperties, useContext, useRef, useEffect } from 'react'
import { Item, SortableContext } from './SortableProvider'
import { useMousePos } from './MousePosProvider'

interface SortableItemProps {
    id: number
    item: Item
    style?: CSSProperties
}

export const SortableItem: FC<SortableItemProps> = ({ id, item, style }) => {
    const { items, setItems } = useContext(SortableContext)
    const mousePos = useMousePos()
    const itemRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (item.dragStart) {
            if (mousePos.y - window.scrollY < 50) {
                window.scrollTo(0, window.scrollY - 5)
            }

            if (mousePos.y + 50 > window.innerHeight + window.scrollY) {
                window.scrollTo(0, window.scrollY + 5)
            }
        }
    }, [mousePos])

    const onClick = () => {
        setItems(
            items.map((i, index) => {
                if (index === id) {
                    return {
                        ...i,
                        dragStart: {
                            width: itemRef.current?.offsetWidth || 0,
                            height: itemRef.current?.offsetHeight || 0,
                        },
                    }
                }

                return i
            })
        )
    }

    return (
        <div
            key={id}
            ref={itemRef}
            data-id={id}
            className={'sortable-item' + (item.dragStart ? ' dragging' : '')}
            style={{
                ...(item.dragStart && {
                    top: mousePos.y - item.dragStart.height / 2,
                    left: mousePos.x - item.dragStart.width / 2,
                    width: item.dragStart.width,
                    height: item.dragStart.height,
                }),
                ...style,
            }}
            onMouseDown={onClick}
            onTouchStart={onClick}
        >
            {item.content}
        </div>
    )
}
