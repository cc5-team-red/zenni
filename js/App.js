import React from "react";
import { Platform, Text, StyleSheet } from "react-native";
import DeviceInfo from 'react-native-device-info';
import BackgroundGeolocation from "react-native-background-geolocation";

import StackNavigator from './components/StackNavigator.js'

import {
  createPin,
  pinListener,
  createUser,
  updateUser,
  userListener,
  createSketch,
  sketchListener
} from "./firebase/helper";

import { markers } from "./util/markers";

export default class App extends React.Component {
  state = {
    ready: false,
    user_id: null,
    user: {
      name: null
    },
    location: {
      coords: {
        latitude: 37,
        longitude: -122
      }
    },
    snapshotUri: null,
    errorMessage: null,
    followsUserLocation: true,
    users: [],
    pins: [],
    sketches: [],
    newPin: {
      title: "",
      details: "",
      type: "",
      coordinate: {
        latitude: null,
        longitude: null
      },
      opacity: null
    }
  };

  //BACKGROUND-GEOLOCATION SETUP
  componentWillMount() {
    // executes this.onLocation whenever location changes
    BackgroundGeolocation.on('location', this.onLocation, this.onError);

    BackgroundGeolocation.ready({
      reset: true,
      desiredAccuracy: 0,
      distanceFilter: 3,
      stopTimeout: 1,
      debug: false,
      stopOnTerminate: false,
      startOnBoot: true,
    },
      (state) => {
        console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);

        if (!state.enabled) {
          BackgroundGeolocation.start(function () {
            console.log("- Start success");
          });
        }
      });
  }

  async componentDidMount() {
    if (Platform.OS === "android" && DeviceInfo.isEmulator()) {
      this.setState({
        errorMessage:
          "Geolocation will not work on Sketch in Android emulator. Try it on your device!"
      });
    } else {
      await this._setupUser();
      await this._getLocation();
      await this._getUsers();
      await this._getPins();
      await this._getSketches();

      this.setState({ ready: true });
    }
  }

  async componentWillUnmount() {
    // TODO: finish all listeners, clean up all subscriptions
    // await this._stopLocation();
    // await this._stopUsers();
    // await this._stopPins();
    // await this._stopSketches();
    this.setState({ ready: false });
    //BACKGROUND-GEOLOCATION CLEANUP
    BackgroundGeolocation.removeListeners();
  }


  //BACKGROUND-GEOLOCATION FUNCTIONS
  onLocation = (location) => {
    updateUser(this.state.user_id, location.coords.latitude, location.coords.longitude);
  }
  onError = (error) => {
    console.warn('- [event] location error ', error);
  }


  // HELPER FUNCTIONS
  _setupUser = async () => {
    const user_id = await DeviceInfo.getUniqueID();
    console.log(`user_id`, user_id)
    createUser(user_id, 2, 2, { name: "default" })
    this.setState({ user_id })
  }
  _submitUserSettings = () => {
    const user = {
      name: this.state.name
    }
    updateUserSettings(this.state.user_id, user);
  }

  // PINFORM HELPER FUNCTIONS
  _onChangeTitle = title => {
    this.setState({
      newPin: {
        ...this.state.newPin,
        title
      }
    });
  };
  _onChangeDetails = details => {
    this.setState({
      newPin: {
        ...this.state.newPin,
        details
      }
    });
  };

  _onChangeTypeIndex = typeIndex => {
    this.setState({
      newPin: {
        ...this.state.newPin,
        typeIndex
      }
    });
  };

  _onChangeUserName = name => {
    this.setState({
      user: {
        ...this.state.user,
        name
      }
    });
  };

  _submitPinForm = () => {
    const pinType = Object.keys(markers)[this.state.newPin.typeIndex];
    const pinObj = {
      title: this.state.newPin.title,
      type: pinType,
      userID: this.state.user_id,
      coordinate: {
        latitude: this.state.newPin.coordinate.latitude,
        longitude: this.state.newPin.coordinate.longitude
      }
    };
    // optional fields:
    if (this.state.newPin.details && this.state.newPin.details.length > 0) {
      pinObj.details = this.state.newPin.details;
    }
    createPin(pinObj);
  };




  // MAPSCREEN HELPER FUNCTIONS
  _getMap = (map) => {
    this.map = map;
  }
  _toggleFollowsUserLocation = () => {
    this.setState({
      followsUserLocation: !this.state.followsUserLocation
    });
  }
  _setNewCoordinate = e => {
    this.setState({
      newPin: {
        coordinate: e.nativeEvent.coordinate,
      }
    });
  };
  _getPins = async () => {
    await pinListener(pins => {
      this.setState({ pins });
    });
  };
  _getUsers = async () => {
    await userListener(this.state.user_id, users => {
      this.setState({ users });
    });
  };
  _getSketches = async () => {
    await sketchListener(sketches => {
      this.setState({ sketches })
    })
  }
  _getLocation = async () => {
    await navigator.geolocation.requestAuthorization();

    navigator.geolocation.setRNConfiguration({
      enableHighAccuracy: true,
      distanceInterval: 5,
      timeInterval: 2000
    });

    await navigator.geolocation.watchPosition((location) => {
      updateUser(
        this.state.user_id,
        location.coords.latitude,
        location.coords.longitude
      );
      this.setState({ location });
    },
      (error) => {
        console.log(error)
      });
  };
  _getSnapshot = async () => {
    const snapshotUri = await this.map.takeSnapshot({
      // width: 300,      // optional, when omitted the view-width is used
      // height: 300,     // optional, when omitted the view-height is used
      format: 'png',   // image formats: 'png', 'jpg' (default: 'png')
      quality: 0.8,    // image quality: 0..1 (only relevant for jpg, default: 1)
      result: 'file'
    });
    this.setState({ snapshotUri: snapshotUri });
  }


  // SKETCHSCREEN HELPER FUNCTIONS
  _getSketchCanvasPaths = async (paths) => {
    const strokesPromises = paths.map(async path => {
      const coordPromises = path.path.data.map(point => {
        const [x, y] = point.split(",").map(latOrLon => Number(latOrLon));
        return this.map.coordinateForPoint({ x, y });
      })
      const coords = await Promise.all(coordPromises);
      const coordinates = coords.map(coord => ({
        latitude: coord.lat,
        longitude: coord.lng,
      }))

      const stroke = {
        key: path.path.id,
        strokeColor: path.path.color,
        strokeWidth: path.path.width,
        coordinates
      }
      return stroke
    })
    const strokes = await Promise.all(strokesPromises);

    createSketch(this.state.user_id, strokes);
  }

  render() {
    if (!this.state.ready) {
      console.log('loading....')
      // TODO: create a splash screen 
      return (
        <Text>
          loading...
        </Text>
      )
    }

    console.log('loaded!')
    return (
      <StackNavigator
        screenProps={{
          _onPress: this._onPress,
          _getMap: this._getMap,
          _getSnapshot: this._getSnapshot,
          _setNewCoordinate: this._setNewCoordinate,
          _onChangeTitle: this._onChangeTitle,
          _onChangeDetails: this._onChangeDetails,
          _onChangeTypeIndex: this._onChangeTypeIndex,
          _submitPinForm: this._submitPinForm,
          _getSketchCanvasPaths: this._getSketchCanvasPaths,
          _toggleFollowsUserLocation: this._toggleFollowsUserLocation,
          _onChangeUserName: this._onChangeUserName,
          ...this.state
        }}
      />
    );
  }
}
