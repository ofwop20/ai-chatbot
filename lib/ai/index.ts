import { createOpenAI } from '@ai-sdk/openai';
// import { createAnthropic} from '@ai-sdk/anthropic';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

// 获取自定义host配置
const openaiApiHost = process.env.OPENAI_API_HOST;
const anthropicApiHost = process.env.ANTHROPIC_API_HOST;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: openaiApiHost,
});
// const anthropic = createAnthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
//   baseURL: anthropicApiHost,
// });

export const customModel = (apiIdentifier: string) => {
  console.log('[AI] Starting to create model instance:', apiIdentifier);
  const startTime = Date.now();
  
  // Check if it's an Anthropic model
  // if (apiIdentifier.startsWith('claude')) {
  //   return wrapLanguageModel({
  //     model: anthropic(apiIdentifier),
  //     middleware: customMiddleware,
  //   });
  // }
  
  // Default to OpenAI
  const model = wrapLanguageModel({
    model: openai(apiIdentifier),
    middleware: customMiddleware,
  });
  
  console.log(`[AI] Model instance created, time elapsed: ${Date.now() - startTime}ms`);
  
  return {
    ...model,
    invoke: async (...args: Parameters<typeof model.invoke>) => {
      console.log('[AI] Starting model invocation');
      const invokeStartTime = Date.now();
      const result = await model.invoke(...args);
      console.log(`[AI] Model invoked, time elapsed: ${Date.now() - invokeStartTime}ms`);
      return result;
    }
  };
};
