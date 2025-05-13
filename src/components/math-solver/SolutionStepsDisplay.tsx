'use client';

import type { SolutionStep } from './MathSolverPage'; // Assuming type definition in parent
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SolutionStepsDisplayProps = {
  originalProblem: string;
  steps: SolutionStep[];
  onExplainStep: (stepIndex: number) => Promise<void>;
};

export default function SolutionStepsDisplay({ originalProblem, steps, onExplainStep }: SolutionStepsDisplayProps) {
  if (!steps.length) {
    return null;
  }

  return (
    <Card className="w-full mt-8 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Solution</CardTitle>
        {originalProblem && (
          <CardDescription className="text-muted-foreground pt-2">
            <span className="font-semibold">Original Problem:</span>
            <pre className="mt-1 p-3 bg-secondary rounded-md text-sm whitespace-pre-wrap font-mono">{originalProblem}</pre>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-3">
          {steps.map((step, index) => (
            <AccordionItem key={step.id} value={step.id} className="border bg-background rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline text-base">
                <span className="font-medium text-primary mr-2">Step {index + 1}:</span>
                <span className="flex-1 text-foreground">{step.text}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="border-t pt-4 mt-2">
                  {step.isLoadingExplanation && (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading explanation...
                    </div>
                  )}
                  {step.explanationError && (
                     <Alert variant="destructive" className="mt-2">
                       <AlertTitle>Error</AlertTitle>
                       <AlertDescription>{step.explanationError}</AlertDescription>
                     </Alert>
                  )}
                  {step.explanation && !step.isLoadingExplanation && (
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                       <p className="whitespace-pre-wrap">{step.explanation}</p>
                    </div>
                  )}
                  {!step.explanation && !step.isLoadingExplanation && !step.explanationError && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExplainStep(index)}
                      className="mt-2 border-accent text-accent hover:bg-accent/10 hover:text-accent"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Explain this step
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
