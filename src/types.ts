import z from 'zod';

export const Cipher = z.object({
	word: z.string().min(5).max(8),
	cipherWord: z.string().min(5).max(8),
	maxAttempts: z.number().max(6),
	date: z.string(),
	dayOfWeek: z.string()
});

export type CipherPuzzle = z.infer<typeof Cipher>;
