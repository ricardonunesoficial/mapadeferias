const colaboradores = ["João Coelho", "Newton Filho", "Ricardo Nunes", "Wallace Lindemberg"];
let currentYear = 2026;
let dados = {};
let feriasAnteriores = {};
let currentCell = null;
let saveTimer = null;
let feriadosCache = {};
let currentUnsubscribe = null;
let valoresCache = {};

export function showApp(user) {
  document.getElementById('auth-container').classList.remove('active');
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('user-info').classList.add('active');
  
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-avatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`;
  
  if (window.firebaseReadyCallback) window.firebaseReadyCallback();
}

export function showLogin() {
  document.getElementById('auth-container').classList.add('active');
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('user-info').classList.remove('active');
}

export function initApp() {
  window.addEventListener('firebase-ready', () => {
    initData(2026);
  });
  
  if (window.currentUser) {
    window.firebaseReadyCallback = () => initData(2026);
  } else {
    window.firebaseReadyCallback = () => initData(2026);
  }
  
  document.getElementById('year-select').addEventListener('change', async function() {
    await initData(parseInt(this.value, 10));
  });
  
  window.onclick = function(e) {
    if (e.target === document.getElementById('modal')) {
      window.closeModal();
    }
  };
  
  console.log('✅ SPA inicializada!');
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFeriados(ano) {
  if (feriadosCache[ano]) {
    return feriadosCache[ano];
  }

  const fixos = [
    { data: `${ano}-01-01`, nome: 'Ano Novo', emoji: '🎉' },
    { data: `${ano}-04-25`, nome: 'Dia da Liberdade', emoji: '🔴' },
    { data: `${ano}-05-01`, nome: 'Dia do Trabalhador', emoji: '🔴' },
    { data: `${ano}-06-07`, nome: 'Feriado Municipal Oeiras', emoji: '🏛️' },
    { data: `${ano}-06-10`, nome: 'Dia de Portugal', emoji: '🇵🇹' },
    { data: `${ano}-06-13`, nome: 'Santo António', emoji: '🐟' }, 
    { data: `${ano}-08-15`, nome: 'Assunção de Nossa Senhora', emoji: '🔴' },
    { data: `${ano}-10-05`, nome: 'Implantação da República', emoji: '🔴' },
    { data: `${ano}-11-01`, nome: 'Dia de Todos os Santos', emoji: '🔴' },
    { data: `${ano}-12-01`, nome: 'Restauração da Independência', emoji: '🔴' },
    { data: `${ano}-12-08`, nome: 'Imaculada Conceição', emoji: '🔴' },
    { data: `${ano}-12-25`, nome: 'Natal', emoji: '🎄' }
  ];

  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31);
  const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;

  const dataPascoa = new Date(ano, mesPascoa - 1, diaPascoa);
  const dataSextaSanta = new Date(dataPascoa);
  dataSextaSanta.setDate(dataPascoa.getDate() - 2);

  const dataCorpoDeus = new Date(dataPascoa);
  dataCorpoDeus.setDate(dataPascoa.getDate() + 60);

  const moveis = [
    { data: formatDateLocal(dataSextaSanta), nome: 'Sexta-feira Santa', emoji: '✝️' },
    { data: formatDateLocal(dataPascoa), nome: 'Domingo de Páscoa', emoji: '🐰' },
    { data: formatDateLocal(dataCorpoDeus), nome: 'Corpo de Deus', emoji: '🔴' }
  ];

  const resultado = [...fixos, ...moveis].map(f => {
     let cssClass = 'cell-holiday';
     if (f.nome.includes('Oeiras')) {
        cssClass = 'cell-feriado-oeiras';
     } else {
         const slug = f.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
         cssClass = `cell-holiday cell-feriado-${slug}`;
     }
     return { ...f, classe: cssClass };
  });

  feriadosCache[ano] = resultado;
  return resultado;
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      if (!window.db) return;
      const docRef = window.doc(window.db, "ferias", currentYear.toString());
      await window.setDoc(docRef, { dados: dados, feriasAnteriores: feriasAnteriores });
      console.log("Salvo!");
    } catch (e) { alert('Erro save: ' + e.message); }
  }, 1000); 
}

async function initData(ano) {
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  currentYear = ano;
  const table = document.getElementById('timeline-table');
  table.innerHTML = '<tr><td>A carregar...</td></tr>';

  const docRef = window.doc(window.db, "ferias", ano.toString());
  currentUnsubscribe = window.onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
       const payload = docSnap.data();
       const loadedDados = payload.dados || {};
       dados = {}; 
       Object.keys(loadedDados).forEach(colab => { dados[colab] = loadedDados[colab]; });
       
       const loadedFeriasAnt = payload.feriasAnteriores || {};
       colaboradores.forEach(colab => {
          if (loadedFeriasAnt[colab] !== undefined) feriasAnteriores[colab] = loadedFeriasAnt[colab];
       });
    } else {
       dados = {};
       colaboradores.forEach(c => dados[c] = {});
    }
    valoresCache = {};
    window.renderTimeline();
    window.updateResumo();
  });
}

window.renderTimeline = function() {
  const table = document.getElementById('timeline-table');
  table.innerHTML = '';

  const feriados = getFeriados(currentYear);
  const feriadoMap = new Map();
  feriados.forEach(f => feriadoMap.set(f.data, f));

  const fragment = document.createDocumentFragment();

  const headerRow = document.createElement('tr');
  const headerCell = document.createElement('th');
  headerCell.textContent = 'Colaborador';
  headerRow.appendChild(headerCell);

  let date = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  const headerDates = [];

  while (date <= endDate) {
    headerDates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  headerDates.forEach(d => {
    const th = document.createElement('th');
    const day = d.getDate();
    const mes = d.toLocaleDateString('pt-PT', { month: 'short' }).toUpperCase();
    const weekday = window.getDayName(d.getDay()).substring(0, 3).toUpperCase();

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    
    const monthAbbr = document.createElement('div');
    monthAbbr.className = 'month-abbr';
    monthAbbr.textContent = mes;
    dayHeader.appendChild(monthAbbr);
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayHeader.appendChild(dayNumber);
    
    const weekdayBottomDiv = document.createElement('div');
    weekdayBottomDiv.className = 'weekday-bottom';
    weekdayBottomDiv.textContent = weekday;
    dayHeader.appendChild(weekdayBottomDiv);
    
    th.appendChild(dayHeader);
    th.title = d.toLocaleDateString('pt-PT');

    const dateStr = formatDateLocal(d);
    const feriado = feriadoMap.get(dateStr);
    
    if (feriado) {
      th.title += `\n${feriado.emoji} ${feriado.nome}`;
      th.className = feriado.classe;
    } else if (d.getDay() === 0 || d.getDay() === 6) {
      th.className = 'cell-weekend';
    }
    headerRow.appendChild(th);
  });
  fragment.appendChild(headerRow);

  colaboradores.forEach(colab => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = colab;
    row.appendChild(nameCell);

    const colabData = dados[colab] || {};

    headerDates.forEach(d => {
      const dateStr = formatDateLocal(d);
      const cell = document.createElement('td');
      const value = colabData[dateStr] || '';

      if (value === 'F') cell.className = 'cell-f';
      else if (value === 'M') cell.className = 'cell-m';
      else if (value === 'T') cell.className = 'cell-t';
      else {
        const feriado = feriadoMap.get(dateStr);
        if (feriado) {
          cell.className = feriado.classe;
          cell.title = `${feriado.emoji} ${feriado.nome}`;
        } else if (d.getDay() === 0 || d.getDay() === 6) {
          cell.className = 'cell-weekend';
        } else {
          cell.className = 'cell-empty';
        }
      }
      cell.textContent = value;

      cell.onclick = function() {
        const cellDate = new Date(dateStr + 'T00:00:00');
        currentCell = { colab, dateStr };
        const feriado = feriadoMap.get(dateStr);
        const info = `📅 ${cellDate.toLocaleDateString('pt-PT')} (${window.getDayName(cellDate.getDay())})<br>` +
          `Colaborador: ${colab}<br>Valor atual: ${value || 'vazio'}<br>` +
          `${feriado ? (feriado.emoji + ' FERIADO: ' + feriado.nome) : ''}`;
        document.getElementById('modal-info').innerHTML = info;
        document.getElementById('modal').style.display = 'flex';
      };
      row.appendChild(cell);
    });
    fragment.appendChild(row);
  });

  table.appendChild(fragment);
};

window.exportToCSV = function() {
  const csvLines = ['Colaborador,Férias Ant.,Férias ' + currentYear + ',Total,Gozadas F,Marcadas M+T,Por Marcar,Dias Detalhados'];
  
  colaboradores.forEach(colab => {
    const valoresColab = dados[colab] || {};
    let gozadasF = 0, marcadasMT = 0;
    const diasMarcadosArray = [];
    
    Object.entries(valoresColab).forEach(([dateStr, tipo]) => {
      if (tipo === 'F') {
        gozadasF++;
        diasMarcadosArray.push({ date: dateStr, tipo });
      } else if (tipo === 'M' || tipo === 'T') {
        marcadasMT += 0.5;
        diasMarcadosArray.push({ date: dateStr, tipo });
      }
    });

    const ferAnt = feriasAnteriores[colab] || 0;
    const ferAno = 22;
    const totalDisp = ferAnt + ferAno;
    const porMarcar = totalDisp - gozadasF - marcadasMT;

    const diasMarcados = diasMarcadosArray
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => `${d.date} (${d.tipo})`)
      .join('; ');

    csvLines.push(`${colab},${ferAnt},${ferAno},${totalDisp},${gozadasF},${marcadasMT.toFixed(1)},${porMarcar.toFixed(1)},"${diasMarcados}"`);
  });

  const bom = "\uFEFF";
  const csvContent = bom + csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Mapa_Ferias_${currentYear}_Detalhado.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.updateResumo = function() {
  const table = document.getElementById('resumo-table');
  table.innerHTML = '';
  const fragment = document.createDocumentFragment();
  
  const headerRow = document.createElement('tr');
  ['Colaborador', 'Férias Ant.', 'Férias ' + currentYear, 'Total Disp.', 'Gozadas (F)', 'Marcadas (M+T)', 'Por Marcar'].forEach(header => {
    const th = document.createElement('th');
    th.innerHTML = header;
    headerRow.appendChild(th);
  });
  fragment.appendChild(headerRow);
  let totalMarcados = 0;

  colaboradores.forEach(colab => {
    const colabData = dados[colab] || {};
    const cacheKey = colab + ':' + currentYear;
    let gozadasF, marcadasMT;
    
    if (valoresCache[cacheKey]) {
      ({ gozadasF, marcadasMT } = valoresCache[cacheKey]);
    } else {
      let f = 0, mt = 0;
      Object.values(colabData).forEach(v => {
        if (v === 'F') f++;
        else if (v === 'M' || v === 'T') mt++;
      });
      gozadasF = f;
      marcadasMT = mt * 0.5;
      valoresCache[cacheKey] = { gozadasF, marcadasMT };
    }

    const ferAnt = feriasAnteriores[colab] || 0;
    const ferAno = 22;
    const totalDisp = ferAnt + ferAno;
    const porMarcar = totalDisp - gozadasF - marcadasMT;
    totalMarcados += gozadasF + marcadasMT;

    const row = document.createElement('tr');
    const cells = [colab, ferAnt, ferAno, totalDisp, gozadasF, marcadasMT.toFixed(1), porMarcar.toFixed(1)];
    cells.forEach((cellValue, idx) => {
      const td = document.createElement('td');
      td.textContent = cellValue;
      if (idx === 1) {
        td.className = 'cell-editable';
        td.onclick = function() {
          const novoValor = prompt('Férias Anteriores:', ferAnt);
          if (novoValor !== null && !isNaN(novoValor)) {
            feriasAnteriores[colab] = parseFloat(novoValor);
            valoresCache = {};
            scheduleSave();
            window.updateResumo();
          }
        };
      } else if (idx >= 3) td.className = 'cell-calc';
      row.appendChild(td);
    });
    fragment.appendChild(row);
  });
  
  table.appendChild(fragment);
  document.getElementById('total-marcados').textContent = totalMarcados.toFixed(1);
};

window.setCell = function(value) {
  if (!currentCell) return;
  if (!dados[currentCell.colab]) dados[currentCell.colab] = {};
  dados[currentCell.colab][currentCell.dateStr] = value;
  scheduleSave();
  window.renderTimeline();
  window.updateResumo();
  window.closeModal();
};

window.closeModal = function() { document.getElementById('modal').style.display = 'none'; };

window.clearAll = async function() {
  if (!confirm('Limpar tudo?')) return;
  dados = {}; colaboradores.forEach(c => dados[c] = {});
  feriasAnteriores = {}; colaboradores.forEach(c => feriasAnteriores[c] = 0);
  scheduleSave();
  window.renderTimeline();
  window.updateResumo();
};

window.getDayName = function(day) { return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day]; };
window.loadYear = function() { const ano = parseInt(document.getElementById('year-select').value, 10); initData(ano); };
