/**
 * useGTMEvent Hook
 *
 * Custom hook to dispatch events to Google Tag Manager's data layer.
 * Enables tracking of custom events from anywhere in the application.
 *
 * @example
 * const trackEvent = useGTMEvent();
 * trackEvent({
 *   event: 'book_view',
 *   book_id: '123',
 *   book_title: 'The Great Gatsby'
 * });
 *
 * @returns {function} Function to push events to GTM data layer
 */
export function useGTMEvent() {
  const pushEvent = (eventData) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('GTM data layer not available:', eventData);
    }
  };

  return pushEvent;
}

/**
 * Predefined GTM Event Types
 * Use these functions for consistency and type safety across your app
 */

/**
 * Track user authentication events
 */
export const trackAuthEvent = (action, userId = null) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'user_auth',
      auth_action: action, // 'login', 'signup', 'logout'
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track book interaction events
 */
export const trackBookEvent = (action, bookId, bookTitle = null) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'book_interaction',
      book_action: action, // 'view', 'read', 'favorite', 'download'
      book_id: bookId,
      book_title: bookTitle,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track page view events (GTM typically auto-tracks these)
 */
export const trackPageView = (pageName, pageType = null) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_name: pageName,
      page_type: pageType, // 'book', 'course', 'study_room', etc.
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track study room events
 */
export const trackStudyRoomEvent = (action, roomId, roomName = null) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'study_room_interaction',
      room_action: action, // 'join', 'create', 'leave'
      room_id: roomId,
      room_name: roomName,
      timestamp: new Date().toISOString(),
    });
  }
};
