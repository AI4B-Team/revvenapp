import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, BookOpen, PlayCircle, FileText, HelpCircle, Award, Pencil, Check, X, Copy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type LessonType = 'text' | 'video' | 'quiz' | 'flashcards' | 'assessment';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: number; // minutes
  content?: string;
  videoUrl?: string;
  quizId?: string;
  flashcardDeckId?: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  modules: CourseModule[];
  certificateEnabled: boolean;
  certificateTitle?: string;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CourseModuleEditorProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
  onClose?: () => void;
}

const LESSON_TYPES: { value: LessonType; label: string; icon: typeof BookOpen }[] = [
  { value: 'text', label: 'Text Lesson', icon: FileText },
  { value: 'video', label: 'Video Lesson', icon: PlayCircle },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { value: 'assessment', label: 'Assessment', icon: Award },
];

const CourseModuleEditor = ({ course, onCourseUpdate, onClose }: CourseModuleEditorProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    course.modules.length > 0 ? course.modules[0].id : null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const selectedModule = course.modules.find(m => m.id === selectedModuleId);
  const selectedLesson = selectedModule?.lessons.find(l => l.id === selectedLessonId);

  // Calculate progress
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
    0
  );
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleAddModule = () => {
    const newModule: CourseModule = {
      id: crypto.randomUUID(),
      title: `Module ${course.modules.length + 1}`,
      lessons: [],
      isExpanded: true
    };
    onCourseUpdate({
      ...course,
      modules: [...course.modules, newModule],
      updatedAt: new Date()
    });
    setSelectedModuleId(newModule.id);
    toast.success('New module added');
  };

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = course.modules.filter(m => m.id !== moduleId);
    onCourseUpdate({
      ...course,
      modules: updatedModules,
      updatedAt: new Date()
    });
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(updatedModules.length > 0 ? updatedModules[0].id : null);
      setSelectedLessonId(null);
    }
    toast.success('Module deleted');
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<CourseModule>) => {
    const updatedModules = course.modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    );
    onCourseUpdate({
      ...course,
      modules: updatedModules,
      updatedAt: new Date()
    });
  };

  const handleAddLesson = (moduleId: string, type: LessonType = 'text') => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: `New ${LESSON_TYPES.find(t => t.value === type)?.label || 'Lesson'}`,
      type,
      duration: type === 'video' ? 10 : type === 'text' ? 5 : 15
    };

    handleModuleUpdate(moduleId, {
      lessons: [...module.lessons, newLesson]
    });
    setSelectedLessonId(newLesson.id);
    toast.success('Lesson added');
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    handleModuleUpdate(moduleId, {
      lessons: module.lessons.filter(l => l.id !== lessonId)
    });
    if (selectedLessonId === lessonId) {
      setSelectedLessonId(null);
    }
    toast.success('Lesson deleted');
  };

  const handleLessonUpdate = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedLessons = module.lessons.map(l =>
      l.id === lessonId ? { ...l, ...updates } : l
    );
    handleModuleUpdate(moduleId, { lessons: updatedLessons });
  };

  const handleDuplicateLesson = (moduleId: string, lessonId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    const lessonToDuplicate = module.lessons.find(l => l.id === lessonId);
    if (!lessonToDuplicate) return;

    const newLesson: Lesson = {
      ...lessonToDuplicate,
      id: crypto.randomUUID(),
      title: `${lessonToDuplicate.title} (Copy)`
    };

    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    const updatedLessons = [...module.lessons];
    updatedLessons.splice(lessonIndex + 1, 0, newLesson);

    handleModuleUpdate(moduleId, { lessons: updatedLessons });
    setSelectedLessonId(newLesson.id);
    toast.success('Lesson duplicated');
  };

  const toggleModuleExpand = (moduleId: string) => {
    handleModuleUpdate(moduleId, {
      isExpanded: !course.modules.find(m => m.id === moduleId)?.isExpanded
    });
  };

  const startEditingModule = (moduleId: string, title: string) => {
    setEditingModuleId(moduleId);
    setEditingModuleTitle(title);
  };

  const saveModuleTitle = () => {
    if (editingModuleId && editingModuleTitle.trim()) {
      handleModuleUpdate(editingModuleId, { title: editingModuleTitle.trim() });
    }
    setEditingModuleId(null);
    setEditingModuleTitle('');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={course.title}
            onChange={(e) => onCourseUpdate({ ...course, title: e.target.value, updatedAt: new Date() })}
            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 max-w-md"
            placeholder="Course Title"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <Progress value={progressPercentage} className="flex-1 h-2" />
          <span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-3">Course Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Passing Score (%)</label>
              <Input
                type="number"
                value={course.passingScore}
                onChange={(e) => onCourseUpdate({ ...course, passingScore: parseInt(e.target.value) || 70 })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Certificate</label>
              <Select
                value={course.certificateEnabled ? 'enabled' : 'disabled'}
                onValueChange={(value) => onCourseUpdate({ ...course, certificateEnabled: value === 'enabled' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {course.certificateEnabled && (
              <div className="col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Certificate Title</label>
                <Input
                  value={course.certificateTitle || ''}
                  onChange={(e) => onCourseUpdate({ ...course, certificateTitle: e.target.value })}
                  placeholder="Certificate of Completion"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modules & Lessons Tree */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">{course.modules.length} Modules</span>
            <Button variant="ghost" size="sm" onClick={handleAddModule}>
              <Plus className="w-4 h-4 mr-1" />
              Add Module
            </Button>
          </div>

          <div className="space-y-2">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Module Header */}
                <div
                  className={`flex items-center gap-2 p-3 cursor-pointer transition-colors ${
                    selectedModuleId === module.id ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedModuleId(module.id);
                    toggleModuleExpand(module.id);
                  }}
                >
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  {module.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  
                  {editingModuleId === module.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <Input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveModuleTitle();
                          if (e.key === 'Escape') setEditingModuleId(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); saveModuleTitle(); }}>
                        <Check className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">{module.title}</span>
                      <span className="text-xs text-gray-400">{module.lessons.length}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditingModule(module.id, module.title); }}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </>
                  )}
                </div>

                {/* Lessons */}
                {module.isExpanded && (
                  <div className="bg-white p-2 space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const LessonIcon = LESSON_TYPES.find(t => t.value === lesson.type)?.icon || FileText;
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => { setSelectedModuleId(module.id); setSelectedLessonId(lesson.id); }}
                          className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            selectedLessonId === lesson.id
                              ? 'bg-emerald-100 border border-emerald-300'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <LessonIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="flex-1 text-sm text-gray-700 truncate">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-gray-400">{lesson.duration}m</span>
                          )}
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicateLesson(module.id, lesson.id); }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteLesson(module.id, lesson.id); }}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Lesson */}
                    <Select onValueChange={(value) => handleAddLesson(module.id, value as LessonType)}>
                      <SelectTrigger className="h-8 text-xs border-dashed">
                        <Plus className="w-3 h-3 mr-1" />
                        <SelectValue placeholder="Add Lesson" />
                      </SelectTrigger>
                      <SelectContent>
                        {LESSON_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}

            {course.modules.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-2">No modules yet</p>
                <Button variant="outline" size="sm" onClick={handleAddModule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Module
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedLesson && selectedModule ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedLesson.type}
                  onValueChange={(value) => handleLessonUpdate(selectedModule.id, selectedLesson.id, { type: value as LessonType })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LESSON_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <Input
                    type="number"
                    value={selectedLesson.duration || ''}
                    onChange={(e) => handleLessonUpdate(selectedModule.id, selectedLesson.id, { duration: parseInt(e.target.value) || undefined })}
                    className="w-20 h-8"
                    min={1}
                    placeholder="mins"
                  />
                  <span className="text-sm text-gray-400">mins</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Lesson Title</label>
                <Input
                  value={selectedLesson.title}
                  onChange={(e) => handleLessonUpdate(selectedModule.id, selectedLesson.id, { title: e.target.value })}
                  placeholder="Enter lesson title..."
                  className="text-lg"
                />
              </div>

              {selectedLesson.type === 'text' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Lesson Content</label>
                  <Textarea
                    value={selectedLesson.content || ''}
                    onChange={(e) => handleLessonUpdate(selectedModule.id, selectedLesson.id, { content: e.target.value })}
                    placeholder="Write your lesson content here..."
                    className="min-h-[300px]"
                  />
                </div>
              )}

              {selectedLesson.type === 'video' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Video URL</label>
                  <Input
                    value={selectedLesson.videoUrl || ''}
                    onChange={(e) => handleLessonUpdate(selectedModule.id, selectedLesson.id, { videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Supports YouTube, Vimeo, and direct video URLs</p>
                </div>
              )}

              {(selectedLesson.type === 'quiz' || selectedLesson.type === 'assessment') && (
                <div className="p-6 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 text-center">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                  <p className="text-gray-700 font-medium mb-2">
                    {selectedLesson.type === 'quiz' ? 'Quiz Builder' : 'Assessment Builder'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Create questions to test learner knowledge
                  </p>
                  <Button variant="outline">
                    Open {selectedLesson.type === 'quiz' ? 'Quiz' : 'Assessment'} Editor
                  </Button>
                </div>
              )}

              {selectedLesson.type === 'flashcards' && (
                <div className="p-6 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <p className="text-gray-700 font-medium mb-2">Flashcard Deck</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Create flashcards for memorization and review
                  </p>
                  <Button variant="outline">
                    Open Flashcard Editor
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">Select a lesson to edit</p>
                <p className="text-xs">Or add a new lesson to a module</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseModuleEditor;
