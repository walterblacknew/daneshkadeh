
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, CaseSensitive, Sigma } from 'lucide-react';

const formSchema = z.object({
  problem: z.string().min(1, 'Problem description cannot be empty.'),
  topic: z.string().optional(),
  skillLevel: z.string().optional(),
});

type MathInputFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  isLoading: boolean;
  problemInput: string;
  setProblemInput: Dispatch<SetStateAction<string>>;
};

const VIRTUAL_KEYBOARD_BUTTONS = [
  '+', '-', '*', '/', '^', '(', ')', 
  '\\sqrt{', '\\frac{}{}', '\\sin(', '\\cos(', '\\tan(', 
  '\\log(', '\\ln(', '\\pi', '\\theta', '\\alpha', '\\beta',
  'x', 'y', 'z', '=', '<', '>', '\\le', '\\ge'
];
const MATH_TOPICS = ['General Math', 'Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Linear Algebra', 'Differential Equations', 'Probability', 'Number Theory'];
const SKILL_LEVELS = ['Elementary', 'Middle School', 'High School', 'College Freshman', 'College Advanced', 'Beginner', 'Intermediate', 'Advanced'];


export default function MathInputForm({ onSubmit, isLoading, problemInput, setProblemInput }: MathInputFormProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'latex'>('text');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problem: problemInput,
      topic: '',
      skillLevel: '',
    },
  });

  const handleVirtualKeyboardClick = (char: string) => {
    const currentProblem = form.getValues('problem');
    const updatedProblem = currentProblem + char;
    setProblemInput(updatedProblem);
    form.setValue('problem', updatedProblem, { shouldValidate: true });
  };
  
  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  // Update form if problemInput changes externally (e.g. from virtual keyboard)
  if (form.getValues('problem') !== problemInput) {
    form.setValue('problem', problemInput, { shouldValidate: true });
  }


  return (
    <Card className="w-full shadow-xl rounded-xl border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center">
          <Sigma className="h-7 w-7 mr-3 text-primary" />
          Input Your Math Challenge
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose your input method and provide details for a tailored solution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={(value) => {
                const newTab = value as 'text' | 'latex';
                setActiveTab(newTab);
                // Potentially clear or keep the input when switching tabs, current behavior keeps it
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
                <TabsTrigger value="text" className="text-base h-full flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md">
                  <CaseSensitive className="h-5 w-5" /> Text Input
                </TabsTrigger>
                <TabsTrigger value="latex" className="text-base h-full flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md">
                  <span className="font-bold text-lg">L<sup>A</sup>T<sub>E</sub>X</span> Input
                </TabsTrigger>
              </TabsList>
              
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="problemText" className="text-lg font-semibold text-foreground mb-2 block">
                      {activeTab === 'text' ? "Describe your problem" : "Enter LaTeX code"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="problemText"
                        placeholder={
                          activeTab === 'text' 
                          ? "e.g., Solve for x: 2x + 5 = 11\nOr, find the derivative of f(x) = x^2 + 3x - 1"
                          : "e.g., \\frac{d}{dx}(x^2 + 2x - 1) \\newline \\int_{0}^{1} x^3 dx \\newline \\lim_{x \\to \\infty} \\frac{1}{x}"
                        }
                        className={`min-h-[150px] text-base rounded-md focus:ring-2 focus:ring-accent focus:border-accent shadow-sm ${activeTab === 'latex' ? 'font-mono text-sm' : ''}`}
                        {...field}
                        value={problemInput} // Controlled by parent state for virtual keyboard
                        onChange={(e) => {
                           field.onChange(e); // RHF internal update
                           setProblemInput(e.target.value); // Update parent state
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground mt-2">
                      {activeTab === 'text' 
                        ? "You can use plain English. For math symbols, try common notations like ^ for power, * for multiply."
                        : "Enter valid LaTeX. The AI will interpret it to solve the problem."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Tabs>

            <div className="pt-4 border-t">
              <Label className="text-base font-semibold mb-3 block text-foreground">Virtual Keyboard</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {VIRTUAL_KEYBOARD_BUTTONS.map((char) => (
                  <Button
                    key={char}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-sm h-10 hover:bg-muted/80 active:bg-muted shadow-sm"
                    onClick={() => handleVirtualKeyboardClick(char)}
                    aria-label={`Insert ${char}`}
                  >
                    {char.startsWith('\\') ? char.substring(1, char.length-1) || char: char} 
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8 pt-4 border-t">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground">Math Topic (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md h-11 text-base focus:ring-2 focus:ring-accent focus:border-accent shadow-sm">
                          <SelectValue placeholder="Select a topic (e.g., Algebra)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATH_TOPICS.map(topic => (
                           <SelectItem key={topic} value={topic} className="text-base">{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-muted-foreground">Helps the AI provide a more focused solution.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground">Skill Level (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md h-11 text-base focus:ring-2 focus:ring-accent focus:border-accent shadow-sm">
                          <SelectValue placeholder="Select your skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {SKILL_LEVELS.map(level => (
                           <SelectItem key={level} value={level} className="text-base">{level}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-muted-foreground">Tailors the explanation complexity.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold py-6 rounded-lg shadow-md transition-transform hover:scale-105 active:scale-95" 
              disabled={isLoading || !problemInput.trim()}
            >
              <Wand2 className="mr-2 h-6 w-6" />
              {isLoading ? 'Solving, Please Wait...' : 'Get Step-by-Step Solution'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
