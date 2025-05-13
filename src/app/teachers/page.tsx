import TeacherCard, { type Teacher } from '@/components/teachers/TeacherCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Book } from 'lucide-react';

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    avatar: 'https://picsum.photos/seed/evelyn/200/200',
    subjects: ['Calculus', 'Linear Algebra', 'Differential Equations'],
    bio: 'Passionate about making complex math accessible. PhD in Applied Mathematics with 10+ years of teaching experience at university level.',
    experience: '10+ years',
    rating: 4.9,
    email: 'evelyn.reed@example.com',
  },
  {
    id: '2',
    name: 'Mr. Samuel Green',
    avatar: 'https://picsum.photos/seed/samuel/200/200',
    subjects: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    bio: 'Engaging high school math teacher focused on building strong foundational skills. Believes in a practical, problem-solving approach.',
    experience: '8 years',
    rating: 4.7,
    email: 'samuel.green@example.com',
  },
  {
    id: '3',
    name: 'Ms. Olivia Chen',
    avatar: 'https://picsum.photos/seed/olivia/200/200',
    subjects: ['Pre-Calculus', 'Statistics', 'Discrete Mathematics'],
    bio: 'Friendly and patient tutor specializing in helping students overcome math anxiety. MSc in Statistics.',
    experience: '5 years',
    rating: 4.8,
    email: 'olivia.chen@example.com',
  },
   {
    id: '4',
    name: 'Prof. Arthur Dent',
    avatar: 'https://picsum.photos/seed/arthur/200/200',
    subjects: ['Number Theory', 'Abstract Algebra', 'Topology'],
    bio: 'Researcher and lecturer with a knack for explaining abstract concepts with clarity and enthusiasm. Enjoys tackling challenging problems.',
    experience: '15 years',
    rating: 4.6,
    email: 'arthur.dent@example.com',
  },
  {
    id: '5',
    name: 'Mrs. Bella Swan',
    avatar: 'https://picsum.photos/seed/bella/200/200',
    subjects: ['Basic Math', 'Pre-Algebra', 'Study Skills'],
    bio: 'Dedicated to helping younger students build confidence in math. Focuses on personalized learning and making math fun.',
    experience: '6 years',
    rating: 4.9,
    email: 'bella.swan@example.com',
  },
  {
    id: '6',
    name: 'Dr. Zaphod Beeblebrox',
    avatar: 'https://picsum.photos/seed/zaphod/200/200',
    subjects: ['Probability Theory', 'Mathematical Physics', 'Chaos Theory'],
    bio: 'An unconventional tutor who makes even the most improbable math topics seem perfectly normal. Two heads are better than one for problem-solving!',
    experience: '7 years',
    rating: 4.5,
    email: 'zaphod.beeblebrox@example.com',
  }
];

const MATH_SUBJECTS_FOR_FILTER = ['All Subjects', 'Calculus', 'Linear Algebra', 'Differential Equations', 'Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Pre-Calculus', 'Discrete Mathematics', 'Number Theory', 'Abstract Algebra', 'Topology', 'Basic Math', 'Pre-Algebra', 'Probability Theory', 'Mathematical Physics', 'Chaos Theory'];


export default function TeachersPage() {
  // Basic filtering logic can be added here with useState if needed
  // For now, just displaying all mock teachers

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find Your Math Tutor
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Connect with experienced and qualified math teachers.
        </p>
      </header>

      <div className="sticky top-16 bg-background/80 backdrop-blur-md z-10 py-4 mb-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by name or keyword..." className="pl-10" />
            </div>
            <div>
              <Select defaultValue="All Subjects">
                <SelectTrigger className="w-full">
                  <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {MATH_SUBJECTS_FOR_FILTER.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {mockTeachers.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {mockTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No teachers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
