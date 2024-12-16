const dotenv = require("dotenv");
const { ChatOpenAI } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
const hub = require("langchain/hub");

dotenv.config();

outputParser = new StringOutputParser();

const PINECONE_INDEX_NAME = "socket-index";

// Initialize OpenAI client
const openai = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Chunk text into manageable pieces
const retrive = async () => {
  const queryEmbedding = await new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    modelName: "text-embedding-3-small",
    dimensions: 512,
  }).embedQuery("What is MOFA?");
  // .embedQuery("What are switch boards in the socket protocol?");

  const index = pinecone.Index(PINECONE_INDEX_NAME);
  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });

  const retrievalQaChatPrompt = await hub.pull("langchain-ai/retrieval-qa-chat");

  const retriever = queryResponse.matches;
  const response = await retrievalQaChatPrompt.pipe(openai).pipe(outputParser).invoke({
    context: retriever,
    input: "What is MOFA?",
  });

  return response;
};

// Main function
const main = async () => {
  const retrievalChain = await retrive();
  console.log("retrievalChain: ", retrievalChain);

  const answer = await openai.pipe(outputParser).invoke("What is MOFA?");
  console.log("const: ", answer);
};

main().catch(console.error);
