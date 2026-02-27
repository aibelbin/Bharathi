import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import { ModelMessage, generateText, stepCountIs, tool, embed } from "ai";
import { groq } from '@ai-sdk/groq';
import { withSupermemory } from "@supermemory/tools/ai-sdk"
import { userAgentPrompt } from '@/lib/prompts';
import { trpc } from '@/trpc/server';
import { langfuseSpanProcessor } from '@/instrumentation';

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

const LANGUAGE = 'ml-IN';
const SPEAKER = 'priya';

export async function POST(req: Request) {
  try {
    const companyId = req.headers.get("company-id");
    const userId = req.headers.get("user-id");
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!companyId || !userId || !file) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const companyDetails = await trpc.agent.companyDetails({ id: companyId });
    const modelWithMemory = withSupermemory(groq("openai/gpt-oss-120b"), `${companyId}:${userId}`, {
      addMemory: "always",
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const audioFile = new File([buffer], 'recording.wav', { type: 'audio/wav' });

    const response = await client.speechToText.transcribe({
      file: audioFile,
      model: 'saaras:v3',
      mode: 'translate',
    });

    const { text, usage } = await generateText({
      model: modelWithMemory,
      system: userAgentPrompt(companyDetails.name, companyDetails.context),
      prompt: response.transcript,
      stopWhen: stepCountIs(15),
      experimental_telemetry: { isEnabled: true },
    });

    // --- Cost estimation ---
    // Groq pricing per token (USD) — adjust if your model changes
    const INPUT_COST_PER_TOKEN = 0.0000012;   // $1.20 per 1M input tokens
    const OUTPUT_COST_PER_TOKEN = 0.0000012;  // $1.20 per 1M output tokens

    // Debug: log raw usage to see what the model returns
    console.log('Raw usage:', JSON.stringify(usage, null, 2));

    const inputTokens = usage?.inputTokens ?? 0;
    const outputTokens = usage?.outputTokens ?? 0;
    const totalCost =
      inputTokens * INPUT_COST_PER_TOKEN +
      outputTokens * OUTPUT_COST_PER_TOKEN;
 
    console.log(text);
    console.log(`Cost: $${totalCost.toFixed(6)} (in: ${inputTokens}, out: ${outputTokens})`);

    let translation;
    try {
      translation = await client.text.translate({
        input: text,
        source_language_code: 'auto',
        target_language_code: LANGUAGE,
      });
    } catch (e) {
      console.error('Sarvam translate error:', e);
      throw e;
    }

    let audioResponse;
    try {
      audioResponse = await client.textToSpeech.convert({
        text: translation.translated_text,
        target_language_code: LANGUAGE,
        speaker: SPEAKER,
        model: 'bulbul:v3',
      });
    } catch (e) {
      console.error('Sarvam TTS error:', e);
      throw e;
    }

    const audioBase64 = audioResponse.audios[0];

    if (!audioBase64) {
      return NextResponse.json({ error: 'TTS returned no audio' }, { status: 500 });
    }

    // Flush Langfuse traces before the serverless function terminates
    after(async () => await langfuseSpanProcessor.forceFlush());

    return NextResponse.json({
      transcript: response.transcript,
      languageCode: response.language_code,
      response: text,
      audio: audioBase64,
      cost: {
        inputTokens,
        outputTokens,
        totalCost,
      },
    });

  } catch (error: unknown) {
    console.error('Agent route error:', error);
    const message = error instanceof Error ? error.message : 'Speech-to-text failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}