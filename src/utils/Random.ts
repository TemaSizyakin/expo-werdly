export const seedRandom = (s: number) => {
	let seed = s % 2147483647;
	while (seed < 0) {
		seed += 2147483647;
	}
	return () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
};

export const getDateNumber = () => {
	const date = new Date();
	return date.getDate() + 100 * date.getMonth() + 10000 * date.getFullYear();
};
