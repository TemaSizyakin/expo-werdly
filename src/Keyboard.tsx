import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import WindowSizeContext from './contexts/WindowSizeContext';
import Animated, {
	interpolateColor,
	runOnJS,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
	ZoomInDown,
	ZoomOutDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const WIDEKEYS: Array<string> = ['New', 'Del'];

type KeyData = {
	value: string,
	x: number,
	y: number,
	width: number,
	height: number,
	wide: boolean,
};

const Key = ({ data: { value, x, y, width, height, wide }, activeKey }: { data: KeyData, activeKey: Animated.SharedValue<string> }) => {
	const isPressed = useDerivedValue(
		() => (activeKey.value === value ? withTiming(1, { duration: 50 }) : withTiming(0, { duration: 150 })),
		[activeKey],
	);
	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(isPressed.value, [0, 1], ['#888888', '#3b95d7']),
		transform: [{ scale: 1 + 0.35 * isPressed.value }],
		zIndex: 10 + isPressed.value * 10,
	}));
	const fontSize = Math.min(wide ? width / 1.5 : width, height) / 2;
	return (
		<Animated.View
			style={[
				{
					position: 'absolute',
					left: x + 0.05 * width,
					top: y + 0.05 * height,
					width: 0.9 * width,
					height: 0.9 * height,
					borderRadius: 0.05 * Math.max(width, height),
					backgroundColor: '#ffffff',
					alignItems: 'center',
					justifyContent: 'center',
				},
				animatedStyle,
			]}>
			{value === 'Del' ? (
				<Ionicons name="backspace" size={1.5 * fontSize} color="white" />
			) : value === 'New' ? (
				<Ionicons name="bulb" size={1.5 * fontSize} color="white" />
			) : (
				<Text style={{ fontFamily: 'RobotoSlab-Bold', fontSize, color: 'white' }}>{value}</Text>
			)}
		</Animated.View>
	);
};

interface KeyboardProps {
	keyboard: Array<Array<string>>;
	onKeyPress: (key: string) => void;
	onEnterPress: () => void;
	onDelPress: () => void;
}

const Keyboard = ({ keyboard, onKeyPress, onEnterPress, onDelPress }: KeyboardProps) => {
	const window = useContext(WindowSizeContext);
	const keyWidth = window.width / (keyboard.reduce((acc, cur) => Math.max(acc, cur.length), 0) + 0.5);
	const keyHeight = window.height / 4 / keyboard.length;
	const keys: Array<KeyData> = keyboard
		.map((row: Array<string>, i) => {
			const rowWidth = row.reduce((acc: number, cur: string) => acc + keyWidth * (WIDEKEYS.includes(cur) ? 1.5 : 1), 0);
			let left = (window.width - rowWidth) / 2;
			const top = i * keyHeight;
			return row.map((key: string) => {
				const wide = WIDEKEYS.includes(key);
				const width = wide ? 1.5 * keyWidth : keyWidth;
				const keyData: KeyData = { value: key, x: left, y: top, width, height: keyHeight, wide };
				left += wide ? 1.5 * keyWidth : keyWidth;
				return keyData;
			});
		})
		.flat();
	const activeKey = useSharedValue('');
	const checkActiveKey = ({ x, y }: { x: number, y: number }): string => {
		'worklet';
		for (const key of keys) {
			if (y > key.y && y < key.y + key.height && x > key.x && x < key.x + key.width) {
				activeKey.value = key.value;
				return key.value;
			}
		}
		activeKey.value = '';
		return '';
	};
	const gesture = Gesture.Pan()
		.onBegin(checkActiveKey)
		.onUpdate(checkActiveKey)
		.onFinalize(() => {
			if (activeKey.value.length === 1) {
				runOnJS(onKeyPress)(activeKey.value);
			} else if (activeKey.value === 'New') {
				runOnJS(onEnterPress)();
			} else if (activeKey.value === 'Del') {
				runOnJS(onDelPress)();
			}
			activeKey.value = '';
		});
	return (
		<View style={{ position: 'absolute', bottom: 0 }}>
			<GestureDetector gesture={gesture}>
				<Animated.View
					style={{
						width: window.width,
						height: keyHeight * 3,
						backgroundColor: '#00000022',
					}}
					entering={ZoomInDown.duration(500)}
					exiting={ZoomOutDown.duration(500)}>
					{keys.map((key: KeyData, i) => (
						<Key key={key.value + i} data={key} activeKey={activeKey} />
					))}
				</Animated.View>
			</GestureDetector>
		</View>
	);
};

export default Keyboard;
