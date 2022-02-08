import React from 'react';
import { Text } from 'react-native';
import Animated, { FlipInYLeft, FlipInYRight, StretchOutX, Layout } from 'react-native-reanimated';

export const COLOR = {
	WHITE: '#ffffff',
	BLACK: '#000000',
	GREEN: '#81AA66',
	BLUE: '#3B95D7',
	YELLOW: '#D2D837',
	ORANGE: '#D79E3B',
	RED: '#FF4343',
	DARKBLUE: '#24506F',
};

interface SquareProps {
	letter: string;
	size: number;
	color?: string;
	textColor?: string;
	isInput?: boolean;
}

const DURATION = 250;

const Square = ({ letter, size, color = COLOR.WHITE, textColor = COLOR.BLACK, isInput = false }: SquareProps) => {
	return (
		<Animated.View
			entering={isInput ? FlipInYRight.duration(DURATION) : FlipInYLeft.duration(DURATION)}
			layout={Layout.duration(DURATION)}
			exiting={isInput ? StretchOutX.duration(DURATION / 2) : StretchOutX.duration(DURATION / 2)}
			style={{
				width: size,
				height: size,
				margin: size / 20,
				backgroundColor: color,
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: isInput ? 100 : 10,
			}}>
			<Text style={{ fontFamily: 'RobotoSlab-Bold', fontSize: 0.75 * size, color: textColor }}>{letter}</Text>
		</Animated.View>
	);
};
export default Square;
