const dotenv = require("dotenv");
dotenv.config();
const pdf = require("pdf-parse");
const fs = require("fs");
const { ChatOpenAI } = require("@langchain/openai");
const { PineconeEmbeddings, PineconeStore } = require("@langchain/pinecone");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const {
  createStuffDocumentsChain,
} = require("langchain/chains/combine_documents");
const hub = require("langchain/hub");
const { StringOutputParser } = require("@langchain/core/output_parsers");

// Initialize Pinecone client
const pinecone = new PineconeEmbeddings({
  model: "multilingual-e5-large",
});

// Initialize OpenAI client
const openai = new ChatOpenAI({
  model: "gpt-4o",
});

// Read PDF file
const readPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

// Chunk text into manageable pieces
const createIndex = async (indexName) => {
  // check if index already exists
  const { indexes } = await pinecone.client.listIndexes();
  const index = indexes.findIndex((i) => i.name === indexName);
  if (index !== -1) {
    console.log("Index already exists");
    return;
  }

  data = await pinecone.client.createIndex({
    name: indexName,
    dimension: pinecone.model.dimension,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });

  console.log("Index Sucessfully created ", data);

  // pinecone.index(indexName).update(records);
};

outputParser = new StringOutputParser();

// call openai

// Main function
const main = async () => {
  const pdfPath = "./Harry_Potter_And_The_Order_Of_The_Phoenix_Book_001.pdf";
  const indexName = "harry-potter-new-index";

  // Read PDF content
  const text = await readPDF(pdfPath);

  // Index embeddings in Pinecone
  await createIndex(indexName);

  const _index = await pinecone.client.index(indexName).describeIndexStats();
  console.log("_index: ", _index);

  await PineconeStore.fromDocuments([text], pinecone, {
    pineconeIndex: pinecone.client.index(indexName),
  });

  const _index2 = await pinecone.client.index(indexName).describeIndexStats();
  console.log("_index: ", _index2);

  console.log("PDF content indexed successfully in Pinecone!");

  const retrievalQaChatPrompt = await hub.pull(
    "langchain-ai/retrieval-qa-chat"
  );

  const combineDocsChain = await createStuffDocumentsChain({
    llm: openai,
    prompt: retrievalQaChatPrompt,
  });

  const pineconeStore = new PineconeStore(pinecone, {
    pineconeIndex: pinecone.client.index(indexName),
  });

  const retriever = pineconeStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  // const answer = await openai.pipe(outputParser).invoke("On a whole day, what did harry thought?");
  // console.log("const: ", answer);

  const answerWithContext = await retrievalChain.invoke({
    input: "what did Aunt Petunia said?",
  });
  console.log("answerWithContext: ", answerWithContext);
};

main().catch(console.error);
