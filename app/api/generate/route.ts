import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// Template keyword matching for demo mode
const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  "dog-grooming": ["dog", "pet", "grooming", "puppy", "paw", "animal", "vet"],
  photographer: [
    "photo",
    "portfolio",
    "dark",
    "minimal",
    "camera",
    "gallery",
    "art",
  ],
  bakery: [
    "bakery",
    "bake",
    "cake",
    "bread",
    "pastry",
    "cozy",
    "warm",
    "coffee",
    "cafe",
  ],
  "saas-dashboard": [
    "saas",
    "dashboard",
    "project",
    "management",
    "tool",
    "app",
    "startup",
    "software",
    "tech",
  ],
  pizza: [
    "pizza",
    "restaurant",
    "food",
    "italian",
    "bold",
    "red",
    "appetizing",
    "burger",
    "grill",
  ],
};

function findBestTemplate(prompt: string): string {
  const lower = prompt.toLowerCase();
  let bestMatch = "";
  let bestScore = 0;

  for (const [template, keywords] of Object.entries(TEMPLATE_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  // Fallback to a random template if no keywords matched
  if (!bestMatch) {
    const templates = Object.keys(TEMPLATE_KEYWORDS);
    bestMatch = templates[Math.floor(Math.random() * templates.length)];
  }

  return bestMatch;
}

function loadTemplate(name: string): string {
  const templatePath = join(
    process.cwd(),
    "app/templates",
    `${name}.html`
  );
  return readFileSync(templatePath, "utf-8");
}

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  let offset = 0;
  const chunkSize = 80; // characters per chunk — simulates typing

  const readable = new ReadableStream({
    pull(controller) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (offset >= text.length) {
            controller.close();
          } else {
            const end = Math.min(offset + chunkSize, text.length);
            controller.enqueue(encoder.encode(text.slice(offset, end)));
            offset = end;
          }
          resolve();
        }, 15); // 15ms per chunk = smooth streaming feel
      });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If API key is set and looks real, use Claude AI
  if (apiKey && !apiKey.includes("PASTE_YOUR_KEY_HERE")) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const base = join(process.cwd(), ".claude/skills/ui-ux-pro-max/data");
    const styles = readFileSync(join(base, "styles.csv"), "utf-8")
      .split("\n")
      .slice(0, 10)
      .join("\n");
    const colors = readFileSync(join(base, "colors.csv"), "utf-8")
      .split("\n")
      .slice(0, 15)
      .join("\n");
    const typography = readFileSync(join(base, "typography.csv"), "utf-8")
      .split("\n")
      .slice(0, 10)
      .join("\n");

    const systemPrompt = `You are an expert web designer and developer. Generate a complete, beautiful, single-file HTML website based on the user's description.

You have access to these design resources to inform your choices:

STYLES (top options):
${styles}

COLOR PALETTES (by product type):
${colors}

TYPOGRAPHY PAIRINGS:
${typography}

Rules:
- Output ONLY raw HTML — no markdown, no code fences, no explanation
- Include all CSS inline in a <style> tag in the <head>
- Include Google Fonts @import for the chosen font pairing
- Use Tailwind CSS via CDN for utility classes
- Make it fully responsive (mobile-friendly)
- Use real, specific content matching the user's description (not Lorem Ipsum)
- Include at least: a hero section, a features/services section, and a footer
- Pick the most appropriate style, colors, and fonts from the design data above
- Add subtle CSS animations (fade-in, hover effects) using keyframes
- The result must look professional and modern`;

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Build a website for: ${prompt}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  // Demo mode — serve a matching template with a streaming effect
  const templateName = findBestTemplate(prompt);
  const html = loadTemplate(templateName);
  return streamText(html);
}
