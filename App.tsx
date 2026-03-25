import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, BackHandler, Platform, SafeAreaView, Text } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function App() {
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
      backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, [canGoBack]);

  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

  if (!baseUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: EXPO_PUBLIC_BASE_URL is not defined in .env</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        key={baseUrl}
        source={{ uri: baseUrl }}
        onNavigationStateChange={(navState: WebViewNavigation) => {
          setCanGoBack(navState.canGoBack);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        onRenderProcessGone={(syntheticEvent) => {
          console.warn('WebView render process gone:', syntheticEvent.nativeEvent);
        }}
        onContentProcessDidTerminate={(syntheticEvent) => {
          console.warn('WebView content process terminated:', syntheticEvent.nativeEvent);
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
