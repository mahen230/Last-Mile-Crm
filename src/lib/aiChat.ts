import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processChat(prompt: string, context: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`
      Context: ${context}
      User Prompt: ${prompt}
      
      You are an India Post CRM AI Agent. 
      If the user wants to navigate, suggest the route.
      If the user wants to add/update data, instruct them that it will be submitted for Admin Approval.
      Format responses clearly.
    `);
    return result.response.text();
  } catch (error) {
    console.error('Chat error:', error);
    return 'Sorry, I encountered an error.';
  }
}
