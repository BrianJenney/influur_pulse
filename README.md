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
yarn prisma generate
yarn prisma db push
```

5. Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

````

## Development

### Database Management

-   Generate Prisma client:

```bash
yarn prisma generate
````

prisma db push

```

### Type Safety

The project uses TypeScript for type safety throughout the codebase. Key type-safe features include:

-   API routes with Zod validation
-   Form handling with React Hook Form and Zod
-   Database queries with Prisma
```
