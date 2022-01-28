import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import Square, { COLOR } from './Square';
import WindowSizeContext from './contexts/WindowSizeContext';
import Keyboard from './Keyboard';

type Words = {
	four: Array<string>,
	five: Array<string>,
	six: Array<string>,
};

// const CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'];
// const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = window.width / 8;
	const english: Words = require('../assets/json/english.json');
	const [word, setWord] = useState('');
	const [mask, setMask] = useState<Array<number>>([]);
	const [size, setSize] = useState(4);
	const [letters, setLetters] = useState<Array<string>>([]);

	const sizeToString = (s: number) => (s === 4 ? 'four' : s === 5 ? 'five' : 'six');

	useEffect(() => {
		const makeNewWord = (s: number, l: Array<string>) => {
			const sizeString = sizeToString(s);
			const wordsNum = english[sizeString].length;
			const randomWordNum = Math.floor(wordsNum * Math.random());
			if (l.length === 0) {
				const newWord = english[sizeString][randomWordNum].toUpperCase();
				const newMask = [Math.floor(size * Math.random())];
				setMask(newMask);
				setLetters([newWord.charAt(newMask[0])]);
				setWord(newWord);
			} else {
				let newWord = '';
				let found = false;
				for (let i = randomWordNum; i < wordsNum; i++) {
					newWord = english[sizeString][randomWordNum].toUpperCase();
					if (newWord.includes(letters[0])) {
						found = true;
						break;
					}
				}
				if (found) {
					const newMask = [Math.floor(size * Math.random())];
					setMask(newMask);
					setLetters([newWord.charAt(newMask[0])]);
					setWord(newWord);
				} else {
					setLetters([]);
				}
			}
		};
		console.log('useEffect', size, letters);
		if (size === 4 && letters.length === 0) {
			makeNewWord(size, letters);
		}
	}, [size, letters, english]);

	const onKeyPress = (key: string) => {
		setWord(word + key);
	};
	const onEnterPress = () => {
		setSize(Math.min(size + 1, 6));
		// const n: number = 4 + Math.floor(3 * Math.random());
		// const wordLength = n === 4 ? 'four' : n === 5 ? 'five' : 'six';
		// const wordsNum = english[wordLength].length;
		// const randomWordNum = Math.floor(wordsNum * Math.random());
		// setMask([Math.floor(n * Math.random())]);
		// setWord(english[wordLength][randomWordNum].toUpperCase());
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
					<Square key={l + i} letter={mask.includes(i) ? l : ' '} size={squareSize} color={COLOR.WHITE} textColor={COLOR.BLACK} />
				))}
			</View>
			<Keyboard onKeyPress={onKeyPress} onEnterPress={onEnterPress} onDelPress={onDelPress} />
		</View>
	);
};

export default Werdly;
