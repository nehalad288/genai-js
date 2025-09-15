import {VectorStoreRetriever} from "@langchain/core/vectorstores";
import {OpenAIEmbeddings} from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";

dotenv.config();
export async function createRetriever(): Promise<VectorStoreRetriever> {
  // Implementation for creating and returning a retriever
  const embeddingLLM = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
  });
  
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index("lanchain-docs");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddingLLM, {
      pineconeIndex
  });

  return vectorStore.asRetriever();
}

// Test code
// const retriever = await createRetriever();
// const context = await retriever.invoke("What is LangChain?");
// console.log("Context from Retriever:", context);
