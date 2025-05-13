
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import MathInputForm from './MathInputForm';
import SolutionStepsDisplay from './SolutionStepsDisplay';
import { handleGenerateSolutionAction, handleExplainStepAction } from '@/app/actions';
import { Loader2, AlertTriangle, FileQuestion } from 'lucide-react';
import Image from 'next/image';

export interface SolutionStep {
  id: string;
  text: string; // This text may contain LaTeX strings
  explanation?: string; // This text may also contain LaTeX strings
  isLoadingExplanation?: boolean;
  explanationError?: string;
}

// Form schema is defined in MathInputForm, but used here for type consistency in handleSubmitProblem
const formSchema = z.object({
  problem: z.string().min(1, 'Problem description cannot be empty.'),
  topic: z.string().optional(),
  skillLevel: z.string().optional(),
});

export default function MathSolverPage() {
  const [problemInput, setProblemInput] = useState(''); // State for the textarea, controlled by MathInputForm and virtual keyboard
  const [currentProblem, setCurrentProblem] = useState(''); // The problem string that was submitted for solution
  
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [fullSolutionText, setFullSolutionText] = useState<string>(''); // The raw solution text from AI

  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseSolutionSteps = (solutionText: string): SolutionStep[] => {
    if (!solutionText || typeof solutionText !== 'string') return [];
    // Improved parsing: handles "Step X:", "X.", or just newline-separated steps
    // And preserves LaTeX by not trying to text-manipulate it too much
    const lines = solutionText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let currentStepText = "";
    const stepsArray: SolutionStep[] = [];
    
    lines.forEach((line, index) => {
      // A line is considered a new step if it starts with "Step X:", "X.", or if the previous line was a complete step.
      // This is a heuristic; for truly robust parsing, AI should structure output more explicitly (e.g., JSON).
      const isNewStepMarker = /^(Step\s*\d+:|\d+\.\s*)/i.test(line);

      if (isNewStepMarker && currentStepText) {
        stepsArray.push({ id: `step-${stepsArray.length}-${Date.now()}`, text: currentStepText.trim() });
        currentStepText = line.replace(/^(Step\s*\d+:|\d+\.\s*)/i, '').trim();
      } else if (isNewStepMarker) {
         currentStepText = line.replace(/^(Step\s*\d+:|\d+\.\s*)/i, '').trim();
      }
      else {
        currentStepText += (currentStepText ? "\n" : "") + line;
      }

      // If it's the last line, push whatever is in currentStepText
      if (index === lines.length - 1 && currentStepText) {
        stepsArray.push({ id: `step-${stepsArray.length}-${Date.now()}`, text: currentStepText.trim() });
      }
    });
    
    // If parsing fails to create multiple steps but there's content, treat the whole solution as one step
    if (stepsArray.length === 0 && solutionText.trim().length > 0) {
      return [{ id: `step-0-${Date.now()}`, text: solutionText.trim() }];
    }

    return stepsArray.filter(step => step.text.length > 0);
  };

  const handleSubmitProblem = async (data: z.infer<typeof formSchema>) => {
    setIsLoadingSolution(true);
    setSolutionError(null);
    setSolutionSteps([]);
    setCurrentProblem(data.problem); 
    setFullSolutionText('');

    toast({
      title: 'Processing Your Request',
      description: 'The AI is working on your math problem...',
      duration: 3000,
    });

    const result = await handleGenerateSolutionAction({
      problem: data.problem,
      topic: data.topic,
      skillLevel: data.skillLevel,
    });

    setIsLoadingSolution(false);

    if (result.error) {
      setSolutionError(result.error);
      toast({
        title: 'Solution Generation Error',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.solution) {
      setFullSolutionText(result.solution);
      const steps = parseSolutionSteps(result.solution);
      setSolutionSteps(steps);
      toast({
        title: 'Solution Generated!',
        description: 'Your step-by-step solution is ready below.',
        variant: 'default',
      });
    } else {
       const defaultError = 'An unexpected error occurred, or the AI did not return a solution.';
       setSolutionError(defaultError);
       toast({
        title: 'Error',
        description: defaultError,
        variant: 'destructive',
      });
    }
  };

  const handleExplainStep = async (stepIndex: number) => {
    if (!currentProblem || !fullSolutionText || stepIndex < 0 || stepIndex >= solutionSteps.length) {
      toast({ title: 'Cannot Explain Step', description: 'Missing problem or solution information to generate an explanation.', variant: 'destructive'});
      return;
    }

    setSolutionSteps(prev =>
      prev.map((step, idx) =>
        idx === stepIndex ? { ...step, isLoadingExplanation: true, explanationError: undefined, explanation: undefined } : step
      )
    );

    toast({
      title: 'Fetching Explanation',
      description: `AI is explaining step ${stepIndex + 1}...`,
      duration: 2000,
    });

    const result = await handleExplainStepAction({
      problem: currentProblem,
      solution: fullSolutionText, // Pass the full solution text as context for the AI
      stepNumber: stepIndex + 1, // AI flow is likely 1-indexed for step number
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
    } else if (result.explanation) {
       toast({ title: 'Explanation Ready', description: `Explanation for step ${stepIndex + 1} is available.`, variant: 'default'});
    }
  };
  
  if (!isClient) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] bg-card p-8 rounded-xl shadow-lg border">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl font-semibold text-foreground">Loading Math Solver...</p>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <MathInputForm 
        onSubmit={handleSubmitProblem} 
        isLoading={isLoadingSolution} 
        problemInput={problemInput} 
        setProblemInput={setProblemInput} 
      />
      
      {isLoadingSolution && (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-xl shadow-lg border border-border">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-2xl font-semibold text-foreground">Generating Your Solution...</p>
          <p className="text-muted-foreground mt-2">The AI is crunching the numbers. This might take a few moments.</p>
        </div>
      )}

      {solutionError && !isLoadingSolution && (
         <div className="p-8 bg-destructive/10 border-2 border-destructive/50 text-destructive rounded-xl shadow-lg flex flex-col items-center text-center">
           <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
           <h3 className="font-bold text-2xl mb-2">Oops! Something Went Wrong</h3>
           <p className="text-lg">{solutionError}</p>
           <p className="mt-3 text-sm">Please try rephrasing your problem or check your input.</p>
         </div>
      )}

      {!isLoadingSolution && !solutionError && solutionSteps.length > 0 && (
        <SolutionStepsDisplay
          originalProblem={currentProblem}
          steps={solutionSteps}
          onExplainStep={handleExplainStep}
        />
      )}
      
      {!isLoadingSolution && !solutionError && solutionSteps.length === 0 && currentProblem && (
        <div className="mt-10 p-10 bg-card rounded-xl shadow-lg text-center border border-border">
          <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-foreground mb-3">No Steps to Display</h3>
          <p className="text-muted-foreground text-lg mb-4">
            The AI processed your request, but couldn't break it into distinct steps or provided a direct answer.
          </p>
          {fullSolutionText && (
            <div>
              <p className="text-muted-foreground mb-2">Here's the raw output from the AI:</p>
              <pre className="mt-2 p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap text-left font-mono border border-border text-foreground">
                {fullSolutionText}
              </pre>
            </div>
          )}
        </div>
      )}

      {!isLoadingSolution && !currentProblem && !solutionError && (
         <div className="mt-10 p-10 bg-card rounded-xl shadow-lg text-center border border-border">
            <Image 
              src="https://picsum.photos/seed/math-start/400/250" 
              alt="Person thinking about math problems" 
              width={400} 
              height={250} 
              className="mx-auto mb-8 rounded-lg shadow-md"
              data-ai-hint="education mathematics"
            />
            <h3 className="text-2xl font-semibold text-foreground mb-3">Ready to Solve?</h3>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Enter your math problem in the form above. You can use plain text or LaTeX.
              Specify the topic and skill level for more accurate results. Let's tackle those equations!
            </p>
        </div>
      )}
    </div>
  );
}
