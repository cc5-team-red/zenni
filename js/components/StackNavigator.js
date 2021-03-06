import { createStackNavigator } from "react-navigation";
import MapScreen from "./MapScreen.js";
import Details from "./Details.js";
import PinForm from "./PinForm.js";
import Draw from "./Draw.js";
import UserSettingsScreen from "./UserSettingsScreen.js";

export default StackNavigator = createStackNavigator({
  Home: { screen: MapScreen },
  PinForm: { screen: PinForm },
  Details: { screen: Details },
  Draw: { screen: Draw },
  UserSettingsScreen: { screen: UserSettingsScreen }
},
{
  navigationOptions: {
    headerStyle: {
      backgroundColor: '#ecece7',
    },
    headerTintColor: '#2b2b2c',
    headerTitleStyle: {
      fontFamily: 'lato-black',
      fontSize: 20
    },
  },
});
