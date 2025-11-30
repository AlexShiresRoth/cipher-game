type ValidGuessParams = {
	condition: boolean;
	newErrorMsg: string;
	errors: string[];
};

export function handleErrorOnGuess({ condition, newErrorMsg, errors }: ValidGuessParams) {
	if (condition) {
		const newErrors = [...errors, newErrorMsg];
		console.error(newErrorMsg);

		return newErrors;
	}
}
