const dotenv = require("dotenv");
const { ChatOpenAI } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
const hub = require("langchain/hub");

dotenv.config();

outputParser = new StringOutputParser();

const PINECONE_INDEX_NAME = "harry-potter-index";

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
  const queryEmbedding = await new OpenAIEmbeddings();
  const vectorStore = new PineconeStore(queryEmbedding, {
    pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
    namespace: "default",
  });

  const retrievalQaChatPrompt = await hub.pull("langchain-ai/retrieval-qa-chat");
  console.log('retrievalQaChatPrompt: ', retrievalQaChatPrompt);

  const combineDocsChain = await createStuffDocumentsChain({
    llm: openai,
    prompt: retrievalQaChatPrompt,
  });

  const retriever = vectorStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  return retrievalChain;
};

// Main function
const main = async () => {
  // await ingest(pdfPath);

  const retrievalChain = await retrive();

  const answer = await openai.pipe(outputParser).invoke("who is aunt petunia?");
  console.log("const: ", answer);

  const answerWithContext = await retrievalChain.invoke({
    input: "who is aunt petunia",
  });
  console.log("answerWithContext: ", answerWithContext);
};

main().catch(console.error);
