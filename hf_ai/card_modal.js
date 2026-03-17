import { InferenceClient } from "@huggingface/inference";

// inference client snippet
const client = new InferenceClient(process.env.HF_TOKEN);

const chatCompletion = await client.chatCompletion({
    model: "CohereLabs/tiny-aya-water:cohere",
    messages: [
        {
            role: "user",
            content: "What is the capital of France?",
        },
    ],
});

console.log(chatCompletion.choices[0].message);

let out = "";

const stream = client.chatCompletionStream({
    model: "CohereLabs/tiny-aya-water",
    messages: [
        { role: "user", content: "What is the capital of France?" }
    ],
});

for await (const chunk of stream) {
    if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
        console.log(newContent);
    }
}

// fetch snippet
async function query(data) {
    const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({
    messages: [
        {
            role: "user",
            content: "What is the capital of France?",
        },
    ],
    model: "CohereLabs/tiny-aya-water:cohere",
}).then((response) => {
    console.log(JSON.stringify(response));
});