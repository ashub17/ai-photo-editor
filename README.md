# OpenRouter Image Studio

A React + Vite + TypeScript image generation and editing app backed by a Node/Express OpenRouter proxy. The frontend never receives the OpenRouter API key.

## Features

- Generate an image from a text prompt.
- Upload an existing image and edit it with a text instruction.
- Optionally improve or normalize prompts with `openrouter/auto`.
- Send final image work to a configurable OpenRouter image-capable model.
- View, download, and revisit current-session image history.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your OpenRouter API key to `.env`:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_IMAGE_MODEL=google/gemini-3.1-flash-image-preview
   PORT=8787
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the Express backend on `http://localhost:8787`.

## Getting an OpenRouter API Key

Create or sign in to an OpenRouter account, then create an API key from your OpenRouter keys/settings page. Put that key only in the backend `.env` file as `OPENROUTER_API_KEY`.

## Choosing an Image Model

Set `OPENROUTER_IMAGE_MODEL` to an image-capable model available through OpenRouter and your account. The default in `.env.example` is a placeholder:

```env
OPENROUTER_IMAGE_MODEL=google/gemini-3.1-flash-image-preview
```

Change this value as OpenRouter model availability evolves. The backend sends image requests with:

```json
{
  "modalities": ["image"]
}
```

Generation sends `image_config.aspect_ratio`; editing sends `image_config.strength` and includes the uploaded image as an `image_url` content item with a data URL.

## Why `openrouter/auto` Is Only Used For Prompt Enhancement

`openrouter/auto` is useful for routing text tasks such as prompt enhancement, intent classification, and prompt normalization. This app does not use it as the final image model because image generation/editing requires a model that explicitly supports image output. Final image calls always use `OPENROUTER_IMAGE_MODEL`.

## Scripts

- `npm run dev`: run the Express backend and Vite frontend together.
- `npm run server`: run the backend proxy.
- `npm run client`: run Vite.
- `npm run build`: type-check and build the frontend.
- `npm run preview`: preview the production frontend build.

## Security Notes

- `OPENROUTER_API_KEY` is read only by the Express backend.
- The frontend calls local `/api/*` routes and never calls OpenRouter directly.
- Uploaded image data URLs are validated and limited to 10MB.
- Detailed raw OpenRouter response failures are logged server-side only; the frontend receives safe error messages.
