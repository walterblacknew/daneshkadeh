
import MathSolverPage from "@/components/math-solver/MathSolverPage";
import { BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <BrainCircuit className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          MathFluent AI Solver
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Input your math problems, get step-by-step solutions, and understand complex concepts with detailed explanations. Supports text and LaTeX input.
        </p>
      </header>
      <MathSolverPage />
    </div>
  );
}
