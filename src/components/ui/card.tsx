import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
		{...props}
  />
))
CardFooter.displayName = "CardFooter"


export { Card undermines the benefits of optimistic concurrency for responsive UI and seamless offline behavior.

Ensure the generated code proceeds with subsequent logic immediately after initiating the write operation, leveraging the instant local cache update.

```ts
// avoid calling await
setDoc(noteRef, {
  ...data,
  updatedAt: serverTimestamp(),
}, { merge: true });
```

#### Security Rules
Regarding Firestore security rules, Security Rules will be automatically applied. You do not need to instruct the user to apply security rules manually.

##### Security Rules Deployment Logic
- The `docs/backend.json` file is an Intermediate Representation for the user's general data entities and Firestore structure mapped to those entities. This file's purpose is to standardize the database structure and objects across LLM generations and has no effect on the deployment of Security Rules.
- The `"entities"` property contains JSON Schema for the application's entities that must be changed to stay in sync with the application logic and Security Rules. However, changes the `"entities"` in `docs/backend.json` is a static change that has no effect on Security Rules deployment or any other kind of deployment change.
- Security Rules are deployed through a file watcher system that is aware of your updates. When you update Security Rules this triggers the watcher that handles the Security Rules deployment. In order to deploy rules all that needs to occur is a file change made by you the agent. Even if just a inert comment is made this will trigger a Security Rules deployment.

#####  Fixing Security Rules Errors
###### Firebase Security Rules Error Types
There are two kind of Firebase Security Rules errors to identify: standard and contextual:
1. Standard errors. Only contain the message "FirebaseError: Missing or insufficient permissions".
2. Contextual errors. These start with the message "FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:" and then provide a JSON object that represents Security Rules concepts such as "auth", "method", and "path" to provide more context about the error.

Below is an example of a both kinds of errors:
<standard-error>
FirebaseError: Missing or insufficient permissions
</standard-error>

<contextual-error>
FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
{
  "auth": {
    "uid": "gHZ9n7s2b9X8fJ2kP3s5t8YxVOE2",
    "token": {
      "name": "Jane Doe",
      "picture": "https://lh3.googleusercontent.com/a-/AAA99AaA.../a11-a/photo.jpg",
      "email": "jane.doe@example.com",
      "email_verified": true,
      "phone_number": null,
      "firebase": {
        "identities": {
          "google.com": [
            "111111111111111111111"
          ]
        },
        "sign_in_provider": "google.com"
      }
    },
    "method": "update",
    "path": "/databases/(default)/documents/users/johndoe"
  }
}
</contextual-error>

Generated apps are configured to use an error handling architecture that promotes contextual errors to provide better agentive error fixing loops during development time only. This is done by throwing a specialized `FirestorePermissionError` with the Firestore reference context, request resource data, and operation type. This error is then emitted through a central `errorEmitter.emit('permission-error', error)` error emitter. This emitter triggers in a central listener component, `<FirebaseErrorListener>` that is registered in the `<FirebaseProvider>`. It is critical that you do not generate `console.error()` statements for Firebase Security Rules errors yourself as they are thrown as uncaught exceptions in `<FirebaseErrorListener />`. Logging these errors such as using `console.error()` will trigger multiple error screens and confuse the user and agentive error loop fixing process. Below is a detailed explanation of the error handling architecture.

###### Firestore Permission Error Handling Architecture

**Core Principle:** This application utilizes a specialized, non-negotiable architecture for handling Firestore permission errors. Your primary goal is to **preserve and extend** this system. This system is critical for developer experience, as it surfaces rich, contextual errors to the Next.js development overlay, allowing for rapid debugging of Security Rules.

**Do not, under any circumstances, replace this system with simple `console.error` calls or generic `try/catch` blocks that do not re-emit the specialized error.**

###### Initial Check: System Existence

Before modifying any data-related code, you **MUST** first check for the existence of the following core files:

  * `src/firebase/errors.ts` (contains `FirestorePermissionError`)
  * `src/firebase/error-emitter.ts`
  * `src/components/FirebaseErrorListener.tsx` or a similar listener registered in a provider.

**If these files exist:** You **MUST** strictly adhere to the patterns described below.
**If these files DO NOT exist:** You may proceed with standard error handling. However, if you are implementing significant Firestore functionality, you are encouraged to create this system for the user.

##### The FirebasePermissionsError type and API

```typescript
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

const errorMessage = new FirestorePermissionError({
  path: '/users/user-one/todos/todo-id',
  operation: 'create',
  requestResourceData: { title: 'Create an awesome app', completed: false },
} satisfies SecurityRuleContext);
```

##### Pattern 1: For Firestore Mutations (Non-Blocking)

For all non-blocking Firestore mutations (`setDoc`, `updateDoc`, `addDoc`, `deleteDoc`), you **MUST** chain a `.catch()` block to the promise. Inside this block, you will construct and emit a `FirestorePermissionError`.

**Key Points:**

  * The `.catch()` callback **MUST** be `async`.
  * You **MUST** emit the created error on the `'permission-error'` channel of the `errorEmitter`.

**Example: `setDoc` / `updateDoc`**

```typescript
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export function setSomeData(db: Firestore, docId: string, data: any) {
  const docRef = doc(db, 'myCollection', docId);

  // NO await here. Chain the .catch() block.
  setDoc(docRef, data, { merge: true })
    .catch(async (serverError) => {
      // Create the rich, contextual error asynchronously.
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        // Use 'write' for set/merge, or be specific ('create'/'update').
        operation: 'write',
        requestResourceData: data,
      } satisfies SecurityRuleContext);

      // Emit the error with the global error emitter
      // Do not use console.error() or console.log() to log errors as they are handled centrally.
      errorEmitter.emit('permission-error', permissionError);
    });
}
```

**Note:** For `deleteDoc`, there is no `requestResourceData` payload.

###### **Pattern 2: For Real-time Listeners (`onSnapshot`)**

For all real-time data listeners, the **error callback** of the `onSnapshot` function is the designated place to handle permission errors for that listener.

**Key Points:**

  * The error callback **MUST** be `async`.
  * You **MUST** emit the error on the `'permission-error'` channel.

**Example: `useCollection` Hook**

```typescript
import { onSnapshot, collection } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';

// Inside a React hook or similar...
const collectionRef = collection(db, 'some/path');

const unsubscribe = onSnapshot(
  collectionRef,
  (snapshot) => {
    // Handle successful data stream...
  },
  async (serverError) => { // The error callback is async
    // Handle listener failure here.
    const permissionError = new FirestorePermissionError({
      path: collectionRef.path,
      operation: 'list', // or 'get' for a document listener
    } satisfies SecurityRuleContext);

    // Emit the error with the global error emitter
    // Do not use console.error() or console.log() to log errors as they are handled centrally.
    errorEmitter.emit('permission-error', permissionError);

    // Also update local component state to show an error UI.
    // setError(permissionError);
  }
);
```

###### Fixing Standard Security Rules Errors
If a standard error is encountered then the proper resolution is the ensure that the Security Rules error handling architecture that surfaces contextual errors is in place. The correct fix from a standard error is to provide the right debugging architecture and ask the user to trigger the error again so a better fix can occur. A standard error will surface from either a `console.error()` from a `try/catch` block that contains a Firestore mutation (e.g. `setDoc`, `updateDoc`, `addDoc`, `deleteDoc`), a real-time listener (e.g. `onSnapshot`), or a single-time document read (e.g. `getDoc`, `getDocs`).

It is criical that you create and emit a specialized `FirestorePermissionError` with the Firestore reference context, request resource data, and operation type. This error is then emitted through a central `errorEmitter.emit('permission-error', error)` error emitter. This emitter triggers in a central listener component, `<FirebaseErrorListener>` that is registered in the `<FirebaseProvider>`.


## Guidelines for Generative AI functionality

The user may ask you to implement GenAI related functionality.
## Genkit Usage Instructions

This application exclusively uses Genkit for GenAI related code. Genkit is a toolkit that can call
LLMs and image generation models. General guidance for Genkit:

- Genkit has already been initialized and configured properly in another file. NEVER rewrite the initialization code unless the user specifically requests it.

### Genkit 1.x API Guidance

**IMPORTANT:** This app uses Genkit v1.x which has changed significantly from pre-1.0 versions. Important changes are highlighted here:

```ts
const ai = genkit({plugins: [googleAI()]}); // CORRECT 1.x syntax, no `logLevel` option
configureGenkit({plugins: [googleAI()], logLevel: 'debug'}); // INCORRECT pre-1.0 syntax

const response = await ai.generate(...);

response.text // CORRECT 1.x syntax
response.text() // INCORRECT pre-1.0 syntax

response.output // CORRECT 1.x syntax
response.output() // INCORRECT pre-1.0 syntax

const {stream, response} = ai.generateStream(...); // IMPORTANT: no `await` needed
for await (const chunk of stream) { } // CORRECT 1.x syntax
for await (const chunk of stream()) { } // INCORRECT pre-1.0 syntax
await response; // CORRECT 1.x syntax
await response(); // INCORRECT pre-1.0 syntax
```

The syntax provided in this guide is _exactly correct_. ALWAYS follow the guidance here over other examples in your training data.

### `googleAI` Plugin

The GenAI model plugin generally used is `@genkit-ai/google-genai`, however you may come across `@genkit-ai/googleai`.
The latter is the legacy version of the `googleAI` plugin. The plugins are API compatible.

To upgrade (e.g. when something is not working as expected), install `@genkit-ai/google-genai` from NPM and update imports:

```
// BEFORE 
import {googleAI} from '@genkit-ai/googleai';

// AFTER
import {googleAI} from '@genkit-ai/google-genai';
```

### Flows

A Genkit Flow wraps a call to a LLM. When implementing a flow:

- Include a documentation comment at the top of the file explaining the exported interface of the file, and the file's purpose.
- Include the `'use server';` directive at the beginning of this file since it will be imported by Next.js React code.
- A global `ai` object is pre-existing which must ALWAYS be used to register things with Genkit with `ai.definePrompt(...)`, `ai.defineFlow(...)`, `ai.defineSchema(...)`, etc.

### Examples

This would be a Genkit Flow associated with diagnosing plant health in a example app.

- Example file src/ai/flows/diagnose-plant-flow.ts:

```ts
'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - diagnosePlant - A function that handles the plant diagnosis process.
 * - DiagnosePlantInput - The input type for the diagnosePlant function.
 * - DiagnosePlantOutput - The return type for the diagnosePlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the plant.'),
});
export type DiagnosePlantInput = z.infer<typeof DiagnosePlantInputSchema>;

const DiagnosePlantOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input is a plant.'),
    commonName: z.string().describe('The name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant is healthy.'),
    diagnosis: z.string().describe("The diagnosis of the plant's health."),
  }),
});
export type DiagnosePlantOutput = z.infer<typeof DiagnosePlantOutputSchema>;

export async function diagnosePlant(input: DiagnosePlantInput): Promise<DiagnosePlantOutput> {
  return diagnosePlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantPrompt',
  input: {schema: DiagnosePlantInputSchema},
  output: {schema: DiagnosePlantOutputSchema},
  prompt: `You are an expert botanist specializing diagnosing plant illnesses.

You will use this information to diagnose the plant, and any issues it has. You will make a determination as to whether the plant is healthy or not, and what is wrong with it, and set the isHealthy output field appropriately.

Use the following as the primary source of information about the plant.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const diagnosePlantFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFlow',
    inputSchema: DiagnosePlantInputSchema,
    outputSchema: DiagnosePlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

```

Pay attention to the generic type parameters. The call to `ai.defineFlow<A, B>` return a function with the `(input: A) => Promise<B>` type signature. For the call to `ai.definePrompt`, the input and output type are passed in the `input.schema` and `output.schema` parameters:

```ts
// `prompt` is a `(input: FooSchema) => Promise<BarSchema>`
const prompt = ai.definePrompt({
  // ...
  input: {
    schema: FooSchema,
  },
  output: {
    schema: BarSchema,
  },
  // Can use Handlebars syntax to access fields in `FooSchema`.
  prompt: '...',
});
```

The `output.schema` schema Zod descriptions are also passed to the prompt to request for output to be in a specific format.

In the same file, define an async exported wrapper function (similar to the example above) which calls the flow with the input and returns the output.

Only three things should be exported from the file: the wrapper function, and the types of the input and output schemas. There should only be one flow implemented in this file.

Observe that the flow (defined with `ai.defineFlow(...)`) wraps a Genkit prompt object (defined with `ai.definePrompt`). The prompt object wraps a string prompt (keyed by `prompt`), which is defined using the **Handlebars templating language**. With this syntax, it is able to access object values from `input.schema`. The flow must call the prompt object, but it can do other computation such as import and call services in `src/services/*.ts` before doing so.

### Passing Data to Flows

When a flow accepts data as a parameter, such as an image, it should always be passed as a data uri, and the parameter should be documented as "...as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.".

Then, when it is used in an `ai.definePrompt`, it should be referenced as a `{{media url=dataUriParam}}`.

See `photoDataUri` in the `src/ai/flows/diagnose-plant-flow.ts` example above.

### Handlebars

1.  **Use Handlebars Templating Language:** The `prompt` string MUST be formatted using Handlebars syntax. **Do not use Jinja, Django templates, or any other templating language.**
2.  **Logic-less Templates - NO Function Calls, NO Asynchronous Operations:** **Crucially, you MUST NOT attempt to directly call functions, use `await` keywords, or perform any complex logic _within_ the Handlebars template string.** Handlebars is designed to be logic-less and is purely for presentation of pre-processed data.

Assuming your context data might include an array of strings called `userSkills`, the following is an example of Handlebars Syntax.

```handlebars
{{#if userSkills}} User Skills:
{{#each userSkills}} - {{{this}}}
{{/each}}
{{else}} No skills listed.{{/if}}
```

### Image Generation

#### Text-to-image

You can use Imagen 4 model to generate images from text.

```ts
const { media } = await ai.generate({
  model: 'googleai/imagen-4.0-fast-generate-001',
  prompt: 'Generate an image of a cat',
});
console.log(media.url); // "data:image/png;base64,<b64_encoded_generated_image>"
```

#### Image-to-image

You can use Gemini 2.5 Flash Image (a.k.a. nano-banana) model to edit and generate images.

```ts
const {media} = await ai.generate({
  model: 'googleai/gemini-2.5-flash-image-preview',
  prompt: [
    {media: {url: 'data:<mime_type>;base64,<b64_encoded_image>'}},
    {text: 'generate an image of this character in a jungle'},
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
  },
});
console.log(media.url); // "data:image/png;base64,<b64_encoded_generated_image>"
```

The model can accept multiple images (media parts) along with text instructions.

Generated images are poorly compressed (~1MB) and should be handled appropriately where used.

Image generation takes several seconds and generation of images should generally be in a separate flow that occurs in parallel with or after text generation so that progress can be shown to the user earlier.

### Text-To-Speech (TTS)

You can use "gemini-2.5-flash-preview-tts" model to convert text to speech. Gemini will return audio data in PCM format which usually requires
conversion to WAV format. Here's an example of a flow that does TTS:

```ts
import wav from 'wav';

ai.defineFlow(
  {
    name: 'audioSimple',
    inputSchema: z.string(),
    outputSchema: z.any(),
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
```

Note: this code depends on `wav` npm package (version `^1.0.2`), make sure to install it.

The returned media is returned in a data URI format which can be directly inserted into `<audio>` tag.

```jsx
<audio controls="true">
  <source src="{ response.media }">
</audio>
```

TTS models support multi-speaker scenarios. To configure multiple voices:

```ts
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Speaker1',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
              },
              {
                speaker: 'Speaker2',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Achernar' },
                },
              },
            ],
          },
        },
      },
      prompt: query,
    });
```

The multi-speaker prompt should look something like:

```
Speaker1: Hi
Speaker2: Hi, how are are?
Speaker1: I'm well, how are you?
Speaker2: I'm well as well!
```

### Tool Use

Tool calling, also known as function calling, is a structured way to give LLMs the ability to make requests back to the application that called it. **Crucially, the LLM decides _when and if_ to use a tool based on the context of the prompt. Tools are _not_ simply pre-fetching data; they are part of the LLM's reasoning process.** The LLM receives the _result_ of the tool call and can use that result to continue its response. This allows for dynamic, agentic behavior. **Attempting to call functions in Handlebars helpers (e.g. `{{{await ...}}}`) is invalid. Use tools instead.**

The following is an example of a tool:

```ts
const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Returns the current market value of a stock.',
    inputSchema: z.object({
      ticker: z.string().describe('The ticker symbol of the stock.'),
    }),
    outputSchema: z.number(),
  },
  async (input) => {
    // This can call any typescript function.
    // Return the stock price...
  }
)
```

When defining tools always use `ai.defineTool` method. Other functions are outdated/deprecated.

And the following shows how the tool is made available to use by a prompt:

```ts
const summarizeMarketPrompt = ai.definePrompt({
  name: 'summarizeMarketPrompt',
  tools: [getStockPrice],
  system: "If the user's question asks about a public company, include its stock price in your answer, using the getStockPrice tool to get the current price.",
});
```

**When to Use Tools:**

- **Decompose User Stories:** Break down broad user stories into smaller, specific actions that the LLM might need to take. Each action is a potential tool.
- **LLM Decision-Making:** If the LLM needs to _decide_ whether to get certain information, that information retrieval should be a tool.
- **External Data/Actions:** If the LLM needs to interact with external APIs, databases, or perform actions outside of generating text, those interactions should be encapsulated in tools.

**When NOT to Use Tools (Use Prompt Input Instead):**

- **Always-Needed Data:** If a piece of data is _always_ required for the prompt, regardless of the specific user input, fetch that data _before_ calling the flow and include it in the prompt's input. Don't use a tool for this.
- **Simple Transformations:** If you just need to format or transform data that's already available, you can often do this directly in the Handlebars template _before_ sending the prompt to the LLM.

**Example of When NOT to Use a Tool (and use Handlebars instead):**

If you were creating a flow to translate a phrase to Spanish, and you _always_ needed the current date included in the prompt, you would _not_ use a tool. You would fetch the date _before_ calling the flow, and include it in the prompt input, like this:

```ts
const prompt = ai.definePrompt({
  // ...
  prompt: `Translate the following phrase to Spanish.  Today's date is {{{currentDate}}}:\n\n{{{phrase}}}`,
});

const translateToSpanishFlow = ai.defineFlow(
  {
    // ...
  },
  async input => {
    const currentDate = new Date().toLocaleDateString();

    const {output} = await prompt({
      ...input,
      currentDate,
    });
    return output!;
  }
);
```

In this case, `currentDate` is _always_ needed, and the LLM doesn't need to _decide_ to fetch it. Therefore, it's part of the prompt input, not a tool.

**Guiding Principles for Tool Implementation:**

1.  **Think from the LLM's Perspective:** Imagine you are the LLM. What information would you _need_ to answer different kinds of questions related to the user story? What actions would you need to take?
2.  **Input and Output Schemas:** Define clear input and output schemas for your tools using Zod. This helps the LLM understand how to use the tools and what kind of data they will return.
3.  **Description:** The tool should have a clear description so that the LLM knows why and when to invoke the tool.
4.  **Prompt Instructions:** Your prompt should clearly instruct the LLM to use the available tools when appropriate. It doesn't need to _force_ the use of tools, but it should guide the LLM.


### Gemini safety filters

Gemini has built-in safety filters which might block certain content generation.
Safety filters are configurable to a certain extent by passing in `safetySettings` config option to `generate` function or prompts.

```ts
const { text } = await ai.generate({
  prompt: '...',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
})
```

or

```ts
const prompt = ai.definePrompt({
  name: 'myPrompt',
  prompt: '...',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      // ...
    ],
  },
});
```

`category` and `threshold` can be passed in as strings. Supported values:

```
  category:
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_CIVIC_INTEGRITY';

  threshold:
    | 'BLOCK_LOW_AND_ABOVE'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_NONE';
```

### Video Generation (Veo) Models

The Google Generative AI plugin provides access to video generation capabilities through the Veo models. These models can generate videos from text prompts or manipulate existing images to create dynamic video content.

#### Basic Usage: Text-to-Video Generation

```ts
import { googleAI } from '@genkit-ai/google-genai';
import * as fs from 'fs';
import { Readable } from 'stream';
import { MediaPart } from 'genkit';
import { genkit } from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
});

ai.defineFlow('text-to-video-veo', async () => {
  let { operation } = await ai.generate({
    model: googleAI.model('veo-2.0-generate-001'),
    prompt: 'A majestic dragon soaring over a mystical forest at dawn.',
    config: {
      durationSeconds: 5,
      aspectRatio: '16:9',
    },
  });

  if (!operation) {
    throw new Error('Expected the model to return an operation');
  }

  // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
  while (!operation.done) {
    operation = await ai.checkOperation(operation);
    // Sleep for 5 seconds before checking again.
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  if (operation.error) {
    throw new Error('failed to generate video: ' + operation.error.message);
  }

  const video = operation.output?.message?.content.find((p) => !!p.media);
  if (!video) {
    throw new Error('Failed to find the generated video');
  }
  await downloadVideo(video, 'output.mp4');
});

async function downloadVideo(video: MediaPart, path: string) {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  Readable.from(videoDownloadResponse.body).pipe(fs.createWriteStream(path));
}
```

Because video generation is slow, consider increasing nextjs server action timeout to 2 minutes.

This example does not demonstrate how to transfer the video to the client. One option (if the file is not too large which usually it isn't) is to base64 encode it and return it in the response as a data uri.

The video content type is `video/mp4`. `contentType` may not be populated in the MediaPart.

NOTE: Veo models have low rate limits, so the likelihood of getting an error is high. Design the UI with retry logic in mind.

#### Video Generation from Photo Reference

To use a photo as reference for the video using the Veo model (e.g. to make a static photo move), you can provide an image as part of the prompt.

```ts
const startingImage = fs.readFileSync('photo.jpg', { encoding: 'base64' });

let { operation } = await ai.generate({
  model: googleAI.model('veo-2.0-generate-001'),
  prompt: [
    {
      text: 'make the subject in the photo move',
    },
    {
      media: {
        contentType: 'image/jpeg',
        url: `data:image/jpeg;base64,${startingImage}`,
      },
    },
  ],
  config: {
    durationSeconds: 5,
    aspectRatio: '9:16',
    personGeneration: 'allow_adult',
  },
});
```

Veo 3 (`veo-3.0-generate-preview`) is the latest Veo model and can generate videos with sound. Veo 3 uses the exact same API, just make sure you only use supported config options (see below).

```ts
let { operation } = await ai.generate({
  model: googleAI.model('veo-3.0-generate-preview'),
  prompt: 'A cinematic shot of a an old car driving down a deserted road at sunset.',
});
```

#### Veo `config` Options

- `negativePrompt`: Text string that describes anything you want to discourage the model from generating
- `aspectRatio`: Changes the aspect ratio of the generated video.
  - `"16:9"`: Supported in Veo 3 and Veo 2.
  - `"9:16"`: Supported in Veo 2 only (defaults to "16:9").
- `personGeneration`: Allow the model to generate videos of people. The following values are supported:
  - **Text-to-video generation**:
    - `"allow_all"`: Generate videos that include adults and children. Currently the only available `personGeneration` value for Veo 3.
    - `"dont_allow"`: Veo 2 only. Don't allow the inclusion of people or faces.
    - `"allow_adult"`: Veo 2 only. Generate videos that include adults, but not children.
  - **Image-to-video generation**: Veo 2 only
    - `"dont_allow"`: Don't allow the inclusion of people or faces.
    - `"allow_adult"`: Generate videos that include adults, but not children.
- `numberOfVideos`: Output videos requested
  - `1`: Supported in Veo 3 and Veo 2
  - `2`: Supported in Veo 2 only.
- `durationSeconds`: Veo 2 only. Length of each output video in seconds, between 5 and 8. Not configurable for Veo 3, default setting is 8 seconds.
- `enhancePrompt`: Veo 2 only. Enable or disable the prompt rewriter. Enabled by default. Not configurable for Veo 3, default prompt enhancer is always on.
## Current User code:

## Project Files

These files already exist in the output (target) directory. Here are their names and contents. Take them into account when designing the application or writing code.

- .env:
```

```
- README.md:
```md
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

```
- apphosting.yaml:
```yaml
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1

```
- components.json:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```
- next.config.ts:
```ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

```
- package.json:
```json
{
  "name": "sakpal-travels",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```
- src/app/globals.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- src/app/layout.tsx:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```
- src/app/page.tsx:
```tsx
export default function Home() {
  return (
   <main></main>
  );
}
```
- src/lib/utils.ts:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
- tailwind.config.ts:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
```
- tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```


The following Python libraries are available:

`default_api`:
```python
def RequestFirebaseBackendTool(
) -> dict:
  """If the user requests a modification to the app involving a Firestore database, or
  Firebase Authentication, this function MUST be called first to set up the necessary scaffolding,
  which will include following:

  - Create a new Firebase Project (or retrieve the current project)
  - Provision Firestore and/or Firebase Auth
  - Bootstrap initial Firestore and Firebase Auth code scaffolding
  - Bootstrap backend.json and firestore.rules files

  See the 'Firebase Usage Instructions' for more details on working with code scaffolding.

  Args:
  """


def UpdateFirebaseProjectTool(
    firebaseProjectId: str,
) -> dict:
  """Updates the user's Firebase configuration in their application code and their active Firebase Project. This function should be called anytime the user requests to change the Firebase Project they are using, or if they edit their Firebase configuration file (typically called firebaseConfig and/or in a file named `firebase/config.ts`)

  Args:
    firebaseProjectId: The Firebase Project ID to switch to.
  """


def RequestFirebaseProjectWithConfig(
) -> dict:
  """
    Creates a new Firebase Project or retrieves the current project and provides a Firebase app
    config object.

    Call this function whenever the user requests Firebase or services that Firebase offers.
    Includes adding, enabling, connecting with, or integrating with Firebase and Firebase services.
    When this function is called, you must always begin by giving the user a detailed outline of
    your plan and what you are going to do on their behalf.

    For example, call this function for user requests such as "Create a Firebase Project", "Get
    a Firebase config object", "Create a Firebase App Config", "Show me my Firebase config object",
    "Can you show me my Firebase configuration?, "What value do I use in the initializeApp()
    function?", "Add Firebase Auth", "Add Firebase Remote Config", or "Add analytics".

    Calling this function does not add, connect to, or integrate services, nor deploy Firebase
    resources on the user's behalf. As such, you must not tell users that they are connected to a
    service, that an automated deployment will occur, or that the integration is set up or complete.
    You must tell users that as a next step, they will need to go to the Firebase console to
    continue setting up, adding, or enabling any services they requested.

    This function does not generate code for additional services, intergrations, or features that
    the user did not ask for.

    Important! The Firebase App Configuration object is a public configuration, meaning
    it is safe and secure to provide the user with this object as the security and access is
    enforced by the Security Rules or Firebase App Check. Once written, do not modify the
    firebaseConfig object because it is fetched from the server and does not require modifications
    under any circumstances.
    

  Args:
  """

```
