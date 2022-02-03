import React, { useContext, useEffect, useState } from 'react';
import { View, Vibration, Pressable, Text, Alert } from 'react-native';
import Square, { COLOR } from './Square';
import WindowSizeContext from './contexts/WindowSizeContext';
import Keyboard from './Keyboard';
import Animated, { Layout, useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { getDateNumber, seedRandom } from './utils/Random';
import Theme, { getTheme } from './contexts/Theme';
import SettingsContext from './contexts/SettingsContext';
import Language, { getLanguage } from './contexts/Language';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const makeWords = (language: Language, daily: boolean = false): Array<string> => {
	const random = daily ? seedRandom(getDateNumber()) : Math.random;
	random();
	return language.vocab
		.map(words => words[Math.floor(words.length * random())])
		.map(word => {
			const n = Math.floor(word.length / 2);
			const set = new Set<number>();
			while (set.size < n) {
				set.add(Math.floor(word.length * random()));
			}
			let casedWord = word.split('');
			set.forEach(i => (casedWord[i] = casedWord[i].toUpperCase()));
			return casedWord.join('');
		});
	// return ['CaSe', 'SCale', 'ChEeSe'];
};
const showWords = (words: Array<string>, lvl: number) => words.map((wrd, i) => (i === lvl ? wrd.toUpperCase() : wrd));
const isUpperCase = (char: string): boolean => char === char.toUpperCase();

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const settings = useContext(SettingsContext);
	const theme: Theme = getTheme(settings.theme);
	const language: Language = getLanguage(settings.language);
	const squareSize = Math.min(window.width, window.height) / 8;
	const iconSize = squareSize / 2;
	const [daily, setDaily] = useState(true);
	const [words, setWords] = useState<Array<string>>(makeWords(language, daily));
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
			if (language.vocab[level].includes(input.toLowerCase())) {
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
	const onHelpPress = () => {
		if (settings.language === 'russian') {
			Alert.alert('Подсказка', 'Вы уверены, что хотите открыть слово?', [
				{ text: 'Да', onPress: () => setWords(showWords(words, level)) },
				{ text: 'Отмена', style: 'cancel' },
			]);
		} else {
			Alert.alert('Help', 'Are you sure you want to reveal a word?', [
				{ text: 'Yes', onPress: () => setWords(showWords(words, level)) },
				{ text: 'Cancel', style: 'cancel' },
			]);
		}
		// setWords(showWords(words, level));
	};
	const onDelPress = () => {
		if (input.length > 0) {
			setInput(input.substring(0, input.length - 1));
		}
	};
	const onChangeLanguagePress = () => {
		settings.toggleLanguage();
		setLevel(0);
		setAnswers([]);
		setInput('');
		setDaily(false);
	};

	useEffect(() => {
		setWords(makeWords(language));
		// console.log(settings.language, settings.theme);
	}, [settings.language]);

	return words.length > 0 ? (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.backgroundColor }}>
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
			<Keyboard
				key={'keyboard_' + settings.language}
				keyboard={language.keyboard}
				onKeyPress={onKeyPress}
				onEnterPress={onHelpPress}
				onDelPress={onDelPress}
			/>
			<Pressable
				style={{ position: 'absolute', top: Constants.statusBarHeight + 0.5 * iconSize, right: 0.5 * iconSize }}
				onPress={settings.toggleTheme}>
				<Ionicons name="moon" size={iconSize} color={theme.iconColor} />
			</Pressable>
			<Pressable
				style={{ position: 'absolute', top: Constants.statusBarHeight + 2 * iconSize, right: 0.5 * iconSize }}
				onPress={onChangeLanguagePress}>
				<Ionicons name="earth" size={iconSize} color={theme.iconColor} />
			</Pressable>
			{/*<Pressable*/}
			{/*	style={{ position: 'absolute', top: Constants.statusBarHeight + 2 * iconSize, right: 2 * iconSize }}*/}
			{/*	onPress={settings.load}>*/}
			{/*	<Ionicons name="cloud-upload" size={iconSize} color={COLOR.BLUE} />*/}
			{/*</Pressable>*/}
			{/*<Pressable*/}
			{/*	style={{ position: 'absolute', top: Constants.statusBarHeight + 2 * iconSize, right: 0.5 * iconSize }}*/}
			{/*	onPress={settings.save}>*/}
			{/*	<Ionicons name="cloud-download" size={iconSize} color={COLOR.BLUE} />*/}
			{/*</Pressable>*/}
			<Pressable
				style={{ position: 'absolute', top: Constants.statusBarHeight + 0.5 * iconSize, left: 0.5 * iconSize }}
				onPress={() => null}>
				<Text style={{ fontFamily: 'RobotoSlab-Bold', fontSize: 0.75 * iconSize, color: theme.iconColor }}>
					{(settings.language === 'russian' ? (daily ? 'Ежедневный' : 'Случайный') : daily ? 'Daily' : 'Random').toUpperCase()}
				</Text>
			</Pressable>
		</View>
	) : null;
};

export default Werdly;
