import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import Square, { COLOR } from './Square';
import { WindowSizeContext } from './hooks/useWindowSize';
import Keyboard from './Keyboard';

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = window.width / 8;
	const [word, setWord] = useState('');

	const onKeyPress = (key: string) => {
		setWord(word + key);
	};
	const onEnterPress = () => {
		setWord('');
	};
	const onDelPress = () => {
		if (word.length > 0) {
			setWord(word.substring(0, word.length - 1));
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5C80' }}>
				{word.split('').map((l, i) => (
					<Square
						key={l + i}
						letter={l}
						size={squareSize}
						color={i % 2 === 0 ? COLOR.GREEN : COLOR.BLUE}
						textColor={COLOR.WHITE}
					/>
				))}
			</View>
			<Keyboard onKeyPress={onKeyPress} onEnterPress={onEnterPress} onDelPress={onDelPress} />
		</View>
	);
};

export default Werdly;
