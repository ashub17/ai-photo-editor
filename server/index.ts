import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import {
  editImage,
  enhancePrompt,
  generateImage
} from "./openrouter";
import {
  HttpError,
  requireAspectRatio,
  requireBoolean,
  requireImageDataUrl,
  requireStrength,
  requireString
} from "./utils";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: "14mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/enhance-prompt", async (request, response, next) => {
  try {
    const mode = request.body?.mode;
    if (mode !== "generate" && mode !== "edit") {
      throw new HttpError(400, "mode must be generate or edit.");
    }

    const prompt = requireString(request.body?.prompt, "prompt");
    response.json(await enhancePrompt(mode, prompt));
  } catch (error) {
    next(error);
  }
});

app.post("/api/generate-image", async (request, response, next) => {
  try {
    const prompt = requireString(request.body?.prompt, "prompt");
    const aspectRatio = requireAspectRatio(request.body?.aspectRatio);
    const enhance = requireBoolean(request.body?.enhance, "enhance");
    const enhancement = enhance
      ? await enhancePrompt("generate", prompt)
      : { enhancedPrompt: prompt };
    const finalPrompt = enhancement.enhancedPrompt;
    const result = await generateImage({ prompt: finalPrompt, aspectRatio });

    response.json({
      imageUrl: result.imageUrl,
      finalPrompt,
      raw: result.raw
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/edit-image", async (request, response, next) => {
  try {
    const prompt = requireString(request.body?.prompt, "prompt");
    const imageDataUrl = requireImageDataUrl(request.body?.imageDataUrl);
    const strength = requireStrength(request.body?.strength);
    const enhance = requireBoolean(request.body?.enhance, "enhance");
    const enhancement = enhance
      ? await enhancePrompt("edit", prompt)
      : { enhancedPrompt: prompt };
    const finalPrompt = enhancement.enhancedPrompt;
    const result = await editImage({ prompt: finalPrompt, imageDataUrl, strength });

    response.json({
      imageUrl: result.imageUrl,
      finalPrompt,
      raw: result.raw
    });
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    if (error instanceof SyntaxError && "body" in error) {
      response.status(400).json({ error: "Invalid JSON request body." });
      return;
    }

    if (error instanceof HttpError) {
      response.status(error.status).json({ error: error.message });
      return;
    }

    console.error("Unhandled backend error", error);
    response.status(500).json({ error: "Something went wrong on the server." });
  }
);

app.listen(port, () => {
  console.log(`OpenRouter Image Studio API listening on http://localhost:${port}`);
});
