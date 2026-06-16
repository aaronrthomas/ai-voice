import { NextRequest, NextResponse } from "next/server";
import { geminiFlash } from "@/lib/gemini";
import type { GenerateQuestionsRequest, Question } from "@/types";

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Tell me about yourself and your background in software development.",
    category: "Introduction",
    difficulty: "easy",
  },
  {
    id: "q2",
    text: "Describe a challenging technical problem you solved recently. Walk me through your approach.",
    category: "Problem Solving",
    difficulty: "medium",
  },
  {
    id: "q3",
    text: "How do you ensure code quality in a large team?",
    category: "Engineering Practices",
    difficulty: "medium",
  },
  {
    id: "q4",
    text: "What's your experience with system design? Can you describe how you would design a URL shortener?",
    category: "System Design",
    difficulty: "hard",
  },
  {
    id: "q5",
    text: "Where do you see yourself in 5 years and why is this role aligned with your goals?",
    category: "Career",
    difficulty: "easy",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await req.json();
    const { role, level, techStack, count } = body;

    if (!role || !level || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If no Gemini key, return mock questions
    if (!process.env.GEMINI_API_KEY) {
      const questions = MOCK_QUESTIONS.slice(0, count).map((q, i) => ({
        ...q,
        id: `q${i + 1}`,
      }));
      return NextResponse.json({ questions });
    }

    const techStackStr = techStack?.length > 0 ? techStack.join(", ") : "general software engineering";

    const prompt = `You are an expert technical interviewer at a top tech company.
Generate exactly ${count} interview questions for a ${level}-level ${role} position.
Tech stack focus: ${techStackStr}.

Requirements:
- Mix of behavioral, technical, and situational questions appropriate for ${level} level
- Questions should be open-ended and conversational (for voice interview)
- Vary difficulty: ~30% easy, ~50% medium, ~20% hard
- Categories should cover: Technical Skills, Problem Solving, System Design (if applicable), Behavioral, Career Growth

Return ONLY a JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "full question text here",
      "category": "category name",
      "difficulty": "easy" | "medium" | "hard",
      "followUps": ["optional follow-up 1", "optional follow-up 2"]
    }
  ]
}`;

    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    const questions: Question[] = (parsed.questions || []).slice(0, count).map(
      (q: Partial<Question> & { id?: string }, i: number) => ({
        id: q.id || `q${i + 1}`,
        text: q.text || "",
        category: q.category || "General",
        difficulty: q.difficulty || "medium",
        followUps: q.followUps || [],
      })
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", questions: MOCK_QUESTIONS },
      { status: 500 }
    );
  }
}
