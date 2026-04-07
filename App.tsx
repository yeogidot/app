import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLinkingURL, parse } from 'expo-linking';

const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export default function App() {
  const webURL = process.env.EXPO_PUBLIC_BASE_URL;
  if (!webURL)
    return (
      <View style={styles.container}>
        <Text>웹뷰 URL이 지정되지 않았습니다.</Text>
      </View>
    );
  const url = useLinkingURL();
  const URLObject = url ? parse(url) : undefined;
  const isFromScheme = URLObject?.scheme === 'yeogidot';
  const isShare = URLObject?.hostname === 'share';
  const slash = !webURL.endsWith('/') ? '/' : '';
  const isValidPath = URLObject?.path ? uuidRegex.test(URLObject.path) : false;
  const webViewURL =
    webURL +
    (isFromScheme && isShare && isValidPath
      ? `${slash}share/${URLObject.path}`
      : '');
  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: webViewURL,
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
