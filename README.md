## Drag and Drop in React using react-use-gesture

In this sample app I have used [react-use-gesture](https://github.com/react-spring/react-use-gesture) library to create drag and drop with the following features (mobile-only).

### Removed dependency on React-Spring library 

The sample code for drag and drop provided by react-use-spring is using animation library like react-spring. I have removed that dependency. So that in this sample you can react-use-gesture independent of react-spring giving you more flexibility.

### Supports Reordering along with scrolling

The sample code provided by react-use-gesture for drag and drop does not support scrolling of the page when the user reaches the top or bottom edge of the page while dragging items while reordering. In this example code you can see how to support that feature. 

### Supports Long Press to activate reordering

I have added the feature for long press. So that the user can activate the reordering (Dragging) by longpressing an item for approx. 2 seconds. 

### Supports swipe to delete feature along with reordering

I have added the feature where the user can swipe to right for revealing the delete item. 

### Overall features

 - swipe right to delete
 - long press to activate drag and drop 
 - scroll page while dragging items beyond viewport

 #### This is my naive attempt to come up with a sample. If you find a better way to code the above then please go ahead and contribute by creating a pull-request and fix any issues that you find. 