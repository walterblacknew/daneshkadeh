
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpenText, Percent, Sigma, InfinityIcon, Lightbulb } from "lucide-react"; // Replaced Calculator with Sigma for variety
import Image from "next/image";

const usageExamples = [
  {
    icon: BookOpenText,
    title: "Homework Help",
    description: "Stuck on a tricky homework problem? Input it into MathFluent and get a detailed step-by-step solution to guide you through the process. Understand the 'how' and 'why' behind each step.",
    scenario: "e.g., Solving quadratic equations, simplifying algebraic expressions, or finding derivatives in calculus.",
    image: "https://picsum.photos/seed/homework/400/200",
    aiHint: "student studying"
  },
  {
    icon: Lightbulb,
    title: "Concept Clarification",
    description: "Confused about a specific mathematical concept like 'limits' or 'standard deviation'? Ask MathFluent to explain it or solve related problems to see it in action. Use the 'Explain this step' feature for deeper insights.",
    scenario: "e.g., Understanding the Pythagorean theorem, grasping probability basics, or demystifying logarithms.",
    image: "https://picsum.photos/seed/concept/400/200",
    aiHint: "idea lightbulb"
  },
  {
    icon: Percent,
    title: "Exam Preparation",
    description: "Practice for exams by solving a variety of problems in your study area. Use MathFluent to check your answers and learn from any mistakes. Identify weak areas and focus your study efforts effectively.",
    scenario: "e.g., Working through practice tests for algebra, calculus, or statistics exams.",
    image: "https://picsum.photos/seed/exam/400/200",
    aiHint: "test paper"
  },
  {
    icon: Sigma,
    title: "Exploring Advanced Topics",
    description: "Curious about more advanced mathematical topics? MathFluent can help you tackle problems in areas like linear algebra, differential equations, or advanced trigonometry, providing solutions and explanations.",
    scenario: "e.g., Finding eigenvalues, solving first-order differential equations, or working with complex numbers.",
    image: "https://picsum.photos/seed/advanced/400/200",
    aiHint: "complex formula"
  },
  {
    icon: InfinityIcon,
    title: "Quick Calculations & Verifications",
    description: "Need to quickly calculate a complex integral or verify the solution to a system of equations? Use MathFluent as a powerful calculator that also shows the working.",
    scenario: "e.g., Integrating a function, checking matrix multiplication, or verifying trigonometric identities.",
    image: "https://picsum.photos/seed/quickcalc/400/200",
    aiHint: "calculator numbers"
  }
];

export default function UsageExamplesPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Unlock MathFluent&apos;s Potential
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Discover the various ways MathFluent can assist you in your mathematical journey.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {usageExamples.map((example, index) => (
          <Card key={index} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 w-full">
              <Image 
                src={example.image} 
                alt={example.title} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={example.aiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <example.icon className="h-7 w-7 text-accent" />
                <CardTitle className="text-xl font-semibold">{example.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-muted-foreground mb-3">{example.description}</CardDescription>
              <p className="text-sm text-foreground italic">{example.scenario}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
