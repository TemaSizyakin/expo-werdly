import 'react-native-gesture-handler';
import React from 'react';
import WindowSizeContext, { useWindowSizeContext } from './src/contexts/WindowSizeContext';
import Werdly from './src/Werdly';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
	const [windowSize, onContainerLayout] = useWindowSizeContext();

	const [fontsLoaded] = useFonts({ 'RobotoSlab-Bold': require('./assets/fonts/RobotoSlab-Bold.ttf') });
	if (!fontsLoaded) {
		return <AppLoading />;
	}

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<GestureHandlerRootView style={{ flex: 1 }} onLayout={onContainerLayout}>
				<Werdly />
			</GestureHandlerRootView>
		</WindowSizeContext.Provider>
	);
}
