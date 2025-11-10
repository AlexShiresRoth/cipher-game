import z from 'zod';

export const Cipher = z.object({
	word: z.string().min(5).max(5),
	cipherWord: z.string(),
	maxAttempts: z.number().max(10),
	date: z.string(),
	dayOfWeek: z.string()
});

export type CipherPuzzle = z.infer<typeof Cipher>;
