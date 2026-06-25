"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

function PageViewTracker({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    trackEvent("page_view", {
      page_path: `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}

export function AnalyticsEvents({ measurementId }: { measurementId?: string }) {
  return (
    <Suspense fallback={null}>
      <PageViewTracker measurementId={measurementId} />
    </Suspense>
  );
}
