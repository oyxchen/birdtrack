import { NextResponse } from "next/server";

const birdWords = /\b(birds?|avian|ornithology|birding|eagles?|owls?|hawks?|sparrows?|finches?|ducks?|geese|penguins?|flamingos?|parrots?|crows?|ravens?|robins?|cardinals?|pelicans?|stilts?|chickens?|turkeys?|pigeons?|doves?|nests?|feathers?|beaks?|wings?|migration|endangered)\b/i;

export async function POST(request) {
  const { question = "" } = await request.json();
  if (!question.trim() || question.length > 500) return NextResponse.json({ error: "Please enter a shorter question." }, { status: 400 });
  if (!process.env.OPENROUTER_API_KEY && !birdWords.test(question)) return NextResponse.json({ answer: "I can only help with questions about birds. Try asking about a species, migration, feathers, nests, or bird behavior.", sources: [] });

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
          model: process.env.OPENROUTER_MODEL || "openrouter/free",
          messages: [
            {
              role: "system",
              content: "You are BirdTrack Research, a careful bird educator. Answer only questions about birds, birding, ornithology, habitats, migration, conservation, anatomy, or behavior. Politely refuse unrelated questions. Use simple language suitable for a general audience. Give a direct answer in 2–4 sentences. You do not have live web access. Never invent statistics, sources, links, or current facts; state uncertainty and knowledge limitations when necessary."
            },
            { role: "user", content: question }
          ],
          max_tokens: 350,
          temperature: 0.3
        })
      });
      if (response.ok) {
        const data = await response.json();
        const message = data.choices?.[0]?.message;
        return NextResponse.json({
          answer: message?.content || "I couldn’t form an answer.",
          sources: [],
          model: data.model || process.env.OPENROUTER_MODEL || "openrouter/free"
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
    { pattern: /flamingo|pink/i, answer: "Flamingos turn pink because of pigments called carotenoids in the algae and small crustaceans they eat. Young flamingos are gray or white, and their feathers gradually become pink as those pigments build up." },
    { pattern: /migrat/i, answer: "Birds migrate to reach places with more food, safer nesting habitat, or warmer seasonal weather. They navigate using landmarks, the Sun and stars, Earth’s magnetic field, and even smells." },
    { pattern: /owl.*eat|eat.*owl/i, answer: "Most owls eat small animals such as mice, voles, insects, frogs, and sometimes other birds. Their quiet flight and excellent hearing help them find and catch prey, often at night." },
    { pattern: /sing/i, answer: "Birds sing mainly to claim a territory and attract a mate. They also use shorter calls to warn others, stay in contact with their flock, and communicate with their young." }
  ];
  const match = samples.find((s) => s.pattern.test(question));
  return NextResponse.json({
    answer: match?.answer || "That’s a wonderful bird question. Add an OpenRouter API key to enable the free Bird Research model.",
    sources: [],
    setupRequired: true
  });
}
