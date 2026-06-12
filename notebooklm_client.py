"""
Claude <-> NotebookLM bridge.
Usage:
    python notebooklm_client.py list
    python notebooklm_client.py ask <notebook_id> "your question"
    python notebooklm_client.py add <notebook_id> <url|file_path>
"""

import asyncio
import sys
import json
from notebooklm import NotebookLMClient


async def list_notebooks():
    async with NotebookLMClient.from_storage() as client:
        notebooks = await client.notebooks.list()
        for nb in notebooks:
            print(json.dumps({"id": nb.id, "title": nb.title}, ensure_ascii=False))


async def ask(notebook_id: str, question: str):
    async with NotebookLMClient.from_storage() as client:
        result = await client.chat.ask(notebook_id, question)
        print(result.text)


async def add_source(notebook_id: str, source: str):
    async with NotebookLMClient.from_storage() as client:
        if source.startswith("http://") or source.startswith("https://"):
            await client.sources.add_url(notebook_id, source)
            print(f"Added URL: {source}")
        else:
            await client.sources.add_file(notebook_id, source)
            print(f"Added file: {source}")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]

    if cmd == "list":
        asyncio.run(list_notebooks())
    elif cmd == "ask" and len(args) >= 3:
        asyncio.run(ask(args[1], " ".join(args[2:])))
    elif cmd == "add" and len(args) == 3:
        asyncio.run(add_source(args[1], args[2]))
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
