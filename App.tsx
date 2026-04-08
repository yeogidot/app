import { StyleSheet, View, Text, Platform, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useLinkingURL, parse } from 'expo-linking';
import { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export default function App() {
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  if (!baseUrl)
    return (
      <View style={styles.errorContainer}>
        <Text>Error: EXPO_PUBLIC_BASE_URL is not defined in .env</Text>
      </View>
    );
  const url = useLinkingURL();
  const URLObject = url ? parse(url) : undefined;
  const isFromScheme = URLObject?.scheme === 'yeogidot';
  const isShare = URLObject?.hostname === 'share';
  const slash = !baseUrl.endsWith('/') ? '/' : '';
  const isValidPath = URLObject?.path ? uuidRegex.test(URLObject.path) : false;
  const webViewUrl =
    baseUrl +
    (isFromScheme && isShare && isValidPath
      ? `${slash}share/${URLObject.path}`
      : '');
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    let backHandler: any;
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    if (Platform.OS === 'android') {
      backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
    }

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />
      <WebView
        ref={webViewRef}
        key={baseUrl}
        source={{ uri: webViewUrl }}
        onNavigationStateChange={(navState: WebViewNavigation) => {
          setCanGoBack(navState.canGoBack);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        onRenderProcessGone={(syntheticEvent) => {
          console.warn(
            'WebView render process gone:',
            syntheticEvent.nativeEvent
          );
        }}
        onContentProcessDidTerminate={(syntheticEvent) => {
          console.warn(
            'WebView content process terminated:',
            syntheticEvent.nativeEvent
          );
        }}
        onError={(syntheticEvent) => {
          console.warn('WebView error:', syntheticEvent.nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
