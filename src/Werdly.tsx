import React, { useContext, useEffect, useState } from 'react';
import { View, Pressable, Text, Alert, Share } from 'react-native';
import Square, { COLOR } from './Square';
import WindowSizeContext from './contexts/WindowSizeContext';
import Keyboard from './Keyboard';
import Animated, { Layout, useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { getDateNumber, seedRandom } from './utils/Random';
import Theme, { getTheme } from './contexts/Theme';
import SettingsContext from './contexts/SettingsContext';
import Language, { getLanguage } from './contexts/Language';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import LottieView from 'lottie-react-native';
import Lotties from './res/Lotties';

const CHECKMARK_COLORS = [COLOR.RED, COLOR.ORANGE, COLOR.YELLOW, COLOR.GREEN];

const makeWords = (language: Language, daily: number = -1, include: number = 0.8): Array<string> => {
	const random = daily >= 0 ? seedRandom(getDateNumber() + 10101010 * daily) : Math.random;
	random();
	return language.vocab
		.map(words => words[Math.floor(include * words.length * random())])
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

const isUpperCase = (char: string): boolean => char === char.toUpperCase();

const getShareTitle = (language: string, withDate: boolean): string => {
	const title = language === 'english' ? 'Werdly' : 'Вёрдли';
	if (withDate) {
		const date = new Date();
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear().toString();
		return `${title} - ${day}/${month}/${year}`;
	} else {
		return title;
	}
};

const Werdly = () => {
	const window = useContext(WindowSizeContext);
	const settings = useContext(SettingsContext);
	const theme: Theme = getTheme(settings.theme);
	const language: Language = getLanguage(settings.language);
	const squareSize = Math.min(window.width, window.height) / 8;
	const iconSize = squareSize / 2;
	const [daily, setDaily] = useState(0);
	const [words, setWords] = useState<Array<string>>(makeWords(language, daily));
	const [answers, setAnswers] = useState<Array<string>>([]);
	const level = answers.length;
	const [input, setInput] = useState<string>('');
	const shakeValue = useSharedValue(0);
	const shakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeValue.value }],
	}));
	const [isAlert, setIsAlert] = useState(true);
	const dateNumber = getDateNumber();
	const [checkmarks, setCheckmarks] = useState<Array<number>>([]);
	useEffect(() => {
		const answersData = settings.data.date === dateNumber ? settings.data?.answers?.[settings.language] : undefined;
		const newCheckmarks = [0, 1, 2, 3, 4]
			.map(i => (answersData && answersData[i] && answersData[i].length >= 3 ? answersData[i].join('').length : -1))
			.map(j => (j < 0 ? -1 : j < 4 ? 0 : j < 9 ? 1 : j < 15 ? 2 : 3));
		setCheckmarks(newCheckmarks);
	}, [settings.data, settings.language, dateNumber]);

	useEffect(() => {
		setWords(makeWords(language, daily));
		setInput('');
		if (daily >= 0 && settings.data.date === dateNumber) {
			setAnswers(settings.data?.answers?.[settings.language]?.[daily] ?? []);
		} else {
			setAnswers([]);
		}
	}, [settings.language, daily, settings.data, language, dateNumber]);

	const setAndSaveAnswers = (newAnswers: Array<string>) => {
		setAnswers(newAnswers);
		setInput('');
		if (daily >= 0) {
			const dataAnswers = (settings.data.date === dateNumber ? settings.data.answers : undefined) ?? {};
			if (!dataAnswers[settings.language]) {
				dataAnswers[settings.language] = [];
			}
			dataAnswers[settings.language][daily] = newAnswers;
			settings.save({
				date: dateNumber,
				answers: dataAnswers,
			});
		}
	};

	const doShake = () => {
		shakeValue.value = withSequence(withTiming(squareSize / 10, { duration: 100 }), withSpring(0, { stiffness: 500 }));
		// Vibration.vibrate();
	};
	useEffect(() => {
		if (words.length > 0 && words[level] && input.length >= words[level].length) {
			if (language.vocab[level].includes(input.toLowerCase())) {
				const wordArray = words[level].split('');
				const casedInput = input
					.split('')
					.map((l, i) => (isUpperCase(wordArray[i]) ? (wordArray[i] === l ? l : '') : l.toLowerCase()))
					.join('');
				if (casedInput.length === wordArray.length) {
					setAndSaveAnswers([...answers, casedInput]);
				} else {
					doShake();
				}
			} else {
				doShake();
			}
		}
	});

	const onKeyPress = (key: string) => {
		if (words[level]) {
			let newInput = input;
			const checkFilledLetters = () => {
				while (newInput.length < words[level].length && isUpperCase(words[level][newInput.length])) {
					newInput += words[level][newInput.length];
				}
			};
			checkFilledLetters();
			newInput += key;
			checkFilledLetters();
			setInput(newInput);
		}
	};

	const skipWord = () => {
		setAndSaveAnswers([...answers, '']);
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
		if (input.length === words[level].length) {
			setInput('');
		} else if (input.length > 0) {
			let newInput = input;
			let i = newInput.length - 1;
			while (i > 0 && isUpperCase(words[level].charAt(i))) {
				i--;
			}
			setInput(newInput.substring(0, i));
		}
	};

	const onShare = () => {
		const squares = answers.map((answer, i) =>
			answer.length > 0
				? answer
						.split('')
						.map(l => (isUpperCase(l) ? '🟩' : '🟦'))
						.join('') + ` ${answer.toUpperCase()}`
				: '⬜'.padEnd(words[i].length, '⬜') + ` ${words[i].toUpperCase()}`,
		);
		const header = getShareTitle(settings.language, daily >= 0) + (daily >= 0 ? ` (${daily + 1})` : ' - ♾️');
		const message = [header, ...squares].join('\n');
		Share.share({ message }).then();
	};

	const onShareCheckmarks = () => {
		const header = getShareTitle(settings.language, true);
		const SQUARES = ['⬜️', '🟥', '🟧', '🟨', '🟩'];
		const squares = checkmarks.map(mark => SQUARES[mark + 1]).join('');
		const answered = checkmarks.reduce((acc, cur) => (cur > 0 ? acc + cur : acc), 0);
		const total = checkmarks.reduce((acc, cur) => (cur < 0 ? acc : acc + 3), 0);
		const result = `${squares} ${answered}/${total}`;
		const message = [header, result].join('\n');
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
											key={word.charAt(i).toUpperCase() + i + (isUpperCase(word.charAt(i)) ? '' : l.toUpperCase())}
											letter={l.toUpperCase()}
											size={squareSize}
											color={isUpperCase(l) ? COLOR.BLUE : COLOR.GREEN}
											textColor={COLOR.WHITE}
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
									key={l.toUpperCase() + i + (isUpperCase(l) ? '' : inputLetter)}
									letter={inputLetter ?? (isUpperCase(l) ? l : ' ')}
									size={squareSize}
									color={inputLetter ? (isUpperCase(l) ? COLOR.WHITE : COLOR.GREEN) : COLOR.WHITE}
									textColor={isUpperCase(l) ? COLOR.DARKBLUE : COLOR.WHITE}
									isInput={inputLetter !== undefined}
								/>
							);
						})}
					</Animated.View>
				) : null,
			)}

			{level >= words.length ? (
				<View
					style={{
						position: 'absolute',
						width: window.width,
						height: window.height / 4,
						left: 0,
						bottom: 0,
						alignItems: 'center',
					}}>
					<LottieView
						style={{ width: window.height / 4, height: window.height / 4 }}
						source={Lotties.shiba[answers.map(a => (a.length > 0 ? '1' : '')).join('').length]}
						autoPlay
					/>
				</View>
			) : (
				<Keyboard
					key={'keyboard_' + settings.language}
					keyboard={language.keyboard}
					onKeyPress={onKeyPress}
					onEnterPress={onHelpPress}
					onDelPress={onDelPress}
				/>
			)}
			<View
				style={{
					position: 'absolute',
					top: Constants.statusBarHeight + 0.25 * iconSize,
					width: window.width,
					alignItems: 'center',
				}}>
				<Text
					style={{
						fontFamily: 'RobotoSlab-Bold',
						fontSize: 1.25 * iconSize,
						color: theme.iconColor,
					}}>
					{(settings.language === 'russian' ? 'Кятле' : 'Kyatle').toUpperCase()}
				</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Pressable
						style={{ marginHorizontal: 0.1 * iconSize, opacity: daily === -1 ? 1 : 0.4 }}
						onPress={() => {
							if (daily >= 0) {
								setDaily(-1);
							} else {
								setInput('');
								setAnswers([]);
								setWords(makeWords(language, -1));
							}
						}}>
						<FontAwesome5 name="dice" size={iconSize} color={theme.iconColor} />
					</Pressable>
					{[0, 1, 2, 3, 4].map(i => (
						<Pressable
							key={'check' + i}
							style={{ marginHorizontal: 0.1 * iconSize, opacity: daily === i ? 1 : 0.6 }}
							onPress={() => setDaily(i)}>
							<FontAwesome
								name="check-square"
								size={1.25 * iconSize}
								color={checkmarks[i] < 0 ? theme.iconColor : CHECKMARK_COLORS[checkmarks[i]]}
							/>
						</Pressable>
					))}
					<Pressable style={{ marginHorizontal: 0.1 * iconSize, opacity: 0.5 }} onPress={onShareCheckmarks}>
						<FontAwesome name="share" size={iconSize} color={theme.iconColor} />
					</Pressable>
				</View>
			</View>
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
