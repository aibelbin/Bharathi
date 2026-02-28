import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import { ModelMessage, generateText, stepCountIs, tool, embed } from "ai";
import { groq } from '@ai-sdk/groq';
import { withSupermemory } from "@supermemory/tools/ai-sdk"
import { companyAgentPrompt, userAgentPrompt } from '@/lib/prompts';
import { trpc } from '@/trpc/server';
import z from 'zod';
import { inngest } from '@/inngest/client';

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

const LANGUAGE = 'ml-IN';
const SPEAKER = 'priya';

export async function POST(req: Request) {
  try {
    const companyId = req.headers.get("company-id");
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!companyId || !file) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const companyName = await trpc.agent.companyName({ id: companyId });
    const modelWithMemory = withSupermemory(groq("openai/gpt-oss-120b"), companyId, {
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
      checkUsage: tool({
        description: "Check the usage of the company",
        inputSchema: z.object({
          id: z.string().describe("The ID of the company.")
        }),
        execute: async ({ id }) => {
          return true;
        }
      }),
      postToSocialMedia: tool({
        description: "Post to social media",
        inputSchema: z.object({
          caption: z.string().describe("The breif description of the post to be posted on social media."),
        }),
        execute: async ({ caption }) => {
          inngest.send({
            name: "post-to-social-media",
            data: {
              companyId,
              caption
            }
          })
          return "Posted to social media";
        }
      }),
      // generatePoster: tool({
      //   description: "Generate a poster to post on the social media accounts.",
      //   inputSchema: z.object({
      //     description: z.string().describe("The description of the poster to generate.")
      //   }),
      //   execute: async ({ description }) => {
      //     const response = await fetch("http://13.200.207.204:8000/generate-poster", {
      //       method: "POST",
      //       body: JSON.stringify({
      //         company_prompt: description,
      //       })
      //     })
      //     return response.json();
      //   }
      // }),
      // facebookPost: tool({
      //   description: "Post to Facebook",
      //   inputSchema: z.object({
      //     caption: z.string().describe("The caption for the post."),
      //     mediaUrls: z.array(z.string()).describe("The URLs of the media to post."),
      //   }),
      //   execute: async ({ caption, mediaUrls }) => {
      //     const facebookAccessToken = await trpc.agent.getFacebookAccessToken({ id: companyId });
      //     if (!facebookAccessToken) {
      //       return "Facebook account/page is not connected";
      //     }
      //     const post = await facebook_createPost(facebookAccessToken, caption, mediaUrls);
      //     return "Posted successfully";
      //   }
      // }),
      // instagramPost: tool({
      //   description: "Post to Instagram",
      //   inputSchema: z.object({
      //     caption: z.string().describe("The caption for the post."),
      //     mediaUrls: z.array(z.string()).describe("The URLs of the media to post."),
      //   }),
      //   execute: async ({ caption, mediaUrls }) => {
      //     const instagramAccessToken = await trpc.agent.getInstagramAccessToken({ id: companyId });
      //     if (!instagramAccessToken) {
      //       return "Instagram account/page is not connected";
      //     }
      //     const post = await instagram_createPost(instagramAccessToken, caption, "IMAGE", mediaUrls);
      //     return "Posted successfully";
      //   }
      // })
    }

    const { text } = await generateText({
      model: modelWithMemory,
      system: companyAgentPrompt(companyName),
      prompt: response.transcript,
      stopWhen: stepCountIs(15),
      tools
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