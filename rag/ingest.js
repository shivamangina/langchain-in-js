const dotenv = require("dotenv");
const { ChatOpenAI } = require("@langchain/openai");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { Pinecone } = require("@pinecone-database/pinecone");
const fs = require("fs");
const pdf = require("pdf-parse");
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

const readPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

const chunkText = (text, chunkSize = 2000, chunkOverlap = 200) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Embed text chunks using OpenAI
const embedText = async (chunks) => {
  console.log("chunks: ", chunks.length);
  // console.log('chunks: ', chunks);
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    modelName: "text-embedding-3-small",
    dimensions: 512,
  });

  return await embeddings.embedDocuments(chunks);
};

const indexEmbeddings = async (indexName, embeddings, chunks) => {
  const index = pinecone.Index(indexName);
  const vectors = embeddings.map((embedding, i) => ({
    id: `chunk-${i}`,
    values: embedding,
    // metadata: { text: chunks[i] },
  }));

  return await index.upsert(vectors);
};

const ingest = async (filePath) => {
  // Read and process PDF
  const text = await readPDF(filePath);
  const chunks = chunkText(text);

  // Embed text chunks
  const embeddings = await embedText(chunks);
  console.log("embeddings: ", embeddings);
  const vectorStore = await indexEmbeddings(PINECONE_INDEX_NAME, embeddings, chunks);
  console.log("vectorStore: ", vectorStore);

  return vectorStore;
};

const pdfPath = "./books/Harry_Potter_And_The_Order_Of_The_Phoenix_Book_001.pdf";

ingest(pdfPath);
