// CSV-driven content loader. Add/remove rows in the CSV files to update the website.
function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === ',' && !quoted) { row.push(cell.trim()); cell = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell !== '' || row.length) row.push(cell.trim());
  if (row.some(v => v !== '')) rows.push(row);
  return rows;
}

function addCollapsibleList(element, values) {
  if (!element) return;
  element.replaceChildren(...values.map(value => {
    const li = document.createElement('li');
    li.innerHTML = value;
    return li;
  }));
  const oldButton = element.parentElement.querySelector(':scope > .show-more');
  if (oldButton) oldButton.remove();
  if (values.length > 5) {
    element.classList.add('collapsed');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'show-more';
    button.textContent = `Show all (${values.length})`;
    button.addEventListener('click', () => {
      const expanded = element.classList.toggle('expanded');
      element.classList.toggle('collapsed', !expanded);
      button.textContent = expanded ? 'Show less' : `Show all (${values.length})`;
    });
    element.parentElement.appendChild(button);
  }
}

async function loadCSV(path, id, formatter, marquee = false, limit = null) {
  const element = document.getElementById(id);
  if (!element) return;
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCSV(await response.text()).slice(1);
    const values = rows.map(formatter).filter(Boolean);
    const displayValues = limit ? values.slice(0, limit) : values;
    if (marquee) {
      element.innerHTML = displayValues.join(' &nbsp;&nbsp; · &nbsp;&nbsp; ');
    } else {
      addCollapsibleList(element, displayValues);
    }
  } catch (error) {
    console.error(`Could not load ${path}`, error);
  }
}

// Load a complete CSV list without collapsing it. Used when the Publications
// tab is explicitly selected on the homepage.
async function loadCSVFull(path, id, formatter) {
  const element = document.getElementById(id);
  if (!element) return;
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCSV(await response.text()).slice(1);
    const values = rows.map(formatter).filter(Boolean);
    element.replaceChildren(...values.map(value => {
      const li = document.createElement('li');
      li.innerHTML = value;
      return li;
    }));
  } catch (error) {
    console.error(`Could not load ${path}`, error);
  }
}

const authorText = ([a1, a2, a3]) => [a1, a2, a3].filter(Boolean).map(a => a.includes('Sendash') ? `<b>${a}</b>` : a).join(', ');
const publication = ([a1, a2, a3, title, journal, doi]) => `${authorText([a1,a2,a3])}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ''}.${doi && doi !== 'Link' ? ` doi: <a href="https://doi.org/${doi}" target="_blank" rel="noopener"><i>${doi}</i></a>` : ''}`;

function setupTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = [...tabGroup.querySelectorAll('.tab[data-target]')];
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const container = tabGroup.parentElement;
        container.querySelectorAll(':scope > .tab-panel').forEach(panel => {
          const active = panel.id === tab.dataset.target;
          panel.classList.toggle('active', active);
          panel.hidden = !active;
        });
        const preview = document.getElementById('publication-preview');
        const all = document.getElementById('publication-all');
        if (preview && all) {
          // Publications is a preview on initial page load. When the
          // Publications tab is explicitly selected, replace the preview
          // with the complete publication list — still on this homepage.
          const showAll = tab.dataset.target === 'home-publications';
          preview.hidden = !showAll;
          all.hidden = !showAll;
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();

  // Homepage preview: the first three rows of journals.csv are treated as the
  // recent/top entries. Reorder the CSV to change which papers appear here.
  loadCSV('data/Publications/journals.csv','research-preview',publication,false,3);
  loadCSVFull('data/Publications/journals.csv','home-journal-publications',publication);
  loadCSVFull('data/Publications/conferences.csv','home-conference-proceedings',publication);
  loadCSVFull('data/Publications/books.csv','home-book-chapters',publication);
  loadCSVFull('data/Publications/otherpublications.csv','home-other-publications',([title,journal,link]) => `<b><i>${title}</i></b>${journal ? `, ${journal}` : ''}. <a href="${link}" target="_blank" rel="noopener">[Link]</a>`);

  const jobs = [
    ['data/Publications/journals.csv','journal-publications',publication],
    ['data/Publications/conferences.csv','conference-proceedings',publication],
    ['data/Publications/books.csv','book-chapters',publication],
    ['data/Publications/otherpublications.csv','other-publications',([title,journal,link]) => `<b><i>${title}</i></b>${journal ? `, ${journal}` : ''}. <a href="${link}" target="_blank" rel="noopener">[Link]</a>`],
    ['data/ResearchInterest/researchinterests.csv','research-interest',([i]) => i],
    ['data/ResearchInterest/activities.csv','professional-activities',([r,j,l]) => `${r} of <i><a href="${l}" target="_blank" rel="noopener"><b>${j}</b></a></i>`],
    ['data/Teaching/theorycourse.csv','theory-courses',([i]) => i],
    ['data/Teaching/labcourse.csv','lab-courses',([i]) => i],
    ['data/Talks/talks.csv','invited-talks',([title,program,organizer,date]) => `<b>${title}</b>: <i>${program}</i>${organizer ? ` organized by <i>${organizer}</i>` : ''}, ${date}`],
    ['data/Talks/confparticipation.csv','conference-participation',([role,event]) => `Served as <b>${role}</b> – <i>${event}</i>`],
    ['data/Supervision/phd-students.csv','phd-students',([name,topic,status]) => `<b>${name}</b>: <i>${topic}</i> <span class="status">(${status})</span>`],
    ['data/Supervision/master-students.csv','master-students',([name,topic,year]) => `<b>${name}</b>: <i>${topic}</i> <span class="status">[${year}]</span>`],
    ['data/Supervision/bachelor-students.csv','bachelor-students',([name,project,year]) => `<b>${name}</b>: <i>${project}</i> <span class="status">[${year}]</span>`],
    ['data/Notifications/notifications.csv','notification-marquee',([msg]) => msg, true]
  ];
  Promise.all(jobs.map(([path,id,formatter,marquee]) => loadCSV(path,id,formatter,marquee)));
});
