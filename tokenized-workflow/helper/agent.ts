import Anthropic from "@anthropic-ai/sdk"
import { Runtime } from "@chainlink/cre-sdk";
import { Config } from "../types";

const ANTHROPIC = "ANTHROPIC"

/**
 * @dev making a post request to anthropic api 
 */
const pastQuestions: (string|any)[] = [];

async function getMarketQuestion(runtime: Runtime<Config>, anthropic_url: string) {
  // initialize anthropic AI
  const anthropic_key = runtime.getSecret({ id: ANTHROPIC }).result()
  const claude = new Anthropic({ apiKey: anthropic_key.value, fetch })
  const history = pastQuestions.slice(-20).map(q => `- ${q}`).join("\n") || "None yet.";

  runtime.log("searching for new question for new market")
   const res = await fetch(anthropic_url, {
    method: "POST",
    headers: {
      "x-api-key":  anthropic_key.value,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 100,
       messages: [{
        role: "user",
        content: `Generate a unique binary (Yes/No) crypto prediction market question that can resolve within a few hours.
        It must reference a specific token, price level, or on-chain event happening RIGHT NOW.
        Do NOT repeat anything from this list:\n${history}
        Reply with ONLY the question. No explanation.`,
    }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

//   const res = await claude.messages.create({
//     model: "claude-opus-4-5",
//     max_tokens: 100,
//     messages: [{
//       role: "user",
//       content: `Generate a unique binary (Yes/No) crypto prediction market question that can resolve within a few hours.
//       It must reference a specific token, price level, or on-chain event happening RIGHT NOW.
//       Do NOT repeat anything from this list:\n${history}
//       Reply with ONLY the question. No explanation.`,
//     }],
//   });
 runtime.log(`msg result ${res.json()}`)
//   return res.json
//   for(const block of res.content) {
//     if(block.type == "text") {
//           runtime.log(`new question retrieved ${block.text.trim()}`)
//           return block.text.trim()
//        }
//    } 

//    runtime.log("no question retrieved")
//    return null
}

/**
 * Ask Claude AI to search web and answer yes/no
 */
async function getMarketAnswer(runtime: Runtime<Config>, question: string, marketId: string): Promise<string> {
  const anthropic_key = runtime.getSecret({ id: ANTHROPIC }).result()
  const claude = new Anthropic({ apiKey: anthropic_key.value })

  runtime.log(`searching for answer for this market ${marketId}`)

  const questionResponse = await claude.messages.create({
       model: 'claude-opus-4-5',
      max_tokens: 100,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search'
      }],
      messages: [{
        role: 'user',
        content: `Search the web and answer this prediction market question:

        "${question}"

        Search for current, factual information online. Based on what you find, answer ONLY "yes" or "no".

        Return ONLY the word "yes" or "no" (lowercase, no punctuation, no explanation).`
      }]
  })
  
  let answer = '';
  
  for (const block of questionResponse.content) {
    if (block.type === 'text') {
      runtime.log(`answer retrieved ${block.text.trim()}`)
      answer = block.text.toLowerCase().trim();
      console.log(`answer ${answer}`)
      break;
    }
  }
  
  // Ensure only yes/no
  if (answer.includes('yes')) return 'yes';
  if (answer.includes('no')) return 'no';
  
  return 'no'; // Default to no if unclear
}


export {
  // getMarketQuestion,
  // getMarketAnswer
}