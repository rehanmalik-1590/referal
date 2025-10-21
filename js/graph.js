/* js/graph.js
   Chart setup + UI controls for graph.html
   - Populates preset datasets
   - Allows applying custom data (CSV)
   - Switch chart types
   - Download PNG
*/

(function(){
  // Preset datasets
  const PRESETS = {
    "Simple Trend": {
      labels: ["A","B","C","D","E","F"],
      data: [12, 18, 25, 20, 28, 34],
      color: "124,58,237"
    },
    "Seasonal": {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],
      data: [8, 14, 30, 22, 12, 6, 10, 20, 34, 28],
      color: "0,229,255"
    },
    "Growth": {
      labels: ["2016","2017","2018","2019","2020","2021","2022"],
      data: [5, 8, 14, 22, 35, 58, 92],
      color: "32,200,120"
    },
    "Random": {
      labels: ["P1","P2","P3","P4","P5","P6","P7","P8"],
      data: Array.from({length:8}, ()=> Math.floor(Math.random()*60)+4),
      color: "220,80,120"
    }
  };

  // DOM
  const datasetList = document.getElementById('datasetList');
  const customData = document.getElementById('customData');
  const customLabels = document.getElementById('customLabels');
  const applyCustom = document.getElementById('applyCustom');
  const chartTypeSelect = document.getElementById('chartType');
  const btnDownload = document.getElementById('btnDownload');
  const btnReset = document.getElementById('btnReset');

  // Chart.js instance
  const ctx = document.getElementById('myChart').getContext('2d');
  let currentChart = null;
  let currentConfig = null;

  // Helper: create dataset object
  function createDataset(label, data, colorRgb){
    const rgb = colorRgb || "124,58,237";
    return {
      label,
      data,
      borderColor: `rgba(${rgb},0.95)`,
      backgroundColor: Array.isArray(data) && data.length && (currentChart && currentChart.config.type.includes('bar') || chartTypeSelect.value === 'bar')
        ? data.map(()=>`rgba(${rgb},0.65)`)
        : `rgba(${rgb},0.18)`,
      tension: 0.3,
      fill: chartTypeSelect.value === 'line' || chartTypeSelect.value === 'radar'
    };
  }

  function buildConfig(type, labels, dataArr, datasetLabel, color){
    return {
      type: type,
      data: {
        labels: labels,
        datasets: [ createDataset(datasetLabel, dataArr, color) ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: (type === 'pie' || type === 'doughnut') ? {} : {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' } }
        }
      }
    };
  }

  function renderChart(config){
    if(currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
    // set canvas container height dynamically
    const canvas = document.getElementById('myChart');
    canvas.style.height = '420px';
    currentChart = new Chart(canvas, config);
    currentConfig = config;
  }

  // Populate preset list
  function populatePresets(){
    datasetList.innerHTML = '';
    Object.keys(PRESETS).forEach((key)=>{
      const item = document.createElement('div');
      item.className = 'dataset-item';
      item.innerHTML = `<div><strong>${key}</strong><div class="small-muted" style="margin-top:6px;">${PRESETS[key].data.length} points</div></div>
                        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
                          <button class="btn-graph" data-preset="${key}">Apply</button>
                          <div style="width:18px; height:18px; border-radius:50%; background:linear-gradient(90deg, rgba(${PRESETS[key].color},0.95), rgba(${PRESETS[key].color},0.6));"></div>
                        </div>`;
      datasetList.appendChild(item);
    });
    // wire apply buttons
    datasetList.querySelectorAll('[data-preset]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const key = btn.getAttribute('data-preset');
        applyPreset(key);
      });
    });
  }

  function applyPreset(key){
    const p = PRESETS[key];
    const type = chartTypeSelect.value || 'line';
    const cfg = buildConfig(type, p.labels, p.data, key, p.color);
    renderChart(cfg);
  }

  // Parse CSV numbers
  function parseCSVNumbers(str){
    if(!str) return [];
    const arr = str.split(',').map(s=>s.trim()).filter(s=>s.length>0).map(s=>{
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    });
    return arr;
  }

  // Apply custom dataset
  applyCustom.addEventListener('click', ()=>{
    const raw = customData.value.trim();
    if(!raw){ alert('Enter comma separated numbers'); return; }
    const dataArr = parseCSVNumbers(raw);
    const labelsRaw = customLabels.value.trim();
    const labels = labelsRaw ? labelsRaw.split(',').map(s=>s.trim()) : dataArr.map((_,i)=>`P${i+1}`);
    const type = chartTypeSelect.value || 'line';
    const cfg = buildConfig(type, labels, dataArr, 'Custom', '124,58,237');
    renderChart(cfg);
  });

  // Chart type change — re-render with current data
  chartTypeSelect.addEventListener('change', ()=>{
    if(!currentConfig) return;
    const type = chartTypeSelect.value;
    // extract current labels and data if possible
    const labels = currentConfig.data.labels || [];
    const dataArr = (currentConfig.data.datasets && currentConfig.data.datasets[0] && currentConfig.data.datasets[0].data) || [];
    const label = (currentConfig.data.datasets && currentConfig.data.datasets[0] && currentConfig.data.datasets[0].label) || 'Dataset';
    const color = (currentConfig.data.datasets && currentConfig.data.datasets[0] && currentConfig.data.datasets[0].borderColor)
                  ? currentConfig.data.datasets[0].borderColor.replace(/rgba?\(|\)/g,'').split(',').slice(0,3).join(',').trim()
                  : '124,58,237';
    const cfg = buildConfig(type, labels, dataArr, label, color);
    renderChart(cfg);
  });

  // Download
  btnDownload.addEventListener('click', ()=>{
    if(!currentChart) { alert('No chart to download'); return; }
    const link = document.createElement('a');
    link.href = document.getElementById('myChart').toDataURL('image/png', 1.0);
    link.download = 'chart.png';
    link.click();
  });

  // Reset to default
  btnReset.addEventListener('click', ()=>{
    // apply first preset
    const firstKey = Object.keys(PRESETS)[0];
    applyPreset(firstKey);
    customData.value = '';
    customLabels.value = '';
    chartTypeSelect.value = 'line';
  });

  // Auto init
  document.addEventListener('DOMContentLoaded', ()=>{
    populatePresets();
    // initial chart
    const firstKey = Object.keys(PRESETS)[0];
    applyPreset(firstKey);
  });
})();
