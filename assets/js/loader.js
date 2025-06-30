async function loadCSVToUL(csvPath, ulId, formatter) {
  const res = await fetch(csvPath);
  const data = await res.text();
  const rows = data.trim().split("\n").slice(1); // skip header
  const ul = document.getElementById(ulId);

  rows.forEach(row => {
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, ''));
    const li = document.createElement("li");
    li.innerHTML = formatter(cols);
    ul.appendChild(li);
  });
}

// Formatter map
const formatters = {
  "journal-publications": ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
  },
  "conference-proceedings": ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
  },
  "book-chapters": ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
  },
  "other-publications": ([title, journal, link]) => {
    return `<b><i>${title}</i></b>${journal ? `, ${journal}` : ""}. <a href="${link}" target="_blank">[Link]</a>`;
  },
  "research-interest": ([i]) => i,
  "professional-activities": ([r, j, l]) =>
    `${r} of <i><a href="${l}" target="_blank"><b>${j}</b></a></i>`,
  "theory-courses": ([i]) => i,
  "lab-courses": ([i]) => i,
  "invited-talks": ([title, program, organizer, date]) =>
    `<b>${title}</b>: <i>${program}</i> organized by <i>${organizer}</i>, ${date}`,
  "conference-participation": ([role, event]) =>
    `Served as <b>${role}</b> – <i>${event}</i>`
};

// CSV file map
const csvMap = {
  "journal-publications": "data/journals.csv",
  "conference-proceedings": "data/conferences.csv",
  "book-chapters": "data/books.csv",
  "other-publications": "data/otherpublications.csv",
  "research-interest": "data/researchinterests.csv",
  "professional-activities": "data/activities.csv",
  "theory-courses": "data/theorycourse.csv",
  "lab-courses": "data/labcourse.csv",
  "invited-talks": "data/talks.csv",
  "conference-participation": "data/confparticipation.csv"
};

// Track already loaded sections
const loadedSections = new Set();

document.addEventListener("DOMContentLoaded", async () => {
  // Load "Publications" section by default
  await loadCSVToUL("data/journals.csv", "journal-publications", formatters["journal-publications"]);
  loadedSections.add("journal-publications");

  if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
    AOS.refresh();
  }
  document.body.classList.add("loaded");

  // Lazy load other tabs on click
  const filterButtons = document.querySelectorAll(".filter-btn"); // Update class based on your HTML

  filterButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-target"); // Assuming data-target="#research-interest"
      const sectionId = target?.replace("#", "");

      if (sectionId && !loadedSections.has(sectionId) && csvMap[sectionId]) {
        await loadCSVToUL(csvMap[sectionId], sectionId, formatters[sectionId]);
        loadedSections.add(sectionId);

        if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
          AOS.refresh();
        }
      }
    });
  });
});
