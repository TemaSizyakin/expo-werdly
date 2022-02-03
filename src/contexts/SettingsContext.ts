import { createContext, useEffect, useState } from 'react';
import { LanguageType } from './Language';
import { ThemeType } from './Theme';
import * as FileSystem from 'expo-file-system';

const FilePath = FileSystem.documentDirectory + 'settings.json';

interface SettingsContextInterface {
	theme: ThemeType;
	language: LanguageType;
	toggleTheme: () => void;
	toggleLanguage: () => void;
	load: () => void;
	save: () => void;
}

const SettingsContextDefault: SettingsContextInterface = {
	theme: 'dark',
	language: 'english',
	toggleTheme: () => null,
	toggleLanguage: () => null,
	load: () => null,
	save: () => null,
};

const SettingsContext = createContext<SettingsContextInterface>(SettingsContextDefault);

export const useSettingsContext = (): SettingsContextInterface => {
	const [theme, setTheme] = useState<ThemeType>('dark');
	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};
	const [language, setLanguage] = useState<LanguageType>('russian');
	const toggleLanguage = () => {
		setLanguage(language === 'english' ? 'russian' : 'english');
	};
	const load = async () => {
		try {
			const file = await FileSystem.readAsStringAsync(FilePath);
			const settings = JSON.parse(file) ?? {};
			console.log('load', settings);
			const loadedTheme: ThemeType = settings.theme;
			if (loadedTheme) {
				setTheme(loadedTheme);
			}
			const loadedLang: LanguageType = settings.language;
			if (loadedLang) {
				setLanguage(loadedLang);
			}
		} catch (e) {
			console.log('load', 'failed');
		}
	};
	const save = () => {
		try {
			const settings = JSON.stringify({ theme, language });
			FileSystem.writeAsStringAsync(FilePath, settings).then();
			console.log('save', settings);
		} catch (e) {
			console.log('save', 'failed');
		}
	};
	useEffect(() => {
		load().then();
	}, []);
	return { theme, language, toggleTheme, toggleLanguage, load, save };
};

export default SettingsContext;
