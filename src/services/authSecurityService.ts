// src/services/authSecurityService.ts

export interface UserSession {
  userId: string;
  activeSessionToken: string;
  lastLoginTime: string;
  userAgent: string;
}

/**
 * सिंगल सेशन और डिवाइस बाइंडिंग चेक करने का फ़ंक्शन
 * यह सुनिश्चित करता है कि एक यूजर आईडी पर एक समय में केवल एक ही एक्टिव सेशन रहे।
 */
export async function verifyAndEnforceSingleSession(
  userId: string,
  currentSessionToken: string
): Promise<boolean> {
  if (!userId || !currentSessionToken) {
    return false;
  }

  const storedSessionJson = localStorage.getItem(`secure_session_${userId}`);
  if (!storedSessionJson) {
    return false; // सेशन मौजूद नहीं है
  }

  try {
    const activeSession: UserSession = JSON.parse(storedSessionJson);
    // यदि टोकन मैच नहीं होता, इसका मतलब दूसरे ब्राउज़र/टैब/डिवाइस में नया लॉगिन हुआ है
    if (activeSession.activeSessionToken !== currentSessionToken) {
      console.warn('SECURITY ALERT: Concurrent login detected. Terminating older session.');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * नया सुरक्षित सेशन रजिस्टर करना (पुराने सेशन को इनवैलिडेट करता है)
 */
export async function createNewSecureSession(userId: string): Promise<string> {
  const token = `SEC_TKN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const session: UserSession = {
    userId,
    activeSessionToken: token,
    lastLoginTime: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
  };

  localStorage.setItem(`secure_session_${userId}`, JSON.stringify(session));
  localStorage.setItem('active_user_token', token);
  localStorage.setItem('active_session_userId', userId);

  return token;
}

/**
 * एक्टिव सेशन टोकन प्राप्त करना
 */
export function getActiveSessionToken(): string | null {
  return localStorage.getItem('active_user_token');
}

/**
 * एक्टिव सेशन यूजर आईडी प्राप्त करना
 */
export function getActiveSessionUserId(): string | null {
  return localStorage.getItem('active_session_userId');
}

/**
 * लॉगिन के समय या संवेदनशील कार्य के समय एक्टिव सेशन टोकन वैलिडेट करना
 * मिसमैच होने पर एरर थ्रो करता है ताकि अनाधिकृत एक्सेस तुरंत रुक जाए।
 */
export async function validateAndEnforceSingleSession(
  userId: string,
  currentSessionToken: string
): Promise<void> {
  const isValid = await verifyAndEnforceSingleSession(userId, currentSessionToken);
  if (!isValid) {
    throw new Error('SECURITY_ALERT: Multiple browser login detected. This session has been terminated.');
  }
}

/**
 * सेशन समाप्त / लॉगआउट
 */
export function clearUserSession(userId: string): void {
  localStorage.removeItem(`secure_session_${userId}`);
  localStorage.removeItem('active_user_token');
  localStorage.removeItem('active_session_userId');
}
