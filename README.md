# Influur Pulse

A modern influencer marketing platform built with Next.js, Prisma, and TypeScript.

## Features

-   Type-safe API routes with Zod validation
-   Modern form handling with React Hook Form
-   Responsive UI with Tailwind CSS
-   Database management with Prisma
-   Authentication and authorization
-   Campaign management
-   Influencer discovery and management

## Getting Started

### Prerequisites

-   Node.js 20 or later
-   Yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/influur_pulse.git
cd influur_pulse
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other configuration.

4. Set up the database:

```bash
npx prisma db pull (load the database from the cloud... there will be some errors to clean up)
yarn prisma generate
yarn prisma db push
```

5. Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development

### Database Management

-   Generate Prisma client:

```bash
yarn prisma generate
```

## Directory Structure

```
app/
  agents/           # Agent implementations
  schemas/          # Zod schemas
  types/           # TypeScript types
  utils/           # Shared utilities
  components/      # React components
  api/            # API routes
  (routes)/       # Page routes

libs/             # Third-party integrations and utilities
  openai/         # OpenAI client and helpers
  prisma/         # Prisma client and utilities
```

# Agent Development Guide

## Best Practices

### 1. Agent Architecture

-   **Single Responsibility**: Each agent should focus on one specific task
-   **Composition**: Build complex workflows by composing simple agents
-   **Reusability**: Design agents to be reusable across different contexts
-   **Type Safety**: Use TypeScript and Zod for robust type checking

### 2. Performance Optimization

-   Use `gpt-4o-mini` for:
    -   Simple classification
    -   Basic extraction
    -   Formatting tasks
    -   Quick responses
-   Use `gpt-4o` for:
    -   Complex reasoning
    -   Multi-step analysis
    -   Creative tasks
    -   Strategic planning

### 3. Prompt Engineering

```typescript
// Good: Cached system prompt
const SYSTEM_PROMPT = `
You are an expert in [domain].
Your task is to [specific task].

Example input:
${JSON.stringify(exampleInput, null, 2)}

Example output:
${JSON.stringify(exampleOutput, null, 2)}

Format your response as:
${JSON.stringify(outputSchema.shape, null, 2)}
`;

// Bad: Variable interpolation in system prompt
const getSystemPrompt = (variable) => `
You are analyzing ${variable}...
`;
```

OpenAI caches prompt based on prefix, so a long system prompt with dynamic content at the end could\* still hit the cache:

Structuring prompts: https://platform.openai.com/docs/guides/prompt-caching

`Cache hits are only possible for exact prefix matches within a prompt. To realize caching benefits, place static content like instructions and examples at the beginning of your prompt, and put variable content, such as user-specific information, at the end. This also applies to images and tools, which must be identical between requests.`

### 4. Type Safety with Zod

```typescript
import { zodResponseFormat } from 'openai/helpers/zod';

const response = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-mini',
  response_format: zodResponseFormat(
    outputSchema,
    'taskName'
  ),
  messages: [...]
});
```

### 5. Agent Composition

```typescript
// Example of agent composition
const analyzeCampaign = async (campaign: Campaign) => {
	// Step 1: Get recommendations
	const recommendations = await recommendInfluencers(campaign);

	// Step 2: Analyze budget fit
	const budgetAnalysis = await analyzeBudget(
		recommendations,
		campaign.budget
	);

	// Step 3: Generate final report
	return generateReport(recommendations, budgetAnalysis);
};
```

### 6. Error Handling

```typescript
try {
	const result = await agent.execute(input);
	return result;
} catch (error) {
	if (error instanceof ZodError) {
		// Handle validation errors
	} else if (error instanceof OpenAIError) {
		// Handle API errors
	} else {
		// Handle unexpected errors
	}
}
```
