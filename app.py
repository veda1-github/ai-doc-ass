import os
import time
from transformers import BartTokenizer, BartForConditionalGeneration
import streamlit as st

# Load the BART model and tokenizer
@st.cache_resource
def load_model():
    tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
    model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
    return tokenizer, model

# Read documents
def load_documents(folder_path="documents"):
    docs = []
    for filename in os.listdir(folder_path):
        with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as file:
            content = file.read()
            docs.append((filename, content))
    return docs

# Ask question using BART
def ask_bart(query, documents):
    tokenizer, model = load_model()
    context = "\n\n".join([f"{name}:\n{content}" for name, content in documents])
    full_input = f"question: {query} context: {context[:1024]}"  # Truncate context if too long

    inputs = tokenizer([full_input], max_length=1024, return_tensors='pt', truncation=True)
    summary_ids = model.generate(inputs['input_ids'], num_beams=4, max_length=200, early_stopping=True)
    output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return output

# Streamlit UI
st.title("📚 Smart Doc Assistant (BART Version)")
query = st.text_input("Ask your question from the documents:")

if query:
    with st.spinner("Thinking..."):
        documents = load_documents()
        answer = ask_bart(query, documents)
        if answer:
            st.success("Answer:")
            st.write(answer)
