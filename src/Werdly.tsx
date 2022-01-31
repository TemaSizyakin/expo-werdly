import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import Square, { COLOR } from './Square';
import WindowSizeContext from './contexts/WindowSizeContext';
import Keyboard from './Keyboard';

type Vocabulary = Array<Array<string>>;
type Language = {
	vocab: Vocabulary,
	keyboard: Array<Array<string>>,
	consonants: Array<string>,
	vowels: Array<string>,
};
type LanguageName = 'english' | 'russian';
const Languages: { [key: string]: Language } = {
	english: {
		vocab: require('../assets/json/english.json'),
		keyboard: [
			['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
			['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
			['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del'],
		],
		consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'],
		vowels: ['A', 'E', 'I', 'O', 'U', 'Y'],
	},
	russian: {
		vocab: require('../assets/json/russian.json'),
		keyboard: [
			['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
			['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
			['Enter', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'Del'],
		],
		consonants: ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь'],
		vowels: ['А', 'Е', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'],
	},
};

const exWords = ['CaVe', 'VoiCe', 'oCtAVe'];
const exInput = '';

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = window.width / 8;
	const [language, setLanguage] = useState<LanguageName>('english');
	const [words, setWords] = useState<Array<string>>([]);
	const [input, setInput] = useState<string>('');
	const [level, setLevel] = useState<number>(0);

	useEffect(() => {
		// const makeNewWord = (s: number, l: Array<string>) => {
		// 	const sizeString = sizeToString(s);
		// 	const wordsNum = english[sizeString].length;
		// 	const randomWordNum = Math.floor(wordsNum * Math.random());
		// 	if (l.length === 0) {
		// 		const newWord = english[sizeString][randomWordNum].toUpperCase();
		// 		const newMask = [Math.floor(size * Math.random())];
		// 		setMask(newMask);
		// 		setLetters([newWord.charAt(newMask[0])]);
		// 		setWord(newWord);
		// 	} else {
		// 		let newWord = '';
		// 		let found = false;
		// 		for (let i = randomWordNum; i < wordsNum; i++) {
		// 			newWord = english[sizeString][randomWordNum].toUpperCase();
		// 			if (newWord.includes(letters[0])) {
		// 				found = true;
		// 				break;
		// 			}
		// 		}
		// 		if (found) {
		// 			const newMask = [Math.floor(size * Math.random())];
		// 			setMask(newMask);
		// 			setLetters([newWord.charAt(newMask[0])]);
		// 			setWord(newWord);
		// 		} else {
		// 			setLetters([]);
		// 		}
		// 	}
		// };
		// console.log('useEffect', size, letters);
		// if (size === 4 && letters.length === 0) {
		// 	makeNewWord(size, letters);
		// }
	}, [language]);

	const onKeyPress = (key: string) => {
		if (input.length < words[level].length) {
			setInput(input + key);
		}
	};
	const onEnterPress = () => {
		// setSize(Math.min(size + 1, 6));
		// const n: number = 4 + Math.floor(3 * Math.random());
		// const wordLength = n === 4 ? 'four' : n === 5 ? 'five' : 'six';
		// const wordsNum = english[wordLength].length;
		// const randomWordNum = Math.floor(wordsNum * Math.random());
		// setMask([Math.floor(n * Math.random())]);
		// setWord(english[wordLength][randomWordNum].toUpperCase());
	};
	const onDelPress = () => {
		if (input.length > 0) {
			setInput(input.substring(0, input.length - 1));
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5C80' }}>
				{input.split('').map((l, i) => (
					<Square key={l + i} letter={l} size={squareSize} color={COLOR.WHITE} textColor={COLOR.BLACK} />
				))}
			</View>
			<Keyboard onKeyPress={onKeyPress} onEnterPress={onEnterPress} onDelPress={onDelPress} />
		</View>
	);
};

export default Werdly;
