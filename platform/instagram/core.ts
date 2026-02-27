import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { detectMediaType } from "@/lib/media-type";
import { InstagramClient } from "./graphapi";

type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL" | "REELS" | "STORIES";

const instagramClient = new InstagramClient({
  clientId: process.env.INSTAGRAM_CLIENT_ID as string,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
  redirectUri: new URL("/api/platform/instagram/callback", process.env.NEXT_PUBLIC_URL).toString(),
  scope: [
    "instagram_business_basic",
    "instagram_business_content_publish",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_manage_insights",
  ],
});

export async function instagram_generateAuthUrl(userId: string) {
  const state = nanoid();
  await redis.set(state, userId, { ex: 300 });

  const authUrl = await instagramClient.getAuthorizationUrl(state);
  return authUrl;
}

export async function instagram_getAccessToken(code: string) {
  const tokenDetails = await instagramClient.exchangeCode(code);
  return tokenDetails;
}

export async function instagram_getProfile(accessToken: string) {
  const data = await instagramClient.userDetails(accessToken);
  return data;
}

export async function instagram_getUserId(accessToken: string) {
  const data = await instagramClient.userDetails(accessToken);
  return data.id;
}

export async function instagram_createPost(accessToken: string, caption: string, mediaType: MediaType, mediaUrls: string[]) {
  const igUserId = await instagram_getUserId(accessToken);
  const params = new URLSearchParams();
  const containerIds = [];
  let containerResponse;
  let options: Record<string, string>[];

  switch (mediaType) {
    // Single image post
    case "IMAGE":
      options = [];
      options.push({ key: "media_type", value: "IMAGE" });
      options.push({ key: "caption", value: caption });
      options.push({ key: "image_url", value: mediaUrls[0] });
      options.push({ key: "is_carousel_item", value: "false" });
      containerResponse = await instagramClient.createMediaContainer(accessToken, igUserId, options);
      containerIds.push(containerResponse.id);
      params.append("creation_id", containerResponse.id);
      break;
    // Maybe removed in future
    // case 'VIDEO':
    //   options = []
    //   options.push({ key: 'media_type', value: 'VIDEO' });
    //   options.push({ key: 'caption', value: caption });
    //   options.push({ key: 'video_url', value: mediaUrls[0] });
    //   options.push({ key: 'is_carousel_item', value: 'false' });
    //   containerResponse = await createMediaContainer(accessToken, igUserId, options);
    //   containerIds.push(containerResponse.id);
    //   params.append('creation_id', containerResponse.id);
    //   break;
    // Carousel post (multiple images/videos)
    case "CAROUSEL":
      let max_items = 10;
      const containers = [];
      for (const mediaUrl of mediaUrls) {
        const itemsOptions = [];
        const itemType = (await detectMediaType(mediaUrl)) === "IMAGE" ? "IMAGE" : "VIDEO";
        itemsOptions.push({ key: "media_type", value: itemType });
        itemsOptions.push({ key: "is_carousel_item", value: "true" });
        itemsOptions.push({ key: itemType === "IMAGE" ? "image_url" : "video_url", value: mediaUrl });
        const itemContainerResponse = await instagramClient.createMediaContainer(accessToken, igUserId, itemsOptions);
        containerIds.push(itemContainerResponse.id);
        containers.push(itemContainerResponse.id);
        max_items--;
        if (max_items === 0) break;
      }
      options = [];
      options.push({ key: "media_type", value: "CAROUSEL" });
      options.push({ key: "caption", value: caption });
      options.push({ key: "children", value: JSON.stringify(containers) });
      containerResponse = await instagramClient.createMediaContainer(accessToken, igUserId, options);
      containerIds.push(containerResponse.id);
      params.append("creation_id", containerResponse.id);
      break;
    // Reels post (video)
    case "REELS":
      options = [];
      options.push({ key: "media_type", value: "REELS" });
      options.push({ key: "caption", value: caption });
      options.push({ key: "video_url", value: mediaUrls[0] });
      options.push({ key: "share_to_feed", value: "true" });
      containerResponse = await instagramClient.createMediaContainer(accessToken, igUserId, options);
      containerIds.push(containerResponse.id);
      params.append("creation_id", containerResponse.id);
      break;
    // Maybe removed in future
    // case 'STORIES':
    //   options = []
    //   options.push({ key: 'caption', value: caption });
    //   options.push({ key: 'image_url', value: mediaUrls[0] });
    //   options.push({ key: 'video_url', value: mediaUrls[0] });
    //   containerResponse = await createMediaContainer(accessToken, igUserId, 'STORIES', options);
    //   containers.push(containerResponse.id);
    //   break;
    default:
      throw new Error("Invalid media type");
  }

  // Wait for all containers to finish processing
  for (const containerId of containerIds) {
    await instagramClient.waitForContainer(accessToken, containerId);
  }

  // Publish the media
  return await instagramClient.publishMediaContainer(accessToken, igUserId, params);
}