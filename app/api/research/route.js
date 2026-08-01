import { NextResponse } from "next/server";

const birdWords = /\b(bird|birds|avian|eagle|owl|hawk|sparrow|finch|duck|goose|penguin|flamingo|parrot|crow|raven|robin|chicken|turkey|pigeon|dove|nest|feather|beak|wing|migration|endangered)\b/i;

export async function POST(request) {
  const { question = "" } = await request.json();
  if (!question.trim() || question.length > 500) return NextResponse.json({ error: "Please enter a shorter question." }, { status: 400 });
  if (!birdWords.test(question)) return NextResponse.json({ answer: "I can only help with questions about birds. Try asking about a species, migration, feathers, nests, or bird behavior.", sources: [] });

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5.6-terra",
          tools: [{ type: "web_search" }],
          input: `Answer this bird-related question for a general audience in 2-4 clear sentences. Only answer bird questions. Include accurate current facts: ${question}`
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.output?.flatMap((o) => o.content || []).find((c) => c.type === "output_text");
        const citations = text?.annotations?.filter((a) => a.type === "url_citation").map((a) => ({ title: a.title || "Source", url: a.url })) || [];
        return NextResponse.json({ answer: text?.text || "I couldn’t form an answer.", sources: citations });
      }
    } catch {}
  }

  const samples = [
    { pattern: /flamingo|pink/i, answer: "Flamingos turn pink because of pigments called carotenoids in the algae and small crustaceans they eat. Young flamingos are gray or white, and their feathers gradually become pink as those pigments build up." },
    { pattern: /migrat/i, answer: "Birds migrate to reach places with more food, safer nesting habitat, or warmer seasonal weather. They navigate using landmarks, the Sun and stars, Earth’s magnetic field, and even smells." },
    { pattern: /owl.*eat|eat.*owl/i, answer: "Most owls eat small animals such as mice, voles, insects, frogs, and sometimes other birds. Their quiet flight and excellent hearing help them find and catch prey, often at night." },
    { pattern: /sing/i, answer: "Birds sing mainly to claim a territory and attract a mate. They also use shorter calls to warn others, stay in contact with their flock, and communicate with their young." }
  ];
  const match = samples.find((s) => s.pattern.test(question));
  return NextResponse.json({ answer: match?.answer || "That’s a wonderful bird question. Connect an OpenAI API key to receive a current, web-researched answer with citations.", sources: [] });
}
