import {Document} from "@langchain/core/documents";
import { crawlLangchainDocsUrls } from "./crawlDocuments";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import cliProgress from "cli-progress";

export async function loadDocuments(): Promise<Document[]> {
    const langchaindocsUrl = await crawlLangchainDocsUrls();
    const rawDocuments : Document[] = [];
    
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(langchaindocsUrl.length, 0);

    for(const url of langchaindocsUrl) {
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        rawDocuments.push(...docs);
        console.log(`Loaded ${docs.length} documents from ${url}`);
        progressBar.increment();
    }

    progressBar.stop();
    console.log(`Total documents loaded: ${rawDocuments.length}`);

    return rawDocuments
}
const rawDocuments = await loadDocuments();
console.log(rawDocuments[0]);