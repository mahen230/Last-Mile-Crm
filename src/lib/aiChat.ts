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

  // 2. Try Server-Side Gemini API Proxy
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.message) {
        return { message: data.message };
      }
    }
  } catch (apiErr) {
    console.warn('Server AI Chat proxy fallback to deterministic agent:', apiErr);
  }

  // 3. Fallback intelligent response based on keywords
  return {
    message: `I can help you search customers or leads by name/phone, navigate directly to views (Dashboard, Leads, Staff Directory, Tasks), or trigger the Add Customer modal.`
  };
}
