require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage =
  "You are an helpful assistant to translate  English to French";
const humanMessage = "Translate {word} to French";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemMessage],
  ["human", humanMessage],
]);

const outputParser = new StringOutputParser();
const captalize = (str) => str.toUpperCase();

promptTemplate
  .invoke({
    word: "Cat",
  })
  .then((res) => {
    const messages = res.toChatMessages();
    model
      .pipe(outputParser)
      .pipe(captalize)
      .invoke(messages)
      .then(console.log)
      .catch(console.error);
  })
  .catch(console.error);
