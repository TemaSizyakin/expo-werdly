import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import Square, { COLOR } from './Square';
import { WindowSizeContext } from './hooks/useWindowSize';
import { useMemo } from 'react';
import { State, TapGestureHandler, TapGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = useMemo(() => window.width / 8, [window]);
	const [word, setWord] = useState('W');
	// useEffect(() => {
	// 	const WORD = 'WERDLY';
	// 	setTimeout(() => {
	// 		if (word.length < WORD.length) {
	// 			setWord(WORD.substring(0, word.length + 1));
	// 		}
	// 	}, 250);
	// }, [word]);
	const onSingleTap = (event: TapGestureHandlerStateChangeEvent) => {
		if (event.nativeEvent.state === State.ACTIVE) {
			const WORD = 'WERDLY';
			if (word.length < WORD.length) {
				setWord(WORD.substring(0, word.length + 1));
			} else {
				setWord('W');
			}
		}
	};

	return (
		<TapGestureHandler onHandlerStateChange={onSingleTap}>
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
		</TapGestureHandler>
	);
};

export default Werdly;
