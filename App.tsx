import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';
import Werdly from './src/Werdly';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
	const [windowSize, onContainerLayout] = useWindowSize();

	const [fontsLoaded] = useFonts({ 'RobotoSlab-Bold': require('./assets/fonts/RobotoSlab-Bold.ttf') });
	if (!fontsLoaded) {
		return <AppLoading />;
	}

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<GestureHandlerRootView style={{ flex: 1 }} onLayout={onContainerLayout}>
				<StatusBar style="auto" />
				<Werdly />
			</GestureHandlerRootView>
		</WindowSizeContext.Provider>
	);
}
