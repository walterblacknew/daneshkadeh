'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import MathInputForm from './MathInputForm';
import SolutionStepsDisplay from './SolutionStepsDisplay';
import { handleGenerateSolutionAction, handleExplainStepAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export interface SolutionStep {
  id: string;
  text: string;
  explanation?: string;
  isLoadingExplanation?: boolean;
  explanationError?: string;
}

const formSchema = z.object({
  problem: z.string().min(1, 'Problem description cannot be empty.'),
  topic: z.string().optional(),
  skillLevel: z.string().optional(),
});

export default function MathSolverPage() {
  const [problemInput, setProblemInput] = useState('');
  const [currentProblem, setCurrentProblem] = useState('');
  
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [fullSolutionText, setFullSolutionText] = useState<string>('');

  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseSolutionSteps = (solutionText: string): SolutionStep[] => {
    if (!solutionText) return [];
    return solutionText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        // Try to remove common prefixes like "1. ", "Step 1: "
        const text = line.replace(/^\s*(\d+\.|Step\s*\d+:)\s*/, '');
        return {
          id: `step-${index}-${Date.now()}`, // Unique ID for accordion
          text: text,
        };
      });
  };

  const handleSubmitProblem = async (data: z.infer<typeof formSchema>) => {
    setIsLoadingSolution(true);
    setSolutionError(null);
    setSolutionSteps([]);
    setCurrentProblem(data.problem); // Store the problem as it was submitted
    setFullSolutionText('');

    const result = await handleGenerateSolutionAction({
      problem: data.problem,
      topic: data.topic,
      skillLevel: data.skillLevel,
    });

    setIsLoadingSolution(false);

    if (result.error) {
      setSolutionError(result.error);
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.solution) {
      setFullSolutionText(result.solution);
      const steps = parseSolutionSteps(result.solution);
      setSolutionSteps(steps);
      if (steps.length === 0 && result.solution.trim() !== "") {
        // If parsing failed but there is a solution, show it as one step
         setSolutionSteps([{ id: `step-0-${Date.now()}`, text: result.solution.trim() }]);
      }
      toast({
        title: 'Solution Generated!',
        description: 'Your step-by-step solution is ready.',
      });
    } else {
       setSolutionError('An unexpected error occurred or no solution was returned.');
       toast({
        title: 'Error',
        description: 'An unexpected error occurred or no solution was returned.',
        variant: 'destructive',
      });
    }
  };

  const handleExplainStep = async (stepIndex: number) => {
    if (!currentProblem || !fullSolutionText || stepIndex < 0 || stepIndex >= solutionSteps.length) {
      toast({ title: 'Error', description: 'Cannot explain step due to missing information.', variant: 'destructive'});
      return;
    }

    setSolutionSteps(prev =>
      prev.map((step, idx) =>
        idx === stepIndex ? { ...step, isLoadingExplanation: true, explanationError: undefined, explanation: undefined } : step
      )
    );

    const result = await handleExplainStepAction({
      problem: currentProblem,
      solution: fullSolutionText,
      stepNumber: stepIndex + 1, // AI flow might be 1-indexed
    });

    setSolutionSteps(prev =>
      prev.map((step, idx) => {
        if (idx === stepIndex) {
          return {
            ...step,
            isLoadingExplanation: false,
            explanation: result.explanation,
            explanationError: result.error,
          };
        }
        return step;
      })
    );
    
    if (result.error) {
       toast({ title: 'Explanation Error', description: result.error, variant: 'destructive'});
    }
  };
  
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MathInputForm onSubmit={handleSubmitProblem} isLoading={isLoadingSolution} problemInput={problemInput} setProblemInput={setProblemInput} />
      
      {isLoadingSolution && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-semibold text-foreground">Generating your solution...</p>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {solutionError && !isLoadingSolution && (
         <div className="p-6 bg-destructive/10 border border-destructive text-destructive rounded-lg shadow-md">
           <h3 className="font-semibold text-lg mb-2">Oops! Something went wrong.</h3>
           <p>{solutionError}</p>
         </div>
      )}

      {!isLoadingSolution && solutionSteps.length > 0 && (
        <SolutionStepsDisplay
          originalProblem={currentProblem}
          steps={solutionSteps}
          onExplainStep={handleExplainStep}
        />
      )}
      
      {!isLoadingSolution && solutionSteps.length === 0 && currentProblem && !solutionError && (
        <div className="mt-8 p-8 bg-card rounded-lg shadow-md text-center">
          <Image src="https://picsum.photos/300/200?grayscale" alt="No solution steps" width={300} height={200} data-ai-hint="empty telescope" className="mx-auto mb-4 rounded-md" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Steps to Display</h3>
          <p className="text-muted-foreground">
            The AI might have provided a direct answer or couldn't break it into steps.
            {fullSolutionText && <pre className="mt-2 p-3 bg-secondary rounded-md text-sm whitespace-pre-wrap text-left font-mono">{fullSolutionText}</pre>}
          </p>
        </div>
      )}
    </div>
  );
}
