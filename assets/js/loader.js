async function loadCSVToUL(csvPath, ulId, formatter) {
    let res;
    try {
        res = await fetch(csvPath);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    } catch (error) {
        console.error(`Failed to load CSV from ${csvPath}:`, error);
        return;
    }
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

document.addEventListener("DOMContentLoaded", async () => {
    const tasks = [];

    // Helper wrapper for collecting promises
    const scheduleLoad = (csvPath, ulId, formatter) => {
        tasks.push(loadCSVToUL(csvPath, ulId, formatter));
    };

    // Load all CSV sections
    scheduleLoad("data/journals.csv", "journal-publications", ([a1, a2, a3, title, journal, doi]) => {
        const authors = [a1, a2, a3]
            .filter(a => a.trim() !== "")
            .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
            .join(", ");
        return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
    });

    scheduleLoad("data/conferences.csv", "conference-proceedings", ([a1, a2, a3, title, journal, doi]) => {
        const authors = [a1, a2, a3]
            .filter(a => a.trim() !== "")
            .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
            .join(", ");
        return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
    });

    scheduleLoad("data/books.csv", "book-chapters", ([a1, a2, a3, title, journal, doi]) => {
        const authors = [a1, a2, a3]
            .filter(a => a.trim() !== "")
            .map(a => a.includes("Sendash") ? `<b>${a}</b>` : a)
            .join(", ");
        return `${authors}. <b><i>"${title}"</i></b>${journal ? `, ${journal}` : ""}. doi: <a href="https://doi.org/${doi}" target="_blank"><i>${doi}</i></a>`;
    });

    scheduleLoad("data/otherpublications.csv", "other-publications", ([title, journal, link]) => {
        return `<b><i>${title}</i></b>${journal ? `, ${journal}` : ""}. <a href="${link}" target="_blank">[Link]</a>`;
    });

    scheduleLoad("data/researchinterests.csv", "research-interest", ([i]) => i);
    scheduleLoad("data/activities.csv", "professional-activities", ([r, j, l]) =>
        `${r} of <i><a href="${l}" target="_blank"><b>${j}</b></a></i>`
    );
    scheduleLoad("data/theorycourse.csv", "theory-courses", ([i]) => i);
    scheduleLoad("data/labcourse.csv", "lab-courses", ([i]) => i);
    scheduleLoad("data/talks.csv", "invited-talks", ([title, program, organizer, date]) =>
        `<b>${title}</b>: <i>${program}</i> organized by <i>${organizer}</i>, ${date}`
    );
    scheduleLoad("data/confparticipation.csv", "conference-participation", ([role, event]) =>
        `Served as <b>${role}</b> – <i>${event}</i>`
    );

    // Wait for all CSVs to load and content to be appended
    await Promise.all(tasks);

    // ✅ Refresh AOS and reveal the body
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
        AOS.refresh();
    }

    document.body.classList.add("loaded");
});
