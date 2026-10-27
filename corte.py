"""
Fórmulas básicas de parámetros de corte para torno y fresadora.

Unidades (siempre en milímetros y minutos):
    Vc  = velocidad de corte       [m/min]  -> qué tan rápido pasa el filo por el material
    D   = diámetro                 [mm]     -> de la pieza (torno) o de la fresa (fresadora)
    n   = velocidad del husillo    [rpm]    -> vueltas por minuto
    f   = avance por vuelta        [mm/rev] -> torno
    fz  = avance por diente        [mm/diente] -> fresadora
    z   = número de dientes (filos) de la fresa
    Vf  = velocidad de avance      [mm/min] -> lo que va en la F del código G
"""

import math


def rpm(vc, diametro):
    """Velocidad del husillo: n = (Vc * 1000) / (pi * D).

    Se multiplica por 1000 porque Vc está en metros y D en milímetros.
    Ejemplo visual: una vuelta recorre el contorno (pi * D). Si el filo debe
    recorrer Vc metros por minuto, n es cuántos contornos caben en esa distancia.
    """
    if vc <= 0 or diametro <= 0:
        raise ValueError("Vc y el diámetro deben ser mayores que cero")
    return (vc * 1000) / (math.pi * diametro)


def avance_torno(f, n):
    """Velocidad de avance en torno: Vf = f * n  [mm/min]."""
    return f * n


def avance_fresado(fz, z, n):
    """Velocidad de avance en fresadora: Vf = fz * z * n  [mm/min].

    Cada diente corta fz mm por vuelta; con z dientes, la fresa avanza fz * z por vuelta.
    """
    return fz * z * n


def tiempo_mecanizado(longitud, vf):
    """Tiempo de una pasada: t = L / Vf  [min]."""
    if vf <= 0:
        raise ValueError("La velocidad de avance debe ser mayor que cero")
    return longitud / vf


def volumen_viruta_fresado(ap, ae, vf):
    """Volumen de material removido por minuto: Q = ap * ae * Vf / 1000  [cm³/min].

    ap = profundidad de corte [mm], ae = ancho de corte [mm].
    Sirve para comparar qué tan "agresivo" es un corte.
    """
    return ap * ae * vf / 1000


def limitar_rpm(n, rpm_maxima):
    """Si la máquina no llega a las rpm calculadas, se usa su máximo."""
    return min(n, rpm_maxima)
