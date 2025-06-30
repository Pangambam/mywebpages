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

  // ✅ Refresh AOS after each section is updated
  if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
    AOS.refresh();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Journal Publications
  loadCSVToUL("data/journals.csv", "journal-publications", ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. <a href="${doi}" target="_blank">[Link]</a>`;
  });

  // Conference Proceedings
  loadCSVToUL("data/conferences.csv", "conference-proceedings", ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. <a href="${doi}" target="_blank">[Link]</a>`;
  });

  // Book Chapters
  loadCSVToUL("data/books.csv", "book-chapters", ([a1, a2, a3, title, journal, doi]) => {
    const authors = [a1, a2, a3]
      .filter(a => a.trim() !== "")
      .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
      .join(", ");
    return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. <a href="https://doi.org/${doi}" target="_blank">doi: ${doi}</a>`;
});

  // Other Publications
  loadCSVToUL("data/otherpublications.csv", "other-publications", ([title, journal, link]) => {
    return `<b><i>${title}</i></b>${journal ? `, ${journal}` : ""}. <a href="${link}" target="_blank">[Link]</a>`;
  });

  // Research Interests
  loadCSVToUL("data/researchinterests.csv", "research-interest", ([i]) => i);

  // Professional Activities
  loadCSVToUL("data/activities.csv", "professional-activities", ([r, j, l]) =>
    `${r} of <i><a href="${l}" target="_blank"><b>${j}</b></a></i>`
  );

  // Theory Courses
  loadCSVToUL("data/theorycourse.csv", "theory-courses", ([i]) => i);

  // Lab Courses
  loadCSVToUL("data/labcourse.csv", "lab-courses", ([i]) => i);

  // Invited Talks
  loadCSVToUL("data/talks.csv", "invited-talks", ([title, program, organizer, date]) =>
    `<b>${title}</b>: <i>${program}</i> organized by <i>${organizer}</i>, ${date}`
  );

  // Conference Participation
  loadCSVToUL("data/confparticipation.csv", "conference-participation", ([role, event]) =>
    `Served as <b>${role}</b> – <i>${event}</i>`
  );

  // Mark body as loaded
  document.body.classList.add("loaded");
});
