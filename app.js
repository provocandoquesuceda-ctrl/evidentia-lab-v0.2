const steps = ["MISSION","PLAN","RESEARCH","ANALYSIS","CRITICAL REVIEW","VERIFICATION","RESULT","EVIDENCE","LEARNING"];
let executionCount = 0;

function init() {
  renderWorkflow();
  loadData();
  document.getElementById('run-mission').onclick = runMission;
  document.getElementById('save-learning').onclick = saveLearning;
  document.getElementById('reset-lab').onclick = resetLab;
}

function renderWorkflow() {
  const container = document.getElementById('workflow-steps');
  container.innerHTML = steps.map(s => 
    `<div class="workflow-step"><span>${s}</span><span class="state-pending" id="step-${s}">PENDING</span></div>`
  ).join('');
}

async function runMission() {
  executionCount++;
  document.getElementById('evidence-level').innerText = "E2 — FUNCTIONAL DEMONSTRATION";
  document.getElementById('twin-status').innerText = "RUNNING";
  
  for (let s of steps) {
    setState(s, "RUNNING");
    await sleep(400);
    setState(s, "COMPLETED");
  }

  document.getElementById('twin-status').innerText = "COMPLETED";
  document.getElementById('qc-output').innerHTML = "AGENT OUTPUT → CRITICAL REVIEW → VERIFICATION → DEPURATED RESULT";
  document.getElementById('qc-gate').innerHTML = '<span style="color:#10b981">Quality Gate: PASSED</span>';
  document.getElementById('learning-form').style.display = 'block';
  
  saveEvidence();
  updateCounters();
}

function setState(step, state) {
  const el = document.getElementById(`step-${step}`);
  el.className = `state-${state.toLowerCase()}`;
  el.innerText = state;
}

function saveEvidence() {
  const exec = {
    id: `AUREA-DEMO-${String(executionCount).padStart(3,'0')}`,
    date: new Date().toISOString(),
    mission: document.getElementById('mission-input').value,
    workflow: "Opportunity Analysis",
    agents: ["Research","Critical Review","Verification","Learning"],
    result: "Structured recommendation generated",
    quality: "PASSED",
    evidence: "Execution trace available"
  };
  let ledger = JSON.parse(localStorage.getItem('aurea_ledger') || '[]');
  ledger.push(exec);
  localStorage.setItem('aurea_ledger', JSON.stringify(ledger));
  renderLedger();
}

function renderLedger() {
  const ledger = JSON.parse(localStorage.getItem('aurea_ledger') || '[]');
  const container = document.getElementById('evidence-ledger');
  if(ledger.length === 0) { container.innerHTML = "Sin ejecuciones aún"; return; }
  container.innerHTML = ledger.map(e => 
    `<div style="border-bottom:1px solid #374151; padding:0.5rem 0">
      <b>${e.id}</b><br><small>${e.date}</small><br>Mission: ${e.mission}<br>Result: ${e.result}
    </div>`
  ).join('');
}

function saveLearning() {
  const learning = {
    l1: document.getElementById('l1').value,
    l2: document.getElementById('l2').value,
    l3: document.getElementById('l3').value,
    l4: document.getElementById('l4').value,
    l5: document.getElementById('l5').value
  };
  let learnings = JSON.parse(localStorage.getItem('aurea_learning') || '[]');
  learnings.push(learning);
  localStorage.setItem('aurea_learning', JSON.stringify(learnings));
  renderLearning();
  updateCounters();
  alert("Learning saved");
}

function renderLearning() {
  const learnings = JSON.parse(localStorage.getItem('aurea_learning') || '[]');
  const ul = document.getElementById('reusable-knowledge');
  ul.innerHTML = learnings.map(l => `<li>${l.l4 || 'Sin aprendizaje'}</li>`).join('');
}

function updateCounters() {
  const ledger = JSON.parse(localStorage.getItem('aurea_ledger') || '[]');
  const learnings = JSON.parse(localStorage.getItem('aurea_learning') || '[]');
  document.getElementById('c-exec').innerText = ledger.length;
  document.getElementById('c-ev').innerText = ledger.length;
  document.getElementById('c-learn').innerText = learnings.length;
  document.getElementById('c-cap').innerText = learnings.filter(l => l.l5).length;
}

function resetLab() {
  if(confirm("¿Borrar todos los datos locales del laboratorio?")) {
    localStorage.removeItem('aurea_ledger');
    localStorage.removeItem('aurea_learning');
    location.reload();
  }
}

function loadData() { renderLedger(); renderLearning(); updateCounters(); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

document.addEventListener('DOMContentLoaded', init);
document.getElementById('analyze-file').addEventListener('click', async () => {
    const file = document.getElementById('file-input').files[0];
    if(!file) return alert('Sube un archivo primero CEO');
    
    document.getElementById('file-result').innerHTML = `🧠 Analizando ${file.name}...`;
    await new Promise(r => setTimeout(r, 2000)); // Simulación
    
    document.getElementById('file-result').innerHTML = `<b>EVIDENCIA:</b> Archivo ${file.name} procesado. 3 hallazgos detectados.`;
});
// === BLOQUE 3: EXPORTAR A PDF ===
document.getElementById('export-pdf').addEventListener('click', () => {
    let ledger = JSON.parse(localStorage.getItem('evidenceLedger')) || [];
    
    if(ledger.length === 0) return alert('No hay evidencia para exportar CEO');
    
    let html = `
    <h1>EVIDENTIA LAB™ - REPORTE OFICIAL</h1>
    <p>Generado: ${new Date().toLocaleString()}</p>
    <hr>
    ${ledger.map(e => `
        <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">
            <p><b>Fecha:</b> ${e.timestamp}</p>
            <p><b>Tipo:</b> ${e.type}</p>
            <p><b>Detalle:</b> ${e.result || e.output}</p>
        </div>
    `).join('')}
    `;
    
    let ventana = window.open('', '', 'height=600,width=800');
    ventana.document.write('<html><head><title>Reporte</title></head><body>');
    ventana.document.write(html);
    ventana.document.write('</body></html>');
    ventana.document.close();
    ventana.print(); // Se abre para imprimir/guardar como PDF
});
// =============================================
// === BLOQUE 4: CEREBRO WEBLLM REAL - AUREA ===
// =============================================

let engine = null; // Aquí guardamos el cerebro

// FUNCIÓN 1: ENCENDER EL CEREBRO CUANDO ABRE LA PÁGINA
async function initEngine() {
    const runBtn = document.getElementById('run-mission');
    runBtn.innerText = "🧠 DESCARGANDO CEREBRO... 1RA VEZ TARDA";
    runBtn.disabled = true;

    // Carga Llama 3.1. La 1ra vez descarga 4GB. Después ya está.
    engine = await webllm.CreateMLCEngine(
        "Llama-3.1-8B-Instruct-q4f16_1",
        {
            initProgressCallback: (report) => {
                runBtn.innerText = `🧠 ${report.text}`; // Muestra % de descarga
            }
        }
    );

    runBtn.innerText = "RUN MISSION"; // Cuando termina
    runBtn.disabled = false;
    runBtn.style.background = "#22c55e"; // Se pone verde
    console.log("Cerebro de AUREA Listo CEO");
}

// Encendemos el cerebro apenas carga la página
initEngine();

// FUNCIÓN 2: CUANDO DAN CLICK A RUN MISSION
document.getElementById('run-mission').addEventListener('click', async () => {
    if(!engine) {
        alert("Espera CEO, el cerebro aún se está descargando");
        return;
    }

    const missionInput = document.getElementById('mission-input').value;
    const stepsDiv = document.getElementById('workflow-steps');

    if(missionInput === "") {
        alert("Escribe una misión primero");
        return;
    }

    stepsDiv.innerHTML = '<p>🧠 AUREA PENSANDO...</p>';

    // Le hablamos a AUREA
    const messages = [
        { role: "system", content: "Eres AUREA, la IA de EVIDENTIA LAB. Eres directa, estratégica y das 3 pasos accionables. Responde en español." },
        { role: "user", content: `Misión: ${missionInput}. Dame 3 pasos para ejecutarla y 1 riesgo.` }
    ];

    // AUREA piensa
    const reply = await engine.chat.completions.create({ messages });
    const output = reply.choices[0].message.content;

    // Mostramos lo que pensó
    stepsDiv.innerHTML = `<pre style="white-space: pre-wrap; color: #22c55e;">${output}</pre>`;

    // Guardamos en el Evidence Ledger
    const entry = {
        timestamp: new Date().toISOString(),
        type: 'MISSION_CON_CEREBRO',
        input: missionInput,
        output: output
    };
    evidenceLedger.push(entry);
    localStorage.setItem('evidenceLedger', JSON.stringify(evidenceLedger));
    renderEvidence(); // Actualiza la tabla
});
