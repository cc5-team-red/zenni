import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createStackNavigator } from "react-navigation";
import MapScreen from './Components/MapScreen.js';
import Details from './Components/Details.js';
import PinForm from './Components/PinForm.js'
import { pinListener } from './firebase/helper'

const StackNavigator = createStackNavigator({
  Home: { screen: MapScreen },
  PinForm: { screen: PinForm },
  Details: { screen: Details },
});

export default class App extends React.Component {
  state = {
   how: "didyoudodat",
   pins: [
    {
      id: 0,
      coordinate: {
        latitude: 35.71825,
        longitude: 139.7324
      },
      type: "danger", //currently enum of 'danger', 'noPassage', or 'medical'.

      title: "sample", //optional
      description: "sample description", //optional
      opacity: 1.0 //optional
    },
    {
      id: 1,
      coordinate: {
        latitude: 35.71725,
        longitude: 139.7324
      },
      type: "noPassage",

      opacity: 1.0
    },
    {
      id: 2,
      coordinate: {
        latitude: 35.71625,
        longitude: 139.7324
      },
      type: "crosshairs",

      title: "tgt",
      description: "",
      opacity: 1.0
    },

    {
      id: 3,
      coordinate: {
        latitude: 35.71625,
        longitude: 139.7314
      },
      type: "medical",

      title: "aid tent",
      description: "red cross aid tent here",
      opacity: 1.0
    }
  ]
  }

  _onPress(e) {
    console.log("onPress happened");
  }

  _onLongPress(e) {
    console.log("onLongPress happened");
    console.log(e.nativeEvent);
  }

  render(){
    return (
      <StackNavigator
        screenProps={{
          _onPress: this._onPress,
          _onLongPress: this._onLongPress,
          ...this.state,
        }} 
      />
    )
  }
};
