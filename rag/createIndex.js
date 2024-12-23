const dotenv = require("dotenv");
const { Pinecone } = require("@pinecone-database/pinecone");

dotenv.config();

const PINECONE_INDEX_NAME = "socket-index";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const createIndex = async (indexName) => {
  // check if index already exists
  const { indexes } = await pinecone.listIndexes();
  const index = indexes.find((i) => i.name === indexName);
  if (index) {
    console.log("Index already exists");
    return index;
  }

  data = await pinecone.createIndex({
    name: indexName,
    dimension: 512,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });

  console.log("Index Sucessfully created ", data);

  return data;
};

createIndex(PINECONE_INDEX_NAME);
