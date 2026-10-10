import { signInWithPopup, User, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth, googleWorkspaceProvider } from './firebase';

let isSigningIn = false;
// Cache the OAuth access token strictly in memory (never in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const setInMemoryAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const listFiles = async (token: string, query: string) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive API error (${response.status}): ${errText}`);
  }
  return response.json();
};

export const getSpreadsheetMetadata = async (token: string, spreadsheetId: string) => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sheets Metadata error (${response.status}): ${errText}`);
  }
  return response.json();
};

export const getSheetData = async (token: string, spreadsheetId: string, range?: string) => {
  let targetRange = range;
  if (!targetRange) {
    const meta = await getSpreadsheetMetadata(token, spreadsheetId);
    const firstSheetTitle = meta?.sheets?.[0]?.properties?.title || 'Sheet1';
    targetRange = `${firstSheetTitle}!A:Z`;
  }
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetRange)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sheets Read error (${response.status}): ${errText}`);
  }
  return response.json();
};

export const createBackupSpreadsheet = async (
  token: string,
  title: string,
  sheetTitles: string[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheetTitles.map((tabTitle) => ({
        properties: {
          title: tabTitle,
          gridProperties: { frozenRowCount: 1 },
        },
      })),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Google Sheet (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
  };
};

export const ensureSheetTabsExist = async (
  token: string,
  spreadsheetId: string,
  requiredTabs: string[]
): Promise<void> => {
  const meta = await getSpreadsheetMetadata(token, spreadsheetId);
  const existingTitles = new Set<string>(
    (meta?.sheets || []).map((s: any) => s?.properties?.title).filter(Boolean)
  );

  const missingTabs = requiredTabs.filter((t) => !existingTitles.has(t));
  if (missingTabs.length === 0) return;

  const requests = missingTabs.map((tabTitle) => ({
    addSheet: {
      properties: {
        title: tabTitle,
        gridProperties: { frozenRowCount: 1 },
      },
    },
  }));

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to add tabs to spreadsheet (${response.status}): ${errText}`);
  }
};

export const writeSheetTabValues = async (
  token: string,
  spreadsheetId: string,
  tabName: string,
  values: (string | number)[][]
) => {
  const range = `${tabName}!A1`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed writing to tab ${tabName} (${response.status}): ${errText}`);
  }

  return response.json();
};

const toBase64Url = (str: string): string => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const sendGmailMessage = async (
  token: string,
  toEmail: string,
  subject: string,
  htmlBody: string
) => {
  const mimeMessage = [
    `To: ${toEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlBody,
  ].join('\r\n');

  const raw = toBase64Url(mimeMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API send failed (${response.status}): ${errText}`);
  }

  return response.json();
};

