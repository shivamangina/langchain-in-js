require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
});

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

const parser = new StringOutputParser();
const capitalize = (s) => s.toUpperCase();

const chain = model.pipe(parser).pipe(capitalize);

chain.invoke(messages).then((response) => {
  console.log(response);
});
