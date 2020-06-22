import React, {useState, useRef} from 'react';
import { useDrag, useGesture } from 'react-use-gesture';
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
let setSwipingMode = true;
let buttonPressTimer = {};
let longPressed = false;
const POSITION = {x:0, y:0};

const createTransformState = (newOrder, index, currIndex, down, xPos, yPos, order) => {
  console.log(down, index, currIndex, draggingMode);
  let newOrderIdx = newOrder.indexOf(index);
  let orderIdx = order && order.indexOf(index);
  // console.log(newOrderIdx, orderIdx);

  if(draggingMode === 'x') {
    return index === currIndex && xPos < 0
        ? { x: xPos, y: newOrderIdx * 50, scale: 1.1, zIndex: '100', shadow: 15 }
        : { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1}
  } else {
    return down && index === currIndex
        ? { x: 0, y: orderIdx * 50 + yPos, zIndex: '100', shadow: 15, draggableCls: 'draggable' }
        : { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1, draggableCls: '' }
  }
}
    
function DragTest() {
  const order = useRef(items.map((_, index) => index));

  const [state, setState] = useState({
    isDragging: false,
    isSwiping: false
  });

  const setItemsState = () => {
    return items.map((item, index) => {
      return createTransformState(order.current, index);
    })
  }

  const [itemTransformState, setItemTransormState] = useState(()=> setItemsState());
  // console.log("itemTransformState:", itemTransformState);

  const getTransformPositionX = (transformItem) => {
    // console.log("transform item:", transformItem);
    return { 
      zIndex: transformItem.zIndex,
      transform: `translate3D(${transformItem.x}px, 0px, 0px)`,
      transition: state.isDragging ? 'none' : 'transform 500ms',
      // transition: 'transform 500ms',
    }
  }

  const getTransformPositionY = (transformItem) => {
    // console.log("transform item:", transformItem);
    return { 
      zIndex: transformItem.zIndex,
      transform: `translate3D(0px, ${transformItem.y}px, 0px)`,
      transition: state.isDragging ? 'none' : 'transform 500ms',
      // transition: 'transform 500ms',
    }
  }

  const onDragEnd = () => {
    console.log("reset drag or call service");
    setDraggingMode = true;
    longPressed = false;
  }

  const onSwipeEnd = () => {
    console.log("reset swipe or call service");
    setSwipingMode = true;
  }

  const swapOrder = (orderArr, curIndex, curRow) => {
    orderArr.splice(curRow, 0, orderArr.splice(curIndex, 1)[0]);
    return orderArr;
  }

  const triggerTapStartEvent = (downState) => {
    let currIdx = downState.currentTarget.getAttribute('data-idx')
    buttonPressTimer = setTimeout(() => {
      console.log("long press activated...");
      longPressed = true;
      setItemTransormState(items.map((item, index) => {
        draggingMode = 'y';
        // console.log("clicked item:", order.current, item);
        return createTransformState(order.current, index, parseInt(currIdx), true);
      }));
    }, 1500);
  }

  const triggerTapEndEvent = (downState) => {
    console.log("tap ended: ", downState);
    clearTimeout(buttonPressTimer);
  }

  // Set the drag hook and define component movement based on gesture data
  const triggerDragEvent = ({ down, movement: [mx, my], args, direction, first, last, elapsedTime}) => {
    // console.log("down:", down);
    // console.log("args:", args);
    // console.log("direction:", direction);
    // console.log("diff: " + Math.round(elapsedTime));
    // console.log("drag movement:", mx, my);
    // console.log("setDraggingMode:", setDraggingMode);
    // console.log("setSwipingMode:", setSwipingMode);

    clearTimeout(buttonPressTimer);

    if(first) {
      setState(state => ({
        ...state,
        isDragging: true
      }));
    }
    
    if((mx != 0 || my != 0) && setDraggingMode && setSwipingMode) {
      // console.log("inside set dragging mode");
      draggingMode = (my > 0 || my < 0) ? 'y' : 'x';
      setDraggingMode = false;
      setSwipingMode = false;
      // console.log("draggingMode:", draggingMode);
    }

    if(draggingMode == 'y' && longPressed) {
      // console.log("dragging direction y");
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
        order.current = newOrder;
      }
    }

    if(last) {
      setState(state => ({
        ...state,
        isDragging: false
      }));
      onDragEnd();
    }
    
  };

  // Set the drag hook and define component movement based on gesture data
  const bindSwipingEvent = useDrag(({ down, movement: [mx, my], args, direction, distance, delta, first, last}) => {
    // console.log("down:", down);
    // console.log("args:", args);
    // console.log("direction:", direction);
    // console.log("distance:", distance);
    // console.log("swipe movement:", mx, my);
    // console.log("swipe movement delta:", delta);

    if(first) {
      // draggingMode = 'x';
      setState(state => ({
        ...state,
        isSwiping: true,
      }));
    }
    
    if(draggingMode == 'x') {
      // console.log("dragging direction x");
     let xPos = down ? mx : (mx > -30) ? 0 : -50;
      setItemTransormState(items.map((item, index) => {
        return createTransformState(order.current, index, args[0], down, xPos, my, order.current);
      }));

      if(last) {
        setState(state => ({
          ...state,
          isSwiping: false,
          isDragging: false
        }));
        onSwipeEnd();
      }
    }
  },
  { filterTaps: true });

  const bindDraggingEvent = useGesture({
    onDrag: (dragState) => triggerDragEvent(dragState),
    onTouchStart: (downState) => triggerTapStartEvent(downState),
    onTouchEnd: (downState) => triggerTapEndEvent(downState),
    onContextMenu: (e) => e.preventDefault()
  })


  return(
    <section>
        {itemTransformState && items.map( (item, index) => {
          let transformItem = itemTransformState[index];
          return(
            <div className={"draggable-item " + transformItem.draggableCls } data-idx={index} key={index} {...bindDraggingEvent(index, 'y')} style={getTransformPositionY(transformItem)}>
              <div className="swipeable-item">
                <div className="delete-icon">
                  <span>Delete</span>
                </div>
                <div className="content" {...bindSwipingEvent(index, 'x')} style={getTransformPositionX(transformItem)}>{item.number} {'  '} {item.title}</div>
              </div>
            </div>
          )
        })}
    </section>
  )
}

export default DragTest;
