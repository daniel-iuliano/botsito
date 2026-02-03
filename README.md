<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nexus Scalper Pro (CoinEx Edition)

Bot de trading con panel web para CoinEx. Incluye modo simulación y control del bot desde la interfaz.

## Requisitos
- Node.js (recomendado 18+)
- Una cuenta en CoinEx (solo si vas a usar modo real)

## Paso a paso (local)
1. Instala dependencias:
   ```bash
   npm install
   ```
2. (Opcional) Define tu `GEMINI_API_KEY` en `.env.local` si tu build lo requiere:
   ```env
   GEMINI_API_KEY=tu_api_key
   ```
3. Levanta frontend + backend:
   ```bash
   npm run dev
   ```
   Esto inicia:
   - Frontend Vite: `http://localhost:3000`
   - API Express: `http://localhost:4000`
4. Abre el panel en el navegador:
   ```
   http://localhost:3000
   ```

## Cómo usar el bot
1. **Conectar cuenta CoinEx**
   - Abre el panel y completa *API Key* y *API Secret*.
   - Presiona **Connect** para autenticar.
2. **Elegir modo**
   - **PAPER SIMULATION**: modo de prueba sin operar en real.
   - **LIVE PRODUCTION**: operaciones reales (requiere confirmación de riesgo).
3. **Configurar parámetros**
   - Ve a la pestaña **Config**.
   - Ajusta límites de riesgo, take profit, stop loss, etc.
4. **Iniciar/Detener**
   - Presiona **ENGAGE** para arrancar el bot.
   - Presiona **HALT** para detenerlo.
5. **Monitoreo**
   - **Terminal**: estado general y balance.
   - **Scanner**: oportunidades detectadas.
   - **History**: operaciones ejecutadas.

## Scripts útiles
```bash
npm run dev        # frontend + backend
npm run dev:client # solo frontend
npm run dev:server # solo backend
npm run build      # build producción
```
