"""
Velocidades de corte ORIENTATIVAS (Vc en m/min), como rango (mínimo, máximo).

IMPORTANTE: son valores de referencia general para empezar.
Los valores reales dependen de la herramienta exacta, la máquina, el refrigerante
y la rigidez del montaje. Verifícalos siempre con:
  - el catálogo del fabricante de la herramienta (Sandvik, Iscar, etc.), y
  - tu instructor de CNC en Tecsup.

HSS     = acero rápido (herramienta más barata, más lenta)
carburo = metal duro / insertos (más rápido, más caro)
"""

MATERIALES = {
    "aluminio":            {"HSS": (60, 120), "carburo": (200, 400)},
    "acero bajo carbono":  {"HSS": (20, 30),  "carburo": (120, 200)},
    "acero aleado":        {"HSS": (12, 20),  "carburo": (80, 150)},
    "acero inoxidable":    {"HSS": (10, 18),  "carburo": (60, 120)},
    "bronce / latón":      {"HSS": (40, 70),  "carburo": (150, 300)},
    "fundición gris":      {"HSS": (15, 25),  "carburo": (80, 150)},
}


def vc_recomendada(material, herramienta):
    """Devuelve el punto medio del rango: un valor prudente para empezar."""
    minimo, maximo = MATERIALES[material][herramienta]
    return (minimo + maximo) / 2
