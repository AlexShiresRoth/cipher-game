import z from 'zod';

export const Cipher = z.object({
	word: z.string().min(5).max(8),
	cipherWord: z.string().min(5).max(8),
	minMoves: z.number(),
	date: z.string(),
	id: z.string().optional()
});

export type CipherPuzzle = z.infer<typeof Cipher>;
