"""Bounded extra reads; normal state stays owned by HA's coordinator."""

from time import monotonic
from types import SimpleNamespace

from .adapter import AdapterError


async def async_refresh_map(adapter):
    previous = getattr(adapter, "_map_request_time", 0)
    if monotonic() - previous < 30:
        raise AdapterError("rate_limited")
    adapter._map_request_time = monotonic()
    api = adapter.coordinator.properties_api
    before = adapter.get_snapshot()
    generation = adapter.generation
    # Refresh the current map only: HomeTrait.refresh may discover/switch floors.
    if not getattr(api, "map_content", None):
        raise AdapterError("geometry_unavailable")
    await api.map_content.refresh()
    adapter.ensure_current()
    after = adapter.get_snapshot()
    if (
        generation == adapter.generation
        and len(before["maps"]) == 1
        and len(after["maps"]) == 1
        and before["current_map"] == after["current_map"]
        and after["state"] in ("idle", "docked")
    ):
        live = api.map_content
        adapter._verified_live = (
            generation,
            after["current_map"],
            SimpleNamespace(
                map_data=live.map_data,
                image_content=live.image_content,
                raw_api_response=live.raw_api_response,
            ),
        )
    adapter._notify()


async def async_history(adapter, params):
    if set(params) - {"offset", "limit"}:
        raise AdapterError("invalid_request")
    offset, limit = params.get("offset", 0), params.get("limit", 5)
    if (
        type(offset) is not int
        or type(limit) is not int
        or not 0 <= offset <= 1000
        or not 1 <= limit <= 10
    ):
        raise AdapterError("invalid_request")
    summary = getattr(adapter.coordinator.properties_api, "clean_summary", None)
    if summary is None:
        raise AdapterError("unsupported_operation")
    ids = list(getattr(summary, "records", None) or [])[:1000]
    records = []
    for record_id in ids[offset : offset + limit]:
        record = await summary.get_clean_record(record_id)
        adapter.ensure_current()
        records.append(
            {
                "id": record_id,
                "begin": getattr(record, "begin", None),
                "duration": getattr(record, "duration", None),
                "area": getattr(record, "area", None),
                "error": getattr(record, "error", None),
            }
        )
    return {
        "records": records,
        "offset": offset,
        "total": len(ids),
        "next_offset": offset + limit if offset + limit < len(ids) else None,
    }
