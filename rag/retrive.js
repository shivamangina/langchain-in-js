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
    dimensions: 512
  }).embedQuery("What are switch boards in the socket protocol?");
  // const vectorStore = new PineconeStore(queryEmbedding, {
  //   pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
  //   namespace: "default",
  // });

  const index = pinecone.Index(PINECONE_INDEX_NAME);
  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });

  console.log(queryResponse.matches);

  const retrievalQaChatPrompt = await hub.pull("langchain-ai/retrieval-qa-chat");

  const combineDocsChain = await createStuffDocumentsChain({
    llm: openai,
    prompt: retrievalQaChatPrompt,
  });

  const retriever = vectorStore.asRetriever();
  // console.log("retriever: ", retriever);

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  return retrievalChain;
};

// Main function
const main = async () => {
  const retrievalChain = await retrive();

  // const answer = await openai.pipe(outputParser).invoke("Does a switchboard that allows for plug execution if only a single watcher authorize execution?");
  // console.log("const: ", answer);

  const answerWithContext = await retrievalChain.invoke({
    input: "What are switch boards in the socket protocol?",
  });
  console.log("answerWithContext: ", answerWithContext);
};

main().catch(console.error);
