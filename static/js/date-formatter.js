let dates = document.getElementsByClassName("date");
let options = { year: "numeric", month: "long", day: "numeric" };
for (const dateElem of dates) {
    const date = new Date(dateElem.textContent + "T12:00:00Z");
    dateElem.textContent = date.toLocaleDateString("en-US", options);
}

dates = document.getElementsByClassName("short-date");
options = { month: "short", day: "numeric" };
for (const dateElem of dates) {
    const date = new Date(dateElem.textContent + "T12:00:00Z");
    dateElem.textContent = date.toLocaleDateString("en-US", options);
}