interface FacebookClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface ShortToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface LongToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PageInfo {
  access_token: string;
  category: string;
  name: string;
  id: string;
  tasks?: string[];
}

interface PagesResponse {
  data: PageInfo[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

const API_VERSION = "v24.0";

export class FacebookClient {
  private config: FacebookClientConfig;

  constructor(config: FacebookClientConfig) {
    this.config = config;
  }

  /**
   * Generate the Facebook OAuth authorization URL
   * @see https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
   */
  async getAuthorizationUrl(state: string) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope?.join(",") || "",
      state: state || "",
    });
    return `https://www.facebook.com/${API_VERSION}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token, then get long-lived token
   * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
   */
  async exchangeCode(code: string) {
    // Step 1: Exchange code for short-lived user access token
    const tokenParams = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code: code,
    });

    const shortTokenResponse = await fetch(`https://graph.facebook.com/${API_VERSION}/oauth/access_token?${tokenParams.toString()}`);

    if (!shortTokenResponse.ok) {
      const error = await shortTokenResponse.text();
      throw new Error(`Short-lived token exchange failed: ${shortTokenResponse.status} - ${error}`);
    }

    const shortToken: ShortToken = await shortTokenResponse.json();

    // Step 2: Exchange for long-lived user token (60 days)
    const longTokenParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      fb_exchange_token: shortToken.access_token,
    });

    const longTokenResponse = await fetch(`https://graph.facebook.com/${API_VERSION}/oauth/access_token?${longTokenParams.toString()}`);

    if (!longTokenResponse.ok) {
      const error = await longTokenResponse.text();
      throw new Error(`Long-lived token exchange failed: ${longTokenResponse.status} - ${error}`);
    }

    const longToken: LongToken = await longTokenResponse.json();

    return {
      access_token: longToken.access_token,
      refresh_token: shortToken.access_token,
      expires_in: longToken.expires_in ?? 5183998,
      scope: this.config.scope?.join(",") || "",
    };
  }

  /**
   * Get user details from Facebook Graph API
   * @see https://developers.facebook.com/docs/graph-api/reference/user
   */
  async userDetails(accessToken: string) {
    const params = new URLSearchParams({
      fields: "id,name,email",
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/me?${params.toString()}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user details: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Get page details using a page access token
   * When called with a page token, /me returns the page's info
   */
  async pageDetails(pageAccessToken: string) {
    const params = new URLSearchParams({
      fields: "id,name,category",
      access_token: pageAccessToken,
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/me?${params.toString()}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get page details: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Get list of pages the user manages with their access tokens
   * Returns long-lived page access tokens
   * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived#get-a-long-lived-page-access-token
   */
  async getPages(accessToken: string): Promise<PagesResponse> {
    const params = new URLSearchParams({
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/me/accounts?${params.toString()}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get pages: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Retrieves a simplified list of Facebook Pages managed by the user.
   * Returns long-lived page access tokens
   * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived#get-a-long-lived-page-access-token
   */
  async getPagesList(accessToken: string): Promise<PageInfo[]> {
    const pages = await this.getPages(accessToken);
    return pages.data;
  }

  /**
   * Publish a text post to a Facebook Page
   * @see https://developers.facebook.com/docs/pages/publishing
   */
  async publishPost(
    pageAccessToken: string,
    pageId: string,
    options: {
      message?: string;
      link?: string;
      published?: boolean;
      scheduled_publish_time?: number;
    }
  ) {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
    });

    if (options.message) params.append("message", options.message);
    if (options.link) params.append("link", options.link);
    if (options.published !== undefined) params.append("published", String(options.published));
    if (options.scheduled_publish_time) {
      params.append("scheduled_publish_time", String(options.scheduled_publish_time));
    }

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${pageId}/feed?${params.toString()}`, { method: "POST" });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish post: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Publish a photo post to a Facebook Page
   * @see https://developers.facebook.com/docs/pages/publishing#publish-a-photo
   */
  async publishPhoto(
    pageAccessToken: string,
    pageId: string,
    options: {
      url: string;
      caption?: string;
      published?: boolean;
      scheduled_publish_time?: number;
    }
  ) {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      url: options.url,
    });

    if (options.caption) params.append("caption", options.caption);
    if (options.published !== undefined) params.append("published", String(options.published));
    if (options.scheduled_publish_time) {
      params.append("scheduled_publish_time", String(options.scheduled_publish_time));
    }

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${pageId}/photos?${params.toString()}`, { method: "POST" });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish photo: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Upload multiple photos without publishing (for multi-photo posts)
   * Returns array of photo IDs that can be attached to a post
   */
  async uploadUnpublishedPhotos(pageAccessToken: string, pageId: string, photoUrls: string[]): Promise<string[]> {
    const photoIds: string[] = [];

    for (const url of photoUrls) {
      const params = new URLSearchParams({
        access_token: pageAccessToken,
        url: url,
        published: "false",
      });

      const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${pageId}/photos?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload photo: ${response.status} - ${error}`);
      }

      const data = await response.json();
      photoIds.push(data.id);
    }

    return photoIds;
  }

  /**
   * Publish a post with multiple photos attached
   * First uploads photos as unpublished, then creates a post with attached media
   */
  async publishMultiPhotoPost(
    pageAccessToken: string,
    pageId: string,
    options: {
      message?: string;
      photoUrls: string[];
      published?: boolean;
      scheduled_publish_time?: number;
    }
  ) {
    // Upload photos as unpublished first
    const photoIds = await this.uploadUnpublishedPhotos(pageAccessToken, pageId, options.photoUrls);

    // Create post with attached photos
    const params = new URLSearchParams({
      access_token: pageAccessToken,
    });

    if (options.message) params.append("message", options.message);
    if (options.published !== undefined) params.append("published", String(options.published));
    if (options.scheduled_publish_time) {
      params.append("scheduled_publish_time", String(options.scheduled_publish_time));
    }

    // Attach each photo using attached_media format
    photoIds.forEach((photoId, index) => {
      params.append(`attached_media[${index}]`, JSON.stringify({ media_fbid: photoId }));
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${pageId}/feed?${params.toString()}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish multi-photo post: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Publish a video from a URL
   */
  async publishVideoFromUrl(
    pageAccessToken: string,
    pageId: string,
    options: {
      file_url: string;
      title?: string;
      description?: string;
      published?: boolean;
      scheduled_publish_time?: number;
    }
  ) {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      file_url: options.file_url,
    });

    if (options.title) params.append("title", options.title);
    if (options.description) params.append("description", options.description);
    if (options.published !== undefined) params.append("published", String(options.published));
    if (options.scheduled_publish_time) {
      params.append("scheduled_publish_time", String(options.scheduled_publish_time));
    }

    const response = await fetch(`https://graph-video.facebook.com/${API_VERSION}/${pageId}/videos?${params.toString()}`, { method: "POST" });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish video: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Get page insights/analytics
   * @see https://developers.facebook.com/docs/graph-api/reference/page/insights
   */
  async getPageInsights(pageAccessToken: string, pageId: string, metrics: string[], period: "day" | "week" | "days_28" | "month" | "lifetime" = "day") {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      metric: metrics.join(","),
      period: period,
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${pageId}/insights?${params.toString()}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get page insights: ${response.status} - ${error}`);
    }
    return response.json();
  }

  /**
   * Delete a post from a Facebook Page
   */
  async deletePost(pageAccessToken: string, postId: string) {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
    });

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${postId}?${params.toString()}`, { method: "DELETE" });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete post: ${response.status} - ${error}`);
    }
    return response.json();
  }
}