"""Map DTOs from the official parser, without guessing image calibration."""

import math

from .map_audit import audit_map


def _point(point):
    if point is None:
        return None
    if not all(math.isfinite(v) for v in (point.x, point.y)):
        return None
    return {"x": point.x, "y": point.y}


def convert_map(map_id, info, content):
    data = getattr(content, "map_data", None)
    calibration = data.calibration() if data is not None else None
    if calibration and any(
        not math.isfinite(v)
        for row in calibration
        for point in row.values()
        for v in point.values()
    ):
        calibration = None
    names = {r.segment_id: r.name for r in getattr(info, "rooms", [])}
    rooms = []
    for room in list((getattr(data, "rooms", None) or {}).values())[:128]:
        rooms.append(
            {
                "id": room.number,
                "name": names.get(room.number) or room.name or str(room.number),
                "x": room.pos_x if room.pos_x is not None else (room.x0 + room.x1) / 2,
                "y": room.pos_y if room.pos_y is not None else (room.y0 + room.y1) / 2,
                "bounds": [room.x0, room.y0, room.x1, room.y1],
            }
        )
    if not rooms:
        rooms = [
            {"id": r.segment_id, "name": r.name or str(r.segment_id)}
            for r in getattr(info, "rooms", [])
        ][:128]
    dimensions = getattr(getattr(data, "image", None), "dimensions", None)
    rotation = getattr(dimensions, "rotation", 0)
    width = getattr(dimensions, "width", 0) * getattr(dimensions, "scale", 1)
    height = getattr(dimensions, "height", 0) * getattr(dimensions, "scale", 1)
    angle = math.radians(rotation)
    display_width = abs(width * math.cos(angle)) + abs(height * math.sin(angle))
    display_height = abs(width * math.sin(angle)) + abs(height * math.cos(angle))
    rendered_size = getattr(getattr(getattr(data, "image", None), "data", None), "size", None)
    if rendered_size and len(rendered_size) == 2:
        display_width, display_height = rendered_size
    audit = audit_map(getattr(content, "raw_api_response", None))
    complete = bool(
        calibration
        and len(getattr(data, "walls", None) or []) <= 128
        and len(getattr(data, "no_go_areas", None) or []) <= 128
        and audit["blocker"] is None
        and audit["counts"].get(9, 0) == len(getattr(data, "no_go_areas", None) or [])
        and audit["counts"].get(10, 0) == len(getattr(data, "walls", None) or [])
    )
    return {
        "id": map_id,
        "name": info.name or str(map_id),
        "rooms": rooms,
        "calibration": calibration,
        "width": display_width,
        "height": display_height,
        "robot": _point(getattr(data, "vacuum_position", None)),
        "charger": _point(getattr(data, "charger", None)),
        "walls": [w.as_list() for w in (getattr(data, "walls", None) or [])][:128],
        "no_go": [a.as_list() for a in (getattr(data, "no_go_areas", None) or [])][:128],
        "no_mop": [a.as_list() for a in (getattr(data, "no_mopping_areas", None) or [])][:128],
        "path": [
            [_point(p) for p in segment[:5000]]
            for segment in (getattr(getattr(data, "path", None), "path", None) or [])[:16]
        ],
        # Parser 0.1.5 omits some restriction types/flags; never replace the whole set.
        "preservation_complete": complete,
        "edit_blocker": None
        if complete
        else "preservation_unverified"
        if calibration
        else "geometry_unavailable",
    }
