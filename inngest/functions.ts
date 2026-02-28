import { trpc } from "@/trpc/server";
import { inngest } from "./client";
import { facebook_createPost } from "@/platform/facebook/core";
import { instagram_createPost } from "@/platform/instagram/core";

export const postToSocialMedia = inngest.createFunction(
  { id: "post-to-social-media" },
  { event: "post-to-social-media" },
  async ({ event, step }) => {
    const { companyId, caption } = event.data;
    const poster = await step.run("generate-poster", async () => {
      const response = await fetch("http://13.200.207.204:8000/generate-poster", {
        method: "POST",
        body: JSON.stringify({
          company_prompt: caption,
        })
      })
      return response.json();
    });
    const mediaUrls = [poster.url];
    await step.run("post-to-facebook", async () => {
      const facebookAccessToken = await trpc.agent.getFacebookAccessToken({ id: companyId });
      if (!facebookAccessToken) {
        return "Facebook account/page is not connected";
      }
      const post = await facebook_createPost(facebookAccessToken, caption, mediaUrls);
      return "Posted on facebook";
    });
    await step.run("post-to-instagram", async () => {
      const instagramAccessToken = await trpc.agent.getInstagramAccessToken({ id: companyId });
      if (!instagramAccessToken) {
        return "Instagram account/page is not connected";
      }
      const post = await instagram_createPost(instagramAccessToken, caption, "IMAGE", mediaUrls);
      return "Posted on instagram";
    });
    return "Posted successfully";
  },
);

export const functions = [postToSocialMedia];