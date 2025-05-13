import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare } from 'lucide-react';

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  bio: string;
  experience: string;
  rating: number;
  email?: string; // Added for mailto link
}

interface TeacherCardProps {
  teacher: Teacher;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="items-center text-center p-6 bg-muted/30">
        <div className="relative w-28 h-28 mb-3">
          <Image
            src={teacher.avatar}
            alt={teacher.name}
            layout="fill"
            objectFit="cover"
            className="rounded-full ring-4 ring-primary ring-offset-background ring-offset-2"
            data-ai-hint="teacher portrait"
          />
        </div>
        <CardTitle className="text-xl font-semibold">{teacher.name}</CardTitle>
        <CardDescription className="text-sm text-accent">{teacher.experience} of experience</CardDescription>
        <div className="mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(teacher.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            ))}
            <span className="ml-1 text-xs text-muted-foreground">({teacher.rating.toFixed(1)})</span>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-1 text-foreground">Subjects:</h4>
          <div className="flex flex-wrap gap-2">
            {teacher.subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {teacher.bio}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="w-full sm:w-auto flex-1" asChild>
          <a href={`mailto:${teacher.email || 'teacher@example.com'}`}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </a>
        </Button>
        <Button className="w-full sm:w-auto flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
          <Link href={`/messages/${teacher.id}`}>
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
