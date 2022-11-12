import React, { Component, useState, useEffect } from 'react';
import { 
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as SQLite from "expo-sqlite";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("bmiDB.db");
  return db;
}

const db = openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, date(itemDate) as itemDate, bmi, height, weight from items order by itemDate desc;`,
        [],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }
  return (
    <View>
      <Text style={styles.BMIHistoryTitle}>BMI History</Text>
      {items.map(({ id, itemDate, bmi, weight, height }) => (
        <Text style={styles.BMIHistoryText} key={id} >{itemDate}: {bmi} (W:{weight}, H:{height})</Text>
      ))}
    </View>
  );
}


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
    db.transaction((tx) => {
        // tx.executeSql(
        //   "drop table items;"
        // );
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, itemDate real, bmi number, height text, weight text);"
      );
    });
  }

  onSave = async () => {
    const { WeightText, HeightText} = this.state;
    let storedValue = parseFloat(((WeightText / ( HeightText * HeightText ) ) * 703).toFixed(1));
    let healthCondition
    if (storedValue < 18.5) {
      healthCondition = "Underweight"
    } else if (storedValue > 18.5 && storedValue < 24.9) {
      healthCondition = "Healthy"
    }else if (storedValue > 25.0 && storedValue < 29.9) {
      healthCondition = "Overweight"
    }else if (storedValue > 30.0) {
      healthCondition = "Obese"
    }
    let storeValueString = "Body Mass Index is " + storedValue + "\n("+healthCondition+")"

    this.setState({storeValueString})

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (itemDate, bmi, height, weight) values (julianday('now'), ?, ?, ?)", [storedValue, HeightText, WeightText]);
        tx.executeSql(`select * from items order by itemDate desc;`, [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      }
    );
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
          <Items />
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
    //flex: 1,
    justifyContent: 'center',
    //height: 500,
    fontSize: 28
  },
  BMIHistoryTitle: {
    backgroundColor: '#fff',
    textAlign: 'left',
    //flex: 1,
    justifyContent: 'center',
    //height: 500,
    fontSize: 28
  },
  BMIHistoryText: {
    backgroundColor: '#fff',
    textAlign: 'left',
    //flex: 1,
    justifyContent: 'center',
    //height: 500,
    fontSize: 18
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
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});