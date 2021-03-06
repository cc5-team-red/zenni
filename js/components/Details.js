import React from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Button,
  Image,
  TouchableOpacity
} from "react-native";
import { Divider } from 'react-native-elements';

import {
  pinListener,
  upvotePin,
  downvotePin,
  commentPin,
  deletePin,
} from "../firebase/helper"
import PinComment from "./PinComment";
import { getImageSource } from '../util/markers';

export default class Details extends React.Component {
  state = {
    comment: "",
    voted: false,
    confirmDelete: false,
    id: this.props.navigation.getParam("id"),
    title: this.props.navigation.getParam("title"),
    votes: this.props.navigation.getParam("votes"),
    hoursAgo: this.props.navigation.getParam("hoursAgo"),
    details: this.props.navigation.getParam("details"),
    type: this.props.navigation.getParam("type"),
    creator: this.props.navigation.getParam("creator"),
  }

  static navigationOptions = ({ navigation }) => ({
    // title: `${navigation.state.params.title}`,
    headerTitle:
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <Image
          source={getImageSource(navigation.state.params.type)}
          style={{ width: 30, height: 30, marginRight: 10 }}
        />
        <Text style={{ top: 10 }}>{navigation.state.params.title}</Text>
      </View>
  });

  _handleChange = (input) => {
    this.setState({ comment: input });
  }

  _submitPinComment = () => {
    if (this.state.comment.length > 0) {
      commentPin(
        this.props.screenProps.user_id,
        this.props.navigation.getParam("id"),
        {
          comment: this.state.comment
        }
      )
      this.setState({ comment: "" });
    } else {
      console.log("Error: No Comment");
    }
  }

  _sendUpvote = (xid, xvotes) => {
    if (!this.state.voted) {
      upvotePin(xid, xvotes + 1);
      this.setState({ voted: true });
    }
  }

  _sendDownvote = (xid, xvotes) => {
    if (!this.state.voted) {
      downvotePin(xid, xvotes - 1);
      this.setState({ voted: true });
    }
  }

  _deletePin = () => {
    if (this.props.screenProps.user_id === this.state.creator) {
      this.props.navigation.navigate("Home");
      deletePin(this.state.id);
    } else {
      console.log("id mismatch")
    }
  }

  _showComments = (id) => {
    const pin = this.props.screenProps.pins.filter(pin => pin.id === id);

    if (pin.length > 0) {
      const comments = pin[0].comments;
      if (typeof comments === 'object') {
        return Object.entries(comments).map(([key, value]) => {
          const timestamp = new Date(value.timestamp);
          const oneHour = (1000 * 60 * 60)
          const now = new Date(Date.now())
          const hoursAgo = ((now - timestamp) / oneHour);
          const agoText = hoursAgo >= 1 ?
            `${hoursAgo} hours ago` :
            `${(hoursAgo * 60).toFixed(0)} minutes ago`

          return (
            <View key={key} style={{ flex: 1, flexDirection: 'row' }}>
              <Image
                style={styles.icon}
                source={require('../assets/img/personIcon.png')}
              />
              <View style={{ flex: 0, flexShrink: 1 }}>
                <Text>{`\n${value.comment.comment} \n ~ ${agoText}`}</Text>
              </View>
            </View>
          )
        })
      }
    }
  }

  _showVotes = (id) => {
    const pin = this.props.screenProps.pins.filter(pin => pin.id === id);
    if (pin.length > 0) {
      const votes = pin[0].votes;
      return (<Text>{`${votes}`}</Text>)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {/* TOP PRIO COMPONENT */}
        <View style={{ flex: 3, minHeight: 150 }}>
          <View style={{ paddingBottom: 10, paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>{`Votes    `}<Text style={{ fontWeight: 'normal', fontSize: 28 }}>{this._showVotes(this.state.id)}</Text></Text>
            <Text style={{ marginBottom: 15, fontSize: 12, color: '#444444' }}>Last updated: {`${this.state.hoursAgo >= 1 ? (`${this.state.hoursAgo} hours ago`)
              : (`${(this.state.hoursAgo * 60).toFixed(0)} minutes ago`)}`}
            </Text>
            <Divider style={{ height: 1, backgroundColor: '#a7bbcd' }} />
          </View>

          {/* VOTING COMPONENT */}
          <View style={{ minHeight: 100, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
              Is this still true?
            </Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', }}>
              <View style={{ width: 50, height: 50 }}>
                <TouchableOpacity
                  disabled={this.state.voted} onPress={() => {
                    this._sendUpvote(this.state.id, this.state.votes);
                  }}>
                  <Image
                    style={styles.good}
                    source={require('../assets/img/thumb.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ width: 50, height: 50 }}>
                <TouchableOpacity
                  disabled={this.state.voted} onPress={() => {
                    this._sendDownvote(this.state.id, this.state.votes);
                  }}>
                  <Image
                    style={styles.bad}
                    source={require('../assets/img/thumb.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Divider style={{ height: 1, backgroundColor: '#a7bbcd', marginBottom: -10 }} />
          </View>

          {/* DETAILS COMPONENT */}
          {this.state.details ? (
            <View style={{ flexWrap: 'wrap', paddingBottom: 5, paddingLeft: 20, paddingRight: 20, paddingTop: 0 }}>
              <View style={{ flex: 1, minHeight: 50, flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center' }}>
                <Image
                  style={styles.icon}
                  source={require('../assets/img/informationIcon.png')}
                />
                <ScrollView style={{ marginTop: 15, flexShrink: 1 }}>
                  <Text>
                    {this.state.details}
                  </Text>
                </ScrollView>
              </View>
              <Divider style={{ height: 1, backgroundColor: '#a7bbcd' }} />
            </View>
          ) : null}
        </View>

        {/* COMMENTS COMPONENT */}
        <View style={{ flex: 4, paddingLeft: 20, paddingRight: 20 }}>
          <View style={{ flex: 2, marginTop: 5, marginBottom: -20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, opacity: 1 }}>{`Comments`}</Text>
          </View>
          <View style={{ flex: 8 }}>
            <ScrollView style={{ flex: 1 }} >
              {this._showComments(this.state.id)}
            </ScrollView>
          </View>
        </View >

        {/* FORMS AND BUTTONS COMPONENT */}
        <View style={{ flex: 2, minHeight: 100, }}>
          <PinComment
            comment={this.state.comment}
            _handleChange={this._handleChange}
            _submitPinForm={this._submitPinComment}
            disabled={(this.state.comment === "")}
          />
          <View style={{ marginLeft: 20, marginRight: 20 }}>
            {this.props.screenProps.user_id === this.state.creator && !this.state.confirmDelete ?
              (<TouchableOpacity style={{ alignItems: "center", backgroundColor: "#F9A800", padding: 15 }} onPress={() => (this.setState({ confirmDelete: true }))}>
                <Text style={{ color: "#ECECE7", fontSize: 22 }}>Delete</Text>
              </TouchableOpacity>) : null}
            {this.state.confirmDelete ?
              (<TouchableOpacity style={{ alignItems: "center", backgroundColor: "#9B2423", padding: 15 }} onPress={this._deletePin}>
                <Text style={{ color: "#ECECE7", fontSize: 22 }}>Confirm Delete</Text>
              </TouchableOpacity>) : null}
          </View>
        </View>
      </View >
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    // justifyContent: 'flex-end',
    justifyContent: 'flex-start',
  },
  good: {
    width: 50,
    height: 50
  },
  bad: {
    width: 50,
    height: 50,
    transform: [
      { rotateX: '180deg' }
    ]
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
    marginTop: 18
  }
});

