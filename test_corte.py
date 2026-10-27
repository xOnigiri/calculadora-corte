"""
Pruebas con valores calculados a mano. Ejecutar con:  python -m pytest
Si cambias una fórmula y una prueba falla, algo se rompió.
"""

import pytest
from corte import (rpm, avance_torno, avance_fresado, tiempo_mecanizado,
                   volumen_viruta_fresado, limitar_rpm)


def test_rpm_fresa_10mm_vc_100():
    # 100 * 1000 / (3.1416 * 10) = 3183 rpm
    assert rpm(100, 10) == pytest.approx(3183.1, abs=0.1)


def test_rpm_torno_pieza_50mm_vc_25():
    # 25 * 1000 / (3.1416 * 50) = 159 rpm
    assert rpm(25, 50) == pytest.approx(159.15, abs=0.01)


def test_avance_torno():
    assert avance_torno(0.2, 500) == pytest.approx(100)


def test_avance_fresado():
    # 0.05 mm/diente * 4 dientes * 3000 rpm = 600 mm/min
    assert avance_fresado(0.05, 4, 3000) == pytest.approx(600)


def test_tiempo():
    # 120 mm a 600 mm/min = 0.2 min = 12 s
    assert tiempo_mecanizado(120, 600) == pytest.approx(0.2)


def test_volumen_viruta():
    # 2 mm * 5 mm * 600 mm/min / 1000 = 6 cm³/min
    assert volumen_viruta_fresado(2, 5, 600) == pytest.approx(6)


def test_limitar_rpm():
    assert limitar_rpm(8000, 6000) == 6000
    assert limitar_rpm(3000, 6000) == 3000


def test_rpm_rechaza_cero():
    with pytest.raises(ValueError):
        rpm(100, 0)
