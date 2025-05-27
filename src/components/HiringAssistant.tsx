import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, FileText, Award, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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

    if (questions.length === 0) {
      questions.push(
        "Describe a challenging technical problem you've solved recently.",
        "How do you stay updated with new technologies in your field?",
        "What's your approach to debugging code?"
      );
    }

    return questions.slice(0, 5);
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) return;

    addUserMessage(input);
    setCurrentInput('');
    setIsLoading(true);

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
    <div className="max-w-6xl mx-auto flex gap-6 animate-fade-in">
      {/* Main Chat Interface */}
      <div className="flex-1">
        <Card className="h-[600px] flex flex-col shadow-2xl backdrop-blur-sm bg-white/10 border-white/20 animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 text-white rounded-t-lg backdrop-blur-sm border-b border-white/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="relative">
                <Bot className="w-7 h-7" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
              TalentScout Hiring Assistant
              <div className="ml-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <FileText className="w-4 h-4" />
                  Scroll to Top
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-gray-50/90 to-white/90 backdrop-blur-sm">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 animate-fade-in ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                        message.type === 'bot'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <Bot className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                        message.type === 'bot'
                          ? 'bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-200'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-white/20 p-4 bg-white/50 backdrop-blur-sm rounded-b-lg">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 bg-white/90 border-white/30 focus:border-blue-400 transition-all duration-300 rounded-xl shadow-sm"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !currentInput.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 rounded-xl shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Info Sidebar */}
      {Object.keys(candidateInfo).length > 0 && (
        <div className="w-80 animate-slide-in-right">
          <Card className="sticky top-4 backdrop-blur-sm bg-white/10 border-white/20 shadow-xl">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Candidate Profile
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCandidateInfo(!showCandidateInfo)}
                  className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
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
              <CardContent className="pt-4 bg-white/90 backdrop-blur-sm rounded-b-lg">
                <div className="space-y-4">
                  {candidateInfo.fullName && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.fullName}</p>
                    </div>
                  )}
                  {candidateInfo.email && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.email}</p>
                    </div>
                  )}
                  {candidateInfo.phone && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Phone</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.phone}</p>
                    </div>
                  )}
                  {candidateInfo.experience && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Experience</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.experience} years</p>
                    </div>
                  )}
                  {candidateInfo.position && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Desired Position</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.position}</p>
                    </div>
                  )}
                  {candidateInfo.location && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-1">Location</label>
                      <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded-lg">{candidateInfo.location}</p>
                    </div>
                  )}
                  {candidateInfo.techStack && candidateInfo.techStack.length > 0 && (
                    <div className="animate-fade-in">
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Tech Stack</label>
                      <div className="flex flex-wrap gap-2">
                        {candidateInfo.techStack.map((tech, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 hover:scale-105 transition-transform duration-200"
                          >
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
