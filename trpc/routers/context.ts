import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { context } from "@/db/schema";
import { eq } from "drizzle-orm";
const websiteInfoSchema = z.object({
    name: z.string(),
    description: z.string(),
    
});

export const websiteRouter = createTRPCRouter({
    analyze: protectedProcedure
        .input(z.object({ url: z.string().url() }))
        .mutation(async ({ input }) => {
            try {
                const websiteResponse = await fetch(input.url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)",
                    },
                });

                if (!websiteResponse.ok) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to fetch website",
                    });
                }

                const html = await websiteResponse.text();

                const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "system",
                                content: `You are a website analyzer system that extracts basic business identity information from HTML content.

Analyze the provided HTML and return a JSON object containing:

name: The company or portfolio name

description: A short 5-6 sentence description of what the company or portfolio does

Rules:

Use the <title>, <meta description>, header text, hero section, or about section to determine the information.

Prefer clear business names over generic words like "Home" or "Welcome".

The description must be concise and factual.

Do not invent information.

If information is missing, return an empty string.

Return only valid JSON.

No explanations.

No markdown.

No extra text.

Expected Output Format

{
"name": "Company Name",
"description": "Short description of the company or portfolio."
}`,
                            },
                            {
                                role: "user",
                                content: `Analyze this website (URL: ${input.url}) and extract information:\n\n${html.substring(0, 12000)}`,
                            },
                        ],
                        temperature: 0.3,
                        max_tokens: 1024,
                    }),
                });

                if (!aiResponse.ok) {
                    const errorText = await aiResponse.text();
                    console.error("API error:", aiResponse.status, errorText);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: `AI analysis failed: ${aiResponse.status}`,
                    });
                }

                const aiData = await aiResponse.json();
                const content = aiData.choices[0].message.content;

                let extractedInfo;
                try {
                    const cleanedContent = content
                        .replace(/```json\n?/g, "")
                        .replace(/```\n?/g, "")
                        .trim();
                    extractedInfo = JSON.parse(cleanedContent);
                } catch {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        extractedInfo = JSON.parse(jsonMatch[0]);
                    } else {
                        console.error("Failed to parse AI response:", content);
                        throw new Error("Failed to parse AI response as JSON");
                    }
                }

                return websiteInfoSchema.parse(extractedInfo);
            } catch (error) {
                console.error("Error analyzing website:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "Failed to analyze website",
                });
            }
        }),

    saveContext: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                deliverable: z.boolean(),
                deliveryPhone: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const companyId = ctx.auth!.user.id;

            const existing = await db
                .select()
                .from(context)
                .where(eq(context.companyId, companyId))
                .limit(1);

            if (existing.length > 0) {
                const updated = await db
                    .update(context)
                    .set({
                        companyName: input.name,
                        description: input.description,
                        isDeliverable: input.deliverable,
                        deliveryPhone: input.deliveryPhone ?? null,
                    })
                    .where(eq(context.companyId, companyId))
                    .returning();
                return updated[0];
            } else {
                const created = await db
                    .insert(context)
                    .values({
                        companyId,
                        companyName: input.name,
                        description: input.description,
                        isDeliverable: input.deliverable,
                        deliveryPhone: input.deliveryPhone ?? null,
                    })
                    .returning();
                return created[0];
            }
        }),

    getContext: protectedProcedure
        .query(async ({ ctx }) => {
            const companyId = ctx.auth!.user.id;

            const result = await db
                .select()
                .from(context)
                .where(eq(context.companyId, companyId))
                .limit(1);

            return result[0] ?? null;
        }),

    deleteContext: protectedProcedure
        .mutation(async ({ ctx }) => {
            const companyId = ctx.auth!.user.id;

            await db
                .delete(context)
                .where(eq(context.companyId, companyId));

            return { success: true };
        }),
});