import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
import Draggable from './Draggable'
import {inRange} from 'lodash';


function DragContainer() {
    const items = [
        { id: 0, number: "1", title: "India"},
        { id: 1, number: "2", title: "Singapore"},
        { id: 2, number: "3", title: "South Korea"},
        { id: 3, number: "4", title: "Canada"},
        { id: 4, number: "5", title: "New Zealand"},
    ];

    const [state, setState] = useState({
        order: items,
        dragOrder: items,
        draggedIndex: null,
    });

    const handleDrag = useCallback(({translation, item}) => {
        const delta = Math.round(translation.y / 50);
        const index = state.order.indexOf(item);
        // console.log("order:", state.order);
        const dragOrder = state.order.filter((idx) => {
            // console.log("filter:", idx, item.id)
            return idx.id !== item.id;
        });
        // console.log("dragOrder:", index, item.id, dragOrder);

        if(!inRange(index + delta, 0, state.order.length)) {
            console.log("not in range");
            return;
        }

        dragOrder.splice(index + delta, 0, item);
        console.log("dragOrder after splice:", dragOrder);
        setState(state => ({
            ...state,
            draggedIndex: item.id,
            dragOrder
        }));
    }, [state.order, state.order.length]);

    const handleDragEnd = useCallback(() => {
        console.log("drag end");
        setState(state => ({
            ...state,
            order: state.dragOrder,
            draggedIndex: null
        }));
    }, []);


    return (
        <Container>
            {state.order.map((item, index) => {
                const isDragging = state.draggedIndex === index;
                // console.log(item, state.order.indexOf(item), state.order);
                const draggedTop = (state.order.indexOf(item) * 50) + 10;
                const top = (state.dragOrder.indexOf(item) * 50) + 10;
                // console.log(index, isDragging, draggedTop, top);
                return (
                    <Draggable 
                        key={index} 
                        item={item}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}>
                        <Rect
                            isDragging={isDragging}
                            top={isDragging ? draggedTop : top}
                        >
                            {item.number} {' - '} {item.title}
                        </Rect>
                    </Draggable>
                )
            })}
        </Container>
    );
}

export default DragContainer;

const Container = styled.div`
    width: 100vw;
    min-height: 100vh;
`;

const Rect = styled.div.attrs(props => ({
    style: {
        top: `${props.top}px`,
        transition: props.isDragging ? 'none' : 'all 500ms'
    }
}))`
    width: 300px;
    height: 50px;
    user-select: none;
    background: white;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
    display: flex;
    align-elements: center;
    justify-content: center;
    position: absolute;
    font-size: 20px;
    color: #777;
    left: calc(50vw - 150px);
`;
