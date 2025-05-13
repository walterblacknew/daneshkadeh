'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

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

const VIRTUAL_KEYBOARD_BUTTONS = ['+', '-', '*', '/', '^', '(', ')', 'sqrt(', 'sin(', 'cos(', 'tan(', 'log('];
const MATH_TOPICS = ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Linear Algebra', 'Differential Equations'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'High School', 'College'];


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
    setProblemInput((prev) => prev + char);
    form.setValue('problem', form.getValues('problem') + char);
  };
  
  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Enter Your Math Problem</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'latex')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="latex">LaTeX Input</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="problemText" className="text-base">Problem Description (Text)</FormLabel>
                      <FormControl>
                        <Textarea
                          id="problemText"
                          placeholder="e.g., Solve for x: 2x + 5 = 11"
                          className="min-h-[120px] text-base rounded-md focus:ring-accent focus:border-accent"
                          {...field}
                          value={problemInput}
                          onChange={(e) => {
                             field.onChange(e);
                             setProblemInput(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="latex">
                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="problemLatex" className="text-base">Problem Description (LaTeX)</FormLabel>
                      <FormControl>
                        <Textarea
                          id="problemLatex"
                          placeholder="e.g., \frac{d}{dx}(x^2 + 2x)"
                          className="min-h-[120px] text-base font-mono rounded-md focus:ring-accent focus:border-accent"
                          {...field}
                           value={problemInput}
                           onChange={(e) => {
                             field.onChange(e);
                             setProblemInput(e.target.value);
                           }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-2">
              <Label className="text-sm font-medium mb-2 block">Virtual Keyboard (Basic)</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {VIRTUAL_KEYBOARD_BUTTONS.map((char) => (
                  <Button
                    key={char}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => handleVirtualKeyboardClick(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Math Topic (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md focus:ring-accent focus:border-accent">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATH_TOPICS.map(topic => (
                           <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Skill Level (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md focus:ring-accent focus:border-accent">
                          <SelectValue placeholder="Select a skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {SKILL_LEVELS.map(level => (
                           <SelectItem key={level} value={level}>{level}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-md" disabled={isLoading}>
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? 'Solving...' : 'Solve Problem'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
