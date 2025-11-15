import React, { useState } from 'react';
import { Upload, FileText, Link, Plus, Trash2, BookOpen, FileStack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface KnowledgeBasePageProps {
  onNext: () => void;
  onBack: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface WebsiteLink {
  id: string;
  url: string;
  title: string;
}

interface DiscoveryAnswer {
  question: string;
  answer: string;
}

export default function KnowledgeBasePage({ onNext, onBack }: KnowledgeBasePageProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [websiteLinks, setWebsiteLinks] = useState<WebsiteLink[]>([]);
  const [newLink, setNewLink] = useState('');
  const [hasExistingMaterials, setHasExistingMaterials] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<DiscoveryAnswer[]>([
    { question: "What problem does your brand solve?", answer: "" },
    { question: "Who is your target customer?", answer: "" },
    { question: "What makes your solution unique?", answer: "" },
    { question: "What products or services do you offer?", answer: "" },
    { question: "What are your core brand values?", answer: "" },
    { question: "How do customers transform after using your product/service?", answer: "" },
    { question: "What industry or category do you operate in?", answer: "" }
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      const newWebsiteLink: WebsiteLink = {
        id: Math.random().toString(36).substr(2, 9),
        url: newLink,
        title: new URL(newLink).hostname
      };
      setWebsiteLinks([...websiteLinks, newWebsiteLink]);
      setNewLink('');
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const handleRemoveLink = (id: string) => {
    setWebsiteLinks(websiteLinks.filter(link => link.id !== id));
  };

  const handleDiscoveryAnswer = (answer: string) => {
    const updated = [...discoveryAnswers];
    updated[currentQuestion].answer = answer;
    setDiscoveryAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < discoveryAnswers.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const totalMaterials = uploadedFiles.length + websiteLinks.length + 
    (hasExistingMaterials === false ? discoveryAnswers.filter(a => a.answer.trim()).length : 0);

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left Column - Input Forms */}
      <div className="space-y-6 overflow-y-auto pr-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Knowledge Base</h2>
          <p className="text-gray-400">
            Build your brand's knowledge foundation
          </p>
        </div>

        {hasExistingMaterials === null && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Do you have existing brand materials?
            </h3>
            <div className="flex gap-4">
              <Button
                onClick={() => setHasExistingMaterials(true)}
                variant="outline"
                className="flex-1 h-24 flex-col gap-2"
              >
                <FileStack className="h-6 w-6" />
                <span>Yes, I have materials</span>
              </Button>
              <Button
                onClick={() => setHasExistingMaterials(false)}
                variant="outline"
                className="flex-1 h-24 flex-col gap-2"
              >
                <BookOpen className="h-6 w-6" />
                <span>No, help me start</span>
              </Button>
            </div>
          </Card>
        )}

        {hasExistingMaterials === true && (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="links">Add Links</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-white font-medium mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-400">
                    PDF, DOC, TXT, PPT (Max 10MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Uploaded Files</Label>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{file.name}</p>
                          <p className="text-gray-400 text-xs">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website-link" className="text-white">
                  Add Website or Resource Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="website-link"
                    placeholder="https://example.com"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Button onClick={handleAddLink} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {websiteLinks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Added Links</Label>
                  {websiteLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Link className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{link.title}</p>
                          <p className="text-gray-400 text-xs truncate max-w-xs">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(link.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {hasExistingMaterials === false && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Brand Discovery
                </h3>
                <span className="text-sm text-gray-400">
                  Question {currentQuestion + 1} of {discoveryAnswers.length}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / discoveryAnswers.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-lg mb-3 block">
                  {discoveryAnswers[currentQuestion].question}
                </Label>
                <Textarea
                  value={discoveryAnswers[currentQuestion].answer}
                  onChange={(e) => handleDiscoveryAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="bg-slate-900 border-slate-600 text-white min-h-[120px]"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === discoveryAnswers.length - 1}
                >
                  Next Question
                </Button>
              </div>
            </div>
          </Card>
        )}

        {hasExistingMaterials !== null && (
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Intelligence
            </Button>
          </div>
        )}
      </div>

      {/* Right Column - Live Preview */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Knowledge Base Summary
        </h3>

        <div className="space-y-6">
          {/* Materials Count */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {totalMaterials}
              </div>
              <div className="text-sm text-gray-400">
                Total Knowledge Sources
              </div>
            </div>
          </div>

          {/* Uploaded Files Summary */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Uploaded Documents ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-slate-900/50 rounded p-3 border border-slate-700"
                  >
                    <div className="text-sm text-white font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-400">{file.size}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website Links Summary */}
          {websiteLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Link className="h-4 w-4" />
                Reference Links ({websiteLinks.length})
              </h4>
              <div className="space-y-2">
                {websiteLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-slate-900/50 rounded p-3 border border-slate-700"
                  >
                    <div className="text-sm text-white font-medium">
                      {link.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {link.url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovery Answers Summary */}
          {hasExistingMaterials === false && discoveryAnswers.some(a => a.answer.trim()) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Discovery Insights
              </h4>
              <div className="space-y-3">
                {discoveryAnswers
                  .filter(a => a.answer.trim())
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/50 rounded p-3 border border-slate-700"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {item.question}
                      </div>
                      <div className="text-sm text-white">
                        {item.answer}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {totalMaterials === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {hasExistingMaterials === null
                  ? "Choose how you'd like to build your knowledge base"
                  : hasExistingMaterials
                  ? "Upload files or add links to get started"
                  : "Answer discovery questions to build your knowledge base"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
