# Vite + Deno + React + TypeScript

## Running

You need to have Deno v2.0.0 or later installed to run this repo.

Start a dev server where localhost:5173 will host the frontend and localhost:8080 will host the backend that connects to the database:

```
$ deno task dev
```

## Deploy

Build production assets:

```
$ deno task build
```
Proyecto semestral de Felipe Alonso Madrid Jaramillo (ZetaBeeM), Benjamín Octavio Rodríguez Fuentes (BenjaR23), y Diego Jiménez Riveros (Diegojimnz53) para TICS420 (Programación Profesional), siguiendo la tematica P10.- Ventas de entradas a eventos y conciertos.

El proyecto busca incluir las siguientes funcionalidades:

1) Venta y compra de entradas
   - Sistema de compra directa pensando en distintos precios, paquetes y disponibilidad de los mismos.
   - Confirmación digital con códigos QR para el acceso.
   - Asociar ventas a QR carnet de identidad.
2) Sistema de reventa y transferencia segura
   - Permitir a los usuarios revender sus tickets dentro de la plataforma
   - Transferencia de tickets a otros usuarios sin riesgo de fraude.
3) Check-In, aforos y disponibilidad en tiempo real
   - Inscripción o check-in una vez ingresado al evento, otro usuario con el mismo carnet y/o código no debe poder ingresar.
   - Alertas a organizadores si los espacios se están saturando en tiempo real.
4) Cupones o vouchers para uso interno durante el evento
   - Generación de vouchers o cupones para ser canjeados durante el evento. Ejemplo: evento PAES UAI, cupón válido por un snack.
5) Opcional: Check-Out
   - Para eventos donde sea necesario entrar y salir de distintas zonas. Idealmente con reconocimiento automático / detección de personas mediante una cámara.
