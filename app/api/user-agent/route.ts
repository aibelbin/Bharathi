import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import { ModelMessage, generateText, stepCountIs, tool, embed } from "ai";
import { groq } from '@ai-sdk/groq';
import { withSupermemory } from "@supermemory/tools/ai-sdk"
import { userCompanyAgentPrompt } from '@/lib/prompts';
import { trpc } from '@/trpc/server';
import { langfuseSpanProcessor } from '@/instrumentation';
import { db } from '@/db';
import z from 'zod';
import { company } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const tools = {
      ragRetrieve: tool({
        description: "Retrieve information from the company's knowledge base.",
        inputSchema: z.object({
          query: z.string().describe("The query to retrieve information about."),
        }),
        execute: async ({ query }) => {
          console.log("calling tool...", query);
          try {
            const context = await trpc.agent.embedding({ content: query });
            console.log("context", context);
            return context;
          } catch (error) {
            console.error("embedding tool error:", error);
            return "Error retrieving context: " + (error instanceof Error ? error.message : String(error));
          }
        }
      }),
      initOrder: tool({
        description: "Initialize an order for the user",
        inputSchema: z.object({
          items: z.array(z.object({
            name: z.string().describe("The name of the item."),
            quantity: z.number().describe("The quantity of the item."),
          })).describe("The items to be ordered."),
          totalPrice: z.number().describe("The total price of the order."),
          address: z.string().describe("The address to deliver the order."),
        }),
        execute: async ({ items, address, totalPrice }) => {
          const companyDetails = await trpc.agent.companyDetails({ id: companyId });
          const customerDetails = await trpc.agent.callerDetails({ id: userId });
          await trpc.caller.callDelivery({
            isDeliverable: companyDetails.isDeliverable!,
            deliveryPhone: companyDetails.deliveryPhone!,
            companyPhone: companyDetails.phone!,
            customerPhone: customerDetails.phone!,
            customerName: customerDetails.name!,
            address: address,
            price: totalPrice,
            items: items,
          })
          return "Order initiated.";
        }
      }),
      alert: tool({
        description: "Send an alert to the company dashboard. Only use this tool for sending important updates/queries related to the user. Example: Starting a new order, raising an issue or ticket, etc.",
        inputSchema: z.object({
          message: z.string().describe("The alert message or query to be sent to the company dashboard."),
        }),
        execute: async ({ message }) => {
          await trpc.agent.pushMessage({
            userId: userId,
            companyId: companyId,
            message: message,
          });
          return "Alert message sent to company dashboard.";
        }
      })
    }

    const { text, usage } = await generateText({
      model: modelWithMemory,
      system: userCompanyAgentPrompt(companyDetails.name, companyDetails.context),
      prompt: response.transcript,
      stopWhen: stepCountIs(15),
      experimental_telemetry: { isEnabled: true },
      tools,
    });

    // --- Cost estimation ---
    // Groq pricing per token (USD) — adjust if your model changes
    const INPUT_COST_PER_TOKEN = 0.0000012 * 91;   // $1.20 per 1M input tokens
    const OUTPUT_COST_PER_TOKEN = 0.0000012 * 91;  // $1.20 per 1M output tokens

    const inputTokens = usage?.inputTokens ?? 0;
    const outputTokens = usage?.outputTokens ?? 0;
    const totalCost =
      inputTokens * INPUT_COST_PER_TOKEN +
      outputTokens * OUTPUT_COST_PER_TOKEN;
    const totalToken = inputTokens + outputTokens;

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

    // Flush Langfuse traces and update DB cost after the response is sent
    after(async () => {
      await langfuseSpanProcessor.forceFlush();
      const existingData = await db.select().from(company).where(eq(company.id, companyId));
      if (existingData.length) {
        await db.update(company).set({
          cost: (Number(existingData[0].cost!) + totalCost).toString(),
          totalToken: (Number(existingData[0].totalToken!) + totalToken).toString()
        }).where(eq(company.id, companyId));
      }
    });

    return NextResponse.json({
      transcript: response.transcript,
      languageCode: response.language_code,
      response: text,
      audio: audioBase64,
      cost: {
        inputTokens,
        outputTokens,
        totalCost,
        totalToken
      },
    });
  } catch (error: unknown) {
    console.error('User-agent route error:', error);
    const message = error instanceof Error ? error.message : 'Speech-to-text failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}