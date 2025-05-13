
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, MessageSquare, Users, Settings, BarChart3, Brain, LogIn, UserPlus } from "lucide-react";
import Image from "next/image";

const gettingStartedSteps = [
  {
    icon: UserPlus,
    title: "1. Create Your Account",
    description: "Sign up for a free MathFluent account to save your progress and access all features. If you already have an account, simply sign in.",
    image: "https://picsum.photos/seed/signup/400/250",
    aiHint: "registration form"
  },
  {
    icon: Brain,
    title: "2. Input Your Math Problem",
    description: "Navigate to the main solver page. You can type your problem directly or use LaTeX for complex mathematical expressions. Select the math topic and your skill level for more tailored solutions.",
    image: "https://picsum.photos/seed/mathinput/400/250",
    aiHint: "equation editor"
  },
  {
    icon: BarChart3,
    title: "3. Get Step-by-Step Solutions",
    description: "Our AI will generate a detailed, step-by-step solution. Each step is clearly explained to help you understand the underlying concepts.",
    image: "https://picsum.photos/seed/solution/400/250",
    aiHint: "math solution"
  },
  {
    icon: CheckCircle,
    title: "4. Explore Explanations",
    description: "For any step you find challenging, click 'Explain this step' to get a more in-depth clarification of the mathematical principles involved.",
    image: "https://picsum.photos/seed/explanation/400/250",
    aiHint: "knowledge lightbulb"
  },
  {
    icon: MessageSquare,
    title: "5. Join the Community Chat",
    description: "Have more questions or want to discuss math problems with peers? Head over to our Chat Room to connect with other users and tutors.",
    image: "https://picsum.photos/seed/chatroom/400/250",
    aiHint: "community chat"
  },
  {
    icon: Users,
    title: "6. Discover Teachers",
    description: "Looking for personalized help? Browse our directory of qualified math teachers and connect with them for one-on-one sessions.",
    image: "https://picsum.photos/seed/teachers/400/250",
    aiHint: "teacher profile"
  },
  {
    icon: Settings,
    title: "7. Manage Your Profile",
    description: "Keep your account information up-to-date in your Profile section. Here you can manage your preferences and view your activity.",
    image: "https://picsum.photos/seed/profile/400/250",
    aiHint: "user settings"
  }
];

export default function RoadmapPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to MathFluent!
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Your AI-powered guide to mastering mathematics. Here&apos;s how to get started:
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
        {gettingStartedSteps.map((step, index) => (
          <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="md:flex">
              <div className="md:w-1/3 relative">
                 <Image 
                    src={step.image} 
                    alt={step.title} 
                    width={400} 
                    height={250} 
                    className="object-cover w-full h-48 md:h-full"
                    data-ai-hint={step.aiHint}
                  />
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-8 w-8 text-accent" />
                    <CardTitle className="text-2xl font-semibold">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <section className="text-center py-10">
        <h2 className="text-3xl font-semibold text-foreground mb-4">Ready to Solve?</h2>
        <p className="text-lg text-muted-foreground">
          Start with your first problem on the <a href="/" className="text-primary hover:underline font-medium">Math Solver page</a>.
        </p>
      </section>
    </div>
  );
}
