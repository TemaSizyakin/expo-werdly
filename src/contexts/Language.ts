export type LanguageType = 'english' | 'russian';

type Vocabulary = Array<Array<string>>;

type Language = {
	vocab: Vocabulary,
	keyboard: Array<Array<string>>,
	consonants: Array<string>,
	vowels: Array<string>,
};

const LANGUAGES: { [key: string]: Language } = {
	english: {
		vocab: require('../../assets/json/english.json'),
		keyboard: [
			['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
			['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
			['New', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Del'],
		],
		consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'],
		vowels: ['A', 'E', 'I', 'O', 'U', 'Y'],
	},
	russian: {
		vocab: require('../../assets/json/russian.json'),
		keyboard: [
			['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
			['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
			['New', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'Del'],
		],
		consonants: ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь'],
		vowels: ['А', 'Е', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'],
	},
};

export const getLanguage = (lang: LanguageType) => LANGUAGES[lang];

export default Language;
