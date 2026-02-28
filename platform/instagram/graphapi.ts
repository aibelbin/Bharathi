interface InstagramClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface ShortToken {
  access_token: string;
  user_id: string;
  permissions: string[];
}

interface LongToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

const API_VERSION = "v24.0";

export class InstagramClient {
  private config: InstagramClientConfig;

  constructor(config: InstagramClientConfig) {
    this.config = config;
  }

  /**
   * Generate the Instagram OAuth authorization URL
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
   */
  async getAuthorizationUrl(state: string) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope?.join(",") || "",
      state: state || "",
    });
    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token, then get long-lived token
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login#step-2--exchange-the-code-for-a-token
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login#long-lived-tokens
   */
  async exchangeCode(code: string) {
    // Step 1: Get short-lived token
    const formData = new FormData();
    formData.append("client_id", this.config.clientId);
    formData.append("client_secret", this.config.clientSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", this.config.redirectUri);
    formData.append("code", code);

    const shortTokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: formData,
    });

    if (!shortTokenResponse.ok) {
      throw new Error(`Short-lived token exchange failed: ${shortTokenResponse.status}`);
    }

    const shortToken: ShortToken = await shortTokenResponse.json();
    const scope = shortToken.permissions.join(",");

    // Step 2: Exchange for long-lived (60 days)
    const params = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: this.config.clientSecret,
      access_token: shortToken.access_token,
    });

    const longTokenResponse = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
    if (!longTokenResponse.ok) {
      throw new Error(`Long-lived token exchange failed: ${longTokenResponse.status}`);
    }
    const longToken: LongToken = await longTokenResponse.json();

    return { access_token: longToken.access_token, refresh_token: shortToken.access_token, expires_in: longToken.expires_in, scope };
  }

  /**
   * Get user details from Instagram Graph API
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started#get-user-profile
   */
  async userDetails(accessToken: string) {
    const params = new URLSearchParams({
      fields: "user_id,username,account_type",
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.instagram.com/${API_VERSION}/me?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to get user details: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  /**
   * Create a media container for publishing content
   * Use this endpoint to create a media container for images, videos, carousels, reels, and stories
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing#step-1-of-2--create-a-container
   */
  async createMediaContainer(accessToken: string, igUserId: string, options: Record<string, string>[]) {
    const params = new URLSearchParams({ access_token: accessToken });
    for (const option of options) {
      params.append(option.key, option.value);
    }
    const response = await fetch(`https://graph.instagram.com/${API_VERSION}/${igUserId}/media?${params.toString()}`, { method: "POST" });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  /**
   * Check the status of a media container
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing#check-container-status
   */
  private async containerStatus(accessToken: string, containerId: string) {
    const response = await fetch(`https://graph.instagram.com/${API_VERSION}/${containerId}?fields=status_code&access_token=${accessToken}`);
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.status_code;
  }

  /**
   * Wait for a media container to finish processing
   * Polls the container status until it's ready for publishing or an error occurs
   * Status codes: IN_PROGRESS, FINISHED, ERROR, EXPIRED, PUBLISHED
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing#check-container-status
   */
  async waitForContainer(accessToken: string, containerId: string, maxRetries = 10): Promise<string> {
    const status_code = await this.containerStatus(accessToken, containerId);
    if (status_code === "IN_PROGRESS" && maxRetries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return this.waitForContainer(accessToken, containerId, maxRetries - 1);
    }
    if (status_code === "ERROR" || status_code === "EXPIRED" || status_code === "PUBLISHED") {
      throw new Error("Media upload failed");
    }
    return status_code;
  }

  /**
   * Publish a media container to Instagram
   * This is the final step to publish content after creating and waiting for the container
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing#step-2-of-2--publish-the-container
   */
  async publishMediaContainer(accessToken: string, igUserId: string, params: URLSearchParams) {
    params.append("access_token", accessToken);
    const response = await fetch(`https://graph.instagram.com/${API_VERSION}/${igUserId}/media_publish?${params.toString()}`, { method: "POST" });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
}