/*
 * Calculadora de parámetros de corte (torno y fresadora).
 * Las fórmulas son las mismas de corte.py; la versión en Python, con sus
 * pruebas, sirve para comparar resultados.
 *
 * Unidades: mm y minutos. Vc [m/min], D [mm], n [rpm], f [mm/rev],
 * fz [mm/diente], Vf [mm/min], Q [cm³/min].
 */

// ===== Velocidades de corte ORIENTATIVAS (copia de materiales.py) =====
// Rango [mínimo, máximo] en m/min. PROVISIONALES: falta verificarlas con el
// catálogo del fabricante y con el instructor de CNC.
const MATERIALES = {
  "aluminio":           { HSS: [60, 120], carburo: [200, 400] },
  "acero bajo carbono": { HSS: [20, 30],  carburo: [120, 200] },
  "acero aleado":       { HSS: [12, 20],  carburo: [80, 150] },
  "acero inoxidable":   { HSS: [10, 18],  carburo: [60, 120] },
  "bronce / latón":     { HSS: [40, 70],  carburo: [150, 300] },
  "fundición gris":     { HSS: [15, 25],  carburo: [80, 150] },
};

// Avance de ejemplo al elegir cada máquina: f [mm/rev] en torno, fz [mm/diente] en fresadora
// (aproximados, igual que los ejemplos de main.py)
const AVANCE_POR_DEFECTO = { torno: 0.15, fresadora: 0.05 };

/** Punto medio del rango: un valor prudente para empezar. */
function vcRecomendada(material, herramienta) {
  const [minimo, maximo] = MATERIALES[material][herramienta];
  return (minimo + maximo) / 2;
}

// ===== Fórmulas (iguales a corte.py) =====

/** n = (Vc * 1000) / (pi * D). Se multiplica por 1000 porque Vc está en m y D en mm. */
function rpm(vc, diametro) {
  if (vc <= 0 || diametro <= 0) {
    throw new Error("Vc y el diámetro deben ser mayores que cero");
  }
  return (vc * 1000) / (Math.PI * diametro);
}

/** Torno: Vf = f * n [mm/min]. */
function avanceTorno(f, n) {
  return f * n;
}

/** Fresadora: Vf = fz * z * n [mm/min]. */
function avanceFresado(fz, z, n) {
  return fz * z * n;
}

/** t = L / Vf [min]. */
function tiempoMecanizado(longitud, vf) {
  if (vf <= 0) {
    throw new Error("La velocidad de avance debe ser mayor que cero");
  }
  return longitud / vf;
}

/** Q = ap * ae * Vf / 1000 [cm³/min]. */
function volumenViruta(ap, ae, vf) {
  return (ap * ae * vf) / 1000;
}

/** Si la máquina no llega a las rpm calculadas, se usa su máximo. */
function limitarRpm(n, rpmMaxima) {
  return Math.min(n, rpmMaxima);
}

/**
 * Hace todo el cálculo a partir de los datos del formulario.
 * Devuelve un objeto con los resultados (sin redondear).
 */
function calcular(datos) {
  const vc = vcRecomendada(datos.material, datos.herramienta);
  const nCalculada = rpm(vc, datos.diametro);
  const n = limitarRpm(nCalculada, datos.rpmMaxima);

  const vf = datos.maquina === "torno"
    ? avanceTorno(datos.avance, n)
    : avanceFresado(datos.avance, datos.dientes, n);

  const t = tiempoMecanizado(datos.longitud, vf);
  const q = datos.maquina === "fresadora" ? volumenViruta(datos.ap, datos.ae, vf) : null;

  return { vc, nCalculada, n, limitada: n < nCalculada, vf, t, q };
}

// ===== Formato de números =====

/** Entero con espacio de miles: 2865 -> "2 865". */
function entero(x) {
  return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ===== Parte visual (solo se ejecuta en el navegador) =====

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const formulario = $("formulario");

  // Llenar la lista de materiales desde la tabla
  for (const nombre of Object.keys(MATERIALES)) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    $("material").appendChild(opcion);
  }

  /** Lee un campo numérico; devuelve NaN si está vacío o mal escrito. */
  function numero(id) {
    return parseFloat($(id).value.replace(",", "."));
  }

  function leerDatos() {
    return {
      maquina: formulario.elements.maquina.value,
      material: $("material").value,
      herramienta: $("herramienta").value,
      diametro: numero("diametro"),
      rpmMaxima: numero("rpm-maxima"),
      avance: numero("avance"),
      dientes: numero("dientes"),
      longitud: numero("longitud"),
      ap: numero("ap"),
      ae: numero("ae"),
    };
  }

  /** Cambia etiquetas y oculta los campos de fresadora cuando es torno. */
  function ajustarSegunMaquina(maquina) {
    document.body.dataset.maquina = maquina;
    if (maquina === "torno") {
      $("etiqueta-diametro").textContent = "Diámetro de la pieza D [mm]";
      $("etiqueta-avance").textContent = "Avance por vuelta f [mm/rev]";
    } else {
      $("etiqueta-diametro").textContent = "Diámetro de la fresa D [mm]";
      $("etiqueta-avance").textContent = "Avance por diente fz [mm/diente]";
    }
    $("ayuda-avance").textContent = `Ejemplo: ${AVANCE_POR_DEFECTO[maquina]}`;
  }

  /** Revisa que los campos visibles tengan números mayores que cero. */
  function validar(datos) {
    const campos = [
      ["diametro", "el diámetro"],
      ["rpmMaxima", "las RPM máximas"],
      ["avance", "el avance"],
      ["longitud", "la longitud"],
    ];
    if (datos.maquina === "fresadora") {
      campos.push(["dientes", "el número de dientes"], ["ap", "ap"], ["ae", "ae"]);
    }
    for (const [clave, nombre] of campos) {
      if (!(datos[clave] > 0)) return `Escribe un número mayor que cero en ${nombre}.`;
    }
    if (datos.maquina === "fresadora" && !Number.isInteger(datos.dientes)) {
      return "El número de dientes debe ser un número entero.";
    }
    return null;
  }

  function limpiarResultados() {
    for (const id of ["res-vc", "res-rpm", "res-vf", "res-tiempo", "res-viruta"]) {
      $(id).textContent = "—";
    }
    $("res-vc-rango").textContent = "";
    $("res-tiempo-min").textContent = "";
    $("res-gcode").textContent = "S— F—";
    $("aviso-rpm").hidden = true;
  }

  function actualizar() {
    const datos = leerDatos();
    ajustarSegunMaquina(datos.maquina);

    const error = validar(datos);
    $("error").hidden = !error;
    if (error) {
      $("error").textContent = error;
      limpiarResultados();
      return;
    }

    const r = calcular(datos);
    const [vcMin, vcMax] = MATERIALES[datos.material][datos.herramienta];

    $("res-vc").textContent = entero(r.vc);
    $("res-vc-rango").textContent = `Rango orientativo ${vcMin}–${vcMax} m/min (se usa el punto medio)`;

    $("res-rpm").textContent = entero(r.n);
    $("aviso-rpm").hidden = !r.limitada;
    $("aviso-rpm").textContent =
      `Limitadas por la máquina: se calcularon ${entero(r.nCalculada)} rpm`;

    $("res-vf").textContent = entero(r.vf);
    $("res-gcode").textContent = `S${Math.round(r.n)} F${Math.round(r.vf)}`;

    $("res-tiempo").textContent = entero(r.t * 60);
    $("res-tiempo-min").textContent = `${r.t.toFixed(2)} min`;

    $("res-viruta").textContent = r.q === null ? "—" : r.q.toFixed(1);
  }

  // Al cambiar de máquina se pone su avance por defecto (f y fz son cosas distintas)
  for (const opcion of formulario.elements.maquina) {
    opcion.addEventListener("change", () => {
      $("avance").value = AVANCE_POR_DEFECTO[opcion.value];
    });
  }

  // Recalcula al instante cada vez que se cambia cualquier dato
  formulario.addEventListener("input", actualizar);
  formulario.addEventListener("change", actualizar);
  actualizar();
}

// Permite probar las fórmulas desde la terminal con Node.js (el navegador lo ignora)
if (typeof module !== "undefined") {
  module.exports = { MATERIALES, AVANCE_POR_DEFECTO, vcRecomendada, rpm, avanceTorno, avanceFresado,
    tiempoMecanizado, volumenViruta, limitarRpm, calcular };
}
