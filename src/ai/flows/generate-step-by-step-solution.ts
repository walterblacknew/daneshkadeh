
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
  problem: z.string().describe('The math problem to solve. This can be in plain text or LaTeX format.'),
  topic: z.string().optional().describe('The math topic of the problem (e.g., Algebra, Calculus).'),
  skillLevel: z.string().optional().describe('The skill level of the problem (e.g., beginner, intermediate, advanced).'),
});
export type GenerateStepByStepSolutionInput = z.infer<typeof GenerateStepByStepSolutionInputSchema>;

const GenerateStepByStepSolutionOutputSchema = z.object({
  solution: z.string().describe('The step-by-step solution to the math problem. All mathematical formulas, variables, and expressions should be formatted using LaTeX. For example, use `\frac{a}{b}` for fractions, `x^2` for exponents, `\int f(x) dx` for integrals, Greek letters like `\alpha`, `\beta`, etc.'),
});
export type GenerateStepByStepSolutionOutput = z.infer<typeof GenerateStepByStepSolutionOutputSchema>;

export async function generateStepByStepSolution(input: GenerateStepByStepSolutionInput): Promise<GenerateStepByStepSolutionOutput> {
  return generateStepByStepSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStepByStepSolutionPrompt',
  input: {schema: GenerateStepByStepSolutionInputSchema},
  output: {schema: GenerateStepByStepSolutionOutputSchema},
  prompt: `You are an expert math tutor. Your goal is to provide clear, accurate, and step-by-step solutions to math problems.

Problem: {{{problem}}}
{{#if topic}}
Topic: {{{topic}}}
{{/if}}
{{#if skillLevel}}
Skill Level: {{{skillLevel}}}
{{/if}}

Instructions for solution:
1. Break down the solution into logical, easy-to-follow steps.
2. Clearly state what is being done in each step.
3. IMPORTANT: Ensure all mathematical formulas, variables, symbols (e.g., pi, theta), and expressions are formatted using LaTeX. For example:
    - Fractions: \`\\frac{a}{b}\`
    - Exponents: \`x^2\`
    - Square roots: \`\\sqrt{x}\`
    - Integrals: \`\\int f(x) dx\`
    - Summations: \`\\sum_{i=1}^{n} x_i\`
    - Greek letters: \`\\alpha\`, \`\\beta\`, \`\\pi\`, \`\\theta\`
    - Multiplication: Use \`\\times\` for multiplication symbol if needed, or juxtaposition for variables.
    - Parentheses for clarity: Ensure proper use of parentheses \`()\` or brackets \`[]\`.
4. The final answer should be clearly stated at the end of the solution.

Solution:`,
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

