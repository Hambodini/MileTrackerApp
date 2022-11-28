import React, { Component, useEffect, useState } from 'react';
import { Text, View, Linking, Image, TextInput, StyleSheet, FlatList } from 'react-native';
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
    margin: 10,
  },
  textInput: {
    color: 'grey',
    textAlign: 'center',
    width: 200,
  }
});

const storeValueString = useState("");
const miles = useState("");
const routeName = useState("");

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
      <Text style={styles.milesHistoryTitle}>Miles History</Text>
      {items.map(({ id, itemDate, miles, routeName }) => (
        <Text style={styles.MilesHistoryText} key={id} >On {itemDate} your ran {miles} miles on route {routeName}</Text>
      ))}
    </View>
  );
}

const onLoad = async () => {
  db.transaction((tx) => {
      // tx.executeSql(
      //   "drop table items;"
      // );
    tx.executeSql(
      "create table if not exists items (id integer primary key not null, itemDate real, miles number, routeName text);"
    );
  });
}

const onSave = async () => {

  storeValueString = "Your ran " + miles + " on route "+routeName+"."

  db.transaction(
    (tx) => {
      tx.executeSql("insert into items (itemDate, miles, routeName) values (julianday('now'), ?, ?)", [MileText, routeName]);
      tx.executeSql(`select * from items order by itemDate desc;`, [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    }
  );
}

const onMilesChange = (MilesText) => {
  miles = MilesText
}
const onRouteChange = (RouteText) => {
  routeName = RouteText
}

function MileEntry() {
  
  useEffect(() => {
    onLoad;
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <TextInput
        style={styles.input}
        onChangeText={newText => onMilesChange(newText)}
        value={miles}
        placeholder="Enter miles ran"
      />
                <TextInput
        style={styles.input}
        onChangeText={newText => onRouteChange(newText)}
        value={routeName}
        placeholder="Enter route name"
      />
      <TouchableOpacity onPress={onSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Info</Text>
      </TouchableOpacity>
      <Text style={styles.WhatWasStored}>{storeValueString}</Text>
      <Items />
      </View>
  </SafeAreaView>
  );
}

function MileDB() {
  return (
    <View style={styles.container}>
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

function HelpTips() {
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
