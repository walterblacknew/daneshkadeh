
'use client';

import type { SolutionStep } from './MathSolverPage'; 
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
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
    <Card className="w-full mt-8 shadow-xl rounded-xl border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
          <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
          Step-by-Step Solution
        </CardTitle>
        {originalProblem && (
          <CardDescription className="text-muted-foreground pt-3 text-base">
            <span className="font-semibold text-foreground">For the problem:</span>
            <pre className="mt-2 p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap font-mono border border-border text-foreground shadow-sm">
              {originalProblem}
            </pre>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {steps.length === 1 && steps[0].text.length > 200 ? ( // Heuristic for single, long answer
            <Alert variant="default" className="mb-4 border-primary/30 bg-primary/5">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">Direct Answer Provided</AlertTitle>
                <AlertDescription className="text-foreground">
                The AI provided a direct solution. You can request an explanation for the overall approach if needed (feature for overall explanation coming soon).
                </AlertDescription>
            </Alert>
        ) : (
             <p className="text-muted-foreground mb-4 text-sm">
                Each step of the solution is outlined below. Click on a step to expand it and request a detailed explanation. 
                Mathematical expressions are shown in LaTeX format.
            </p>
        )}

        <Accordion type="multiple" className="w-full space-y-4">
          {steps.map((step, index) => (
            <AccordionItem 
              key={step.id} 
              value={step.id} 
              className="border border-border bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group">
                <div className="flex items-start text-base md:text-lg w-full">
                  <span className="font-semibold text-primary mr-3 mt-0.5">Step {index + 1}:</span>
                  {/* Display step text, which might contain LaTeX */}
                  <pre className="flex-1 text-foreground whitespace-pre-wrap font-sans group-hover:text-primary transition-colors text-left">
                    {step.text}
                  </pre>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  {step.isLoadingExplanation && (
                    <div className="flex items-center text-muted-foreground p-3 bg-muted/50 rounded-md">
                      <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                      Loading detailed explanation...
                    </div>
                  )}
                  {step.explanationError && (
                     <Alert variant="destructive" className="mt-2">
                       <AlertTriangle className="h-5 w-5" />
                       <AlertTitle>Explanation Error</AlertTitle>
                       <AlertDescription>{step.explanationError}</AlertDescription>
                     </Alert>
                  )}
                  {step.explanation && !step.isLoadingExplanation && (
                    <div>
                      <h4 className="text-md font-semibold text-foreground mb-2">Explanation:</h4>
                      {/* Display explanation, which might contain LaTeX */}
                      <pre className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-sans border border-border text-foreground shadow-sm">
                        {step.explanation}
                      </pre>
                    </div>
                  )}
                  {!step.explanation && !step.isLoadingExplanation && !step.explanationError && (
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => onExplainStep(index)}
                      className="mt-2 border-accent text-accent hover:bg-accent/10 hover:text-accent focus-visible:ring-accent text-base py-3 px-5 shadow-sm"
                      disabled={step.isLoadingExplanation}
                    >
                      <Lightbulb className="mr-2 h-5 w-5" />
                      Explain This Step
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
