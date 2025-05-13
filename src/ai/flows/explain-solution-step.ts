
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
  problem: z.string().describe('The math problem to be solved. Can be plain text or LaTeX.'),
  solution: z.string().describe('The complete solution to the math problem, with each step clearly delineated. Mathematical expressions in the solution are expected to be in LaTeX format.'),
  stepNumber: z.number().describe('The specific step number in the solution (1-indexed) that needs explanation.'),
});
export type ExplainSolutionStepInput = z.infer<typeof ExplainSolutionStepInputSchema>;

const ExplainSolutionStepOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the mathematical principle or operation used in the specified step. All mathematical formulas, variables, and expressions within this explanation should be formatted using LaTeX. For example, use `\frac{a}{b}` for fractions, `x^2` for exponents, etc.'),
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

You will be provided with a math problem, its complete solution (where mathematical expressions are in LaTeX), and a specific step number within that solution.
Your task is to generate a detailed explanation of the mathematical principle, theorem, or operation used in that particular step. Tailor your explanation to be easily understood by a student at the relevant skill level for the problem.

Problem: {{{problem}}}
Complete Solution (with LaTeX): {{{solution}}}
Step Number to Explain: {{{stepNumber}}}

Instructions for explanation:
1. Focus specifically on the provided step number.
2. Explain the underlying mathematical concept(s) applied in this step.
3. If it involves a formula, state the formula and explain its components.
4. If it's an algebraic manipulation, explain the rule or property being used.
5. IMPORTANT: Ensure all mathematical formulas, variables, symbols, and expressions within your explanation are formatted using LaTeX. For example:
    - Fractions: \`\\frac{a}{b}\`
    - Exponents: \`x^2\`
    - Square roots: \`\\sqrt{x}\`
    - Derivatives: \`\\frac{dy}{dx}\`
    - Greek letters: \`\\alpha\`, \`\\beta\`, \`\\pi\`, \`\\theta\`
    - Use \`\\times\` for multiplication symbol if needed.
    - Ensure proper use of parentheses \`()\` or brackets \`[]\`.
6. Be concise yet thorough.

Explanation of Step {{{stepNumber}}}:`,
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

