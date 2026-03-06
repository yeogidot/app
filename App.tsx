import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
export default function App() {
  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: `${process.env.EXPO_PUBLIC_BASE_URL}`,
        }}
      ></WebView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
