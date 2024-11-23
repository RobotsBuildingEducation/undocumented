import { useChatCompletion as useOpenAIChatCompletion } from "./stream";

const useChatCompletion = (config) => {
  return useOpenAIChatCompletion({
    // model: "gpt-4o-mini",
    model: "grok-beta",
    // apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    apiKey: import.meta.env.VITE_XAI_API_KEY,
    temperature: 0.9,
    ...config,
  });
};

export { useChatCompletion };
