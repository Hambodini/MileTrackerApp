import React, { Component } from 'react';
import {
  Alert,
  ScrollView,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

const storeValueStringKey = "@MyApp:key1";
const HeightTextKey = "@MyApp:key2";

export default class App extends Component {
  state = {
    WeightText: '',
    HeightText: '',
    storeValueString: '',
  };

  constructor(props) {
    super(props);
    this.onLoad();
  }

  onLoad = async () => {
    try {
      const storeValueString = await AsyncStorage.getItem(storeValueStringKey);
      const HeightText = await AsyncStorage.getItem(HeightTextKey);
      this.setState({ storeValueString, HeightText });
    } catch (error) {
      Alert.alert('Error', 'There was an error while loading the data');
    }
  }

  onSave = async () => {
    const { WeightText, HeightText} = this.state;
    let storedValue = parseFloat(((WeightText / ( HeightText * HeightText ) ) * 703).toFixed(1));
    let storeValueString = "Body Mass Index is " + storedValue

    this.setState({storeValueString})
    try {
      await AsyncStorage.setItem(storeValueStringKey, storeValueString);
      await AsyncStorage.setItem(HeightTextKey, HeightText);
      Alert.alert('Saved', 'Successfully saved on device');
    } catch (error) {
      Alert.alert('Error', 'There was an error while saving the data');
    }
  }

  onWeightChange = (WeightText) => {
    this.setState({ WeightText });
  }
  onHeightChange = (HeightText) => {
    this.setState({ HeightText });
  }

  render() {
    const { storeValueString, WeightText, HeightText } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.toolbar}>BMI Calculator</Text>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            onChangeText={this.onWeightChange}
            value={WeightText}
            placeholder="Weight in Pounds"
          />
                    <TextInput
            style={styles.input}
            onChangeText={this.onHeightChange}
            value={HeightText}
            placeholder="Height in Inches"
          />
          <TouchableOpacity onPress={this.onSave} style={styles.button}>
            <Text style={styles.buttonText}>Compute BMI</Text>
          </TouchableOpacity>
          <Text style={styles.BMI}>{storeValueString}</Text>
          <Text style={styles.preview}>
          Assessing Your BMI{"\n"}
          {"\t"}Underweight: less than 18.5{"\n"}
          {"\t"}Underweight: 18.5 to 24.9{"\n"}
          {"\t"}Underweight: 25.0 to 29.9{"\n"}
          {"\t"}Underweight: 30.0 to higher
          </Text>
          </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    padding: 25,
    fontSize: 28 ,
    fontWeight: 'bold'
  },
  content: {
    fontSize:24,
    flex: 1,
    padding: 10,
  },
  BMI: {
    backgroundColor: '#fff',
    textAlign: 'center',
    flex: 1,
    justifyContent: 'center',
    height: 500,
    fontSize: 28
  },
  preview: {
    backgroundColor: '#fff',
    flex: 1,
    height: 500,
    fontSize: 20
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    height: 40,
    padding: 5,
    marginBottom: 10,
    fontSize:20,
  },
  button: {
    backgroundColor: '#34495e',
    color: '#fff',
    padding: 10,
    borderRadius: 3,
    marginBottom: 30,
    fontSize: 24
  },
  buttonText: {
    color: '#fff',
    fontSize:20,
    textAlign: 'center',
  }
});