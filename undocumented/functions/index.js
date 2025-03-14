/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);
const admin = require("firebase-admin"); // Import Firebase Admin SDK

dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

// app.set("trust proxy", true);

// Capture and log user IP addresses
// app.use((req, res, next) => {
//   const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//   console.log("User IP Address:", userIP);
//   next();
// });

// Dynamic allowed origins based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://undocumented.app", "http://localhost:4449"]
    : ["https://undocumented.app", "http://localhost:4449"];

// Middleware to check the Referer or Origin header
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (
    !origin ||
    !allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin))
  ) {
    return res.status(403).send({ error: "invalid" });
  }
  next();
});

// Function to capture and return user IP address
// exports.captureUserIP = functions.https.onRequest((req, res) => {
//   const userIP =
//     req.headers["x-forwarded-for"] || // From proxies, if available
//     req.connection.remoteAddress || // Direct IP from socket
//     req.socket.remoteAddress || // Another socket fallback
//     req.ip; // Express/Node default

//   console.log("Detected User IP:", userIP);
//   res.status(200).send(`Your IP is: ${userIP}`);
// });

// Middleware to verify App Check tokens
async function verifyAppCheckToken(req, res, next) {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    console.warn("Request missing App Check token. Rejecting request.");
    res.status(401).send({ error: "App Check token missing" });
    return;
  }

  try {
    // Verify the App Check token using Firebase Admin SDK
    await admin.appCheck().verifyToken(appCheckToken);
    next();
  } catch (err) {
    console.error("Invalid App Check token:", err);
    res.status(401).send({ error: "Invalid App Check token" });
  }
}

// Function to calculate the number of characters
function calculateCharacterCount(messages) {
  const characterCount = messages.reduce((total, message) => {
    return total + (message.content ? message.content.length : 0);
  }, 0);
  return characterCount;
}

// Apply the App Check middleware to your route
app.post("/generate", verifyAppCheckToken, async (req, res) => {
  try {
    const { model, messages, ...restOfApiParams } = req.body;

    // Calculate the number of characters in the input messages
    const characterCount = calculateCharacterCount(messages || []);
    const maxCharacterLimit = 25000;

    if (characterCount > maxCharacterLimit) {
      return res.status(400).send({
        error: `Character count exceeds the limit of ${maxCharacterLimit} characters.`,
      });
    }

    // Construct the payload for OpenAI API
    const constructor = {
      model: "gpt-4o-mini",
      messages: messages || [],
      stream: false, // Disable streaming
      ...restOfApiParams,
    };

    // Make the OpenAI API call using node-fetch
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(constructor),
      }
    );

    if (openaiResponse.status === 429) {
      const retryAfter = "300"; // Default to 300 seconds if header is missing
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).send({
        error: "Rate limit exceeded.",
        retryAfter: retryAfter,
      });
    }

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    // Parse the entire response body as JSON
    const openaiData = await openaiResponse.json();

    // Send the complete response back to the frontend
    res.status(200).json(openaiData);
  } catch (error) {
    console.error("Error generating completion:", error);
    res.status(500).send({ error: error.message });
  }
});

app.post("/websearch", verifyAppCheckToken, async (req, res) => {
  try {
    // Extract properties from the request body
    // Use 'input' for the main content (string or array) and optionally include other parameters.
    const { model, input, tools, ...rest } = req.body;

    // Optionally check input length if input is a string (or sum over an array)
    const maxCharacterLimit = 25000;
    let inputLength = 0;
    if (typeof input === "string") {
      inputLength = input.length;
    } else if (Array.isArray(input)) {
      inputLength = input.reduce(
        (total, item) => total + (typeof item === "string" ? item.length : 0),
        0
      );
    }
    if (inputLength > maxCharacterLimit) {
      return res.status(400).send({
        error: `Input exceeds the limit of ${maxCharacterLimit} characters.`,
      });
    }

    // Build the payload for the Responses API.
    // Default to using the web_search_preview tool if not provided.
    const payload = {
      model: model || "gpt-4o",
      input: input,
      tools: tools || [
        {
          type: "web_search_preview",
          // You can add additional tool options like search_context_size or user_location here.
        },
      ],
      ...rest,
    };

    // Make the OpenAI API call using node-fetch
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (openaiResponse.status === 429) {
      const retryAfter = openaiResponse.headers.get("Retry-After") || "300";
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).send({
        error: "Rate limit exceeded.",
        retryAfter: retryAfter,
      });
    }

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    res.status(200).json(openaiData);
  } catch (error) {
    console.error("Error generating websearch response:", error);
    res.status(500).send({ error: error.message });
  }
});

exports.app = functions.https.onRequest(app);
