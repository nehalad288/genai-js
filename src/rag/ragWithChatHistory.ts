import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatHandler, chat } from "../utils/chat";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    Context: {context}
    `,
  ],
  new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
]);
const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  maxTokens: 500,
});

const outputParser = new StringOutputParser();
const retriever = await createRetriever();

const retrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  formatDocumentsAsString,
]);

const generationChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    context: retrievalChain,
    chat_history: (input) => input.chat_history || [],
  },
  prompt,
  llm,
  outputParser,
]);

// System prompts are special type of prompts that are used for giving instructions to the llm on how to handle the chat request.
const queryContextualizationSystemPrompt = `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it iif needed and otherwise return it as is.`;
const qcPrompt = ChatPromptTemplate.fromMessages([
  ["system", queryContextualizationSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const qcChain = RunnableSequence.from([qcPrompt, llm, outputParser]);

// to keep track of chat history, we use a simple array here but for real production use case you might want to store the chat history in a database like redid, progres etc. For this langcain for some utility functions as well.
const chatHistory: BaseMessage[] = [];

const chatHandler: ChatHandler = async (question: string) => {
  // first we contextualize the question based on chat history
  let contextualizedQuestion = null;
  // if no chat history then no need to contextualize the question

  if (chatHistory.length > 0) {
    contextualizedQuestion = await qcChain.invoke({
      question,
      chat_history: chatHistory,
    });
    console.log("Contextualized Question:", contextualizedQuestion);
  }
  return {
    answer: generationChain.stream({ 
        question: contextualizedQuestion || question,
        chat_history: chatHistory 
    }),
    // we also add a callback function to the response so that once we get the answer from llm we can update the chat history with question and answer
    answerCallBack: async (answerText: string) => {
      // once we get the answer from llm we add the question and answer to chat history
        chatHistory.push(new HumanMessage(contextualizedQuestion || question));
        chatHistory.push(new AIMessage(answerText));
    }
    };
};
chat(chatHandler);
