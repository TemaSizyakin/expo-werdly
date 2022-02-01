import React, { useContext, useEffect, useState } from 'react';
import { View, Vibration } from 'react-native';
import Square, { COLOR } from './Square';
import WindowSizeContext from './contexts/WindowSizeContext';
import Keyboard from './Keyboard';
import Animated, { Layout, useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring } from 'react-native-reanimated';

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
			['New', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del'],
		],
		consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'],
		vowels: ['A', 'E', 'I', 'O', 'U', 'Y'],
	},
	russian: {
		vocab: require('../assets/json/russian.json'),
		keyboard: [
			['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
			['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
			['New', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'Del'],
		],
		consonants: ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь'],
		vowels: ['А', 'Е', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'],
	},
};
const makeWords = (language: Language): Array<string> => {
	return language.vocab
		.map(words => words[Math.floor(words.length * Math.random())])
		.map(word => {
			const n = Math.floor(word.length / 2);
			const set = new Set<number>();
			while (set.size < n) {
				set.add(Math.floor(word.length * Math.random()));
			}
			let casedWord = word.split('');
			set.forEach(i => (casedWord[i] = casedWord[i].toUpperCase()));
			return casedWord.join('');
		});
	// return ['CaSe', 'SCale', 'ChEeSe'];
};
const isUpperCase = (char: string): boolean => char === char.toUpperCase();

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const squareSize = window.width / 8;
	const [language] = useState<LanguageName>('english');
	const [words, setWords] = useState<Array<string>>(makeWords(Languages[language]));
	const [answers, setAnswers] = useState<Array<string>>([]);
	const [input, setInput] = useState<string>('');
	const [level, setLevel] = useState<number>(0);
	const shakeValue = useSharedValue(0);
	const shakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeValue.value }],
	}));

	useEffect(() => {
		if (words.length > 0 && words[level] && input.length >= words[level].length) {
			const doShake = () => {
				shakeValue.value = withSequence(withTiming(squareSize / 10, { duration: 100 }), withSpring(0, { stiffness: 500 }));
				Vibration.vibrate();
			};
			if (Languages[language].vocab[level].includes(input.toLowerCase())) {
				const wordArray = words[level].split('');
				const casedInput = input
					.split('')
					.map((l, i) => (isUpperCase(wordArray[i]) ? (wordArray[i] === l ? l : '') : l.toLowerCase()))
					.join('');
				if (casedInput.length === wordArray.length) {
					setAnswers([...answers, casedInput]);
					setInput('');
					setLevel(lvl => lvl + 1);
				} else {
					doShake();
				}
			} else {
				doShake();
			}
		}
	}, [words, input, level, shakeValue, squareSize, language, answers]);

	const onKeyPress = (key: string) => {
		if (words[level] && input.length < words[level].length) {
			setInput(input + key);
		}
	};
	const onEnterPress = () => {
		setLevel(0);
		setWords(makeWords(Languages[language]));
		setAnswers([]);
		setInput('');
	};
	const onDelPress = () => {
		if (input.length > 0) {
			setInput(input.substring(0, input.length - 1));
		}
	};

	return words.length > 0 ? (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A5C80' }}>
			{words.map((word, j) =>
				j < level ? (
					<Animated.View
						key={'word' + j}
						style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
						layout={Layout}>
						{answers[j].split('').map((l, i) => (
							<Square
								key={word.charAt(i).toUpperCase() + i + l.toUpperCase()}
								letter={l.toUpperCase()}
								size={squareSize}
								color={isUpperCase(l) ? COLOR.GREEN : COLOR.BLUE}
								textColor={COLOR.DARKBLUE}
							/>
						))}
					</Animated.View>
				) : j === level ? (
					<Animated.View
						key={'word' + j}
						style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, shakeStyle]}
						layout={Layout}>
						{word.split('').map((l, i) => {
							const inputLetter = input[i];
							return (
								<Square
									key={l.toUpperCase() + i + inputLetter ?? ''}
									letter={inputLetter ?? (isUpperCase(l) ? l : ' ')}
									size={squareSize}
									color={
										inputLetter
											? isUpperCase(l)
												? inputLetter === l
													? COLOR.GREEN
													: COLOR.RED
												: COLOR.BLUE
											: COLOR.WHITE
									}
									textColor={inputLetter ? COLOR.WHITE : COLOR.DARKBLUE}
									isInput={inputLetter !== undefined}
								/>
							);
						})}
					</Animated.View>
				) : null,
			)}
			<Keyboard onKeyPress={onKeyPress} onEnterPress={onEnterPress} onDelPress={onDelPress} />
		</View>
	) : null;
};

export default Werdly;
