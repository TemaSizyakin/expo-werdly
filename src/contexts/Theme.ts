export type ThemeType = 'light' | 'dark';

type Theme = {
	backgroundColor: string,
	barStyle: ThemeType,
	iconColor: string,
};

const THEMES: { [key: string]: Theme } = {
	light: { backgroundColor: '#cbd9e5', barStyle: 'dark', iconColor: '#24506F' },
	dark: { backgroundColor: '#2a5c80', barStyle: 'light', iconColor: '#3B95D7' },
};

export const getTheme = (theme: ThemeType) => THEMES[theme];

export default Theme;
