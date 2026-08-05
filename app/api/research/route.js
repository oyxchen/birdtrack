import { NextResponse } from "next/server";

const DEFAULT_RESEARCH_MODEL = "google/gemma-4-26b-a4b-it:free";
const configuredModel = process.env.OPENROUTER_MODEL;
const researchModel = configuredModel && configuredModel !== "openrouter/free"
  ? configuredModel
  : DEFAULT_RESEARCH_MODEL;

export async function POST(request) {
  const { question = "" } = await request.json();
  if (!question.trim() || question.length > 500) return NextResponse.json({ error: "Please enter a shorter question." }, { status: 400 });

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3001",
          "X-OpenRouter-Title": "BirdTrack"
        },
        body: JSON.stringify({
          model: researchModel,
          messages: [
            {
              role: "system",
              content: "You are BirdTrack Research, a careful and knowledgeable bird educator. Answer ANY genuinely bird-related question, including questions that mention only a species name without the words bird or avian. Covered topics include identification; differences between sexes, ages, seasons, and similar species; plumage and molt; sounds; anatomy and physiology; behavior; nesting and reproduction; diet; migration; habitats and ranges; taxonomy; evolution; conservation; bird health; birdwatching; photography; gardening for birds; cultural history; and questions about particular wild or domestic birds. Politely refuse only questions that truly have no connection to birds. Use clear language suitable for a general audience. Give a useful direct answer, usually in 2–5 short paragraphs. You do not have live web access. Never invent statistics, sources, links, or current facts; state uncertainty when necessary."
            },
            { role: "user", content: question }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });
      if (response.ok) {
        const data = await response.json();
        const message = data.choices?.[0]?.message;
        const answer = message?.content?.trim() || "";
        if (!answer || /^(?:user safety:\s*)?(?:safe|unsafe)$/i.test(answer)) {
          return NextResponse.json({
            answer: "The research model returned an incomplete response. Please try the question again.",
            sources: []
          }, { status: 502 });
        }
        return NextResponse.json({
          answer,
          sources: [],
          model: data.model || researchModel
        });
      }
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({
        answer: error.error?.message || "The free OpenRouter model is temporarily unavailable. Please try again shortly.",
        sources: []
      }, { status: response.status });
    } catch {
      return NextResponse.json({ answer: "Bird Research couldn’t reach OpenRouter. Please try again.", sources: [] }, { status: 502 });
    }
  }

  const samples = [
    { pattern: /(?:male|female).*(?:dark[- ]eyed )?junco|(?:dark[- ]eyed )?junco.*(?:male|female)/i, answer: "Male and female Dark-eyed Juncos overlap a lot, so sex is not always certain from appearance alone. In many populations, adult males tend to have darker, more sharply defined hoods and backs, while females often look browner or grayer with softer contrast; age, region, lighting, and the junco’s form can change those clues." },
    { pattern: /flamingo|pink/i, answer: "Flamingos turn pink because of pigments called carotenoids in the algae and small crustaceans they eat. Young flamingos are gray or white, and their feathers gradually become pink as those pigments build up." },
    { pattern: /migrat/i, answer: "Birds migrate to reach places with more food, safer nesting habitat, or warmer seasonal weather. They navigate using landmarks, the Sun and stars, Earth’s magnetic field, and even smells." },
    { pattern: /owl.*eat|eat.*owl/i, answer: "Most owls eat small animals such as mice, voles, insects, frogs, and sometimes other birds. Their quiet flight and excellent hearing help them find and catch prey, often at night." },
    { pattern: /sing/i, answer: "Birds sing mainly to claim a territory and attract a mate. They also use shorter calls to warn others, stay in contact with their flock, and communicate with their young." }
  ];
  const match = samples.find((s) => s.pattern.test(question));
  return NextResponse.json({
    answer: match?.answer || "That is a valid bird-research question. Add an OpenRouter API key to enable answers for the complete range of bird topics.",
    sources: [],
    setupRequired: true
  });
}
