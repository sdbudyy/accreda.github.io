declare global {
  interface Window {
    WebLLM?: any;
  }
}

let chat: any = null;
let modelLoaded = false;

function waitForWebLLM(): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;
    function check() {
      if (window.WebLLM && window.WebLLM.ChatModule) {
        resolve();
      } else if (tries > 50) {
        reject(new Error("WebLLM did not load in time."));
      } else {
        tries++;
        setTimeout(check, 100);
      }
    }
    check();
  });
}

export const initializeWebLLM = async () => {
  if (chat) return chat;
  await waitForWebLLM();
  chat = new window.WebLLM.ChatModule();
  await chat.reload("Llama-2-7b-chat-hf-q4f32_1");
  modelLoaded = true;
  return chat;
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://accreda.com"; // Replace with your production URL
const SITE_NAME = "Accreda";

// Use environment variable for the API key
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const enhanceSAO = async (text: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }
  const prompt = `You are an expert in writing professional Situation-Action-Outcome (SAO) statements. Please enhance the following SAO statement following these specific guidelines:

1. Structure:
   - Situation: Clearly describe the context, challenge, or problem faced
   - Action: Detail the specific steps taken, emphasizing your personal involvement
   - Outcome: Quantify results and highlight the impact of your actions

2. Best Practices:
   - Use active voice and strong action verbs
   - Include specific metrics and numbers where possible
   - Focus on your personal contributions and leadership
   - Highlight problem-solving and decision-making skills
   - Maintain a professional and confident tone
   - Keep the statement concise but impactful

3. Key Elements to Include:
   - Clear problem statement
   - Specific actions taken
   - Measurable results
   - Skills demonstrated
   - Impact on the organization/team

Please enhance the following SAO statement while maintaining its core message and following these guidelines:

${text}

Format the response as a clear SAO statement with Situation, Action, and Outcome sections clearly separated.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // The response format: { choices: [{ message: { content: "..." } }] }
  return data.choices?.[0]?.message?.content || "";
};

export const enhanceSAOClarity = async (text: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }
  const prompt = `You are an expert in improving the clarity and professionalism of writing. Please enhance the following text by:

1. Fixing any grammatical errors and spelling mistakes
2. Improving sentence structure and flow
3. Enhancing clarity while maintaining the exact same meaning and content
4. Adjusting tone to be more professional and clear
5. Preserving all specific details, numbers, technical terms, and names
6. NOT changing any of the actual content or meaning

Important: Do not modify or change any of the actual content, facts, or meaning of the text. Only improve the grammar, spelling, tone, and clarity.

Please provide the enhanced version with clear markdown formatting to show the changes:

${text}

Format the response as a markdown diff, showing the original text with strikethrough and the improved text in bold.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}; 