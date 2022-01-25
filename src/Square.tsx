import React from 'react';
import { Text, View } from 'react-native';

export const COLOR = {
	WHITE: '#ffffff',
	BLACK: '#000000',
	GREEN: '#81AA66',
	BLUE: '#3B95D7',
};

interface SquareProps {
	letter: string;
	size: number;
	color?: string;
	textColor?: string;
}

const Square = ({ letter, size, color = COLOR.WHITE, textColor = COLOR.BLACK }: SquareProps) => {
	return (
		<View
			style={{
				width: size,
				height: size,
				margin: size / 20,
				backgroundColor: color,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Text style={{ fontFamily: 'RobotoSlab-Bold', fontSize: 0.75 * size, color: textColor }}>{letter}</Text>
		</View>
	);
};
export default Square;
