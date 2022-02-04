import React, { useContext, useEffect, useState } from 'react';
import { View, Vibration, Pressable, Text, Alert, Share } from 'react-native';
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
// const showWords = (words: Array<string>, lvl: number) => words.map((wrd, i) => (i === lvl ? wrd.toUpperCase() : wrd));
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
	const level = answers.length;
	const [input, setInput] = useState<string>('');
	const shakeValue = useSharedValue(0);
	const shakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeValue.value }],
	}));
	const [isAlert, setIsAlert] = useState(true);

	useEffect(() => {
		setWords(makeWords(language, daily));
		setInput('');
		if (daily && settings.data.date === getDateNumber()) {
			setAnswers(settings.data?.answers?.[settings.language] ?? []);
		} else {
			setAnswers([]);
		}
	}, [settings.language, daily, settings.data, language]);

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
					const newAnswers: Array<string> = [...answers, casedInput];
					setAnswers(newAnswers);
					setInput('');
					if (daily) {
						const prevAnswers = settings.data?.answers;
						if (settings.data.date === getDateNumber() && prevAnswers) {
							settings.save({
								date: getDateNumber(),
								answers: { ...prevAnswers, [settings.language]: newAnswers },
							});
						} else {
							settings.save({ date: getDateNumber(), answers: { [settings.language]: newAnswers } });
						}
					}
				} else {
					doShake();
				}
			} else {
				doShake();
			}
		}
	}, [words, input, level, shakeValue, squareSize, language, answers, settings, daily]);

	const onKeyPress = (key: string) => {
		if (words[level] && input.length < words[level].length) {
			setInput(input + key);
		}
	};

	const skipWord = () => {
		const newAnswers = [...answers, ''];
		setAnswers(newAnswers);
		setInput('');
		if (daily) {
			const prevAnswers = settings.data?.answers;
			if (settings.data.date === getDateNumber() && prevAnswers) {
				settings.save({
					date: getDateNumber(),
					answers: { ...prevAnswers, [settings.language]: newAnswers },
				});
			} else {
				settings.save({ date: getDateNumber(), answers: { [settings.language]: newAnswers } });
			}
		}
	};

	const onHelpPress = () => {
		if (level < words.length) {
			if (isAlert) {
				if (settings.language === 'russian') {
					Alert.alert('Подсказка', 'Вы уверены, что хотите открыть слово?', [
						{ text: 'Да', onPress: skipWord },
						{ text: 'Отмена', style: 'cancel' },
					]);
				} else {
					Alert.alert('Help', 'Are you sure you want to reveal a word?', [
						{ text: 'Yes', onPress: skipWord },
						{ text: 'Cancel', style: 'cancel' },
					]);
				}
				setIsAlert(false);
			} else {
				skipWord();
			}
		}
	};

	const onDelPress = () => {
		if (input.length > 0) {
			setInput(input.substring(0, input.length - 1));
		}
	};

	const onShare = () => {
		const message = answers.map((word, i) => (word.length > 0 ? word.toUpperCase() : words[i].toUpperCase())).join('\n');
		Share.share({ message }).then();
	};

	return words.length > 0 ? (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.backgroundColor }}>
			{words.map((word, j) =>
				j < level ? (
					<Animated.View
						key={'word' + j}
						style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
						layout={Layout}>
						{answers[j].length === 0
							? word
									.split('')
									.map((l, i) => (
										<Square
											key={l.toUpperCase() + i}
											letter={l.toUpperCase()}
											size={squareSize}
											color={COLOR.WHITE}
											textColor={COLOR.DARKBLUE}
										/>
									))
							: answers[j]
									.split('')
									.map((l, i) => (
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
									key={l.toUpperCase() + i + (inputLetter ?? '')}
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
				style={{ position: 'absolute', top: Constants.statusBarHeight + 0.5 * iconSize, width: window.width, alignItems: 'center' }}
				onPress={() => setDaily(true)}>
				<Text
					style={{ fontFamily: 'RobotoSlab-Bold', fontSize: 1.25 * iconSize, color: theme.iconColor, opacity: daily ? 1 : 0.4 }}>
					{(settings.language === 'russian' ? 'Вёрдли' : 'Werdly').toUpperCase()}
				</Text>
			</Pressable>
			<Pressable
				style={{
					position: 'absolute',
					top: Constants.statusBarHeight + 2.25 * iconSize,
					width: window.width,
					alignItems: 'center',
				}}
				onPress={() => {
					if (daily) {
						setDaily(false);
					} else {
						setInput('');
						setAnswers([]);
						setWords(makeWords(language, false));
					}
				}}>
				<Text
					style={{ fontFamily: 'RobotoSlab-Bold', fontSize: 0.65 * iconSize, color: theme.iconColor, opacity: daily ? 0.4 : 1 }}>
					{(settings.language === 'russian'
						? daily
							? 'Играть ещё'
							: 'Рестарт'
						: daily
						? 'Play again'
						: 'Restart'
					).toUpperCase()}
				</Text>
			</Pressable>
			<Pressable
				style={{ position: 'absolute', top: Constants.statusBarHeight + 0.5 * iconSize, left: 0.5 * iconSize }}
				onPress={settings.toggleTheme}>
				<Ionicons name="moon" size={iconSize} color={theme.iconColor} />
			</Pressable>
			<Pressable
				style={{ position: 'absolute', top: Constants.statusBarHeight + 0.5 * iconSize, right: 0.5 * iconSize }}
				onPress={settings.toggleLanguage}>
				<Ionicons name="earth" size={iconSize} color={theme.iconColor} />
			</Pressable>
			{level === words.length && (
				<Pressable onPress={onShare}>
					<Text
						style={{
							fontFamily: 'RobotoSlab-Bold',
							fontSize: 0.65 * iconSize,
							color: theme.iconColor,
							marginTop: iconSize / 2,
						}}>
						{(settings.language === 'russian' ? 'Поделиться' : 'Share').toUpperCase()}
					</Text>
				</Pressable>
			)}
		</View>
	) : null;
};

export default Werdly;
