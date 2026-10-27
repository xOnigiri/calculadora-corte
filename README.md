# Calculadora de parámetros de corte

Programa en Python que calcula las **RPM**, la **velocidad de avance**, el **tiempo de mecanizado** y el **volumen de viruta** para torno y fresadora, a partir del material, la herramienta y las dimensiones de la pieza.

Lo hice para unir dos cosas que manejo: la manufactura (trabajo en el taller familiar desde 2017 y me formo en CNC en Tecsup) y la programación (certificado Full Stack, Egg 2024).

## Cómo usarlo

```bash
python main.py
```

Ejemplo — fresar aluminio con una fresa HSS de 10 mm y 4 dientes:

```
RPM calculadas:        2,865 rpm
Velocidad de avance:   573 mm/min   -> en código G: S2865 F573
Tiempo por pasada:     0.21 min  (13 s)
Volumen de viruta:     5.7 cm³/min
```

Para comprobar que las fórmulas funcionan:

```bash
pip install pytest
python -m pytest
```

## Fórmulas

| Qué calcula | Fórmula | Unidad |
|---|---|---|
| Velocidad del husillo | n = (Vc × 1000) / (π × D) | rpm |
| Avance en torno | Vf = f × n | mm/min |
| Avance en fresadora | Vf = fz × z × n | mm/min |
| Tiempo de una pasada | t = L / Vf | min |
| Volumen de viruta | Q = ap × ae × Vf / 1000 | cm³/min |

**Idea visual:** en una vuelta, el filo recorre el contorno de la pieza (π × D). Si el material "aguanta" que el filo pase a Vc metros por minuto, las RPM son cuántas vueltas caben en esa distancia. Por eso una pieza grande gira más lento que una pequeña con el mismo material.

## Archivos

- `corte.py` — las fórmulas.
- `materiales.py` — velocidades de corte por material y herramienta.
- `main.py` — el programa que pregunta los datos y muestra los resultados.
- `test_corte.py` — pruebas con valores calculados a mano.

## Advertencia

Las velocidades de `materiales.py` son **orientativas**. Antes de cortar, se verifican con el catálogo del fabricante de la herramienta y con el instructor o el maquinista responsable.

## Próximas mejoras

- [ ] Agregar materiales y valores reales de los catálogos que use en Tecsup.
- [ ] Opción para trabajar en pulgadas.
- [ ] Calcular el tiempo total de una pieza con varias pasadas.
- [ ] Versión web sencilla (HTML + JavaScript).
