"use client";

type AnalyticsEvent =
  | "page_view"
  | "waitlist_submit"
  | "contact_submit"
  | "realtor_submit"
  | "realtor_signup"
  | "join_waitlist_click"
  | "listing_view"
  | "save_home"
  | "compare_home"
  | "contact_agent"
  | "lead_created";

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function trackEvent(
  eventName: AnalyticsEvent,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
}
