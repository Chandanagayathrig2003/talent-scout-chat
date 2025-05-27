import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, FileText, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface CandidateInfo {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  position: string;
  location: string;
  techStack: string[];
}

const HiringAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [conversationState, setConversationState] = useState('greeting');
  const [candidateInfo, setCandidateInfo] = useState<Partial<CandidateInfo>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [techQuestions, setTechQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCandidateInfo, setShowCandidateInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    addBotMessage(
      "Hello! Welcome to TalentScout's intelligent hiring assistant. I'm here to help with your initial screening process. Let's start by getting to know you better. What's your full name?"
    );
  }, []);

  const addBotMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateTechnicalQuestions = (techStack: string[]): string[] => {
    const questionBank: Record<string, string[]> = {
      'javascript': [
        "Explain the difference between let, const, and var in JavaScript.",
        "What is event delegation and how does it work?",
        "How do closures work in JavaScript? Provide an example.",
        "What are the differences between == and === operators?",
        "Explain the concept of hoisting in JavaScript."
      ],
      'python': [
        "What are Python decorators and how do you use them?",
        "Explain the difference between lists and tuples in Python.",
        "What is the Global Interpreter Lock (GIL) in Python?",
        "How do you handle exceptions in Python?",
        "What are Python generators and when would you use them?"
      ],
      'react': [
        "What are React hooks and why were they introduced?",
        "Explain the difference between controlled and uncontrolled components.",
        "What is the virtual DOM and how does it improve performance?",
        "How do you optimize React applications for better performance?",
        "What are React context and when should you use it?"
      ],
      'node.js': [
        "What is the event loop in Node.js?",
        "How do you handle asynchronous operations in Node.js?",
        "What are streams in Node.js and when would you use them?",
        "Explain the difference between process.nextTick() and setImmediate().",
        "How do you handle errors in Node.js applications?"
      ],
      'java': [
        "What are the main principles of Object-Oriented Programming?",
        "Explain the difference between abstract classes and interfaces.",
        "What is garbage collection in Java?",
        "How does exception handling work in Java?",
        "What are Java generics and why are they useful?"
      ],
      'sql': [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "How do you optimize slow SQL queries?",
        "What are database indexes and when should you use them?",
        "Explain ACID properties in databases.",
        "What is normalization and why is it important?"
      ]
    };

    const questions: string[] = [];
    techStack.forEach(tech => {
      const techLower = tech.toLowerCase();
      if (questionBank[techLower]) {
        const randomQuestions = questionBank[techLower]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        questions.push(...randomQuestions);
      }
    });

    // If no specific questions found, add general questions
    if (questions.length === 0) {
      questions.push(
        "Describe a challenging technical problem you've solved recently.",
        "How do you stay updated with new technologies in your field?",
        "What's your approach to debugging code?"
      );
    }

    return questions.slice(0, 5); // Limit to 5 questions
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) return;

    addUserMessage(input);
    setCurrentInput('');
    setIsLoading(true);

    // Check for conversation-ending keywords
    const endKeywords = ['bye', 'goodbye', 'quit', 'exit', 'end', 'finish', 'stop'];
    if (endKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      setTimeout(() => {
        addBotMessage(
          "Thank you for your time! Your information has been recorded. Our HR team will review your profile and get back to you within 2-3 business days. Have a great day!"
        );
        setIsLoading(false);
      }, 1000);
      return;
    }

    setTimeout(() => {
      handleConversationFlow(input);
      setIsLoading(false);
    }, 1000);
  };

  const handleConversationFlow = (input: string) => {
    switch (conversationState) {
      case 'greeting':
        setCandidateInfo(prev => ({ ...prev, fullName: input }));
        setConversationState('email');
        addBotMessage(`Nice to meet you, ${input}! Could you please provide your email address?`);
        break;

      case 'email':
        setCandidateInfo(prev => ({ ...prev, email: input }));
        setConversationState('phone');
        addBotMessage("Great! What's your phone number?");
        break;

      case 'phone':
        setCandidateInfo(prev => ({ ...prev, phone: input }));
        setConversationState('experience');
        addBotMessage("How many years of professional experience do you have?");
        break;

      case 'experience':
        setCandidateInfo(prev => ({ ...prev, experience: input }));
        setConversationState('position');
        addBotMessage("What position(s) are you interested in applying for?");
        break;

      case 'position':
        setCandidateInfo(prev => ({ ...prev, position: input }));
        setConversationState('location');
        addBotMessage("What's your current location?");
        break;

      case 'location':
        setCandidateInfo(prev => ({ ...prev, location: input }));
        setConversationState('techStack');
        addBotMessage(
          "Now, let's talk about your technical skills. Please list your tech stack (programming languages, frameworks, databases, tools) separated by commas. For example: JavaScript, React, Node.js, MongoDB"
        );
        break;

      case 'techStack':
        const techArray = input.split(',').map(tech => tech.trim()).filter(tech => tech);
        setCandidateInfo(prev => ({ ...prev, techStack: techArray }));
        const questions = generateTechnicalQuestions(techArray);
        setTechQuestions(questions);
        setCurrentQuestionIndex(0);
        setConversationState('technicalQuestions');
        addBotMessage(
          `Excellent! Based on your tech stack (${techArray.join(', ')}), I'll ask you a few technical questions to assess your proficiency. Let's start with the first one:`
        );
        setTimeout(() => {
          addBotMessage(questions[0]);
        }, 1500);
        break;

      case 'technicalQuestions':
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < techQuestions.length) {
          setCurrentQuestionIndex(nextIndex);
          addBotMessage("Thank you for your answer! Here's the next question:");
          setTimeout(() => {
            addBotMessage(techQuestions[nextIndex]);
          }, 1500);
        } else {
          setConversationState('completed');
          addBotMessage(
            "Excellent! That completes our initial screening. Thank you for taking the time to answer all the questions. Your responses have been recorded and our HR team will review your profile. You should expect to hear back from us within 2-3 business days. Is there anything else you'd like to know about the position or our company?"
          );
        }
        break;

      case 'completed':
        addBotMessage(
          "Thank you for your interest! If you have any other questions in the future, feel free to reach out. Good luck with your application!"
        );
        break;

      default:
        addBotMessage("I'm sorry, I didn't understand that. Could you please rephrase?");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processUserInput(currentInput);
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-6">
      {/* Main Chat Interface */}
      <div className="flex-1">
        <Card className="h-[600px] flex flex-col shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="w-6 h-6" />
              TalentScout Hiring Assistant
              <div className="ml-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-white hover:bg-white/20"
                >
                  <FileText className="w-4 h-4" />
                  Scroll to Top
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'bot'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.type === 'bot'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-gray-50">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !currentInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Info Sidebar */}
      {Object.keys(candidateInfo).length > 0 && (
        <div className="w-80">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Candidate Info
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCandidateInfo(!showCandidateInfo)}
                >
                  {showCandidateInfo ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {showCandidateInfo && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {candidateInfo.fullName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.fullName}</p>
                    </div>
                  )}
                  {candidateInfo.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.email}</p>
                    </div>
                  )}
                  {candidateInfo.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.phone}</p>
                    </div>
                  )}
                  {candidateInfo.experience && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.experience} years</p>
                    </div>
                  )}
                  {candidateInfo.position && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Desired Position</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.position}</p>
                    </div>
                  )}
                  {candidateInfo.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900 text-sm">{candidateInfo.location}</p>
                    </div>
                  )}
                  {candidateInfo.techStack && candidateInfo.techStack.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-2">Tech Stack</label>
                      <div className="flex flex-wrap gap-1">
                        {candidateInfo.techStack.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default HiringAssistant;
