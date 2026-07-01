const Audio = (() => {


  let ctx        = null;
  let duckGain   = null; 
  let gainTrilha = null;  

  let trilhaAtiva   = false;
  let trilhaTimeout = null;

  let   VOL_NORMAL   = 0.38;
  const VOL_DUCK     = 0.10;
  const DUCK_SPEED   = 0.25;
  const UNDUCK_SPEED = 1.2;

  function _getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      duckGain = ctx.createGain();
      duckGain.gain.value = VOL_NORMAL;
      duckGain.connect(ctx.destination);

      gainTrilha = ctx.createGain();
      gainTrilha.gain.value = 1.0;
      gainTrilha.connect(duckGain);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }


  let _duckTimer = null;

  function _duck() {
    if (!duckGain) return;
    const c = _getCtx();
    duckGain.gain.cancelScheduledValues(c.currentTime);
    duckGain.gain.setValueAtTime(duckGain.gain.value, c.currentTime);
    duckGain.gain.linearRampToValueAtTime(VOL_DUCK, c.currentTime + DUCK_SPEED);
    clearTimeout(_duckTimer);
    _duckTimer = setTimeout(_unduck, 1800);
  }

  function _unduck() {
    if (!duckGain) return;
    const c = _getCtx();
    duckGain.gain.cancelScheduledValues(c.currentTime);
    duckGain.gain.setValueAtTime(duckGain.gain.value, c.currentTime);
    duckGain.gain.linearRampToValueAtTime(VOL_NORMAL, c.currentTime + UNDUCK_SPEED);
  }

  function _unduckLongo() {
    if (!duckGain) return;
    const c = _getCtx();
    duckGain.gain.cancelScheduledValues(c.currentTime);
    duckGain.gain.setValueAtTime(duckGain.gain.value, c.currentTime);
    duckGain.gain.linearRampToValueAtTime(VOL_NORMAL, c.currentTime + 2.5);
  }



  function _nota(freq, start, duration, type, volume, attack, release, destino) {
    const c    = _getCtx();
    const dest = destino || gainTrilha;

    const osc    = c.createOscillator();
    const gain   = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type            = 'lowpass';
    filter.frequency.value = 2400;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + (attack || 0.02));
    gain.gain.setValueAtTime(volume, start + duration - (release || 0.1));
    gain.gain.linearRampToValueAtTime(0, start + duration);

    osc.start(start);
    osc.stop(start + duration);
  }

  function _notaHarpa(freq, start, duration, volume, destino) {
    const v    = volume || 0.25;
    const dest = destino || gainTrilha;
    _nota(freq,     start, duration, 'sine',     v,       0.005, 0.35, dest);
    _nota(freq * 2, start, duration, 'sine',     v * 0.4, 0.005, 0.25, dest);
    _nota(freq * 3, start, duration, 'triangle', v * 0.2, 0.01,  0.18, dest);
  }

  function _notaFlauta(freq, start, duration, volume, destino) {
    const c    = _getCtx();
    const dest = destino || gainTrilha;

    const osc     = c.createOscillator();
    const lfo     = c.createOscillator();
    const lfoGain = c.createGain();
    const gain    = c.createGain();

    lfo.frequency.value = 5.5;
    lfoGain.gain.value  = 3.5;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(dest);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    const v = volume || 0.22;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(v, start + 0.06);
    gain.gain.setValueAtTime(v, start + duration - 0.15);
    gain.gain.linearRampToValueAtTime(0, start + duration);

    lfo.start(start); osc.start(start);
    lfo.stop(start + duration); osc.stop(start + duration);
  }

  function _notaCorda(freq, start, duration, volume, destino) {
    const c    = _getCtx();
    const dest = destino || gainTrilha;

    const osc    = c.createOscillator();
    const gain   = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type            = 'bandpass';
    filter.frequency.value = freq * 2;
    filter.Q.value         = 0.8;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, start);

    const v = volume || 0.15;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(v, start + 0.12);
    gain.gain.setValueAtTime(v, start + duration - 0.2);
    gain.gain.linearRampToValueAtTime(0, start + duration);

    osc.start(start);
    osc.stop(start + duration);
  }


  const N = {
    D3: 146.8, A3: 220.0,
    D4: 293.7, E4: 329.6, Fs4: 370.0, G4: 392.0, A4: 440.0, B4: 493.9,
    D5: 587.3, E5: 659.3, Fs5: 740.0, A5: 880.0,
  };

  function _cicloTrilha(offset) {
    const c = _getCtx();
    const t = c.currentTime + offset;

    const arpejos = [
      [N.D3,  0.0], [N.A3,  0.5], [N.D4,  1.0], [N.Fs4, 1.5],
      [N.A4,  2.0], [N.Fs4, 2.5], [N.D4,  3.0], [N.A3,  3.5],
      [N.G4,  4.0], [N.D4,  4.5], [N.G4,  5.0], [N.B4,  5.5],
      [N.D5,  6.0], [N.B4,  6.5], [N.G4,  7.0], [N.D4,  7.5],
      [N.A3,  8.0], [N.E4,  8.5], [N.A4,  9.0], [N.Fs4, 9.5],
      [N.A4, 10.0], [N.E4, 10.5], [N.A3, 11.0], [N.E4, 11.5],
      [N.D4, 12.0], [N.Fs4,12.5], [N.A4, 13.0], [N.D5, 13.5],
      [N.A4, 14.0], [N.Fs4,14.5], [N.D4, 15.0], [N.A3, 15.5],
    ];
    arpejos.forEach(([f, s]) => _notaHarpa(f, t + s, 0.55, 0.12));

    const melodia = [
      [N.Fs4, 1.0,  0.8 ],
      [N.A4,  2.0,  0.6 ],
      [N.D5,  2.8,  1.2 ],
      [N.E5,  4.2,  0.5 ],
      [N.D5,  4.9,  0.5 ],
      [N.B4,  5.6,  0.7 ],
      [N.A4,  6.5,  1.0 ],
      [N.A4,  8.0,  0.6 ],
      [N.Fs4, 8.8,  0.5 ],
      [N.E4,  9.5,  0.5 ],
      [N.Fs4,10.2,  0.7 ],
      [N.A4, 11.0,  0.6 ],
      [N.D5, 12.0,  1.5 ],
      [N.Fs5,13.8,  0.8 ],
      [N.E5, 14.8,  1.4 ],
    ];
    melodia.forEach(([f, s, d]) => _notaFlauta(f, t + s, d, 0.18));

    const cordas = [
      [N.D4,  0.0,  4.0, 0.10],
      [N.Fs4, 0.0,  4.0, 0.07],
      [N.G4,  4.0,  4.0, 0.10],
      [N.B4,  4.0,  4.0, 0.07],
      [N.A4,  8.0,  4.0, 0.10],
      [N.Fs4, 8.0,  4.0, 0.07],
      [N.D4, 12.0,  4.0, 0.12],
      [N.A4, 12.0,  4.0, 0.08],
    ];
    cordas.forEach(([f, s, d, v]) => _notaCorda(f, t + s, d, v));

    const baixo = [
      [N.D3,  0.0, 1.5, 0.18],
      [N.D3,  4.0, 1.5, 0.18],
      [N.A3,  8.0, 1.5, 0.18],
      [N.D3, 12.0, 2.0, 0.20],
    ];
    baixo.forEach(([f, s, d, v]) => _notaHarpa(f, t + s, d, v));
  }

  function iniciarTrilha() {
    if (trilhaAtiva) return;
    trilhaAtiva = true;
    _getCtx();

    const CICLO = 16.2;

    function loop(offset) {
      if (!trilhaAtiva) return;
      _cicloTrilha(offset);
      trilhaTimeout = setTimeout(() => loop(0.4), (CICLO - 0.4) * 1000);
    }

    loop(0.2);
  }

  function pararTrilha() {
    trilhaAtiva = false;
    clearTimeout(trilhaTimeout);
    if (!gainTrilha) return;
    const c = _getCtx();
    gainTrilha.gain.cancelScheduledValues(c.currentTime);
    gainTrilha.gain.setValueAtTime(gainTrilha.gain.value, c.currentTime);
    gainTrilha.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
  }

  function clickMenu() {
    const c = _getCtx();
    const t = c.currentTime;
    _nota(660, t,        0.06, 'sine', 0.12, 0.005, 0.05, c.destination);
    _nota(880, t + 0.05, 0.06, 'sine', 0.08, 0.005, 0.05, c.destination);
    _duck();
  }

  function fecharMenu() {
    const c = _getCtx();
    const t = c.currentTime;
    _nota(440, t,        0.07, 'sine', 0.10, 0.005, 0.06, c.destination);
    _nota(330, t + 0.06, 0.07, 'sine', 0.07, 0.005, 0.06, c.destination);
    _duck();
  }


  function novaJornada() {
    const c    = _getCtx();
    const dest = c.destination;

    function _play() {
      const t = c.currentTime + 0.05;
      _duck();
      clearTimeout(_duckTimer);

      const notas = [
        { f: 261.6, s: 0.00, d: 0.18 },
        { f: 329.6, s: 0.16, d: 0.18 },
        { f: 392.0, s: 0.30, d: 0.18 },
        { f: 523.3, s: 0.44, d: 0.22 },
        { f: 659.3, s: 0.60, d: 0.35 },
      ];

      notas.forEach(n => _notaHarpa(n.f, t + n.s, n.d, 0.30, dest));
      notas.slice(2).forEach(n => _notaFlauta(n.f, t + n.s + 0.02, n.d, 0.22, dest));

      [392.0, 493.9, 587.3, 784.0].forEach((f, i) => {
        _notaHarpa(f, t + 0.92 + i * 0.03, 0.9, 0.22 - i * 0.03, dest);
      });

      _nota(1318.5, t + 1.05, 0.7, 'sine', 0.08, 0.01, 0.55, dest);
      _duckTimer = setTimeout(_unduckLongo, 1400);
    }

    // Se o AudioContext estiver suspenso (sem gesto do usuário), aguarda o
    // resume antes de agendar as notas — assim o som toca independente do
    // momento em que o usuário interagiu com a página.
    if (c.state === 'suspended') {
      c.resume().then(_play).catch(() => {});
    } else {
      _play();
    }
  }
 
function setVolMusica(valor) {         
  if (!duckGain) return;
  VOL_NORMAL = valor;                    
  const c = _getCtx();
  duckGain.gain.cancelScheduledValues(c.currentTime);
  duckGain.gain.setValueAtTime(valor, c.currentTime);
}
 
function setVolEfeitos(valor) {           
  if (!gainSFX) return;
  const c = _getCtx();
  gainSFX.gain.cancelScheduledValues(c.currentTime);
  gainSFX.gain.setValueAtTime(valor, c.currentTime);
}

  function contextoAtivo() {
    return !!(ctx && ctx.state === 'running');
  }

  return {
    iniciarTrilha,
    pararTrilha,
    clickMenu,
    fecharMenu,
    novaJornada,
    setVolMusica,
    setVolEfeitos,
    contextoAtivo,
  };

})();
