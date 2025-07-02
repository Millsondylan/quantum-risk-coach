import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Trophy,
  CheckCircle,
  User,
  TrendingUp,
  Target,
  Lightbulb,
  Video,
  FileText,
  HeadphonesIcon
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  progress: number;
  rating: number;
  students: number;
  category: string;
  image: string;
  instructor: string;
  isCompleted: boolean;
  isFree: boolean;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz' | 'practice';
  isCompleted: boolean;
  isLocked: boolean;
}

export default function EducationalResources() {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const courses: Course[] = [
    {
      id: '1',
      title: 'Trading Fundamentals',
      description: 'Learn the basics of trading, market analysis, and risk management',
      level: 'beginner',
      duration: '4 hours',
      lessons: 12,
      progress: 75,
      rating: 4.8,
      students: 1250,
      category: 'Fundamentals',
      image: '/course-fundamentals.jpg',
      instructor: 'John Smith',
      isCompleted: false,
      isFree: true
    },
    {
      id: '2',
      title: 'Technical Analysis Mastery',
      description: 'Advanced chart patterns, indicators, and trading strategies',
      level: 'intermediate',
      duration: '8 hours',
      lessons: 24,
      progress: 30,
      rating: 4.9,
      students: 890,
      category: 'Technical Analysis',
      image: '/course-technical.jpg',
      instructor: 'Sarah Johnson',
      isCompleted: false,
      isFree: false
    },
    {
      id: '3',
      title: 'Risk Management Strategies',
      description: 'Protect your capital with professional risk management techniques',
      level: 'intermediate',
      duration: '3 hours',
      lessons: 8,
      progress: 100,
      rating: 4.7,
      students: 2100,
      category: 'Risk Management',
      image: '/course-risk.jpg',
      instructor: 'Mike Davis',
      isCompleted: true,
      isFree: true
    },
    {
      id: '4',
      title: 'Psychology of Trading',
      description: 'Master your emotions and develop winning mindset',
      level: 'advanced',
      duration: '6 hours',
      lessons: 16,
      progress: 0,
      rating: 4.9,
      students: 650,
      category: 'Psychology',
      image: '/course-psychology.jpg',
      instructor: 'Dr. Emily Chen',
      isCompleted: false,
      isFree: false
    },
    {
      id: '5',
      title: 'Algorithmic Trading Basics',
      description: 'Introduction to automated trading systems and strategies',
      level: 'advanced',
      duration: '10 hours',
      lessons: 30,
      progress: 15,
      rating: 4.6,
      students: 420,
      category: 'Algorithmic Trading',
      image: '/course-algo.jpg',
      instructor: 'Alex Thompson',
      isCompleted: false,
      isFree: false
    }
  ];

  const articles = [
    {
      id: '1',
      title: 'Understanding Market Cycles',
      excerpt: 'Learn how to identify and trade different phases of market cycles',
      readTime: '5 min',
      category: 'Market Analysis',
      author: 'Trading Team',
      date: '2024-01-15',
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Top 10 Risk Management Rules',
      excerpt: 'Essential rules every trader should follow to protect their capital',
      readTime: '7 min',
      category: 'Risk Management',
      author: 'Risk Experts',
      date: '2024-01-12',
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Building Your Trading Plan',
      excerpt: 'Step-by-step guide to creating a comprehensive trading plan',
      readTime: '10 min',
      category: 'Strategy',
      author: 'Strategy Team',
      date: '2024-01-10',
      isBookmarked: false
    }
  ];

  const webinars = [
    {
      id: '1',
      title: 'Live Market Analysis',
      description: 'Weekly market outlook and trading opportunities',
      date: '2024-01-20',
      time: '14:00 EST',
      duration: '60 min',
      instructor: 'Chief Analyst',
      isLive: true,
      attendees: 245
    },
    {
      id: '2',
      title: 'Advanced Chart Patterns',
      description: 'Identify high-probability trading setups',
      date: '2024-01-18',
      time: '15:00 EST',
      duration: '45 min',
      instructor: 'Technical Expert',
      isLive: false,
      attendees: 180
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first trading course',
      icon: Trophy,
      isUnlocked: true,
      unlockedDate: '2024-01-10'
    },
    {
      id: '2',
      title: 'Knowledge Seeker',
      description: 'Read 10 educational articles',
      icon: BookOpen,
      isUnlocked: true,
      unlockedDate: '2024-01-12'
    },
    {
      id: '3',
      title: 'Risk Master',
      description: 'Complete Risk Management course',
      icon: Target,
      isUnlocked: true,
      unlockedDate: '2024-01-15'
    },
    {
      id: '4',
      title: 'Technical Analyst',
      description: 'Master technical analysis patterns',
      icon: TrendingUp,
      isUnlocked: false,
      unlockedDate: null
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'quiz': return CheckCircle;
      case 'practice': return Target;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="holo-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Educational Resources
          </CardTitle>
          <CardDescription>
            Enhance your trading skills with comprehensive courses and materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
              <TabsTrigger value="achievements">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                            {course.isFree && (
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                FREE
                              </Badge>
                            )}
                            {course.isCompleted && (
                              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-slate-400">{course.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Play className="w-4 h-4" />
                              {course.lessons} lessons
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {course.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {course.students} students
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-white">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>

                        <div className="ml-6 space-y-2">
                          <Button 
                            onClick={() => setSelectedCourse(course)}
                            className="holo-button"
                          >
                            {course.progress > 0 ? 'Continue' : 'Start Course'}
                          </Button>
                          {course.progress > 0 && course.progress < 100 && (
                            <p className="text-xs text-slate-400 text-center">
                              {Math.floor((course.lessons * course.progress) / 100)} of {course.lessons} completed
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              <div className="grid gap-4">
                {articles.map((article) => (
                  <Card key={article.id} className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                            <Badge variant="outline">{article.category}</Badge>
                          </div>
                          <p className="text-slate-400">{article.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>{article.readTime} read</span>
                            <span>by {article.author}</span>
                            <span>{new Date(article.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Read Article
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Star className={`w-4 h-4 ${article.isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webinars" className="space-y-6">
              <div className="grid gap-4">
                {webinars.map((webinar) => (
                  <Card key={webinar.id} className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{webinar.title}</h3>
                            {webinar.isLive && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-400">{webinar.description}</p>
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <span>{new Date(webinar.date).toLocaleDateString()} at {webinar.time}</span>
                            <span>{webinar.duration}</span>
                            <span>by {webinar.instructor}</span>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {webinar.attendees} attending
                            </div>
                          </div>
                        </div>
                        <Button className={webinar.isLive ? "bg-red-600 hover:bg-red-700" : "holo-button"}>
                          {webinar.isLive ? 'Join Live' : 'Watch Recording'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Courses Completed</span>
                        <span className="text-white">1 of 5</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Articles Read</span>
                        <span className="text-white">12</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Webinars Attended</span>
                        <span className="text-white">3</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {achievements.map((achievement) => {
                        const IconComponent = achievement.icon;
                        return (
                          <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                            achievement.isUnlocked ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-900/30'
                          }`}>
                            <div className={`p-2 rounded-lg ${
                              achievement.isUnlocked ? 'bg-cyan-500/20' : 'bg-slate-700/50'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                achievement.isUnlocked ? 'text-cyan-400' : 'text-slate-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                achievement.isUnlocked ? 'text-white' : 'text-slate-500'
                              }`}>
                                {achievement.title}
                              </h4>
                              <p className={`text-sm ${
                                achievement.isUnlocked ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {achievement.description}
                              </p>
                              {achievement.isUnlocked && achievement.unlockedDate && (
                                <p className="text-xs text-cyan-400 mt-1">
                                  Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      {selectedCourse && (
        <Card className="holo-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedCourse.title}</CardTitle>
                <CardDescription>by {selectedCourse.instructor}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Course Content</h3>
                  <div className="space-y-2">
                    {[...Array(selectedCourse.lessons)].map((_, index) => {
                      const isCompleted = index < Math.floor((selectedCourse.lessons * selectedCourse.progress) / 100);
                      const isLocked = index > Math.floor((selectedCourse.lessons * selectedCourse.progress) / 100);
                      const LessonIcon = getTypeIcon(index % 2 === 0 ? 'video' : 'article');
                      
                      return (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                          isCompleted ? 'bg-green-500/10 border border-green-500/30' :
                          isLocked ? 'bg-slate-900/30 opacity-50' : 'bg-slate-800/30 border border-slate-700/50'
                        }`}>
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-500/20' :
                            isLocked ? 'bg-slate-700/50' : 'bg-blue-500/20'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <LessonIcon className={`w-4 h-4 ${isLocked ? 'text-slate-500' : 'text-blue-400'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                              Lesson {index + 1}: Trading Fundamentals Part {index + 1}
                            </h4>
                            <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                              {Math.floor((index + 1) * 2) + 8} minutes
                            </p>
                          </div>
                          {!isLocked && (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-white">Course Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration</span>
                        <span className="text-white">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lessons</span>
                        <span className="text-white">{selectedCourse.lessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level</span>
                        <Badge className={getLevelColor(selectedCourse.level)}>
                          {selectedCourse.level}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white">{selectedCourse.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full holo-button" size="lg">
                  {selectedCourse.progress > 0 ? 'Continue Learning' : 'Start Course'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 