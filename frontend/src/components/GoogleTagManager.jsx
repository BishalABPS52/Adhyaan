'use client';

import { GoogleTagManager } from '@next/third-parties/google';

/**
 * GoogleTagManager Component
 *
 * Initializes Google Tag Manager with the container ID from environment variables.
 * This component uses Next.js's optimized third-party script loading.
 *
 * @component
 * @returns {JSX.Element | null} GTM component or null if container ID is not set
 */
export default function GTMComponent() {
  const containerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

  // Only render if container ID is configured
  if (!containerId) {
    console.warn(
      'Google Tag Manager: NEXT_PUBLIC_GTM_CONTAINER_ID is not configured in environment variables.'
    );
    return null;
  }

  return <GoogleTagManager gtmId={containerId} />;
}
