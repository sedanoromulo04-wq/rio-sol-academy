import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOKLM_SRC = ROOT / "NotebookLM" / "notebooklm-py-main" / "src"

sys.path.insert(0, str(NOTEBOOKLM_SRC))

from notebooklm import NotebookLMClient  # type: ignore  # noqa: E402


def notebook_to_dict(notebook):
    return {
        "id": notebook.id,
        "title": notebook.title,
        "createdAt": notebook.created_at.isoformat() if notebook.created_at else None,
        "sourceCount": notebook.sources_count,
        "isOwner": notebook.is_owner,
    }


def source_to_dict(source):
    return {
        "id": source.id,
        "title": source.title,
        "url": source.url,
        "kind": source.kind.value if hasattr(source.kind, "value") else str(source.kind),
        "status": int(source.status),
        "isReady": source.is_ready,
    }


def artifact_to_dict(artifact):
    return {
        "id": artifact.id,
        "title": artifact.title,
        "kind": artifact.kind.value if hasattr(artifact.kind, "value") else str(artifact.kind),
        "status": int(artifact.status),
        "url": artifact.url,
        "createdAt": artifact.created_at.isoformat() if artifact.created_at else None,
    }


def reference_to_dict(reference, source_titles):
    return {
        "sourceId": reference.source_id,
        "sourceTitle": source_titles.get(reference.source_id),
        "citationNumber": reference.citation_number,
        "citedText": reference.cited_text,
        "startChar": reference.start_char,
        "endChar": reference.end_char,
        "chunkId": reference.chunk_id,
    }


async def handle_status():
    async with await NotebookLMClient.from_storage() as client:
        notebooks = await client.notebooks.list()
        return {
            "authenticated": True,
            "storagePath": str(Path.home() / ".notebooklm" / "storage_state.json"),
            "notebookCount": len(notebooks),
        }


async def handle_list_notebooks():
    async with await NotebookLMClient.from_storage() as client:
        notebooks = await client.notebooks.list()
        return {"notebooks": [notebook_to_dict(notebook) for notebook in notebooks]}


async def handle_get_notebook(payload):
    notebook_id = payload["notebookId"]
    async with await NotebookLMClient.from_storage() as client:
        notebooks = await client.notebooks.list()
        notebook = next((item for item in notebooks if item.id == notebook_id), None)
        if notebook is None:
          raise ValueError(f"Notebook {notebook_id} not found.")

        description = await client.notebooks.get_description(notebook_id)
        sources = await client.sources.list(notebook_id)
        audio_artifacts = await client.artifacts.list_audio(notebook_id)

        return {
            "notebook": notebook_to_dict(notebook),
            "summary": description.summary,
            "suggestedTopics": [
                {"question": topic.question, "prompt": topic.prompt}
                for topic in description.suggested_topics
            ],
            "sources": [source_to_dict(source) for source in sources],
            "audioArtifacts": [artifact_to_dict(artifact) for artifact in audio_artifacts],
        }


async def handle_generate_podcast(payload):
    notebook_id = payload["notebookId"]
    title = payload.get("title", "").strip()
    brief = payload.get("brief", "").strip()
    language = payload.get("language", "pt")
    timeout_seconds = float(payload.get("timeoutSeconds", 900))
    instructions = "\n".join(part for part in [title, brief] if part)

    async with await NotebookLMClient.from_storage() as client:
        status = await client.artifacts.generate_audio(
            notebook_id,
            language=language,
            instructions=instructions or None,
        )
        final_status = await client.artifacts.wait_for_completion(
            notebook_id,
            status.task_id,
            timeout=timeout_seconds,
        )
        audio_artifacts = await client.artifacts.list_audio(notebook_id)
        artifact = next((item for item in audio_artifacts if item.id == status.task_id), None)

        return {
            "taskId": status.task_id,
            "status": final_status.status,
            "artifact": artifact_to_dict(artifact) if artifact else None,
        }


async def handle_ask(payload):
    notebook_id = payload["notebookId"]
    question = payload["question"].strip()
    conversation_id = payload.get("conversationId") or None
    source_ids = payload.get("sourceIds") or None

    if not question:
        raise ValueError("Question is required.")

    async with await NotebookLMClient.from_storage() as client:
        result = await client.chat.ask(
            notebook_id,
            question,
            source_ids=source_ids,
            conversation_id=conversation_id,
        )
        sources = await client.sources.list(notebook_id)
        source_titles = {source.id: source.title for source in sources}

        return {
            "answer": result.answer,
            "conversationId": result.conversation_id,
            "turnNumber": result.turn_number,
            "isFollowUp": result.is_follow_up,
            "references": [
                reference_to_dict(reference, source_titles) for reference in result.references[:12]
            ],
        }


async def dispatch(command, payload):
    if command == "status":
        return await handle_status()
    if command == "list_notebooks":
        return await handle_list_notebooks()
    if command == "get_notebook":
        return await handle_get_notebook(payload)
    if command == "generate_podcast":
        return await handle_generate_podcast(payload)
    if command == "ask":
        return await handle_ask(payload)
    raise ValueError(f"Unsupported command: {command}")


def main():
    command = sys.argv[1]
    payload = json.loads(sys.stdin.read() or "{}")
    try:
        data = asyncio.run(dispatch(command, payload))
        sys.stdout.write(json.dumps({"ok": True, "data": data}, ensure_ascii=True))
    except Exception as error:  # noqa: BLE001
        sys.stdout.write(
            json.dumps(
                {
                    "ok": False,
                    "error": {
                        "message": str(error),
                        "type": error.__class__.__name__,
                    },
                },
                ensure_ascii=True,
            )
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
