import React, {useState, useRef} from 'react';
import { useDrag } from 'react-use-gesture';
import {clamp} from 'lodash';
 
const items = [
  { number: "1", title: "India"},
  { number: "2", title: "Singapore"},
  { number: "3", title: "South Korea"},
  { number: "4", title: "Canada"},
  { number: "5", title: "New Zealand"},
]

let draggingMode = 'x';
let setDraggingMode = true;
const POSITION = {x:0, y:0};

const createTransformState = (newOrder, index, currIndex, down, xPos, yPos, order) => {
  console.log(newOrder, index, currIndex, order);
  let newOrderIdx = newOrder.indexOf(index);
  let orderIdx = order && order.indexOf(index);
  console.log(newOrderIdx, orderIdx);

  if(draggingMode === 'x') {
    return index === currIndex && xPos < 0
        ? { x: xPos, y: newOrderIdx * 50, scale: 1.1, zIndex: '100', shadow: 15, immediate: n => n === 'y' || n === 'zIndex' }
        : { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1, immediate: false }
  } else {
    return down && index === currIndex
        ? { x: 0, y: orderIdx * 50 + yPos, scale: 1.1, zIndex: '100', shadow: 15, immediate: n => n === 'y' || n === 'zIndex' }
        : { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1, immediate: false }
  }
}
    
function DragTest() {
  const order = useRef(items.map((_, index) => index));

  const [state, setState] = useState({
    isDragging: false
  });

  const setItemsState = () => {
    return items.map((item, index) => {
      return createTransformState(order.current, index);
    })
  }

  const [itemTransformState, setItemTransormState] = useState(()=> setItemsState());
  // console.log("itemTransformState:", itemTransformState);

  const getTransformPosition = (transformItem) => {
    // console.log("transform item:", transformItem);
    return { 
      zIndex: transformItem.zIndex,
      transform: `translate3D(${transformItem.x}px, ${transformItem.y}px, 0px)`,
      // transition: state.isDragging ? 'none' : 'transform 500ms',
      // transition: 'transform 500ms',
    }
  }

  const onDragEnd = () => {
    console.log("reset drag or call service");
    setDraggingMode = true;
  }

  const swapOrder = (orderArr, curIndex, curRow) => {
    orderArr.splice(curRow, 0, orderArr.splice(curIndex, 1)[0]);
    return orderArr;
  }

  // Set the drag hook and define component movement based on gesture data
  const bind = useDrag(({ down, movement: [mx, my], args, direction, distance, delta, first, last}) => {
    // console.log("down:", down);
    // console.log("args:", args);
    // console.log("direction:", direction);
    // console.log("distance:", distance);
    // console.log("movement:", mx, my);
    // console.log("movement delta:", delta);

    if(first) {
      setState(state => ({
        ...state,
        isDragging: true
      }));
    }
    
    if((mx != 0 || my != 0) && setDraggingMode) {
      draggingMode = (my > 0 || my < 0) ? 'y' : 'x';
      setDraggingMode = false;
      console.log("draggingMode:", draggingMode);
    }

    const curIndex = order.current.indexOf(args[0]);
    const curRow = clamp(Math.round((curIndex * 50 + my) / 50), 0, items.length - 1);
    // console.log(curIndex, curRow);
    const newOrder = swapOrder([...order.current], curIndex, curRow);
    // console.log(order.current, newOrder);
    
    let xPos = down ? mx : (mx > -30) ? 0 : -50;
    setItemTransormState(items.map((item, index) => {
      return createTransformState(newOrder, index, args[0], down, xPos, my, order.current);
    }));

    if(last) {
      setState(state => ({
        ...state,
        isDragging: false
      }));
      order.current = newOrder;
      onDragEnd();
    }
    
  },
  { filterTaps: true });


  return(
    <section>
        {itemTransformState && items.map( (item, index) => {
          let transformItem = itemTransformState[index];
          return(
            <div className="draggable-item" key={index} {...bind(index)} style={getTransformPosition(transformItem)}>
              <div>{item.number} {'  '} {item.title}</div>
            </div>
          )
        })}
    </section>
  )
}

export default DragTest;
