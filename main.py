"""
Calculadora de parámetros de corte (torno y fresadora).
Ejecutar con:  python main.py
"""

from corte import (rpm, avance_torno, avance_fresado, tiempo_mecanizado,
                   volumen_viruta_fresado, limitar_rpm)
from materiales import MATERIALES, vc_recomendada


def elegir(titulo, opciones):
    """Muestra una lista numerada y devuelve la opción elegida."""
    print(f"\n{titulo}")
    for i, opcion in enumerate(opciones, start=1):
        print(f"  {i}. {opcion}")
    while True:
        respuesta = input("Elige un número: ")
        if respuesta.isdigit() and 1 <= int(respuesta) <= len(opciones):
            return opciones[int(respuesta) - 1]
        print("Número no válido, intenta otra vez.")


def pedir_numero(texto):
    """Pide un número positivo (acepta coma o punto decimal)."""
    while True:
        valor = input(texto).replace(",", ".")
        try:
            numero = float(valor)
            if numero > 0:
                return numero
        except ValueError:
            pass
        print("Escribe un número mayor que cero.")


def main():
    print("=== Calculadora de parámetros de corte ===")

    maquina = elegir("¿Qué máquina?", ["torno", "fresadora"])
    material = elegir("¿Qué material vas a cortar?", list(MATERIALES))
    herramienta = elegir("¿Qué herramienta?", ["HSS", "carburo"])

    vc_min, vc_max = MATERIALES[material][herramienta]
    vc = vc_recomendada(material, herramienta)
    print(f"\nVc orientativa para {material} con {herramienta}: {vc_min}–{vc_max} m/min "
          f"(uso {vc:.0f} m/min)")

    if maquina == "torno":
        diametro = pedir_numero("Diámetro de la pieza [mm]: ")
    else:
        diametro = pedir_numero("Diámetro de la fresa [mm]: ")
    rpm_maxima = pedir_numero("RPM máximas de la máquina: ")

    n_calculada = rpm(vc, diametro)
    n = limitar_rpm(n_calculada, rpm_maxima)

    if maquina == "torno":
        f = pedir_numero("Avance por vuelta f [mm/rev] (ej. 0.15): ")
        vf = avance_torno(f, n)
    else:
        fz = pedir_numero("Avance por diente fz [mm/diente] (ej. 0.05): ")
        z = int(pedir_numero("Número de dientes de la fresa: "))
        vf = avance_fresado(fz, z, n)

    longitud = pedir_numero("Longitud a mecanizar en una pasada [mm]: ")
    t = tiempo_mecanizado(longitud, vf)

    print("\n--- Resultados ---")
    print(f"RPM calculadas:        {n_calculada:,.0f} rpm")
    if n < n_calculada:
        print(f"RPM usadas:            {n:,.0f} rpm  (limitadas por la máquina)")
    print(f"Velocidad de avance:   {vf:,.0f} mm/min   -> en código G: S{n:.0f} F{vf:.0f}")
    print(f"Tiempo por pasada:     {t:.2f} min  ({t * 60:.0f} s)")

    if maquina == "fresadora":
        ap = pedir_numero("\nProfundidad de corte ap [mm]: ")
        ae = pedir_numero("Ancho de corte ae [mm]: ")
        q = volumen_viruta_fresado(ap, ae, vf)
        print(f"Volumen de viruta:     {q:.1f} cm³/min")

    print("\nRecuerda: son valores para empezar. Ajusta según el sonido, la viruta y el catálogo.")


if __name__ == "__main__":
    main()
