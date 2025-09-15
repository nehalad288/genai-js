import {Document} from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadDocuments } from "./loadDocuments";

export async function splitDocuments(rawDocuments: Document[]): Promise<Document[]> {
    console.log("Splitting Documents...");
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    const documentChunks = await textSplitter.splitDocuments(rawDocuments);
    console.log(`${rawDocuments.length} documents split into  ${documentChunks.length} chunks. `);
    return documentChunks;
}
// const rawDocuments = await loadDocuments()
// await splitDocuments(rawDocuments);
