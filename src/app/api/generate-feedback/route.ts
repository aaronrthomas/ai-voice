import { NextRequest, NextResponse } from "next/server";
import { geminiPro } from "@/lib/gemini";
import type { GenerateFeedbackRequest, QuestionFeedback, PracticeExercise } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateFeedbackRequest = await req.json();
    const { transcript, questions, role, level } = body;

    if (!transcript || !questions) {
      return NextResponse.json({ error: "Missing transcript or questions" }, { status: 400 });
    }

    // Build transcript text for the AI
    const transcriptText = transcript
      .map((m) => `[${m.speaker.toUpperCase()}]: ${m.text}`)
      .join("\n");

    const questionsText = questions
      .map((q, i) => `${i + 1}. ${q.text} (${q.category}, ${q.difficulty})`)
      .join("\n");

    // If no Gemini key, return mock feedback
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        feedback: getMockFeedback(questions),
      });
    }

    const prompt = `You are an expert ${role} technical interviewer evaluating a candidate interview.
Role: ${role} (${level} level)

Interview Questions:
${questionsText}

Interview Transcript:
${transcriptText}

Evaluate the candidate's performance thoroughly. Return ONLY a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary of performance>",
  "communicationScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "topWeaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "questionFeedback": [
    {
      "questionId": "q1",
      "questionText": "<exact question text>",
      "score": <0-10>,
      "strengths": ["<what they did well>"],
      "weaknesses": ["<what could be improved>"],
      "idealAnswer": "<brief ideal answer outline>"
    }
  ],
  "practiceExercises": [
    {
      "title": "<exercise title>",
      "description": "<what to practice and how>",
      "difficulty": "easy"|"medium"|"hard",
      "estimatedMinutes": <number>
    }
  ]
}`;

    const result = await geminiPro.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      // Strip markdown code fences Gemini sometimes adds
      const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      // Fall back to extracting the first {...} block
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("JSON parse fallback failed:", innerErr, "\nRaw text:", text);
          throw new Error("Failed to parse AI feedback response");
        }
      } else {
        console.error("No JSON found in Gemini response. Raw text:", text);
        throw new Error("AI returned no parseable JSON");
      }
    }

    return NextResponse.json({ feedback: parsed });
  } catch (error) {
    console.error("Generate feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback", feedback: null },
      { status: 500 }
    );
  }
}

function getMockFeedback(questions: GenerateFeedbackRequest["questions"]) {
  const qFeedback: QuestionFeedback[] = questions.map((q, i) => ({
    questionId: q.id,
    questionText: q.text,
    score: Math.floor(Math.random() * 3 + 6), // 6-8
    strengths: ["Clear explanation", "Good use of examples"],
    weaknesses: ["Could elaborate more on edge cases"],
    idealAnswer: "A strong answer would cover the core concept, trade-offs, and a real-world example.",
  }));

  const exercises: PracticeExercise[] = [
    {
      title: "System Design Practice",
      description: "Practice designing scalable systems by studying patterns like load balancing, caching, and database sharding.",
      difficulty: "hard",
      estimatedMinutes: 45,
    },
    {
      title: "Behavioral STAR Method",
      description: "Practice the STAR (Situation, Task, Action, Result) method for behavioral questions using past experiences.",
      difficulty: "easy",
      estimatedMinutes: 20,
    },
    {
      title: "Data Structures Review",
      description: "Review trees, graphs, hash maps, and practice LeetCode medium difficulty problems.",
      difficulty: "medium",
      estimatedMinutes: 60,
    },
    {
      title: "Mock Verbal Explanation",
      description: "Record yourself explaining a technical concept for 2 minutes. Review for clarity and pacing.",
      difficulty: "easy",
      estimatedMinutes: 15,
    },
    {
      title: "Code Review Practice",
      description: "Review open-source PRs and practice giving constructive code review feedback.",
      difficulty: "medium",
      estimatedMinutes: 30,
    },
  ];

  return {
    overallScore: 72,
    summary:
      "The candidate demonstrated solid foundational knowledge and communicated ideas clearly. Technical depth was adequate for most questions, though some answers lacked specific examples. Focus on providing more concrete metrics and outcomes in behavioral responses.",
    communicationScore: 78,
    technicalScore: 70,
    confidenceScore: 68,
    topStrengths: [
      "Clear and structured communication",
      "Good conceptual understanding of core topics",
      "Positive and engaged attitude throughout",
    ],
    topWeaknesses: [
      "Answers lacked specific metrics and outcomes",
      "System design depth needs improvement",
      "Could handle follow-up probing questions better",
    ],
    questionFeedback: qFeedback,
    practiceExercises: exercises,
  };
}
