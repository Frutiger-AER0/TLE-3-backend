import {InferenceClient, InferenceClientInputError} from "@huggingface/inference";
import {
    InferenceClientError,
    InferenceClientProviderApiError,
    InferenceClientProviderOutputError,
    InferenceClientHubApiError,
} from "@huggingface/inference";

const client = new InferenceClient();

try {
    const result = await client.textGeneration({
        model: "CohereLabs/tiny-aya-water",
        inputs: "Hello, I'm a language model",
    });
} catch (error) {
    if (error instanceof InferenceClientProviderApiError) {
        // Handle API errors (e.g., rate limits, authentication issues)
        console.error("Provider API Error:", error.message);
        console.error("HTTP Request details:", error.request);
        console.error("HTTP Response details:", error.response);
        if (error instanceof InferenceClientHubApiError) {
            // Handle API errors (e.g., rate limits, authentication issues)
            console.error("Hub API Error:", error.message);
            console.error("HTTP Request details:", error.request);
            console.error("HTTP Response details:", error.response);
        } else if (error instanceof InferenceClientProviderOutputError) {
            // Handle malformed responses from providers
            console.error("Provider Output Error:", error.message);
        } else if (error instanceof InferenceClientInputError) {
            // Handle invalid input parameters
            console.error("Input Error:", error.message);
        } else {
            // Handle unexpected errors
            console.error("Unexpected error:", error);
        }
    }

/// Catch all errors from @huggingface/inference
    try {
        const result = await client.textGeneration({
            model: "CohereLabs/tiny-aya-water",
            inputs: "Hello, I'm a language model",
        });
    } catch (error) {
        if (error instanceof InferenceClientError) {
            // Handle errors from @huggingface/inference
            console.error("Error from InferenceClient:", error);
        } else {
            // Handle unexpected errors
            console.error("Unexpected error:", error);
        }
    }
}