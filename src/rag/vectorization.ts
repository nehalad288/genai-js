import dotenv from "dotenv";
import {loadDocuments} from "./loadDocuments";
import {splitDocuments} from "./splitDocuments";
import {OpenAIEmbeddings} from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone"
import cliProgress from "cli-progress";

dotenv.config();

const rawDocuments = await loadDocuments();
const documentChunks = await splitDocuments(rawDocuments);

const embeddingLLM = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
});

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index("lanchain-docs");
console.log("Starting Vectorization...");
const progresBar = new cliProgress.SingleBar({});
progresBar.start(documentChunks.length, 0);

// Insert documents in batches of 100
for(let i=0; i< documentChunks.length; i+=100) {
    const batch = documentChunks.slice(i, i+100);
    await PineconeStore.fromDocuments(batch, embeddingLLM, {
        pineconeIndex
    });
    console.log(`Inserted batch ${i/100 + 1} of ${Math.ceil(documentChunks.length/100)}`);
    progresBar.increment(batch.length);
}
progresBar.stop();
console.log("Chunks stored in pinecone.");