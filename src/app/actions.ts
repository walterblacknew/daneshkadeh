'use server';

import { generateStepByStepSolution, GenerateStepByStepSolutionInput } from '@/ai/flows/generate-step-by-step-solution';
import { explainSolutionStep, ExplainSolutionStepInput } from '@/ai/flows/explain-solution-step';

export async function handleGenerateSolutionAction(input: GenerateStepByStepSolutionInput): Promise<{ solution?: string; error?: string }> {
  try {
    const result = await generateStepByStepSolution(input);
    return { solution: result.solution };
  } catch (error) {
    console.error('Error generating solution:', error);
    return { error: 'Failed to generate solution. Please try again.' };
  }
}

export async function handleExplainStepAction(input: ExplainSolutionStepInput): Promise<{ explanation?: string; error?: string }> {
  try {
    const result = await explainSolutionStep(input);
    return { explanation: result.explanation };
  } catch (error) {
    console.error('Error explaining step:', error);
    return { error: 'Failed to explain step. Please try again.' };
  }
}
