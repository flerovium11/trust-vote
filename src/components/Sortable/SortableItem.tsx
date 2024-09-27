import { FC, CSSProperties, useContext, useRef } from 'react'
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

    const onClick = () => {
        setItems(
            items.map((i, index) => {
                if (index === id) {
                    return {
                        ...i,
                        dragStart: {
                            x: mousePos.x,
                            y: mousePos.y - itemRef.current!.offsetTop,
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
                    transform: `translate(${mousePos.x - item.dragStart.x}px, ${
                        mousePos.y - item.dragStart.y
                    }px)`,
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
