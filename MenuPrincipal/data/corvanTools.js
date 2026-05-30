// ═══════════════════════════════════════════════════════════════
//  MINERALIS · corvanTools.js
//  Função global _drawCorvanTools(activeTool, S, frame, lb)
//  Desenha a ferramenta equipada no Corvan para TODAS as fases.
//  Depende do `ctx` global de canvas de cada fase.
//  Chamada ao FINAL de drawCorvan(), após o corpo e os braços.
// ═══════════════════════════════════════════════════════════════

function _drawCorvanTools(activeTool, S, frame, lb) {
  if (!activeTool) return;

  // Helper de rect (usa o ctx global do script da fase)
  const r = (x, y, w, h, fill, op) => {
    ctx.fillStyle = fill;
    ctx.globalAlpha = op !== undefined ? op : 1;
    ctx.fillRect(x * S, y * S, w * S, h * S);
    ctx.globalAlpha = 1;
  };

  // ── BRAÇO ESQUERDO (x ≈ 0-8) ────────────────────────────────

  if (activeTool === 'picareta' || activeTool === 'picareta_basica') {
    const wb = Math.sin(frame * 0.2) * 1.5;
    r(0, 24 + wb, 6, 1, '#7a4818'); r(0, 25 + wb, 1, 7, '#7a4818');
    r(0, 22 + wb, 6, 3, '#888888'); r(4, 20 + wb, 2, 3, '#aaaaaa');

  } else if (activeTool === 'picareta_industrial') {
    const wb = Math.sin(frame * 0.2) * 1.5;
    r(0, 25 + wb, 1, 7, '#6a4a20'); r(0, 24 + wb, 3, 1, '#6a4a20');
    ctx.fillStyle = '#707888';
    ctx.beginPath(); ctx.moveTo(-4*S,(22+wb)*S); ctx.lineTo(0,(22+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.lineTo(-4*S,(28+wb)*S); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,(22+wb)*S); ctx.lineTo(8*S,(20+wb)*S); ctx.lineTo(8*S,(26+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(180,200,220,0.3)'; ctx.fillRect(-3*S,(22+wb)*S,4*S,2*S);

  } else if (activeTool === 'maco' || activeTool === 'maco_pedra') {
    const wb = Math.sin(frame * 0.2) * 1.5;
    r(0, 24 + wb, 5, 1, '#8a5820'); r(0, 25 + wb, 1, 6, '#8a5820');
    ctx.fillStyle = '#888888';
    ctx.beginPath(); ctx.ellipse(2*S, (30+wb)*S, 6*S, 4*S, 0, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'martelo' || activeTool === 'martelo_pedra') {
    r(0, 22, 5, 10, '#b82010'); r(0, 32, 5, 3, '#a86030');
    r(-1, 22, 4, 1, '#8a5820'); r(-2, 23, 1, 7, '#8a5820');
    r(-5, 20, 8, 5, '#7a5030'); r(-5, 20, 8, 2, '#9a7050');

  } else if (activeTool === 'escopro' || activeTool === 'escopro_cobre') {
    r(0, 24, 5, 12, '#b82010'); r(0, 36, 5, 3, '#a86030');
    r(-1, 24, 3, 1, '#888888'); r(-2, 25, 1, 8, '#888888');
    r(-4, 22, 6, 4, '#c89060'); r(-3, 22, 4, 2, '#d8a070');

  } else if (activeTool === 'talhadeira') {
    const wb = Math.sin(frame * 0.25) * 2;
    r(0, 24 + wb, 5, 1, '#8a5818'); r(0, 25 + wb, 1, 10, '#8a5818');
    r(-2, 22 + wb, 7, 4, '#909090'); r(-3, 20 + wb, 2, 4, '#b0b0b0');
    ctx.fillStyle = 'rgba(200,200,255,0.4)';
    ctx.fillRect(-3*S, (20+wb)*S, 2*S, 2*S);

  } else if (activeTool === 'pedra_de_toque') {
    r(1, 25, 5, 4, '#302820'); r(0, 24, 7, 2, '#443830');
    ctx.strokeStyle = 'rgba(220,180,40,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(1*S, 26*S); ctx.lineTo(6*S, 28*S); ctx.stroke();

  } else if (activeTool === 'lampada_davy') {
    // Lâmpada de Davy no braço esquerdo
    ctx.save(); ctx.translate(3*S, 30*S);
    const fd = 0.6 + Math.sin(Date.now() / 180) * 0.4;
    r(-2, -14, 4, 14, '#6a4a20', 1);      // cabo
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath(); ctx.ellipse(0, 0, 9*S, 13*S, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = S * 0.8;
    for (let i = -8; i <= 8; i += 4) { ctx.beginPath(); ctx.moveTo(i*S,-12*S); ctx.lineTo(i*S,12*S); ctx.stroke(); }
    for (let j = -10; j <= 10; j += 5) { ctx.beginPath(); ctx.moveTo(-9*S,j*S); ctx.lineTo(9*S,j*S); ctx.stroke(); }
    ctx.fillStyle = '#4a3010'; ctx.fillRect(-5*S,-14*S,10*S,4*S);
    ctx.fillStyle = `rgba(255,150,30,${fd})`; ctx.beginPath(); ctx.ellipse(0,-5*S,4*S,7*S,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // glow
    ctx.fillStyle = '#ffcc00'; ctx.globalAlpha = 0.18 * lb;
    ctx.beginPath(); ctx.arc(5*S, 31*S, 5*S, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

  } else if (activeTool === 'picareta_calcario_item') {
    const wb = Math.sin(frame * 0.2) * 1.5;
    r(0, 25 + wb, 1, 7, '#8a6a30'); r(0, 24 + wb, 4, 1, '#8a6a30');
    ctx.fillStyle = '#c8c0a0';
    ctx.beginPath(); ctx.moveTo(-3*S,(21+wb)*S); ctx.lineTo(0,(23+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.lineTo(-3*S,(27+wb)*S); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,(23+wb)*S); ctx.lineTo(9*S,(21+wb)*S); ctx.lineTo(9*S,(27+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.closePath(); ctx.fill();

  } else if (activeTool === 'picareta_kimberlito') {
    const wb = Math.sin(frame * 0.2) * 1.5;
    r(0, 25 + wb, 1, 7, '#4a3820'); r(0, 24 + wb, 3, 1, '#4a3820');
    ctx.fillStyle = '#606878';
    ctx.beginPath(); ctx.moveTo(-4*S,(22+wb)*S); ctx.lineTo(0,(22+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.lineTo(-4*S,(28+wb)*S); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,(22+wb)*S); ctx.lineTo(9*S,(20+wb)*S); ctx.lineTo(9*S,(26+wb)*S); ctx.lineTo(0,(28+wb)*S); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,210,230,0.35)'; ctx.fillRect(-3*S,(22+wb)*S,4*S,2*S);

  } else if (activeTool === 'bateia_madeira') {
    ctx.fillStyle = '#7a5a30';
    ctx.beginPath(); ctx.ellipse(3*S, 32*S, 9*S, 5*S, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a4020';
    ctx.beginPath(); ctx.ellipse(3*S, 31*S, 6*S, 3*S, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(200,180,160,0.3)';
    ctx.beginPath(); ctx.ellipse(3*S, 30*S, 5*S, 2*S, 0.2, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'calabaca_agua') {
    r(3, 22, 2, 8, '#5a4a20');
    ctx.fillStyle = '#8a9a40'; ctx.beginPath(); ctx.arc(3*S, 30*S, 6*S, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6a7a28'; ctx.beginPath(); ctx.arc(3*S, 28*S, 3*S, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(160,200,220,0.35)'; ctx.beginPath(); ctx.arc(2*S, 31*S, 2*S, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'cesto_vime') {
    ctx.fillStyle = '#b08040';
    ctx.beginPath(); ctx.ellipse(3*S, 30*S, 7*S, 5*S, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#806020'; ctx.lineWidth = S;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo((-3+i*3)*S,26*S); ctx.lineTo((-3+i*3)*S,34*S); ctx.stroke(); }
    ctx.fillStyle = '#c09050'; ctx.beginPath(); ctx.ellipse(3*S, 26*S, 7*S, 2*S, 0, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'cristal_islandia') {
    ctx.fillStyle = '#a0c8e8'; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(2*S,24*S); ctx.lineTo(5*S,19*S); ctx.lineTo(9*S,22*S); ctx.lineTo(8*S,33*S); ctx.lineTo(1*S,33*S); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,235,255,0.5)';
    ctx.beginPath(); ctx.moveTo(3*S,24*S); ctx.lineTo(5*S,21*S); ctx.lineTo(7*S,23*S); ctx.lineTo(6*S,31*S); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;

  } else if (activeTool === 'peneira_classificacao') {
    ctx.fillStyle = '#8a7060';
    ctx.beginPath(); ctx.ellipse(3*S, 32*S, 9*S, 4*S, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#6a5040'; ctx.lineWidth = S * 0.8;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo((-5+i*4)*S,29*S); ctx.lineTo((-5+i*4)*S,35*S); ctx.stroke(); }
    ctx.fillStyle = 'rgba(200,180,160,0.3)';
    ctx.beginPath(); ctx.ellipse(3*S, 30*S, 8*S, 3*S, 0, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'destilador_item') {
    r(1, 20, 3, 14, '#6a4a20');
    ctx.fillStyle = '#8ab8c0'; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(3*S, 20*S, 5*S, 7*S, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(160,220,230,0.4)'; ctx.beginPath(); ctx.ellipse(2*S, 18*S, 2*S, 3*S, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

  // ── BRAÇO DIREITO (x ≈ 24-32) ───────────────────────────────

  } else if (activeTool === 'lanterna' || activeTool === 'lantern' || activeTool === 'lanterna_arqueologa') {
    r(26, 31, 1, 3, '#888888'); r(24, 34, 5, 6, '#604010'); r(25, 35, 3, 4, '#ffe080');
    r(23, 33, 7, 8, '#ffcc00', 0.12 * lb);
    ctx.fillStyle = '#ffcc00'; ctx.globalAlpha = 0.18 * lb;
    ctx.beginPath(); ctx.arc(26*S, 37*S, 5*S, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

  } else if (activeTool === 'bateia' || activeTool === 'pa_exploradora') {
    ctx.fillStyle = '#7a5a30';
    ctx.beginPath(); ctx.ellipse(29*S, 34*S, 10*S, 5*S, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a4020';
    ctx.beginPath(); ctx.ellipse(29*S, 33*S, 7*S, 3*S, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(160,210,230,0.35)';
    ctx.beginPath(); ctx.ellipse(28*S, 33*S, 4*S, 2*S, 0.2, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'corda_de_poco') {
    ctx.strokeStyle = '#b08850'; ctx.lineWidth = 3 * S;
    ctx.beginPath(); ctx.arc(30*S, 30*S, 7*S, 0, Math.PI * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(30*S, 30*S, 4*S, 0.3, Math.PI * 1.8); ctx.stroke();
    ctx.fillStyle = '#907040'; ctx.fillRect(28*S, 26*S, 4*S, 4*S);

  } else if (activeTool === 'lampada_de_sal') {
    const lg = lb * 0.6;
    ctx.fillStyle = `rgba(255,160,80,${lg})`; ctx.beginPath(); ctx.arc(31*S, 28*S, 9*S, 0, Math.PI*2); ctx.fill();
    r(26, 24, 9, 8, '#e8b090'); r(27, 24, 7, 3, '#f0c8a0'); r(29, 32, 3, 2, '#c09070');
    ctx.fillStyle = `rgba(255,200,80,${lb})`; ctx.beginPath(); ctx.arc(30*S, 31*S, 2*S, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(255,240,120,${lb*0.7})`; ctx.beginPath(); ctx.ellipse(30*S, 29*S, 1*S, 3*S, 0, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'ferrao_sondagem') {
    r(26, 20, 2, 16, '#888898'); r(25, 19, 4, 2, '#6a6a7a');
    ctx.fillStyle = 'rgba(180,200,220,0.4)';
    ctx.beginPath(); ctx.moveTo(25*S,19*S); ctx.lineTo(29*S,19*S); ctx.lineTo(27*S,15*S); ctx.closePath(); ctx.fill();
    r(25, 36, 4, 2, '#606070');

  } else if (activeTool === 'bastao_sombra') {
    r(27, 20, 2, 18, '#1a0a04'); r(26, 24, 4, 2, '#2a1208');
    ctx.fillStyle = 'rgba(80,40,140,0.7)';
    ctx.beginPath(); ctx.arc(28*S, 20*S, 4*S, 0, Math.PI*2); ctx.fill();
    const glow = 0.25 + Math.sin(frame * 0.4) * 0.15;
    ctx.fillStyle = `rgba(140,80,220,${glow})`;
    ctx.beginPath(); ctx.arc(28*S, 20*S, 7*S, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'lupa_lapidario') {
    r(28, 30, 2, 10, '#8a7060');
    ctx.strokeStyle = '#6a5a40'; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.arc(29*S, 26*S, 6*S, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(180,220,255,0.35)';
    ctx.beginPath(); ctx.arc(29*S, 26*S, 5*S, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(27*S, 24*S, 2*S, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'tocha_alcatrao') {
    r(27, 22, 2, 18, '#6b4520');
    const blueT = 0;
    const fr2 = Math.sin(Date.now() / 100) * 2;
    ctx.fillStyle = `rgba(255,100,30,0.85)`; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(28*S, (20+fr2)*S, 7*S, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,80,0.5)';
    ctx.beginPath(); ctx.arc(28*S, (16+fr2)*S, 4*S, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    const hG = ctx.createRadialGradient(28*S,20*S,0,28*S,20*S,50*S);
    hG.addColorStop(0,'rgba(255,100,30,0.12)'); hG.addColorStop(1,'rgba(255,100,30,0)');
    ctx.fillStyle = hG; ctx.beginPath(); ctx.arc(28*S, 20*S, 50*S, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'tupu') {
    r(27, 28, 2, 6, '#9090b8'); r(24, 26, 8, 3, '#9090b8'); r(25, 25, 6, 2, '#c0c0d8');
    ctx.fillStyle = '#28a890'; ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.arc(28*S, 26*S, 1.8*S, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    const tpGlow = 0.18 + Math.sin(frame * 0.5) * 0.12;
    ctx.fillStyle = `rgba(192,200,216,${tpGlow})`;
    ctx.beginPath(); ctx.arc(28*S, 26*S, 4*S, 0, Math.PI*2); ctx.fill();

  } else if (activeTool === 'machado_item') {
    r(27, 22, 2, 16, '#6a4a20');
    ctx.fillStyle = '#909090';
    ctx.beginPath(); ctx.moveTo(22*S,20*S); ctx.lineTo(27*S,23*S); ctx.lineTo(27*S,30*S); ctx.lineTo(22*S,32*S); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,210,220,0.3)'; ctx.fillRect(22*S,21*S,3*S,4*S);

  } else if (activeTool === 'balanca_item') {
    r(28, 20, 1, 4, '#888888'); r(24, 24, 9, 1, '#888888');
    ctx.strokeStyle = '#888888'; ctx.lineWidth = S;
    ctx.beginPath(); ctx.moveTo(24*S,25*S); ctx.lineTo(24*S,29*S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(33*S,25*S); ctx.lineTo(33*S,29*S); ctx.stroke();
    ctx.fillStyle = '#b08030';
    ctx.beginPath(); ctx.ellipse(24*S,30*S,4*S,2*S,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(33*S,30*S,4*S,2*S,0,0,Math.PI*2); ctx.fill();

  } else if (activeTool === 'astrolabio_item') {
    r(28, 28, 1, 8, '#8a7050');
    ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 2*S;
    ctx.beginPath(); ctx.arc(29*S,24*S,7*S,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#e0c060'; ctx.lineWidth = S;
    ctx.beginPath(); ctx.moveTo(29*S,17*S); ctx.lineTo(29*S,31*S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22*S,24*S); ctx.lineTo(36*S,24*S); ctx.stroke();
    ctx.fillStyle = '#ffe060'; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(29*S,24*S,2*S,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 1;
}
