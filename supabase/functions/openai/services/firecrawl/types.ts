
/**
 * Types for Firecrawl service responses
 */

export interface FirecrawlErrorResponse {
  success: false;
  error: string;
}

export interface FirecrawlSuccessResponse {
  success: true;
  data: any;
}

export type FirecrawlResponse = FirecrawlSuccessResponse | FirecrawlErrorResponse;

export interface FirecrawlRequestOptions {
  url: string;
  limit?: number;
  followRedirects?: boolean;
  scrapeOptions?: {
    formats?: string[];
    selector?: string | string[];
    followLinks?: boolean;
    waitUntil?: string;
    timeout?: number;
    javascript?: boolean;
    imagesAndCSSRequired?: boolean;
    scrollToBottom?: boolean;
    extraHTTPHeaders?: Record<string, string>;
  };
}
