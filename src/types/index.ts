// Shared TypeScript types for the AI Interview Platform

export type InterviewLevel = "junior" | "mid" | "senior" | "staff";
export type InterviewStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type FeedbackStatus = "pending" | "generating" | "ready" | "error";
export type Speaker = "ai" | "user";
export type TemplateStatus = "active" | "inactive";

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  followUps?: string[];
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  level: InterviewLevel;
  techStack: string[];
  questionCount: number;
  questions: Question[];
  status: InterviewStatus;
  createdAt: string; // ISO string
  updatedAt: string;
  coverImage?: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: number; // ms since call start
  isFinal: boolean;
}

export interface Session {
  id: string;
  interviewId: string;
  userId: string;
  templateId?: string;         // set when session comes from an admin template
  applicantName?: string;      // collected on /apply landing page
  applicantEmail?: string;
  transcript: TranscriptMessage[];
  durationSeconds: number;
  status: InterviewStatus;
  feedbackStatus: FeedbackStatus;
  feedbackId?: string;
  startedAt: string;
  endedAt?: string;
  vapiCallId?: string;
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  score: number; // 0-10
  strengths: string[];
  weaknesses: string[];
  idealAnswer?: string;
}

export interface PracticeExercise {
  title: string;
  description: string;
  resourceUrl?: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
}

export interface Feedback {
  id: string;
  sessionId: string;
  interviewId: string;
  userId: string;
  overallScore: number; // 0-100
  summary: string;
  topStrengths: string[];
  topWeaknesses: string[];
  questionFeedback: QuestionFeedback[];
  practiceExercises: PracticeExercise[];
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt: string;
  interviewCount: number;
  averageScore: number;
}

// API request/response shapes
export interface GenerateQuestionsRequest {
  role: string;
  level: InterviewLevel;
  techStack: string[];
  count: number;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface GenerateFeedbackRequest {
  transcript: TranscriptMessage[];
  questions: Question[];
  role: string;
  level: InterviewLevel;
}

export interface GenerateFeedbackResponse {
  feedback: Omit<Feedback, "id" | "sessionId" | "interviewId" | "userId" | "createdAt">;
}

// Vapi event types
export interface VapiMessage {
  type: string;
  role?: Speaker;
  transcript?: string;
  transcriptType?: "partial" | "final";
  callId?: string;
}

// Admin interview template
export interface InterviewTemplate {
  id: string;
  adminId: string;
  title: string;              // e.g. "Senior Frontend Engineer — Round 1"
  role: string;
  level: InterviewLevel;
  techStack: string[];
  questions: Question[];
  description?: string;       // shown to applicants on the landing page
  status: TemplateStatus;
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}
