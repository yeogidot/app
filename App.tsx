import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, BackHandler, Platform, SafeAreaView, Text } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isUrlParsed, setIsUrlParsed] = useState(false);

  useEffect(() => {
    const handleDeepLinkUrl = (url: string | null): string | null => {
      if (!url) return null;
      try {
        const parsed = Linking.parse(url);
        const routePath = [parsed.hostname, parsed.path].filter(Boolean).join('/');
        if (routePath) {
          let queryString = '';
          if (parsed.queryParams && Object.keys(parsed.queryParams).length > 0) {
            queryString = '?' + Object.entries(parsed.queryParams)
              .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
              .join('&');
          }
          return `/${routePath}${queryString}`.replace(/\/\//g, '/');
        }
      } catch (e) {
        console.warn('Deep link parse error', e);
      }
      return null;
    };

    Linking.getInitialURL().then((url: string | null) => {
      const route = handleDeepLinkUrl(url);
      if (route) {
        setInitialRoute(route);
      }
      setIsUrlParsed(true);
    });

    const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
      const route = handleDeepLinkUrl(url);
      if (route && webViewRef.current) {
        webViewRef.current.injectJavaScript(`window.location.href = '${route}'; true;`);
      }
    });

    return () => { subscription.remove(); };
  }, []);

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

  if (!isUrlParsed) {
    return <View style={styles.container} />; // Render empty view while parsing the initial URL
  }

  let targetUri = baseUrl;
  if (initialRoute) {
    const originMatch = baseUrl.match(/^https?:\/\/[^\/]+/);
    const origin = originMatch ? originMatch[0] : baseUrl;
    targetUri = `${origin}${initialRoute}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        key={baseUrl}
        source={{ uri: targetUri }}
        onNavigationStateChange={(navState: WebViewNavigation) => {
          setCanGoBack(navState.canGoBack);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        injectedJavaScript={`
          setInterval(function() {
            var btn = document.querySelector('button[class*="launchButton"]');
            if (btn && btn.parentElement) {
              btn.parentElement.style.display = 'none';
            }
          }, 300);
          true;
        `}
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
