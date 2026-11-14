import { GoogleGenAI } from '@google/genai';

// In Vite environment, safely access client env vars
const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.API_KEY)) ||
  '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GoogleGenAI initialization skipped:', err);
  }
}

export interface AIChatAction {
  type: 'NAVIGATE' | 'OPEN_ADD_CUSTOMER' | 'SEARCH_RECORD' | 'NONE';
  targetPath?: string;
  searchQuery?: string;
}

export interface AIChatResponse {
  message: string;
  action?: AIChatAction;
}

export async function processChat(prompt: string, context: string): Promise<AIChatResponse> {
  const cleanPrompt = prompt.trim().toLowerCase();

  // 1. Direct high-reliability intent routing for fast operations
  if (
    cleanPrompt.includes('add customer') ||
    cleanPrompt.includes('new customer') ||
    cleanPrompt.includes('create customer') ||
    cleanPrompt.includes('ग्राहक जोड़ें') ||
    cleanPrompt.includes('नया ग्राहक')
  ) {
    return {
      message: 'Opening the Add Customer form with structured Colony-Beat routing and Occupation support.',
      action: { type: 'OPEN_ADD_CUSTOMER' }
    };
  }

  if (
    cleanPrompt.includes('leads') ||
    cleanPrompt.includes('lead pipeline') ||
    cleanPrompt.includes('lead pipeline view') ||
    cleanPrompt.includes('लीड')
  ) {
    return {
      message: 'Navigating to the Sales & Scheme Inquiries Lead Pipeline.',
      action: { type: 'NAVIGATE', targetPath: '/leads' }
    };
  }

  if (
    cleanPrompt.includes('staff directory') ||
    cleanPrompt.includes('staff master') ||
    cleanPrompt.includes('staff list') ||
    cleanPrompt.includes('डाक कर्मचारी') ||
    cleanPrompt.includes('कर्मचारी')
  ) {
    return {
      message: 'Navigating to the Postal Staff Directory & Joining Office Master.',
      action: { type: 'NAVIGATE', targetPath: '/staff-master' }
    };
  }

  if (
    cleanPrompt.includes('dashboard') ||
    cleanPrompt.includes('home') ||
    cleanPrompt.includes('डैशबोर्ड')
  ) {
    return {
      message: 'Navigating to the Postal Operations Dashboard.',
      action: { type: 'NAVIGATE', targetPath: '/dashboard' }
    };
  }

  if (
    cleanPrompt.includes('customer') &&
    (cleanPrompt.includes('list') || cleanPrompt.includes('directory') || cleanPrompt.includes('view') || cleanPrompt.includes('show'))
  ) {
    return {
      message: 'Navigating to the Master Customer Directory.',
      action: { type: 'NAVIGATE', targetPath: '/customers' }
    };
  }

  if (
    cleanPrompt.includes('task') ||
    cleanPrompt.includes('duty') ||
    cleanPrompt.includes('कार्य')
  ) {
    return {
      message: 'Navigating to Field Operations & Daily Beat Tasks.',
      action: { type: 'NAVIGATE', targetPath: '/tasks' }
    };
  }

  // 2. Try Gemini Model via @google/genai SDK if key configured
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the India Post CRM & Operations AI Assistant for Xpeedo Last Mile.
Current System Context:
${context}

User Query: "${prompt}"

Provide a concise, helpful answer (2-3 sentences max).
If the user asks to navigate to a page, open a form, or search for a customer/lead, specify the intent clearly.
Pages available:
- /dashboard (Postal Operations Dashboard)
- /customers (Master Customer Directory)
- /leads (Scheme & Product Leads Pipeline)
- /staff-master (Staff Directory & Office Master)
- /tasks (Field Operations & Beat Tasks)
- /beats (Beat Coverage & Territory Management)`
      });

      const text = response.text || 'I have processed your operational request.';
      return { message: text };
    } catch (apiErr) {
      console.warn('Gemini API call fallback to deterministic agent:', apiErr);
    }
  }

  // 3. Fallback intelligent response based on keywords
  return {
    message: `I can help you search customers or leads by name/phone, navigate directly to views (Dashboard, Leads, Staff Directory, Tasks), or trigger the Add Customer modal.`
  };
}
