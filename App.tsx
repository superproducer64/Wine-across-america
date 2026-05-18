import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pour Across America</Text>
      <Text style={styles.sub}>Loading test — if you see this, native modules are OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1518',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: '#C4847A',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sub: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
