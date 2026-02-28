import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import { ModelMessage, generateText, stepCountIs, tool, embed } from "ai";
import { groq } from '@ai-sdk/groq';
import { withSupermemory } from "@supermemory/tools/ai-sdk"
import { bharathiAgentPrompt } from '@/lib/prompts';
import { trpc } from '@/trpc/server';
import z from 'zod';

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

const LANGUAGE = 'ml-IN';
const SPEAKER = 'priya';

const tools = {
  createCompany: tool({
    description: "Create a new company",
    inputSchema: z.object({
      name: z.string().describe("The name of the company"),
      description: z.string().describe("The description of the company"),
    }),
    execute: async ({ name, description }) => {
      const company = await trpc.agent.createCompany({ name, description });
      return company;
    }
  })
}

export async function POST(req: Request) {
  try {
    const visitorId = req.headers.get("visitor-id");
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!visitorId || !file) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const modelWithMemory = withSupermemory(groq("openai/gpt-oss-120b"), visitorId, {
      addMemory: "always",
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const audioFile = new File([buffer], 'recording.wav', { type: 'audio/wav' });

    const response = await client.speechToText.transcribe({
      file: audioFile,
      model: 'saaras:v3',
      mode: 'translate',
    });

    const { text } = await generateText({
      model: modelWithMemory,
      system: bharathiAgentPrompt(),
      prompt: response.transcript,
      stopWhen: stepCountIs(15),
      tools,
    });

    console.log(text);

    const translation = await client.text.translate({
      input: text,
      source_language_code: 'auto',
      target_language_code: LANGUAGE,
    });

    const audioResponse = await client.textToSpeech.convert({
      text: translation.translated_text,
      target_language_code: LANGUAGE,
      speaker: SPEAKER,
      model: 'bulbul:v3',
    });

    const audioBase64 = audioResponse.audios[0];

    if (!audioBase64) {
      return NextResponse.json({ error: 'TTS returned no audio' }, { status: 500 });
    }

    return NextResponse.json({
      transcript: response.transcript,
      languageCode: response.language_code,
      response: text,
      audio: audioBase64
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Speech-to-text failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}