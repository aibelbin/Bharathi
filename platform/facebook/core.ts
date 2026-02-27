import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { detectMediaType } from "@/lib/media-type";
import { FacebookClient } from "./graphapi";

const facebookClient = new FacebookClient({
  clientId: process.env.FACEBOOK_CLIENT_ID as string,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
  redirectUri: new URL("/api/platform/facebook/callback", process.env.NEXT_PUBLIC_URL).toString(),
  scope: ["pages_manage_posts", "pages_manage_engagement", "pages_manage_metadata", "pages_show_list", "pages_read_engagement", "pages_read_user_content"],
});

export async function facebook_generateAuthUrl(userId: string) {
  const state = nanoid();
  await redis.set(state, userId, { ex: 300 });

  const authUrl = await facebookClient.getAuthorizationUrl(state);
  return authUrl;
}

export async function facebook_getAccessToken(code: string) {
  const token = await facebookClient.exchangeCode(code);
  const pages = await facebookClient.getPagesList(token.access_token);
  return { token, pages };
}

export async function facebook_getProfile(accessToken: string) {
  const user = await facebookClient.userDetails(accessToken);
  return user;
}

export async function facebook_getPageId(pageAccessToken: string) {
  const page = await facebookClient.pageDetails(pageAccessToken);
  return page.id;
}

export async function facebook_createPost(pageAccessToken: string, caption: string, mediaUrls: string[] = []) {
  const pageId = await facebook_getPageId(pageAccessToken);

  // Text only post
  if (mediaUrls.length === 0) {
    return await facebookClient.publishPost(pageAccessToken, pageId, {
      message: caption,
    });
  }

  // Single media post
  if (mediaUrls.length === 1) {
    const mediaType = await detectMediaType(mediaUrls[0]);

    if (mediaType === "VIDEO") {
      return await facebookClient.publishVideoFromUrl(pageAccessToken, pageId, {
        file_url: mediaUrls[0],
        description: caption,
      });
    } else {
      return await facebookClient.publishPhoto(pageAccessToken, pageId, {
        url: mediaUrls[0],
        caption: caption,
      });
    }
  }

  // Multiple media post
  const mediaTypes = await Promise.all(mediaUrls.map((url) => detectMediaType(url)));

  // Filter out videos, keep only images (Facebook doesn't support mixed media)
  const imageUrls = mediaUrls.filter((_, index) => mediaTypes[index] === "IMAGE");

  // If no images remain, post the first video
  if (imageUrls.length === 0) {
    return await facebookClient.publishVideoFromUrl(pageAccessToken, pageId, {
      file_url: mediaUrls[0],
      description: caption,
    });
  }

  // Multi-photo post (images only)
  return await facebookClient.publishMultiPhotoPost(pageAccessToken, pageId, {
    message: caption,
    photoUrls: imageUrls.slice(0, 10),
  });
}