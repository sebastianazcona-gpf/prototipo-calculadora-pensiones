(() => {
  const form = document.getElementById('calculatorForm');
  const panels = [...document.querySelectorAll('[data-panel]')];
  const indicators = [...document.querySelectorAll('[data-indicator]')];
  const currentYear = new Date().getFullYear();
  let currentPanel = 0;

  const startYear = document.getElementById('startYear');
  const bajaYear = document.getElementById('bajaYear');
  for (let y = 1973; y <= currentYear; y++) startYear.add(new Option(y, y));
  for (let y = currentYear - 10; y <= currentYear; y++) bajaYear.add(new Option(y, y));

  function showPanel(index) {
    currentPanel = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, i) => panel.classList.toggle('active', i === currentPanel));
    indicators.forEach((item, i) => {
      item.classList.toggle('active', i === currentPanel);
      item.classList.toggle('done', i < currentPanel);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearErrors() {
    document.querySelectorAll('[data-error]').forEach(node => node.textContent = '');
    document.querySelectorAll('input,select').forEach(node => node.classList.remove('invalid'));
  }

  function setError(name, text) {
    const message = document.querySelector(`[data-error="${name}"]`);
    if (message) message.textContent = text;
    const field = document.querySelector(`[name="${name}"]`);
    if (field) field.classList.add('invalid');
  }

  function validateStep(step) {
    clearErrors();
    let valid = true;

    if (step === 1) {
      ['firstName', 'lastName', 'email', 'phone'].forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
          setError(id, 'Este campo es obligatorio.');
          valid = false;
        }
      });
      const email = document.getElementById('email').value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', 'Ingresa un correo válido.');
        valid = false;
      }
      const phone = document.getElementById('phone').value.replace(/\D/g, '');
      if (phone && !/^\d{10}$/.test(phone)) {
        setError('phone', 'El celular debe contener 10 dígitos.');
        valid = false;
      }
    }

    if (step === 2) {
      ['startYear', 'bajaMonth', 'bajaYear'].forEach(id => {
        if (!document.getElementById(id).value) {
          setError(id, 'Selecciona una opción.');
          valid = false;
        }
      });
      ['pensioned', 'm40', 'activeIMSS'].forEach(name => {
        if (!form.querySelector(`[name="${name}"]:checked`)) {
          setError(name, 'Selecciona una opción.');
          valid = false;
        }
      });

      const curp = document.getElementById('curp').value.trim().toUpperCase();
      if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp) || !birthDateFromCurp(curp)) {
        setError('curp', 'Ingresa una CURP con formato y fecha válidos.');
        valid = false;
      }

      const nss = document.getElementById('nss').value.replace(/\D/g, '');
      if (!/^\d{11}$/.test(nss)) {
        setError('nss', 'El NSS debe contener 11 dígitos.');
        valid = false;
      }

      const weeks = Number(document.getElementById('weeks').value);
      if (!Number.isFinite(weeks) || weeks < 0 || weeks > 3000) {
        setError('weeks', 'Ingresa un número de semanas válido.');
        valid = false;
      }

      const file = document.getElementById('statement').files[0];
      if (file && (file.type !== 'application/pdf' || file.size > 2 * 1024 * 1024)) {
        setError('statement', 'El archivo debe ser PDF y pesar menos de 2 MB.');
        valid = false;
      }
    }
    return valid;
  }

  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (currentPanel === 0 || validateStep(currentPanel)) showPanel(currentPanel + 1);
  }));
  document.querySelectorAll('[data-prev]').forEach(button => button.addEventListener('click', () => showPanel(currentPanel - 1)));

  const weeksRange = document.getElementById('weeksRange');
  const weeksInput = document.getElementById('weeks');
  weeksRange.addEventListener('input', () => weeksInput.value = weeksRange.value);
  weeksInput.addEventListener('input', () => {
    weeksRange.value = Math.min(2000, Math.max(500, Number(weeksInput.value) || 500));
  });

  document.getElementById('curp').addEventListener('input', event => {
    event.target.value = event.target.value.toUpperCase().replace(/\s/g, '');
  });
  ['phone', 'nss'].forEach(id => document.getElementById(id).addEventListener('input', event => {
    const limit = id === 'phone' ? 10 : 11;
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, limit);
  }));
  document.getElementById('statement').addEventListener('change', event => {
    document.getElementById('fileName').textContent = event.target.files[0] ? `Seleccionado: ${event.target.files[0].name}` : '';
  });

  function birthDateFromCurp(curp) {
    const yy = Number(curp.slice(4, 6));
    const mm = Number(curp.slice(6, 8));
    const dd = Number(curp.slice(8, 10));
    const century = /\d/.test(curp.charAt(16)) ? 1900 : 2000;
    const date = new Date(century + yy, mm - 1, dd);
    if (date.getFullYear() !== century + yy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
    return date;
  }

  function wholeMonthsBetween(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
    if (to.getDate() < from.getDate()) months--;
    return months;
  }

  function getAge(birth, today = new Date()) {
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    const sixty = new Date(birth.getFullYear() + 60, birth.getMonth(), birth.getDate());
    const monthsTo60 = today >= sixty ? 0 : Math.max(0, wholeMonthsBetween(today, sixty));
    return { years, months, monthsTo60 };
  }

  function monthsSinceBaja(year, month) {
    return Math.max(0, wholeMonthsBetween(new Date(Number(year), Number(month) - 1, 1), new Date()));
  }

  function factor(title, text, status, label) {
    return `<article class="factor"><div class="factor-top"><strong>${title}</strong><span class="tag ${status}">${label}</span></div><p>${text}</p></article>`;
  }

  function calculate() {
    const data = Object.fromEntries(new FormData(form).entries());
    const age = getAge(birthDateFromCurp(data.curp.toUpperCase()));
    const weeks = Number(data.weeks);
    const firstYear = Number(data.startYear);
    const bajaMonths = monthsSinceBaja(data.bajaYear, data.bajaMonth);
    const ageEligible = age.years >= 60;
    const probable73 = firstYear < 1997;
    const ambiguous97 = firstYear === 1997;
    const withinFiveYears = bajaMonths <= 60;

    const blockers = [];
    const reviews = [];
    if (data.pensioned === 'yes') blockers.push('La persona indicó que ya se encuentra pensionada.');
    if (!ageEligible) blockers.push(`Aún no puede considerarse dentro del criterio público de edad. Faltan aproximadamente ${age.monthsTo60} meses para cumplir 60 años.`);
    if (firstYear > 1997) blockers.push('El año declarado de inicio laboral apunta a cotizaciones posteriores a 1997.');
    if (weeks < 800) blockers.push('No alcanza el criterio público de 800 semanas usado en este prototipo.');
    if (ambiguous97) reviews.push('Debe confirmarse la fecha exacta de la primera cotización para distinguir el régimen aplicable.');
    if (data.activeIMSS === 'yes') reviews.push('Actualmente cotiza en el IMSS; debe revisarse la baja antes de considerar una estrategia de continuidad voluntaria.');
    if (!withinFiveYears) reviews.push('La baja declarada supera cinco años y exige revisar derechos y alternativas.');
    if (data.m40 === 'yes') reviews.push('Ya está inscrito en Modalidad 40; corresponde evaluar su estrategia vigente y documentación.');

    let type = 'success';
    let icon = '✓';
    let title = 'Candidato preliminar para un estudio pensionario';
    let description = 'Los datos declarados cumplen los filtros públicos principales. Esto no equivale a aprobación ni determina el monto final de una pensión.';
    let next = 'Validar la constancia, la ley aplicable, la conservación de derechos, los salarios reconocidos y la viabilidad financiera.';

    if (blockers.length) {
      type = 'danger'; icon = '×'; title = 'No cumple la ruta estándar de precalificación';
      description = blockers.join(' ');
      next = 'No debe presentarse el caso como candidato. Puede requerir otra estrategia pensionaria o esperar a cumplir la edad correspondiente.';
    } else if (reviews.length) {
      type = 'warning'; icon = '!'; title = 'Requiere revisión especializada antes de avanzar';
      description = reviews.join(' ');
      next = 'Confirmar documentalmente los puntos señalados antes de realizar una estimación de pensión o una evaluación financiera.';
    }

    const ageStatus = ageEligible ? ['ok', 'Cumple'] : ['stop', 'No cumple'];
    const regimeStatus = probable73 ? ['ok', 'Probable L73'] : ambiguous97 ? ['review', 'Validar'] : ['stop', 'Probable L97'];
    const weeksStatus = weeks >= 800 ? ['ok', 'Cumple'] : ['stop', 'No cumple'];
    const bajaStatus = withinFiveYears ? ['ok', 'Dentro de plazo'] : ['review', 'Validar'];
    const workStatus = data.activeIMSS === 'no' ? ['ok', 'Dado de baja'] : ['review', 'Cotizando'];
    const m40Status = data.m40 === 'yes' ? ['review', 'Ya inscrito'] : ['ok', 'No inscrito'];

    document.getElementById('result').innerHTML = `
      <section class="result-head ${type}"><div class="result-icon">${icon}</div><div><h2>${title}</h2><p>${description}</p></div></section>
      <div class="result-grid">
        ${factor('Edad', `${age.years} años y ${age.months} meses. ${age.monthsTo60 ? `Faltan aproximadamente ${age.monthsTo60} meses para cumplir 60.` : 'Ya cumplió 60 años.'}`, ...ageStatus)}
        ${factor('Régimen probable', ambiguous97 ? 'El año 1997 no permite determinar por sí solo la ley aplicable.' : `Inicio laboral declarado en ${firstYear}.`, ...regimeStatus)}
        ${factor('Semanas cotizadas', `${weeks.toLocaleString('es-MX')} semanas declaradas.`, ...weeksStatus)}
        ${factor('Antigüedad de la baja', `Aproximadamente ${bajaMonths} meses desde la fecha declarada.`, ...bajaStatus)}
        ${factor('Situación laboral', data.activeIMSS === 'yes' ? 'Actualmente cotiza en el IMSS.' : 'Declaró estar dado de baja.', ...workStatus)}
        ${factor('Modalidad 40', data.m40 === 'yes' ? 'Declaró estar inscrito actualmente.' : 'Declaró no estar inscrito.', ...m40Status)}
      </div>
      <section class="next"><strong>Siguiente paso sugerido</strong><p>${next}</p></section>
      <p class="legal">Resultado orientativo generado con información declarada. No es resolución del IMSS, promesa de pensión, aprobación de financiamiento ni dictamen legal o actuarial. Pendiente de revisión de Legal (Jorge Rico) antes de uso externo.</p>`;
    showPanel(3);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (validateStep(2)) calculate();
  });

  document.getElementById('restart').addEventListener('click', () => {
    form.reset();
    weeksInput.value = 800;
    weeksRange.value = 800;
    document.getElementById('fileName').textContent = '';
    clearErrors();
    showPanel(0);
  });

  document.getElementById('demo').addEventListener('click', () => {
    document.getElementById('firstName').value = 'María';
    document.getElementById('lastName').value = 'González';
    document.getElementById('email').value = 'maria@example.com';
    document.getElementById('phone').value = '5512345678';
    document.getElementById('startYear').value = '1990';
    document.getElementById('curp').value = 'GOMM660815MDFNLR09';
    document.getElementById('nss').value = '12345678901';
    document.querySelector('[name="pensioned"][value="no"]').checked = true;
    document.querySelector('[name="m40"][value="no"]').checked = true;
    document.querySelector('[name="activeIMSS"][value="no"]').checked = true;
    weeksInput.value = 1050;
    weeksRange.value = 1050;
    document.getElementById('bajaMonth').value = '3';
    document.getElementById('bajaYear').value = String(currentYear - 2);
    showPanel(1);
  });
})();
