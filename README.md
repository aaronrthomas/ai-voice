# VoicePrep AI 🎤

A full-stack AI mock interview platform with real-time voice interviews, AI-powered question generation, and actionable post-interview feedback.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Firebase Auth (Email + Google + Anonymous/Guest)
- **Database**: Firebase Firestore
- **Voice AI**: Vapi.ai (`@vapi-ai/web`)
- **LLM**: Google Gemini 1.5 Flash
- **Styling**: TailwindCSS + custom CSS design system
- **Animations**: Framer Motion

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local` and fill in your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps |
| `FIREBASE_ADMIN_*` | Firebase Console → Project Settings → Service accounts → Generate new private key |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | [Vapi Dashboard](https://vapi.ai) → Account → API Keys |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API key |

### 3. Set up Firebase

1. Create a new Firebase project
2. Enable **Firestore** (in test mode to start)
3. Enable **Authentication** with these providers:
   - Email/Password
   - Google
   - Anonymous

### 4. Set up Vapi

1. Create an account at [vapi.ai](https://vapi.ai)
2. Go to Dashboard → Assistants → Create Assistant (optional, the app uses inline configuration)
3. Copy your **Public Key** from Account Settings

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

## Features

- 🎤 **Real-Time Voice Interview** — Speak naturally with a Vapi AI agent, full backchanneling
- ✨ **AI Interview Creation** — 5-step wizard generates tailored questions with Gemini
- 📊 **Post-Interview Feedback** — Overall score, per-question breakdown, strengths/weaknesses
- 📋 **Session History** — Full transcripts, duration, and status tracking
- 👤 **Guest Mode** — Try without creating an account (`signInAnonymously`)
- 🔐 **Protected Routes** — Middleware-based auth guards

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (auth)/register/       # Register page
│   ├── (dashboard)/
│   │   ├── dashboard/         # Session history
│   │   └── interview/[id]/    # Live interview room
│   ├── create/                # Interview creation wizard
│   ├── feedback/[id]/         # Post-interview feedback
│   ├── api/
│   │   ├── generate-questions/ # Gemini question gen
│   │   ├── generate-feedback/  # Gemini feedback
│   │   └── vapi-webhook/       # Vapi event handler
│   ├── layout.tsx
│   ├── page.tsx               # Landing page
│   └── globals.css
├── components/
│   ├── auth/AuthProvider.tsx   # Firebase Auth context
│   ├── interview/
│   │   ├── VoiceAgent.tsx      # Vapi SDK integration
│   │   ├── TranscriptPanel.tsx # Live transcript
│   │   └── AudioVisualizer.tsx # Waveform animation
│   ├── creation/InterviewWizard.tsx
│   └── feedback/FeedbackReport.tsx
├── lib/
│   ├── firebase.ts             # Firebase client
│   ├── firebase-admin.ts       # Firebase Admin
│   ├── gemini.ts               # Gemini client
│   └── vapi.ts                 # Vapi singleton
├── middleware.ts               # Route protection
└── types/index.ts              # Shared TS types
```

## Firestore Collections

| Collection | Document | Fields |
|---|---|---|
| `users` | `{uid}` | displayName, email, isAnonymous, interviewCount |
| `interviews` | `{id}` | userId, role, level, techStack, questions, status |
| `sessions` | `{id}` | interviewId, transcript, status, feedbackStatus |
| `feedback` | `{id}` | sessionId, overallScore, questionFeedback, exercises |

## Vapi Webhook Setup

In your Vapi Dashboard → Settings → Webhooks, add:
```
https://your-domain.com/api/vapi-webhook
```

This enables automatic transcript saving when a call ends.
