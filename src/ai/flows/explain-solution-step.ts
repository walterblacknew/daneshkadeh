'use server';

/**
 * @fileOverview This file defines a Genkit flow for explaining a specific step in a math solution.
 *
 * - explainSolutionStep - A function that takes a math problem, a solution, and a specific step number, and returns an AI-generated explanation of that step.
 * - ExplainSolutionStepInput - The input type for the explainSolutionStep function.
 * - ExplainSolutionStepOutput - The return type for the explainSolutionStep function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSolutionStepInputSchema = z.object({
  problem: z.string().describe('The math problem to be solved.'),
  solution: z.string().describe('The complete solution to the math problem, with each step clearly delineated.'),
  stepNumber: z.number().describe('The specific step number in the solution that needs explanation.'),
});
export type ExplainSolutionStepInput = z.infer<typeof ExplainSolutionStepInputSchema>;

const ExplainSolutionStepOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the mathematical principle or operation used in the specified step.'),
});
export type ExplainSolutionStepOutput = z.infer<typeof ExplainSolutionStepOutputSchema>;

export async function explainSolutionStep(input: ExplainSolutionStepInput): Promise<ExplainSolutionStepOutput> {
  return explainSolutionStepFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSolutionStepPrompt',
  input: {schema: ExplainSolutionStepInputSchema},
  output: {schema: ExplainSolutionStepOutputSchema},
  prompt: `You are an expert math tutor, skilled at explaining complex mathematical concepts in a clear and accessible way.

You will be provided with a math problem, its solution, and a specific step number within that solution.
Your task is to generate a detailed explanation of the mathematical principle or operation used in that step, tailoring your explanation to be easily understood by a student.

Problem: {{{problem}}}
Solution: {{{solution}}}
Step Number: {{{stepNumber}}}

Explanation:`,
});

const explainSolutionStepFlow = ai.defineFlow(
  {
    name: 'explainSolutionStepFlow',
    inputSchema: ExplainSolutionStepInputSchema,
    outputSchema: ExplainSolutionStepOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
