import React, { useContext } from 'react';
import { View } from 'react-native';
import Square, { COLOR } from './Square';
import { WindowSizeContext } from './hooks/useWindowSize';
import { useMemo } from 'react';

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = useMemo(() => window.width / 8, [window]);

	return (
		<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B6281' }}>
			{'WERDLY'.split('').map((l, i) => (
				<Square key={l + i} letter={l} size={squareSize} color={i % 2 === 0 ? COLOR.GREEN : COLOR.BLUE} textColor={COLOR.WHITE} />
			))}
		</View>
	);
};

export default Werdly;
