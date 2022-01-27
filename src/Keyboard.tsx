import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { WindowSizeContext } from './hooks/useWindowSize';
import Animated, {
	interpolateColor,
	runOnJS,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const KEYS: Array<Array<string>> = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
	['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del'],
];
const WIDEKEYS: Array<string> = ['Enter', 'Del'];

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
	return (
		<Animated.View
			style={[
				{
					position: 'absolute',
					left: x + 0.05 * width,
					top: y + 0.05 * height,
					width: 0.9 * width,
					height: 0.9 * height,
					borderRadius: 0.05 * height,
					backgroundColor: '#ffffff',
					alignItems: 'center',
					justifyContent: 'center',
				},
				animatedStyle,
			]}>
			<Text style={{ fontFamily: 'RobotoSlab-Bold', fontSize: Math.min(wide ? width / 1.5 : width, height) / 2, color: 'white' }}>
				{value}
			</Text>
		</Animated.View>
	);
};

interface KeyboardProps {
	onKeyPress: (key: string) => void;
	onEnterPress: () => void;
	onDelPress: () => void;
}

const Keyboard = ({ onKeyPress, onEnterPress, onDelPress }: KeyboardProps) => {
	const window = useContext(WindowSizeContext);
	const keyWidth = window.width / 12;
	const keyHeight = window.height / 12;
	const keys: Array<KeyData> = KEYS.map((row: Array<string>, i) => {
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
	}).flat();
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
			} else if (activeKey.value === 'Enter') {
				runOnJS(onEnterPress)();
			} else if (activeKey.value === 'Del') {
				runOnJS(onDelPress)();
			}
			activeKey.value = '';
		});
	return (
		<View style={{ position: 'absolute', bottom: 0, paddingVertical: keyHeight / 8, backgroundColor: '#00000022' }}>
			<GestureDetector gesture={gesture}>
				<View
					style={{
						width: window.width,
						height: keyHeight * 3,
					}}>
					{keys.map((key: KeyData, i) => (
						<Key key={key.value + i} data={key} activeKey={activeKey} />
					))}
				</View>
			</GestureDetector>
		</View>
	);
};

export default Keyboard;
