import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "@langchain/chains";
import { RunnableSequence } from "@langchain/core/runnables";

dotenv.config();

await personalizedPitch("Generative AI", "JavaScript Developer", 50);

async function personalizedPitch(
  course: string,
  role: string,
  wordLimit: number
) {
  const promptTemplate = new PromptTemplate({
    template:
      "Describe the importance of learning {course} for a {role}. Limit the output to {wordLimit} words.",
    inputVariables: ["course", "role", "wordLimit"],
  });

  const formattedPrompt = await promptTemplate.format({
    course,
    role,
    wordLimit,
  });
  console.log("Formatted Prompt:", formattedPrompt);

  const llm = new ChatOpenAI({
    // temperature: 0,
    // topP: 1,
    maxTokens: 150,
    modelName: "gpt-3.5-turbo",
  });
  const outputParser = new StringOutputParser();

//   Option 1: Langchain Legacy Chain
//   const legacyChain = new LLMChain({
//     prompt: promptTemplate,
//     llm,
//     outputParser,
//   });

//   const answer = await legacyChain.invoke({
//     course,
//     role,
//     wordLimit,
//   });

  // Option 2: LCEL
  // const lcelChain = promptTemplate.pipe(llm).pipe(outputParser);
 const lcelChain = RunnableSequence.from([
    promptTemplate,
    llm,
    outputParser,
  ]);

  const answer = await lcelChain.invoke({
    course,
    role,
    wordLimit,
  });

  console.log("Chain Response:", answer);
  
}
