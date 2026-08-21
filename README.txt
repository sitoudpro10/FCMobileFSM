FC Mobile FSM — paquete de Fase 5
================================

Contenido:
- index.html: interfaz limpia, sin segundo sistema de autenticación.
- app.js: lógica principal, Supabase Auth, FSM IA segura, contador de usos desde el perfil, comparador, plantilla y mercado demo.
- players.js: base actual de demostración de jugadores.
- style.css: estilos actuales.
- README.txt: instrucciones.

IMPORTANTE
1) Este paquete NO contiene claves secretas de Supabase. Solo usa la publishable key del frontend.
2) La Edge Function `fsm-ai-secure` y la base de datos Supabase deben existir en el proyecto.
3) Esta entrega no incluye pagos Stripe; eso es la Fase 6.
4) Los precios de jugadores siguen siendo DEMO en esta fase.
5) El registro depende de la configuración de confirmación de email y de los límites de correo de Supabase.

PARA INSTALAR
1) Haz copia de seguridad del repositorio actual.
2) Sustituye index.html, app.js, players.js y style.css por estos archivos.
3) Haz Commit changes.
4) Espera a que Vercel muestre Ready.
5) Prueba una sola vez el registro para no disparar el límite de emails.

FLUJO DE FASE 5
Cuenta -> Supabase Auth -> perfil -> FSM IA -> Edge Function segura -> resultado -> usos restantes.

La autenticación está centralizada en app.js. index.html no contiene un segundo listener de login/registro.
