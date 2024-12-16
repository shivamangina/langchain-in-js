# langchain-in-js

This project demonstrates how to use Simple LLM , Agents Retrieval-Augmented Generation (RAG) using LangChain, OpenAI, and Pinecone. The system reads text from a PDF file, generates embeddings using OpenAI, indexes the embeddings in Pinecone, and allows for retrieval of information based on queries.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Pinecone API key
- OpenAI API key

## Installation

1. Clone the repository:

````sh
git clone https://github.com/your-username/langchain-in-js.git
cd langchain-in-js



to run the project, you need to install the dependencies:

```javascript

npm install

node simplellm.js // to run the openai llm model

node agent.js // to run the agent to get the weather information


node rag/createIndex.js // to create the index in pinecone
node rag/ingest.js // to ingest the data into pinecone
node rag/retrive.js // to retrive the data from pinecone


````
