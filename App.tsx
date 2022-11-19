import 'react-native-gesture-handler';
import React from 'react';
import WindowSizeContext, { useWindowSizeContext } from './src/contexts/WindowSizeContext';
import Werdly from './src/Werdly';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { getTheme } from './src/contexts/Theme';
import SettingsContext, { useSettingsContext } from './src/contexts/SettingsContext';

function App() {
	const [windowSize, onContainerLayout] = useWindowSizeContext();
	const settings = useSettingsContext();
	const theme = getTheme(settings.theme);

	const [fontsLoaded] = useFonts({ 'RobotoSlab-Bold': require('./assets/fonts/RobotoSlab-Bold.ttf') });
	if (!fontsLoaded) {
		return null;
	}

	return (
		<WindowSizeContext.Provider value={windowSize}>
			<SettingsContext.Provider value={settings}>
				<GestureHandlerRootView style={{ flex: 1 }} onLayout={onContainerLayout}>
					<StatusBar style={theme.barStyle} animated />
					<Werdly />
				</GestureHandlerRootView>
			</SettingsContext.Provider>
		</WindowSizeContext.Provider>
	);
}

export default App;
