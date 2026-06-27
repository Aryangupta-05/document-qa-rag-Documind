# DocuMind AI

DocuMind AI is a full-stack RAG-based document question-answering application.

It allows users to upload documents, extract text, split the text into chunks, generate embeddings, store searchable vectors in FAISS, and ask questions over uploaded documents using an LLM.

The goal of this project is to understand and build a production-style AI document assistant using FastAPI, React, PostgreSQL, LangChain, FAISS, and Groq.

---

## Features

- Upload documents
- Extract text from TXT, PDF, DOCX, Markdown, and HTML files
- Store original files and processed text separately
- Split large document text into smaller chunks
- Generate embeddings using HuggingFace SentenceTransformers
- Store vectors in FAISS for semantic search
- Ask questions using a RAG pipeline
- Generate answers using Groq LLM through LangChain
- Select specific documents for chat
- View query history
- View analytics dashboard
- Rebuild FAISS index from processed documents
- Delete uploaded documents
- Preview processed text
- Backend tests for health, chunking, and extraction
- React frontend with Tailwind CSS, Zustand, and Axios

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Axios
- Lucide React Icons

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic Settings

### AI / RAG

- LangChain
- HuggingFace SentenceTransformers
- FAISS
- Groq API

### DevOps

- Git and GitHub
- Docker support started
- `.env.example`
- `.dockerignore`

---

## What Problem Does This Solve?

Large documents are difficult to search manually.

A normal LLM cannot automatically know the contents of a user's uploaded PDF, DOCX, or text file. If we ask the LLM directly, it may answer from general knowledge or hallucinate.

DocuMind AI solves this using RAG.

RAG stands for Retrieval-Augmented Generation.

It first retrieves relevant document chunks, then gives those chunks to the LLM so the answer is grounded in the uploaded documents.

---

## High-Level Architecture

```mermaid
flowchart LR
    User[User] --> Frontend[React Frontend]

    Frontend -->|HTTP API Requests| Backend[FastAPI Backend]

    Backend --> DB[(PostgreSQL)]
    Backend --> Files[Local File Storage]
    Backend --> Extractor[Text Extraction Service]
    Backend --> Chunker[Chunking Service]
    Backend --> Embeddings[Embedding Service]
    Backend --> VectorDB[FAISS Vector Store]
    Backend --> LLM[Groq LLM via LangChain]

    Files --> Extractor
    Extractor --> Chunker
    Chunker --> Embeddings
    Embeddings --> VectorDB
    VectorDB --> Backend
    DB --> Backend
    LLM --> Backend
    Backend --> Frontend