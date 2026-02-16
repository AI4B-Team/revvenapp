import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, GripVertical, Sparkles, Eye, Pencil, Check, X, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuizOption[];
  correctAnswer?: string; // For true-false, fill-blank, short-answer
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number; // Percentage
  timeLimit?: number; // Minutes
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface QuizEditorProps {
  quiz: Quiz;
  onQuizUpdate: (quiz: Quiz) => void;
  onClose?: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True / False' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'short-answer', label: 'Short Answer' },
];

const QuizEditor = ({ quiz, onQuizUpdate, onClose }: QuizEditorProps) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    quiz.questions.length > 0 ? quiz.questions[0].id : null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const selectedQuestion = quiz.questions.find(q => q.id === selectedQuestionId);

  const handleAddQuestion = (type: QuestionType = 'multiple-choice') => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      type,
      question: '',
      points: 1,
      options: type === 'multiple-choice' ? [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ] : type === 'true-false' ? [
        { id: crypto.randomUUID(), text: 'True', isCorrect: true },
        { id: crypto.randomUUID(), text: 'False', isCorrect: false },
      ] : undefined,
      correctAnswer: type === 'true-false' ? 'true' : '',
    };

    const updatedQuiz = {
      ...quiz,
      questions: [...quiz.questions, newQuestion],
      updatedAt: new Date()
    };
    onQuizUpdate(updatedQuiz);
    setSelectedQuestionId(newQuestion.id);
    toast.success('New question added');
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = quiz.questions.filter(q => q.id !== questionId);
    onQuizUpdate({
      ...quiz,
      questions: updatedQuestions,
      updatedAt: new Date()
    });
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].id : null);
    }
    toast.success('Question deleted');
  };

  const handleDuplicateQuestion = (questionId: string) => {
    const questionToDuplicate = quiz.questions.find(q => q.id === questionId);
    if (!questionToDuplicate) return;

    const newQuestion: QuizQuestion = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      options: questionToDuplicate.options?.map(opt => ({ ...opt, id: crypto.randomUUID() }))
    };
    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(questionIndex + 1, 0, newQuestion);

    onQuizUpdate({
      ...quiz,
      questions: updatedQuestions,
      updatedAt: new Date()
    });
    setSelectedQuestionId(newQuestion.id);
    toast.success('Question duplicated');
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = quiz.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    onQuizUpdate({
      ...quiz,
      questions: updatedQuestions,
      updatedAt: new Date()
    });
  };

  const handleOptionUpdate = (questionId: string, optionId: string, updates: Partial<QuizOption>) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    // If setting this option as correct, unset others for single-choice
    if (updates.isCorrect && question.type !== 'multiple-choice') {
      updatedOptions.forEach(opt => {
        if (opt.id !== optionId) opt.isCorrect = false;
      });
    }

    handleQuestionUpdate(questionId, { options: updatedOptions });
  };

  const handleAddOption = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const newOption: QuizOption = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false
    };

    handleQuestionUpdate(questionId, {
      options: [...question.options, newOption]
    });
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question?.options || question.options.length <= 2) return;

    handleQuestionUpdate(questionId, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    toast.info('Generating quiz questions with AI...');
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-content', {
        body: { type: 'quiz', bookTitle: quiz.title, chapterTitles: [] }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newQuestions: QuizQuestion[] = data.result.map((q: any) => ({
        id: crypto.randomUUID(),
        type: q.type || 'multiple-choice',
        question: q.question,
        points: q.points || 1,
        explanation: q.explanation || '',
        correctAnswer: q.type === 'true-false' ? (q.options?.find((o: any) => o.isCorrect)?.text?.toLowerCase() || 'true') : '',
        options: q.options?.map((o: any) => ({ id: crypto.randomUUID(), text: o.text, isCorrect: o.isCorrect })),
      }));
      onQuizUpdate({
        ...quiz,
        questions: [...quiz.questions, ...newQuestions],
        updatedAt: new Date()
      });
      toast.success(`${newQuestions.length} questions generated!`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;
    quiz.questions.forEach(question => {
      total += question.points;
      const answer = previewAnswers[question.id];
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        if (answer === correctOption?.id) {
          correct += question.points;
        }
      } else if (question.correctAnswer && answer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
        correct += question.points;
      }
    });
    return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  };

  if (isPreviewMode) {
    const score = showResults ? calculateScore() : null;

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{quiz.title || 'Quiz Preview'}</h3>
          <Button variant="outline" size="sm" onClick={() => { setIsPreviewMode(false); setShowResults(false); setPreviewAnswers({}); }}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Quiz
          </Button>
        </div>

        {showResults && score && (
          <div className={`p-6 rounded-xl mb-6 ${score.percentage >= quiz.passingScore ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'}`}>
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {score.percentage >= quiz.passingScore ? '🎉 Congratulations!' : '📚 Keep Learning!'}
            </h4>
            <p className="text-lg">
              Score: <span className="font-bold">{score.correct}/{score.total}</span> ({score.percentage}%)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Passing score: {quiz.passingScore}%
            </p>
          </div>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{question.question || 'Question text...'}</p>
                  <p className="text-xs text-gray-400 mt-1">{question.points} point{question.points !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                <RadioGroup
                  value={previewAnswers[question.id] || ''}
                  onValueChange={(value) => setPreviewAnswers({ ...previewAnswers, [question.id]: value })}
                  disabled={showResults}
                >
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          showResults
                            ? option.isCorrect
                              ? 'bg-green-50 border-green-400'
                              : previewAnswers[question.id] === option.id
                                ? 'bg-red-50 border-red-400'
                                : 'border-gray-200'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          {option.text || 'Option...'}
                        </Label>
                        {showResults && option.isCorrect && <Check className="w-5 h-5 text-green-600" />}
                        {showResults && !option.isCorrect && previewAnswers[question.id] === option.id && <X className="w-5 h-5 text-red-600" />}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {(question.type === 'fill-blank' || question.type === 'short-answer') && (
                <div>
                  <Input
                    value={previewAnswers[question.id] || ''}
                    onChange={(e) => setPreviewAnswers({ ...previewAnswers, [question.id]: e.target.value })}
                    placeholder={question.type === 'fill-blank' ? 'Fill in the blank...' : 'Your answer...'}
                    disabled={showResults}
                    className={showResults ? (
                      previewAnswers[question.id]?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'
                    ) : ''}
                  />
                  {showResults && question.correctAnswer && (
                    <p className="mt-2 text-sm text-green-600">
                      Correct answer: {question.correctAnswer}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!showResults && quiz.questions.length > 0 && (
          <Button className="mt-6 w-full" onClick={() => setShowResults(true)}>
            Submit Quiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={quiz.title}
            onChange={(e) => onQuizUpdate({ ...quiz, title: e.target.value, updatedAt: new Date() })}
            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
            placeholder="Quiz Title"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(true)}
              disabled={quiz.questions.length === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Passing:</span>
            <Input
              type="number"
              value={quiz.passingScore}
              onChange={(e) => onQuizUpdate({ ...quiz, passingScore: parseInt(e.target.value) || 0, updatedAt: new Date() })}
              className="w-16 h-7 text-center"
              min={0}
              max={100}
            />
            <span className="text-gray-500">%</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={quiz.shuffleQuestions}
              onCheckedChange={(checked) => onQuizUpdate({ ...quiz, shuffleQuestions: !!checked, updatedAt: new Date() })}
            />
            <span className="text-gray-500">Shuffle</span>
          </div>
        </div>
      </div>

      {/* Questions List & Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Questions List */}
        <div className="w-72 border-r border-gray-200 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">{quiz.questions.length} Questions</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleGenerateWithAI} disabled={isGenerating}>
                <Sparkles className={`w-4 h-4 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Add Question Dropdown */}
          <div className="mb-3">
            <Select onValueChange={(value) => handleAddQuestion(value as QuestionType)}>
              <SelectTrigger className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Add Question" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {quiz.questions.map((question, index) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestionId(question.id)}
                className={`group p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedQuestionId === question.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                        {QUESTION_TYPES.find(t => t.value === question.type)?.label.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-400">Q{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">
                      {question.question || 'Untitled question'}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(question.id); }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(question.id); }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {quiz.questions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm mb-2">No questions yet</p>
                <p className="text-xs">Use the dropdown above to add questions</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedQuestion ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedQuestion.type}
                  onValueChange={(value) => handleQuestionUpdate(selectedQuestion.id, { type: value as QuestionType })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Points:</span>
                  <Input
                    type="number"
                    value={selectedQuestion.points}
                    onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { points: parseInt(e.target.value) || 1 })}
                    className="w-16 h-8"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Question</label>
                <Textarea
                  value={selectedQuestion.question}
                  onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { question: e.target.value })}
                  placeholder="Enter your question..."
                  className="min-h-[100px]"
                />
              </div>

              {(selectedQuestion.type === 'multiple-choice' || selectedQuestion.type === 'true-false') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Answer Options</label>
                  <div className="space-y-2">
                    {selectedQuestion.options?.map((option, optIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={option.isCorrect}
                          onCheckedChange={(checked) => handleOptionUpdate(selectedQuestion.id, option.id, { isCorrect: !!checked })}
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionUpdate(selectedQuestion.id, option.id, { text: e.target.value })}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1"
                          disabled={selectedQuestion.type === 'true-false'}
                        />
                        {selectedQuestion.type === 'multiple-choice' && selectedQuestion.options && selectedQuestion.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveOption(selectedQuestion.id, option.id)}
                          >
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {selectedQuestion.type === 'multiple-choice' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(selectedQuestion.id)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Check the box next to the correct answer(s)</p>
                </div>
              )}

              {(selectedQuestion.type === 'fill-blank' || selectedQuestion.type === 'short-answer') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Correct Answer</label>
                  <Input
                    value={selectedQuestion.correctAnswer || ''}
                    onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer..."
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Explanation (Optional)</label>
                <Textarea
                  value={selectedQuestion.explanation || ''}
                  onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">Select a question to edit</p>
                <p className="text-xs">Or add a new question from the dropdown</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
