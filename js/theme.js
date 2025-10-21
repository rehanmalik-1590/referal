/* js/theme.js
   Handles:
   - theme toggle (dark / light)
   - color picker for background (accepts rgb/rgba/hex)
   - applies gradient background using chosen color
   - saves preferences to localStorage
*/

(function(){
  // DOM elements will exist in pages that include this file.
  const THEME_KEY = 'dribzap_theme';
  const COLOR_KEY = 'dribzap_bgcolor';

  // Utility: parse value to rgb/rgba string
  function normalizeColor(v){
    // Accept hex (#rrggbb), rgb(...), rgba(...), or comma-separated "r,g,b" or "r,g,b,a"
    if(!v) return null;
    v = v.trim();
    if(v.startsWith('#')){
      // hex -> rgb
      const hex = v.slice(1);
      if(hex.length === 3){
        const r = parseInt(hex[0]+hex[0],16);
        const g = parseInt(hex[1]+hex[1],16);
        const b = parseInt(hex[2]+hex[2],16);
        return `${r}, ${g}, ${b}`;
      } else if(hex.length === 6){
        const r = parseInt(hex.slice(0,2),16);
        const g = parseInt(hex.slice(2,4),16);
        const b = parseInt(hex.slice(4,6),16);
        return `${r}, ${g}, ${b}`;
      }
    }
    if(v.startsWith('rgb')){
      // strip rgb/rgba(...) -> get numbers
      const inside = v.substring(v.indexOf('(')+1, v.lastIndexOf(')'));
      const parts = inside.split(',').map(p=>p.trim());
      if(parts.length >= 3) {
        return `${parseFloat(parts[0])}, ${parseFloat(parts[1])}, ${parseFloat(parts[2])}` + (parts[3] ? `, ${parts[3]}` : '');
      }
    }
    // if comma-separated numbers "r,g,b" or "r,g,b,a"
    if(v.indexOf(',') !== -1){
      const parts = v.split(',').map(p=>p.trim());
      if(parts.length>=3){
        return parts.slice(0,4).join(', ');
      }
    }
    // fallback: try to use as-is
    return v;
  }

  function applyBackgroundColor(colorValue){
    // colorValue should be normalized like "r, g, b" or "r, g, b, a"
    if(!colorValue) return;
    const body = document.body;
    const parts = colorValue.split(',').map(p=>p.trim());
    // craft gradient: soft center glow + linear gradient
    let rgb = parts.slice(0,3).join(', ');
    let alpha = parts[3] ? parts[3] : '1';
    // create multi-stop gradient to look nice with chosen color
    const gradient = `radial-gradient(circle at 18% 12%, rgba(${rgb},0.12), transparent 6%),
                      linear-gradient(180deg, rgba(${rgb},${Math.min(0.14, alpha*0.2)}) 0%, rgba(${rgb},${Math.min(0.06, alpha*0.1)}) 40%), 
                      linear-gradient(180deg, rgba(8,10,18,1) 60%, rgba(6,7,16,1) 100%)`;
    body.style.transition = 'background 450ms ease';
    body.style.background = gradient;
  }

  function setTheme(theme){
    const body = document.body;
    if(theme === 'dark'){
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  // Init: wire up buttons if present in DOM
  function init(){
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const colorInput = document.querySelector('[data-color-input]');
    const applyBtn = document.querySelector('[data-apply-color]');
    const resetColorBtn = document.querySelector('[data-reset-color]');

    // Load saved
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    const savedColor = localStorage.getItem(COLOR_KEY) || null;
    setTheme(savedTheme);
    if(savedColor){
      const norm = normalizeColor(savedColor);
      applyBackgroundColor(norm);
      if(colorInput) colorInput.value = savedColor;
    }

    if(themeToggle){
      themeToggle.addEventListener('click', (e)=>{
        const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
      });
    }

    if(applyBtn && colorInput){
      applyBtn.addEventListener('click', ()=>{
        const v = colorInput.value;
        const norm = normalizeColor(v);
        if(!norm){
          alert('Invalid color. Use hex (#rrggbb), rgb(r,g,b) or r,g,b values.');
          return;
        }
        localStorage.setItem(COLOR_KEY, v);
        applyBackgroundColor(norm);
      });
    }

    if(resetColorBtn){
      resetColorBtn.addEventListener('click', ()=>{
        localStorage.removeItem(COLOR_KEY);
        // Restore default based on theme
        const defaultColor = document.body.classList.contains('theme-dark') ? '6,7,16' : '22,24,38';
        applyBackgroundColor(defaultColor);
      });
    }
  }

  // Auto-init on DOMContentLoaded
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.DribZapTheme = { setTheme, applyBackgroundColor, normalizeColor };
})();
