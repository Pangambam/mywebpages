async function loadCSVToUL(csvPath, ulId, formatter, isMarquee = false) {
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
    const el = document.getElementById(ulId);
    if (!el) return;

    if (isMarquee) {
        // For marquee: combine all rows into one scrolling line
        const items = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, ''));
            return formatter(cols);
        });
        el.innerHTML = items.join(" &nbsp;&nbsp;|&nbsp;&nbsp; ");
    } else {
        rows.forEach(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, ''));
            const li = document.createElement("li");
            li.innerHTML = formatter(cols);
            el.appendChild(li);
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const tasks = [];

    // Helper wrapper for collecting promises
    const scheduleLoad = (csvPath, ulId, formatter, isMarquee = false) => {
        tasks.push(loadCSVToUL(csvPath, ulId, formatter, isMarquee));
    };

    // --- Publications ---
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

    // --- Research, Teaching, Activities ---
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

    // --- Supervision Section ---
    scheduleLoad("data/phd-students.csv", "phd-students", ([name, topic, status]) =>
        `<b>${name}</b>: <i>${topic}</i> <span style="color:gray;">(${status})</span>`
    );

    scheduleLoad("data/master-students.csv", "master-students", ([name, topic, year]) =>
        `<b>${name}</b>: <i>${topic}</i> <span style="color:gray;">[${year}]</span>`
    );

    scheduleLoad("data/bachelor-students.csv", "bachelor-students", ([name, project, year]) =>
        `<b>${name}</b>: <i>${project}</i> <span style="color:gray;">[${year}]</span>`
    );

    // --- Notification Marquee ---
    scheduleLoad("data/notifications.csv", "notification-marquee", ([msg]) => msg, true);

    // Wait for all CSVs to load and content to be appended
    await Promise.all(tasks);

    // ✅ Refresh AOS and reveal the body
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
        AOS.refresh();
    }

    document.body.classList.add("loaded");
});
