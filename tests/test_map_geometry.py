from types import SimpleNamespace as NS

from PIL import Image
from vacuum_map_parser_base.config.image_config import ImageConfig
from vacuum_map_parser_base.map_data import ImageData, MapData, Point, Room

from custom_components.roborock_companion.map_geometry import convert_map


def test_rotated_cropped_map_keeps_real_calibration_and_private_geometry():
    data = MapData(25500, 50)
    config = ImageConfig(scale=2, rotate=90)
    data.image = ImageData(
        100,
        400,
        300,
        100,
        100,
        config,
        Image.new("RGB", (200, 200)),
        lambda p: Point(p.x / 50, p.y / 50),
    )
    data.rooms = {16: Room(24000, 24000, 26000, 26000, 16, "Room 1", 25000, 25000)}
    out = convert_map(1, NS(name="Floor 1", rooms=[]), NS(map_data=data, image_content=b"image"))
    assert out["calibration"][0] == {
        "vacuum": {"x": 25500, "y": 25500},
        "map": {"x": -22.0, "y": -220.0},
    }
    assert out["rooms"][0]["id"] == 16
    assert out["preservation_complete"] is False
    assert out["edit_blocker"] == "preservation_unverified"
    assert "image_content" not in out


def test_no_geometry_never_synthesizes_a_transform():
    out = convert_map(0, NS(name="Floor", rooms=[]), None)
    assert out["calibration"] is None
    assert out["edit_blocker"] == "geometry_unavailable"
