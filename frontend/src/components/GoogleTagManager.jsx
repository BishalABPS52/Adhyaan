'use client';

import { useEffect } from 'react';

/**
 * GoogleTagManager Component
 *
 * Initializes Google Tag Manager with the container ID from environment variables.
 * Includes both the gtm.js script and noscript fallback for complete GTM integration.
 *
 * @component
 */
export default function GoogleTagManager() {
  const containerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-PF5L97QH';

  useEffect(() => {

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Add GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    document.head.appendChild(script);

    // Push pageview event
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    console.log(`GTM initialized with container ID: ${containerId}`);
  }, [containerId]);

  // Render noscript iframe for users without JavaScript
  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
