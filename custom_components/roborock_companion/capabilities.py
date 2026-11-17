"""Derive features from actual traits and map evidence, not retail names."""

MAP_FEATURES = {
    "room_split": "is_re_segment_supported",
    "room_merge": "is_re_segment_supported",
    "floor_material": "is_support_floor_edit",
    "map_backup": "is_support_backup_map",
    "map_restore": "is_support_backup_map",
    "map_build": "is_support_quick_map_builder",
}


def capabilities(adapter, maps):
    api = adapter.coordinator.properties_api if adapter.coordinator else None
    features = getattr(api, "device_features", None)
    result = {
        key: {
            "status": "available" if getattr(features, flag, False) else "unverified",
            "reason": None if getattr(features, flag, False) else "model_unverified",
        }
        for key, flag in MAP_FEATURES.items()
    }
    current = next((m for m in maps if m.get("active")), None)
    can_replace = bool(len(maps) == 1 and current and current.get("preservation_complete"))
    result["map_restrictions_save"] = {
        "status": "available" if can_replace else "unverified",
        "reason": None if can_replace else "preservation_unverified",
    }
    for key in (
        "carpets_save",
        "thresholds_save",
        "room_cleaning_order",
        "smartplan",
        "manual_drive",
        "map_rename",
        "map_delete",
    ):
        result[key] = {"status": "unverified", "reason": "model_unverified"}
    return result
