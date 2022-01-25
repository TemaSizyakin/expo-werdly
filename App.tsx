import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import useWindowSize, { WindowSizeContext } from './src/hooks/useWindowSize';

export default function App() {
	const [windowSize, onContainerLayout] = useWindowSize();
	return (
		<WindowSizeContext.Provider value={windowSize}>
			<View style={{ flex: 1 }} onLayout={onContainerLayout}>
				<StatusBar style="auto" />
			</View>
		</WindowSizeContext.Provider>
	);
}
