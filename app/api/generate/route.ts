import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const client = new Anthropic();

function loadDesignContext() {
  const base = join(process.cwd(), ".claude/skills/ui-ux-pro-max/data");
  const styles = readFileSync(join(base, "styles.csv"), "utf-8")
    .split("\n")
    .slice(0, 10) // top 10 styles for context
    .join("\n");
  const colors = readFileSync(join(base, "colors.csv"), "utf-8")
    .split("\n")
    .slice(0, 15)
    .join("\n");
  const typography = readFileSync(join(base, "typography.csv"), "utf-8")
    .split("\n")
    .slice(0, 10)
    .join("\n");
  return { styles, colors, typography };
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const { styles, colors, typography } = loadDesignContext();

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
    model: "claude-opus-4-6",
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
