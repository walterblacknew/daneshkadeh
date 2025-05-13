'use server';

/**
 * @fileOverview Generates a step-by-step solution for a given math problem using AI.
 *
 * - generateStepByStepSolution - A function that handles the generation of step-by-step math solutions.
 * - GenerateStepByStepSolutionInput - The input type for the generateStepByStepSolution function.
 * - GenerateStepByStepSolutionOutput - The return type for the generateStepByStepSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStepByStepSolutionInputSchema = z.object({
  problem: z.string().describe('The math problem to solve.'),
  topic: z.string().optional().describe('The math topic of the problem.'),
  skillLevel: z.string().optional().describe('The skill level of the problem (e.g., beginner, intermediate, advanced).'),
});
export type GenerateStepByStepSolutionInput = z.infer<typeof GenerateStepByStepSolutionInputSchema>;

const GenerateStepByStepSolutionOutputSchema = z.object({
  solution: z.string().describe('The step-by-step solution to the math problem.'),
});
export type GenerateStepByStepSolutionOutput = z.infer<typeof GenerateStepByStepSolutionOutputSchema>;

export async function generateStepByStepSolution(input: GenerateStepByStepSolutionInput): Promise<GenerateStepByStepSolutionOutput> {
  return generateStepByStepSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStepByStepSolutionPrompt',
  input: {schema: GenerateStepByStepSolutionInputSchema},
  output: {schema: GenerateStepByStepSolutionOutputSchema},
  prompt: `You are an expert math tutor. Your goal is to provide step-by-step solutions to math problems.

  Problem: {{{problem}}}

  Topic: {{topic}}

  Skill Level: {{skillLevel}}

  Solution:`, // The AI will generate a step-by-step solution here.
});

const generateStepByStepSolutionFlow = ai.defineFlow(
  {
    name: 'generateStepByStepSolutionFlow',
    inputSchema: GenerateStepByStepSolutionInputSchema,
    outputSchema: GenerateStepByStepSolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
