from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "CohereLabs/tiny-aya-water"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

# Format message with the chat template
messages = [{"role": "user", "content": ""}]
input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt",
)

gen_tokens = model.generate(
    input_ids,
    max_new_tokens=4096,
    do_sample=True,
    temperature=0.1,
    top_p=0.95
)

gen_text = tokenizer.decode(gen_tokens[0])
print(gen_text)
