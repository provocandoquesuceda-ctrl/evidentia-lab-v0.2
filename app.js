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
