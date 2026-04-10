import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, BackHandler, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import {
  buildWebViewTargetUri,
  parseDeepLinkToAppRoute,
} from './utils/webview';

export default function App() {
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  if (!baseUrl)
    return (
      <View style={styles.errorContainer}>
        <Text>Error: EXPO_PUBLIC_BASE_URL is not defined in .env</Text>
      </View>
    );
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isUrlParsed, setIsUrlParsed] = useState(false);

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.type !== 'SELECT_IMAGES') return;

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        console.warn('Media library permission denied');
        return;
      }

      const allowsMultipleSelection = payload?.allowMultiple !== false;

      await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection,
      });
    } catch (error) {
      console.warn('Failed to handle WebView message:', error);
    }
  };

  useEffect(() => {
    Linking.getInitialURL().then((url: string | null) => {
      const route = parseDeepLinkToAppRoute(url);
      setIsUrlParsed(true);
      if (!route) return;
      setInitialRoute(route);
    });

    const subscription = Linking.addEventListener(
      'url',
      ({ url }: { url: string }) => {
        const route = parseDeepLinkToAppRoute(url);
        if (!route || !webViewRef.current) return;
        webViewRef.current.injectJavaScript(
          `window.location.href = '${route}'; true;`
        );
      }
    );

    return () => {
      subscription.remove();
    };
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

  const targetUri = buildWebViewTargetUri(baseUrl, initialRoute);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />
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
        onMessage={handleWebViewMessage}
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
