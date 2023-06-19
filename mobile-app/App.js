import * as React from "react";
import useWebSocket, { ReadyState } from "react-native-use-websocket";
import { Button, Text, FlatList, StyleSheet, Pressable, TouchableOpacity, View, Image } from "react-native";

export default function App() {

  const [socketUrl] = React.useState("wss://smarthome.mitchellonii.me");

  const messageHistory = React.useRef([])

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  messageHistory.current = React.useMemo(
    () => messageHistory.current.concat(lastMessage),
    [lastMessage]
  );

  const sendM = () => sendMessage(JSON.stringify({ "userType": "mobileApp", "request": "data" }));


  const sendR = () => sendMessage(JSON.stringify({ "request": "data" }))
  const requestData = React.useCallback(sendR, [sendR]);

  const sendArm = () => { sendMessage(JSON.stringify({ "event": "toggleArm" })); console.log("t") }
  const requestDisarm = React.useCallback(sendArm, [sendArm]);


  React.useEffect(sendM, [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: "connecting",
    [ReadyState.OPEN]: "connected",
    [ReadyState.CLOSING]: "closing",
    [ReadyState.CLOSED]: "closed",
    [ReadyState.UNINSTANTIATED]: "uninstantiated",
  }[readyState];

  return (
    <>
      <Text style={styles.header}>The Smarthome is currently {connectionStatus}</Text>
      <Data data={lastMessage.data} />

      <StatsDisplay data={lastMessage.data}></StatsDisplay>


      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={requestData}><Text style={styles.whiteText}>Refresh data</Text></TouchableOpacity>
        <ArmButton data={lastMessage.data} requestDisarm={requestDisarm}></ArmButton>
      </View>
    </>
  );
}


function StatsDisplay({ data }) {


  var d;
  try {
    var d = JSON.parse(data)
  } catch (e) {
    d = {}
  }

  return <View style={styles.statsArea}>
    <View style={styles.statsAreaView}>
      <Image
        style={styles.statsImage}
        source={d.light && d.light > 40 ? require('./sun.png') : require('./moon.png')}
      />
      <Text style={styles.statsAreaText}>Light Level:</Text>
      <Text style={styles.statsAreaTextTwo}>{d.light ? d.light : "Loading..."}</Text>
    </View>
    <View style={styles.statsAreaView}>
      <Image
        style={styles.statsImage}
        source={d.armed && d.armed == "0" ? require('./unlock.png') : require('./lock.png')}
      />
      <Text style={styles.statsAreaText}>System State:</Text>
      <Text style={styles.statsAreaTextTwo}>{d.armed == "1" ? 'Armed' : (d.armed == '0' ? "Disarmed" : "Loading...")}</Text>
    </View>
  </View>


}





function Data({ data }) {
  var d;
  try {
    d = JSON.parse(data)
  } catch (e) {
    return <Text style={styles.dataText} >Waiting for data...</Text>
  }

  return <>
    <Text style={styles.dataText} >Light: {d.light}</Text>
    <Text style={styles.dataTextTwo} >Motion: {d.motion}</Text>
    <Text style={styles.dataTextThree} >Armed: {d.armed}</Text>

  </>

}


function ArmButton({ data, requestDisarm }) {
  var d;
  try {
    d = JSON.parse(data)
    return <TouchableOpacity style={styles.buttontwo} onPress={requestDisarm} ><Text style={styles.whiteText}>{d.armed == "1" ? "Disarm" : "Arm"}</Text></TouchableOpacity>
  } catch (e) {
    console.log(e)

    return <TouchableOpacity style={styles.buttontwo}><Text style={styles.whiteText}>Loading...</Text></TouchableOpacity>

  }
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 40,
    left: 10,
    fontSize: 20
  },
  dataText: {
    position: 'absolute',
    top: 80,
    left: 10,
    fontSize: 10
  },
  dataTextTwo: {
    position: 'absolute',
    top: 95,
    left: 10,
    fontSize: 10
  },
  dataTextThree: {
    position: 'absolute',
    top: 105,
    left: 10,
    fontSize: 10
  },
  button: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: "#24a0ed",
    position: 'relative',
    bottom: 10,
    width: '40%',
    color: 'white',
    right: '7%'
  },
  buttontwo: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: "#f44336",
    position: 'relative',
    bottom: 10,
    width: '40%',
    color: 'white',
    left: '7%'
  },
  buttontwotwo: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: "#008CBA",
    position: 'relative',
    bottom: 10,
    width: '40%',
    color: 'white',
    left: '7%'
  },
  whiteText: {
    color: 'white',
    position: 'relative'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: "100%",
    display: 'flex',
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  statsArea: {
    position: "absolute",
    top: 200,
    left: 0,
    height: 100,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center"
  },
  statsAreaView: {
    position: 'relative',
    width: '40%',
    aspectRatio: 1,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.1)",
    flexDirection: 'row'
  },
  statsAreaText: {
    position: "absolute",
    bottom: 20,
    left: '10%',
    width: '80%',
    textAlign: "center"
  },
  statsAreaTextTwo: {
    position: "absolute",
    bottom: 5,
    left: '10%',
    width: '80%',
    textAlign: "center"
  },
  statsImage: {
    position: 'absolute',
    left: '20%',
    width: '60%',
    height: '60%',
    resizeMode: "stretch",
    aspectRatio: 1,
    top: '10%'
  }
})