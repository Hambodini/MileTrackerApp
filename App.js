import React, { Component, useEffect, useState } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Linking, Image, TextInput, StyleSheet, FlatList } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as SQLite from "expo-sqlite";
import Button from './Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img:{

  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    height: 40,
    padding: 5,
    marginBottom: 10,
    fontSize: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 35,
  },
  subTitle: {
    fontSize: 20,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 10,
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
    fontSize: 20,
    textAlign: 'center',
  },
  textInput: {
    color: 'grey',
    textAlign: 'center',
    width: 200,
  },
  MilesHistoryTitle: {
    backgroundColor: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 28
  },
  MilesHistoryText: {
    backgroundColor: '#fff',
    textAlign: 'left',
    paddingLeft: 10,
    justifyContent: 'center',
    fontSize: 15
  },
  WhatWasStored: {
    textAlign: 'center',
    //flex: 1,
    justifyContent: 'center',
    //height: 500,
    fontSize: 28
  }
});

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("mileDB.db");
  return db;
}

const db = openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, date(itemDate) as itemDate, miles, routeName from items order by itemDate desc;`,
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
      <Text style={styles.MilesHistoryTitle}>Miles History</Text>
      {items.map(({ id, itemDate, miles, routeName }) => (
        <Text style={styles.MilesHistoryText} key={id} >On {itemDate} your ran {miles} miles on {routeName}</Text>
      ))}
    </View>
  );
}

function MileEntry({ navigation }) {

  const [displayString, setDisplayString] = useState("");
  const [miles, setMiles] = useState("");
  const [routeName, setRouteName] = useState("");
  let isValid = true;

  onSave = async () => {
    let result

    //miles check
    if (isNaN(miles)) {
      setDisplayString(" miles needs to be a number")
      isValid = false;
    }

    //route check
    if (!isNaN(routeName)) {
      setDisplayString(" Routes needs to be a string")
      isValid = false;
    }

    try {
      if (isValid) {
        db.transaction(
          (tx) => {
            tx.executeSql("insert into items (itemDate, miles, routeName) values (julianday('now'), ?, ?)", [miles, routeName]);
            tx.executeSql(`select * from items order by itemDate desc;`, [], (_, { rows }) =>
              console.log(JSON.stringify(rows))
            );
          }
        );

        setDisplayString("Your ran " + miles + " miles on " + routeName + ".")

      }
    } catch (Exception) {

    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./assets/runnerImg.png')} style={styles.img}></Image>
      <TextInput
        style={styles.input}
        onChangeText={newText => setMiles(newText)}
        value={miles}
        placeholder="Enter miles ran"
      />
      <TextInput
        style={styles.input}
        onChangeText={newText => setRouteName(newText)}
        value={routeName}
        placeholder="Enter route name"
      />
      <TouchableOpacity onPress={onSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Info</Text>
      </TouchableOpacity>
      <Text style={styles.WhatWasStored}>{displayString}</Text>
    </SafeAreaView>
  );
}

function MileDB({ navigation }) {
  return (
    <View>
      <Items></Items>
    </View>
  );
}

const TipsList = [
  {
    title: '1. Find safe, traffic-free routes',
  },
  {
    title: '2. Run at whatever time of day suits you',
  },
  {
    title: '3. Start each run slowly',
  },
  {
    title: '4. Keep the pace nice and controlled',
  },
  {
    title: '5. Slow down on hills',
  },
  {
    title: "6. Walk breaks aren't cheating",
  },
  {
    title: "7. It doesn't matter how far you go",
  },
  {
    title: "8. Don't run every day at first",
  },
  {
    title: "9. If you're struggling, slow down",
  },
  {
    title: "10. It's fine to miss a day",
  },
  {
    title: "11. Feeing a bit sore is normal",
  },
  {
    title: "12. Make sure you warm-up and cool down",
  },
  {
    title: "13. Get some decent running shoes",
  },
  {
    title: "14. Have Fun",
  },
];

const renderListItem = ({ item }) => (

  <Text style={styles.subTitle}>{item.title}</Text>
);

function handleButtonPress(url) {
  WebBrowser.openBrowserAsync(url);
}

function renderButton(title, url) {
  return (
    <Button info style={styles.button} onPress={() => handleButtonPress(url)}>
      {title}
    </Button>
  )
}

function HelpTips({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tips</Text>
      <FlatList
        data={TipsList}
        renderItem={renderListItem}
      />
      {renderButton('More Tips', 'https://healthtalk.unchealthcare.org/10-tips-for-healthy-running/')}
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {

  useEffect(() => {
    db.transaction((tx) => {
      // tx.executeSql(
      //   "drop table items;"
      // );
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, itemDate real, miles number, routeName text);"
      );
    });
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Drawer.Screen name="Enter Miles" component={MileEntry} />
        <Drawer.Screen name="See Miles Entered" component={MileDB} />
        <Drawer.Screen name="See Help Tips" component={HelpTips} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
