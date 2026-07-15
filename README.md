# Prototipo de calculadora de pensiones

Prototipo estático de una **pre-evaluación pensionaria IMSS** desarrollado con HTML, CSS y JavaScript puro.

## Alcance

- Captura datos personales y laborales.
- Estima la edad a partir de la CURP.
- Calcula los meses aproximados faltantes para cumplir 60 años.
- Evalúa semanas cotizadas, año declarado de inicio laboral, situación de baja y cotización vigente.
- Genera una ruta orientativa: candidato preliminar, revisión especializada o fuera de la ruta estándar.
- Procesa toda la información localmente en el navegador.

No consulta al IMSS, no almacena datos, no calcula una cantidad de pensión y no sustituye una validación documental, legal, actuarial o una resolución oficial.

## Archivos

- `index.html`: estructura del formulario.
- `styles.css`: diseño responsivo.
- `app.js`: validaciones y lógica de evaluación.
- `vercel.json`: configuración estática y encabezados de seguridad.

## Despliegue en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsebastianazcona-gpf%2Fprototipo-calculadora-pensiones)

También puede importarse manualmente desde Vercel seleccionando este repositorio. No requiere comando de compilación ni variables de entorno.

## Aviso

**Pendiente de revisión de Legal (Jorge Rico) antes de uso externo.**
