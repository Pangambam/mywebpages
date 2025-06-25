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

document.addEventListener("DOMContentLoaded", () => {
  // Journal Publications: [Authors, Title, Journal, DOI]
  loadCSVToUL("data/journals.csv", "journal-publications", ([a1, a2, a3, title, journal, doi]) => {
  const authors = [a1, a2, a3]
    .filter(a => a.trim() !== "") // remove empty fields
    .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a) // bold if "Sendash"
    .join(", "); // join non-empty authors

  return `${authors}. <b><i>"${title}"</i></b>, ${journal}. doi: <a href="${doi}" target="_blank">${doi}</a>`;
});


  // Conference Proceedings
  loadCSVToUL("data/conferences.csv", "conference-proceedings", ([a1, a2, a3, title, journal, doi]) => {
  const authors = [a1, a2, a3]
    .filter(a => a.trim() !== "") // remove empty fields
    .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a) // bold if "Sendash"
    .join(", "); // join non-empty authors

  return `${authors}. <b><i>"${title}"</i></b>, ${journal}. doi: <a href="${doi}" target="_blank">${doi}</a>`;
});

  // Book Chapters
  loadCSVToUL("data/books.csv", "book-chapters", ([a1, a2, a3, title, journal, doi]) => {
  const authors = [a1, a2, a3]
    .filter(a => a.trim() !== "") // remove empty fields
    .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a) // bold if "Sendash"
    .join(", "); // join non-empty authors

  return `${authors}. <b><i>"${title}"</i></b>, ${journal}. doi: <a href="${doi}" target="_blank"><i>${doi}</i></a>`;
});

  // Other Publications: [Title, Source, Link]
  loadCSVToUL("data/otherpublications.csv", "other-publications", ([title, journal, link]) => {
	  return `<b><i>${title}</i></b>, ${journal}. <a href="${link}" target="_blank">[Link]</a>`;
});


  // Research Interest
  loadCSVToUL("data/researchinterests.csv", "research-interest", ([i]) => i);

  // Professional Activities: [Role, Journal, Link]
  loadCSVToUL("data/activities.csv", "professional-activities", ([r, j, l]) =>
    `${r} of <i><a href="${l}" target="_blank"><b>${j}</b></a></i>`
  );

  // Theory Courses
  loadCSVToUL("data/theorycourse.csv", "theory-courses", ([i]) => i);

  // Lab Courses
  loadCSVToUL("data/labcourse.csv", "lab-courses", ([i]) => i);

  // Invited Talks: [Title, Program, Organizer, Date]
  loadCSVToUL("data/talks.csv", "invited-talks", ([title, program, organizer, date]) =>
    `<b>${title}</b>: <i>${program}</i> organized by <i>${organizer}</i>, ${date}`
);


  // Conference Participation
  loadCSVToUL("data/confparticipation.csv", "conference-participation", ([r, e]) =>
    `Served as <b>${r}</b> – <i>${e}</i>`
  );
});
