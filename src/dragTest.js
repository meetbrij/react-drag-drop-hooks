import React, {useState, useRef} from 'react';
import { useDrag, useGesture } from 'react-use-gesture';
import {clamp} from 'lodash';
 
const items = [
  { number: "1", title: "India"},
  { number: "2", title: "Singapore"},
  { number: "3", title: "South Korea"},
  { number: "4", title: "Canada"},
  { number: "5", title: "New Zealand"},
  { number: "6", title: "Netherlands"},
  { number: "7", title: "Germany"},
  { number: "8", title: "Switzerland"},
  { number: "9", title: "Ireland"},
  { number: "10", title: "Turkey"},
  { number: "11", title: "Dubai"},
  { number: "12", title: "Japan"},
  { number: "13", title: "Argentina"},
  { number: "14", title: "Brazil"},
  { number: "15", title: "Austria"},
  { number: "16", title: "Denmark"},
  { number: "17", title: "Sweden"},
  { number: "18", title: "Ireland"},
  { number: "19", title: "Norway"},
]

let draggingMode = 'x';
let setDraggingMode = true;
let setSwipingMode = true;
let buttonPressTimer = {};
let longPressed = false;
let viewportHeight = window.innerHeight-20;
let draggableYPos;
let initY;
let scrollPageDirection = '';
let scrollDiff = 0;
let calcDiff = 0;
let scrollContentHeight = document.documentElement.scrollHeight;
// let previousItemIdx;

const createTransformState = (newOrder, index, currIndex, down, xPos, yPos, order) => {
  // console.log(down, index, currIndex, draggingMode);
  let newOrderIdx = newOrder.indexOf(index);
  let orderIdx = order && order.indexOf(index);
  // console.log(index, newOrderIdx, orderIdx, currIndex);
  // console.log("ypos", orderIdx * 50 + yPos);

  if(draggingMode === 'x') {
    return index === currIndex && xPos < 0
        ? { x: xPos, y: newOrderIdx * 50, scale: 1.1, zIndex: '100', shadow: 15 }
        : { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1}
  } else if(draggingMode === 'y') {
    if(down && index === currIndex) {
      console.log("orderIdx: ", orderIdx, "initY: ", initY, "yPos", yPos);
      if(scrollPageDirection == 'up') {
        calcDiff = scrollDiff - (initY-(orderIdx * 50 + yPos));
        let calcY = (orderIdx * 50 + yPos) - calcDiff;
        // console.log(" ^ ypos: ", (orderIdx * 50 + yPos), " - diff: ", initY-(orderIdx * 50 + yPos), " - calcDiff: ", calcDiff, " - calcY: ", calcY);
        return { x: 0, y: calcY, zIndex: '100', shadow: 15, draggableCls: 'draggable' }
      } else if(scrollPageDirection == 'down') {
        calcDiff = scrollDiff - (initY-(orderIdx * 50 + yPos));
        let calcY = (orderIdx * 50 + yPos) - calcDiff;
        // console.log(" v ypos: ", (orderIdx * 50 + yPos), " - diff: ", initY-(orderIdx * 50 + yPos), " - calcDiff: ", calcDiff, " - calcY: ", calcY);
        return { x: 0, y: calcY, zIndex: '100', shadow: 15, draggableCls: 'draggable' }
      } else {
        scrollDiff = initY-(orderIdx * 50 + yPos) > scrollDiff ? initY-(orderIdx * 50 + yPos) : scrollDiff;
        calcDiff = 0;
        let calcY = (orderIdx * 50 + yPos);
        // console.log(" = ypos: ", (orderIdx * 50 + yPos), " - diff: ", initY-(orderIdx * 50 + yPos), " - calcDiff: ", calcDiff, " - calcY: ", calcY);
        return { x: 0, y: calcY, zIndex: '100', shadow: 15, draggableCls: 'draggable' }
      }
    } else if (down && index !== currIndex) {
      return { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1, draggableCls: 'undraggable' }
    } else {
      return { x: 0, y: newOrderIdx * 50, scale: 1, zIndex: '0', shadow: 1, draggableCls: '' }
    }
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
    scrollPageDirection = '';
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
        return createTransformState(order.current, index, parseInt(currIdx), true);
      }));
    }, 1500);
  }

  const triggerTapEndEvent = (downState) => {
    // console.log("tap ended: ", downState);
    clearTimeout(buttonPressTimer);
  }

  const triggerMouseMoveEvent = (downState) => {
    // console.log("<<<<<<<<<< page y offset: ", window.pageYOffset);
    // console.log("Y: ", downState.changedTouches[0].pageY);
    // console.log("window outerheight : ", window.outerHeight);
    // console.log("document scrollheight : ", document.documentElement.scrollHeight);
    // console.log("mouse move - : ", window.outerHeight - window.pageYOffset);
    scrollContentHeight = document.documentElement.scrollHeight;
    initY = downState.changedTouches[0].pageY;
  }

  // Set the drag hook and define component movement based on gesture data
  const triggerDragEvent = ({ down, movement: [mx, my], args, first, last, xy}) => {
    // console.log("down:", down);
    // console.log("args:", args);
    // console.log("initial y: ", initial[1]);
    // console.log("offset: ", offset[1]);
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
    
    if((mx !== 0 || my !== 0) && setDraggingMode && setSwipingMode) {
      // console.log("inside set dragging mode");
      draggingMode = (my > 0 || my < 0) ? 'y' : 'x';
      setDraggingMode = false;
      setSwipingMode = false;
      // console.log("draggingMode:", draggingMode);
    }

    if(draggingMode === 'y' && longPressed) {
      // console.log("dragging direction y");
      const curIndex = order.current.indexOf(args[0]);
      const curRow = clamp(Math.round(((curIndex * 50 + my)-calcDiff) / 50), 0, items.length - 1);
      // console.log(curIndex, curRow);
      const newOrder = swapOrder([...order.current], curIndex, curRow);
      // console.log(order.current, newOrder);
      
      let xPos = down ? mx : (mx > -30) ? 0 : -50;
      setItemTransormState(items.map((item, index) => {
        return createTransformState(newOrder, index, args[0], down, xPos, my, order.current);
      }));

      draggableYPos = xy[1];
      console.log(100, "initY: ", initY, scrollContentHeight);
      if(draggableYPos < 20) {
        scrollPageDirection = 'up';
        if(initY > 100 && initY < scrollContentHeight) {
          console.log("scroll window up");
          window.scrollTo(0, window.pageYOffset - 3);
        }
      } else if(draggableYPos > viewportHeight) {
        scrollPageDirection = 'down';
        if(initY > 100 && initY < scrollContentHeight) {
          console.log("scroll window down");
          window.scrollTo(0, window.pageYOffset + 3);
        }
      } 

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
    
    if(draggingMode === 'x') {
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
    onContextMenu: (e) => e.preventDefault(),
    onTouchMove: (moveState) => triggerMouseMoveEvent(moveState)
  })


  return(
    <section>
        {itemTransformState && items.map( (item, index) => {
          let transformItem = itemTransformState[index];
          return(
            <div id={"draggable-item-"+index}  className={"draggable-item " + transformItem.draggableCls } data-idx={index} key={index} {...bindDraggingEvent(index, 'y')} style={getTransformPositionY(transformItem)}>
              <div className="swipeable-item">
                <div className="delete-icon">
                  <span>DEL</span>
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
