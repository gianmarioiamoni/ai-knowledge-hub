// lib/server/langchain.ts
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { env } from "../env";

const defaultEmbeddingDimensions = 1536;

const createChatModel = (): ChatOpenAI =>
  new ChatOpenAI({
    modelName: "gpt-4.1-mini",
    temperature: 0.2,
    openAIApiKey: env.OPENAI_API_KEY,
  });

const createEmbeddingModel = (): OpenAIEmbeddings =>
  new OpenAIEmbeddings({
    dimensions: defaultEmbeddingDimensions,
    openAIApiKey: env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });

const createTextSplitter = (): RecursiveCharacterTextSplitter =>
  new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 150,
  });

export { createChatModel, createEmbeddingModel, createTextSplitter, defaultEmbeddingDimensions };

