import { createContext, useEffect, useState } from 'react';
import { LanguageType } from './Language';
import { ThemeType } from './Theme';
import * as FileSystem from 'expo-file-system';

const FilePath = FileSystem.documentDirectory + 'settings.json';
// settings.json
//  {
//      "theme": "dark",
//      "language": "russian",
//      "data": {
//          "date": "20220204",
//          "answers": {
//              "russian": ["рыСЬ", "мЕТан", "КупЮРа"]
//              "english": ["SIlk", "", "AnnUaL"]
//          }
//      }
//  }

interface SettingsContextInterface {
	theme: ThemeType;
	language: LanguageType;
	toggleTheme: () => void;
	toggleLanguage: () => void;
	data: any;
	save: (data: any) => void;
}

const SettingsContextDefault: SettingsContextInterface = {
	theme: 'dark',
	language: 'english',
	toggleTheme: () => null,
	toggleLanguage: () => null,
	data: {},
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
	const [data, setData] = useState({});
	const init = async () => {
		try {
			const file = await FileSystem.readAsStringAsync(FilePath);
			const settings = JSON.parse(file) ?? {};
			console.log('init', settings);
			const loadedTheme: ThemeType = settings.theme;
			if (loadedTheme) {
				setTheme(loadedTheme);
			}
			const loadedLang: LanguageType = settings.language;
			if (loadedLang) {
				setLanguage(loadedLang);
			}
			if (settings.data !== undefined) {
				setData(settings.data ?? {});
			}
		} catch (e) {
			console.log('init failed');
		}
	};
	const save = (obj: Object | null = null) => {
		try {
			if (obj) {
				setData(obj);
			}
			const settings = JSON.stringify({ theme, language, data: obj ?? data });
			FileSystem.writeAsStringAsync(FilePath, settings).then();
			console.log('save', settings);
		} catch (e) {
			console.log('save', 'failed');
		}
	};
	useEffect(() => {
		init().then();
	}, []);
	return { theme, language, toggleTheme, toggleLanguage, data, save };
};

export default SettingsContext;
