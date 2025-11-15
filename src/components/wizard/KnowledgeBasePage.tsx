import React, { useState } from 'react';
import { Upload, FileText, Link, Plus, Trash2, BookOpen, FileStack, Globe, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  const [textEntries, setTextEntries] = useState<{ id: string; content: string }[]>([]);
  const [newLink, setNewLink] = useState('');
  const [newText, setNewText] = useState('');
  const [hasExistingMaterials, setHasExistingMaterials] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<string | null>(null);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<DiscoveryAnswer[]>([
    { question: "What Problem Does Your Brand Solve?", answer: "" },
    { question: "Who Is Your Target Customer?", answer: "" },
    { question: "What Makes Your Solution Unique?", answer: "" },
    { question: "What Products Or Services Do You Offer?", answer: "" },
    { question: "What Are Your Core Brand Values?", answer: "" },
    { question: "How Do Customers Transform After Using Your Product/Service?", answer: "" },
    { question: "What Industry Or Category Do You Operate In?", answer: "" }
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

  const handleAddText = () => {
    if (newText.trim()) {
      const newEntry = {
        id: Math.random().toString(36).substr(2, 9),
        content: newText
      };
      setTextEntries([...textEntries, newEntry]);
      setNewText('');
      setSelectedDataType(null);
      setModalOpen(false);
    }
  };

  const handleRemoveText = (id: string) => {
    setTextEntries(textEntries.filter(entry => entry.id !== id));
  };

  const handleSelectDataType = (type: string) => {
    setSelectedDataType(type);
    if (type === 'discovery') {
      setModalOpen(false);
    }
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

  const totalMaterials = uploadedFiles.length + websiteLinks.length + textEntries.length +
    discoveryAnswers.filter(a => a.answer.trim()).length;

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left Column - Input Forms */}
      <div className="space-y-6 overflow-y-auto pr-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Build Your Brand's Knowledge Foundation
          </p>
        </div>

        {/* Add Data Source Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center uppercase">
                Add Data Source
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 p-6">
              {/* Website */}
              <Card
                className="p-6 cursor-pointer hover:border-primary transition-colors bg-card border-border"
                onClick={() => handleSelectDataType('website')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold text-foreground">Website</h3>
                  <p className="text-sm text-muted-foreground">Add Website Links To Your Knowledge Base</p>
                </div>
              </Card>

              {/* Files */}
              <Card
                className="p-6 cursor-pointer hover:border-primary transition-colors bg-card border-border"
                onClick={() => handleSelectDataType('files')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-brand-green" />
                  </div>
                  <h3 className="font-semibold text-foreground">Files</h3>
                  <p className="text-sm text-muted-foreground">Upload Documents And Files</p>
                </div>
              </Card>

              {/* Text */}
              <Card
                className="p-6 cursor-pointer hover:border-primary transition-colors bg-card border-border"
                onClick={() => handleSelectDataType('text')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                    <Type className="h-8 w-8 text-brand-yellow" />
                  </div>
                  <h3 className="font-semibold text-foreground">Text</h3>
                  <p className="text-sm text-muted-foreground">Add Text Content Directly</p>
                </div>
              </Card>

              {/* Discovery */}
              <Card
                className="p-6 cursor-pointer hover:border-primary transition-colors bg-card border-border"
                onClick={() => handleSelectDataType('discovery')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-brand-purple" />
                  </div>
                  <h3 className="font-semibold text-foreground">Discovery</h3>
                  <p className="text-sm text-muted-foreground">Guided Brand Questionnaire</p>
                </div>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Selected Data Type Forms */}
        {selectedDataType === 'website' && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Website Link</h3>
            <div className="space-y-2">
              <Label htmlFor="website-link" className="text-foreground">
                Website URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="website-link"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <Button onClick={handleAddLink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </Card>
        )}

        {selectedDataType === 'files' && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upload Files</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium mb-2">
                  Drop Files Here Or Click To Upload
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC, TXT, PPT (Max 10MB)
                </p>
              </label>
            </div>
          </Card>
        )}

        {selectedDataType === 'text' && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Text Content</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content" className="text-foreground">
                  Content
                </Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste or type your content here..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="bg-background border-border text-foreground min-h-[120px]"
                />
              </div>
              <Button onClick={handleAddText}>
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </div>
          </Card>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Uploaded Files</Label>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <div>
                    <p className="text-foreground text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">{file.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Website Links List */}
        {websiteLinks.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Website Links</Label>
            {websiteLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-brand-blue" />
                  <div>
                    <p className="text-foreground text-sm font-medium">{link.title}</p>
                    <p className="text-muted-foreground text-xs truncate max-w-xs">
                      {link.url}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLink(link.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Text Entries List */}
        {textEntries.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Text Entries</Label>
            {textEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-brand-yellow" />
                  <div>
                    <p className="text-foreground text-sm font-medium line-clamp-2">{entry.content}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveText(entry.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Discovery Questionnaire */}
        {selectedDataType === 'discovery' && (
          <Card className="p-6 bg-card border-border">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Brand Discovery
                </h3>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {discoveryAnswers.length}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-brand-purple h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / discoveryAnswers.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground text-lg mb-3 block">
                  {discoveryAnswers[currentQuestion].question}
                </Label>
                <Textarea
                  value={discoveryAnswers[currentQuestion].answer}
                  onChange={(e) => handleDiscoveryAnswer(e.target.value)}
                  placeholder="Share Your Thoughts..."
                  className="bg-background border-border text-foreground min-h-[120px]"
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

        {totalMaterials > 0 && (
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
      <div className="bg-card/50 rounded-lg p-6 border border-border overflow-y-auto">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-purple" />
          Knowledge Base Summary
        </h3>

        <div className="space-y-6">
          {/* Materials Count */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-purple mb-2">
                {totalMaterials}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Knowledge Sources
              </div>
            </div>
          </div>

          {/* Uploaded Files Summary */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Uploaded Documents ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-background/50 rounded p-3 border border-border"
                  >
                    <div className="text-sm text-foreground font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{file.size}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website Links Summary */}
          {websiteLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Reference Links ({websiteLinks.length})
              </h4>
              <div className="space-y-2">
                {websiteLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-background/50 rounded p-3 border border-border"
                  >
                    <div className="text-sm text-foreground font-medium">
                      {link.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {link.url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Entries Summary */}
          {textEntries.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Entries ({textEntries.length})
              </h4>
              <div className="space-y-2">
                {textEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-background/50 rounded p-3 border border-border"
                  >
                    <div className="text-sm text-foreground line-clamp-3">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovery Answers Summary */}
          {discoveryAnswers.some(a => a.answer.trim()) && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Discovery Insights
              </h4>
              <div className="space-y-3">
                {discoveryAnswers
                  .filter(a => a.answer.trim())
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-background/50 rounded p-3 border border-border"
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.question}
                      </div>
                      <div className="text-sm text-foreground">
                        {item.answer}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {totalMaterials === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Click "Add Data Source" To Get Started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
