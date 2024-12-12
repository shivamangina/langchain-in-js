require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");

const {
  TavilySearchResults,
} = require("@langchain/community/tools/tavily_search");

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
});

process.env.TAVILY_API_KEY = "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";
const agentTools = [new TavilySearchResults({ maxResults: 3 })];

const agent = createReactAgent({ llm: model, tools: agentTools });

const inputs = {
  messages: [{ role: "user", content: "what is the weather in Bangalore?" }],
};

agent
  .invoke(inputs, { streamMode: "values" })
  .then(console.log)
  .catch(console.error);
