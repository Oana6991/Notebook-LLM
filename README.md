# Notebook-LLM — Claude ↔ NotebookLM Bridge

Query and chat with your Google NotebookLM notebooks from Claude.

## Setup

```bash
pip install -r requirements.txt
playwright install chromium
```

## Step 1: Login (once)

```bash
python3 login.py
```

This opens a browser. Log in with your Google account, then close it. Your session is saved locally.

## Step 2: List your notebooks

```bash
python3 notebooklm_client.py list
```

## Step 3: Ask a question

```bash
python3 notebooklm_client.py ask <notebook_id> "What are the key insights?"
```

## Step 4: Add a source

```bash
# Add a URL
python3 notebooklm_client.py add <notebook_id> https://example.com/article

# Add a local file (PDF, TXT, DOCX, etc.)
python3 notebooklm_client.py add <notebook_id> ./my_document.pdf
```

## Supported source types

- URLs (web pages, articles)
- PDFs
- Text files (.txt, .md)
- Google Docs / Drive links
- YouTube video URLs
