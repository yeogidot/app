import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, BackHandler, Platform, Text, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const permissionsToRequest: import('react-native').Permission[] = [];
          
          if (Number(Platform.Version) >= 33) {
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          } else {
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          }

          if (Number(Platform.Version) >= 29) {
            // ACCESS_MEDIA_LOCATION is required to retrieve EXIF location data on Android 10+
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION);
          }

          if (permissionsToRequest.length > 0) {
            await PermissionsAndroid.requestMultiple(permissionsToRequest);
          }
        } catch (err) {
          console.warn('Failed to request media permissions on startup', err);
        }
      }
    };

    requestPermissions();
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

  return (
    <SafeAreaProvider>
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
            console.warn('WebView render process gone:', JSON.stringify(syntheticEvent.nativeEvent, null, 2));
          }}
          onContentProcessDidTerminate={(syntheticEvent) => {
            console.warn('WebView content process terminated:', JSON.stringify(syntheticEvent.nativeEvent, null, 2));
          }}
          onError={(syntheticEvent) => {
            console.warn('WebView error:', JSON.stringify(syntheticEvent.nativeEvent, null, 2));
          }}
          onMessage={async (event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'REQUEST_PHOTO') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  console.warn('Media library permission not granted');
                  return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: false,
                  allowsMultipleSelection: true,
                  quality: 1,
                  exif: true,
                  base64: true,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                  const responseData = result.assets.map(asset => ({
                    uri: asset.uri,
                    base64Url: `data:image/jpeg;base64,${asset.base64}`,
                    exif: asset.exif,
                  }));

                  const script = `
                    window.dispatchEvent(new CustomEvent('onPhotoSelected', { detail: ${JSON.stringify(responseData)} }));
                    true;
                  `;
                  webViewRef.current?.injectJavaScript(script);
                }
              }
            } catch (error) {
              console.error('Error handling WebView message:', error);
            }
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
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
