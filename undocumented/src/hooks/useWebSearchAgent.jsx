import { useChatCompletion as useOpenAIChatCompletion } from "./agenticstream";

const useWebSearchAgent = (config) => {
  return useOpenAIChatCompletion({
    useWebSearch: true,
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    ...config,
  });
};

export { useWebSearchAgent };
