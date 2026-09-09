document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // VARIABLES
    // ==============================

    const card = document.querySelector(".student-card");
    const subjectSection = document.getElementById("subjectSection");
    const subjectForm = document.getElementById("subjectForm");

    let savedSubjectNames = [];

    let studentInfo = {
        name: "",
        className: "",
        roll: "",
        exam: ""
    };

    let currentResultData = null;
    const HISTORY_KEY = "studentMarksAnalyserHistory";


    // ==============================
    // PHASE 3 - SAVED EXAM HISTORY
    // ==============================

    function getHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            };
            return entities[char];
        });
    }

    // ==============================
    // PHASE 7 - REPORT CARD / PDF PRINT
    // ==============================

    function printReportCard() {
        if (!currentResultData) return;
        window.print();
    }

    // ==============================
    // PHASE 6 - STUDENT DASHBOARD
    // ==============================

    function renderStudentDashboard(student, preferredResult) {
        const dashboard = document.getElementById("studentDashboard");
        if (!dashboard) return;

        const currentStudent = student || studentInfo;
        const hasStudent = currentStudent && currentStudent.name && currentStudent.roll && currentStudent.className;

        if (!hasStudent) {
            dashboard.innerHTML = `
                <div class="dashboard-empty">
                    <span>👤</span>
                    <strong>Enter your student details to open your dashboard</strong>
                    <p>Your dashboard will only show results matching your Name + Roll Number + Class.</p>
                </div>`;
            return;
        }

        const history = getStudentHistory(currentStudent.name, currentStudent.roll, currentStudent.className)
            .slice()
            .sort(function (a, b) { return new Date(b.savedAt || 0) - new Date(a.savedAt || 0); });

        const latest = preferredResult || currentResultData || history[0] || null;
        const latestSubjects = latest && Array.isArray(latest.subjects) ? latest.subjects : [];

        if (!latest) {
            dashboard.innerHTML = `
                <div class="dashboard-profile dashboard-no-result">
                    <div class="dashboard-avatar">${escapeHtml((currentStudent.name || "S").charAt(0).toUpperCase())}</div>
                    <div class="dashboard-profile-copy">
                        <span class="dashboard-label">STUDENT PROFILE</span>
                        <h3>${escapeHtml(currentStudent.name)}</h3>
                        <p>Roll No. ${escapeHtml(currentStudent.roll)} · Class ${escapeHtml(currentStudent.className)}</p>
                    </div>
                </div>
                <div class="dashboard-empty dashboard-empty-inline">
                    <span>📚</span>
                    <strong>No saved exam result yet</strong>
                    <p>Complete and save your first exam to build your dashboard.</p>
                </div>`;
            return;
        }

        let strongest = null;
        let weakest = null;
        latestSubjects.forEach(function (subject) {
            const marks = Number(subject.marks) || 0;
            if (!strongest || marks > strongest.marks) strongest = { name: subject.name, marks: marks };
            if (!weakest || marks < weakest.marks) weakest = { name: subject.name, marks: marks };
        });

        const previous = history.find(function (item) {
            return !(Number(item.average) === Number(latest.average) &&
                JSON.stringify(item.subjects || []) === JSON.stringify(latest.subjects || []));
        }) || null;
        const change = previous ? Number(latest.average) - Number(previous.average) : null;
        const changeSign = change !== null && change > 0 ? "+" : "";
        const changeClass = change === null ? "dashboard-neutral" : (change > 0 ? "dashboard-positive" : (change < 0 ? "dashboard-negative" : "dashboard-neutral"));
        const changeText = change === null ? "First result" : `${changeSign}${change.toFixed(2)}%`;

        const historyHtml = history.length ? history.slice(0, 5).map(function (item, index) {
            const dateText = item.savedAt ? new Date(item.savedAt).toLocaleDateString() : "Saved";
            return `<div class="dashboard-history-row">
                <div class="dashboard-history-index">${index + 1}</div>
                <div class="dashboard-history-main">
                    <strong>${escapeHtml(item.exam || "Exam Result")}</strong>
                    <span>${escapeHtml(dateText)} · Grade ${escapeHtml(item.grade || "-")}</span>
                </div>
                <div class="dashboard-history-score">
                    <strong>${Number(item.average || 0).toFixed(2)}%</strong>
                    <button type="button" class="dashboard-view-result" data-dashboard-id="${escapeHtml(item.id)}">View</button>
                </div>
            </div>`;
        }).join("") : `<div class="dashboard-empty-inline"><span>📚</span><strong>No exam history yet</strong></div>`;

        dashboard.innerHTML = `
            <div class="dashboard-profile">
                <div class="dashboard-avatar">${escapeHtml((currentStudent.name || "S").charAt(0).toUpperCase())}</div>
                <div class="dashboard-profile-copy">
                    <span class="dashboard-label">STUDENT PROFILE</span>
                    <h3>${escapeHtml(currentStudent.name)}</h3>
                    <p>Roll No. ${escapeHtml(currentStudent.roll)} · Class ${escapeHtml(currentStudent.className)}</p>
                </div>
                <div class="dashboard-exam-pill">${escapeHtml(latest.exam || "Latest Exam")}</div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card dashboard-latest-card">
                    <div class="dashboard-card-heading"><span>📊</span><div><span class="dashboard-label">LATEST RESULT</span><h3>Latest Performance</h3></div></div>
                    <div class="dashboard-average"><strong>${Number(latest.average || 0).toFixed(2)}%</strong><span>Grade ${escapeHtml(latest.grade || "-")} · ${escapeHtml(latest.result || "")}</span></div>
                    <div class="dashboard-progress-track"><span style="width:${Math.max(0, Math.min(100, Number(latest.average) || 0))}%"></span></div>
                    <div class="dashboard-mini-stats"><div><strong>${escapeHtml(latest.total ?? "-")}</strong><span>Total marks</span></div><div><strong class="${changeClass}">${changeText}</strong><span>Vs previous</span></div></div>
                </div>

                <div class="dashboard-card">
                    <div class="dashboard-card-heading"><span>🏆</span><div><span class="dashboard-label">STRONGEST</span><h3>Best Subject</h3></div></div>
                    <div class="dashboard-subject-highlight strong">${strongest ? escapeHtml(strongest.name) : "-"}<strong>${strongest ? strongest.marks + "%" : ""}</strong></div>
                    <p class="dashboard-card-note">Your highest score in the latest exam.</p>
                </div>

                <div class="dashboard-card">
                    <div class="dashboard-card-heading"><span>🎯</span><div><span class="dashboard-label">FOCUS AREA</span><h3>Weakest Subject</h3></div></div>
                    <div class="dashboard-subject-highlight focus">${weakest ? escapeHtml(weakest.name) : "-"}<strong>${weakest ? weakest.marks + "%" : ""}</strong></div>
                    <p class="dashboard-card-note">Give this subject some extra practice.</p>
                </div>
            </div>

            <div class="dashboard-card dashboard-progress-card">
                <div class="dashboard-card-heading"><span>📈</span><div><span class="dashboard-label">PROGRESS</span><h3>Exam-to-Exam Progress</h3></div></div>
                ${previous ? `<div class="dashboard-progress-compare"><div><span>${escapeHtml(previous.exam || "Previous Exam")}</span><strong>${Number(previous.average).toFixed(2)}%</strong></div><span class="dashboard-arrow">→</span><div><span>${escapeHtml(latest.exam || "Latest Exam")}</span><strong>${Number(latest.average).toFixed(2)}%</strong></div><div class="dashboard-change ${changeClass}">${changeText}</div></div>` : `<div class="dashboard-empty-inline"><span>🌱</span><div><strong>Starting point</strong><p>Save another exam to see how your performance changes over time.</p></div></div>`}
            </div>

            <div class="dashboard-card dashboard-history-card">
                <div class="dashboard-card-heading"><span>📚</span><div><span class="dashboard-label">EXAM HISTORY</span><h3>Your Saved Exams</h3></div><span class="dashboard-history-count">${history.length}</span></div>
                <div class="dashboard-history-list">${historyHtml}</div>
            </div>`;

        dashboard.querySelectorAll(".dashboard-view-result").forEach(function (button) {
            button.addEventListener("click", function () {
                const item = getHistory().find(function (entry) { return entry.id === button.dataset.dashboardId; });
                if (item) loadSavedResult(item);
            });
        });
    }

    function renderHistory(student) {
        const historyList = document.getElementById("historyList");
        const clearButton = document.getElementById("clearHistoryButton");
        if (!historyList) return;

        const currentStudent = student || studentInfo;
        const hasStudent = currentStudent && currentStudent.name && currentStudent.roll && currentStudent.className;
        const history = hasStudent
            ? getStudentHistory(currentStudent.name, currentStudent.roll, currentStudent.className)
            : [];
        if (clearButton) clearButton.hidden = history.length === 0;

        if (!hasStudent) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <span>🔐</span>
                    <strong>Enter student details to view history</strong>
                    <p>Only the results matching the entered Name + Roll Number + Class will be shown.</p>
                </div>`;
            return;
        }

        if (!history.length) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <span>📚</span>
                    <strong>No saved results for this student</strong>
                    <p>No saved exam results were found for ${escapeHtml(currentStudent.name)} · Roll No. ${escapeHtml(currentStudent.roll)} · Class ${escapeHtml(currentStudent.className)}.</p>
                </div>`;
            return;
        }

        historyList.innerHTML = history.map(function (item) {
            const dateText = item.savedAt ? new Date(item.savedAt).toLocaleString() : "Saved result";
            const meta = [
                item.className ? `Class ${escapeHtml(item.className)}` : "",
                item.roll ? `Roll No. ${escapeHtml(item.roll)}` : "",
                item.exam ? escapeHtml(item.exam) : ""
            ].filter(Boolean).join(" • ");

            return `
                <article class="history-card" data-history-id="${item.id}">
                    <div class="history-card-main">
                        <div class="history-avatar">${escapeHtml((item.name || "S").charAt(0).toUpperCase())}</div>
                        <div>
                            <span class="history-date">${escapeHtml(dateText)}</span>
                            <h3>${escapeHtml(item.name)}</h3>
                            ${meta ? `<p>${meta}</p>` : ""}
                        </div>
                    </div>
                    <div class="history-result">
                        <strong>${Number(item.average).toFixed(2)}%</strong>
                        <span>Grade ${escapeHtml(item.grade)} · ${escapeHtml(item.result)}</span>
                    </div>
                    <div class="history-actions">
                        <button type="button" class="history-load" data-id="${item.id}">View Result</button>
                        <button type="button" class="history-delete" data-id="${item.id}" aria-label="Delete saved result">Delete</button>
                    </div>
                </article>`;
        }).join("");

        historyList.querySelectorAll(".history-load").forEach(function (button) {
            button.addEventListener("click", function () {
                const item = getHistory().find(function (entry) { return entry.id === button.dataset.id; });
                if (!item) return;
                loadSavedResult(item);
            });
        });

        historyList.querySelectorAll(".history-delete").forEach(function (button) {
            button.addEventListener("click", function () {
                const updated = getHistory().filter(function (entry) { return entry.id !== button.dataset.id; });
                saveHistory(updated);
                renderHistory();
            });
        });
    }

    // ==============================
    // PHASE 5 - EXAM PROGRESS TRACKING
    // ==============================

    function renderProgressTracking(resultData) {
        const intro = document.getElementById("progressTrackerIntro");
        const overallChange = document.getElementById("progressOverallChange");
        const improvedCount = document.getElementById("progressImprovedCount");
        const bestGain = document.getElementById("progressBestGain");
        const comparison = document.getElementById("progressComparison");

        if (!overallChange || !improvedCount || !bestGain || !comparison) return;

        const matches = getStudentHistory(
            resultData?.name,
            resultData?.roll,
            resultData?.className
        ).slice().sort(function (a, b) {
            return new Date(b.savedAt || 0) - new Date(a.savedAt || 0);
        });

        // The latest saved result is the baseline. If the current result has
        // already been saved, skip that exact saved copy when comparing.
        let previous = matches[0] || null;
        if (resultData && previous &&
            Number(previous.average) === Number(resultData.average) &&
            JSON.stringify(previous.subjects || []) === JSON.stringify(resultData.subjects || [])) {
            previous = matches[1] || null;
        }

        if (!previous) {
            overallChange.textContent = "New";
            improvedCount.textContent = "0";
            bestGain.textContent = "-";
            comparison.innerHTML = `
                <div class="progress-empty">
                    <span>🌱</span>
                    <div>
                        <strong>This is your starting point</strong>
                        <p>Save this exam. Your next saved exam will show exactly how your overall score and subjects changed.</p>
                    </div>
                </div>`;
            if (intro) intro.textContent = "Save this result to start building your personal progress history.";
            return;
        }

        const change = Number(resultData.average) - Number(previous.average);
        const sign = change > 0 ? "+" : "";
        const improved = [];
        const declined = [];
        const subjectChanges = [];

        const previousSubjects = new Map((previous.subjects || []).map(function (subject) {
            return [normalizeStudentKey(subject.name), subject];
        }));

        (resultData.subjects || []).forEach(function (subject) {
            const oldSubject = previousSubjects.get(normalizeStudentKey(subject.name));
            if (!oldSubject) return;
            const delta = Number(subject.marks) - Number(oldSubject.marks);
            subjectChanges.push({ name: subject.name, current: Number(subject.marks), previous: Number(oldSubject.marks), delta: delta });
            if (delta > 0) improved.push({ name: subject.name, delta: delta });
            if (delta < 0) declined.push({ name: subject.name, delta: delta });
        });

        subjectChanges.sort(function (a, b) { return b.delta - a.delta; });
        const best = subjectChanges.length ? subjectChanges[0] : null;

        overallChange.textContent = `${sign}${change.toFixed(2)}%`;
        overallChange.className = change > 0 ? "progress-up" : (change < 0 ? "progress-down" : "progress-same");
        improvedCount.textContent = `${improved.length}`;
        bestGain.textContent = best && best.delta > 0 ? `+${best.delta.toFixed(0)}%` : "-";

        const overallLabel = change > 0 ? "Improved" : (change < 0 ? "Dropped" : "No change");
        const overallClass = change > 0 ? "up" : (change < 0 ? "down" : "same");

        comparison.innerHTML = `
            <div class="progress-overall-row ${overallClass}">
                <div>
                    <span class="progress-overall-label">${overallLabel}</span>
                    <strong>${Number(previous.average).toFixed(2)}% → ${Number(resultData.average).toFixed(2)}%</strong>
                    <small>Compared with ${escapeHtml(previous.exam || "previous exam")}</small>
                </div>
                <strong class="progress-delta">${sign}${change.toFixed(2)}%</strong>
            </div>
            <div class="subject-progress-list">
                ${subjectChanges.length ? subjectChanges.map(function (item) {
                    const deltaSign = item.delta > 0 ? "+" : "";
                    const deltaClass = item.delta > 0 ? "up" : (item.delta < 0 ? "down" : "same");
                    return `<div class="subject-progress-row">
                        <div><strong>${escapeHtml(item.name)}</strong><span>${item.previous}% → ${item.current}%</span></div>
                        <strong class="subject-delta ${deltaClass}">${deltaSign}${item.delta.toFixed(0)}%</strong>
                    </div>`;
                }).join("") : `<div class="progress-empty"><span>ℹ️</span><div><strong>No matching subjects to compare</strong><p>Use the same subject names in your next exam to see subject-wise progress.</p></div></div>`}
            </div>`;

        if (intro) {
            intro.textContent = change > 0
                ? `Great progress! Your overall average increased by ${change.toFixed(2)} percentage points.`
                : change < 0
                    ? `Your overall average changed by ${change.toFixed(2)} points. Use the subject breakdown to focus your practice.`
                    : "Your overall average stayed the same. Check the subject breakdown for smaller changes.";
        }
    }

    function saveCurrentResult() {
        if (!currentResultData) return;

        const history = getHistory();
        const item = {
            ...currentResultData,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            savedAt: new Date().toISOString()
        };

        history.unshift(item);
        saveHistory(history.slice(0, 20));
        renderHistory();
        renderProgressTracking(currentResultData);
        renderStudentDashboard(studentInfo, currentResultData);

        const saveButton = document.getElementById("saveResultButton");
        if (saveButton) {
            saveButton.textContent = "✓ Saved to History";
            saveButton.disabled = true;
        }
    }

    function loadSavedResult(item) {
        studentInfo = {
            name: item.name || "",
            className: item.className || "",
            roll: item.roll || "",
            exam: item.exam || ""
        };
        savedSubjectNames = Array.isArray(item.subjects) ? item.subjects.map(function (subject) { return subject.name; }) : [];

        const studentInfoSection = document.getElementById("studentInfoSection");
        if (studentInfoSection) studentInfoSection.classList.add("is-hidden");

        renderStudentDashboard(studentInfo, item);
        showMarks(savedSubjectNames.length);

        setTimeout(function () {
            item.subjects.forEach(function (subject, index) {
                const input = document.getElementById(`marks${index + 1}`);
                if (input) input.value = subject.marks;
            });

            const calculateButton = document.querySelector("#subjectSection button:last-child");
            if (calculateButton) calculateButton.click();
        }, 450);
    }

    const clearHistoryButton = document.getElementById("clearHistoryButton");
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener("click", function () {
            const currentStudent = studentInfo;
            if (!currentStudent.name || !currentStudent.roll || !currentStudent.className) return;
            const matches = getStudentHistory(currentStudent.name, currentStudent.roll, currentStudent.className);
            if (!matches.length) return;
            if (confirm(`Clear saved results for ${currentStudent.name} (Roll No. ${currentStudent.roll}, Class ${currentStudent.className})?`)) {
                const ids = new Set(matches.map(function (item) { return item.id; }));
                saveHistory(getHistory().filter(function (item) { return !ids.has(item.id); }));
                renderHistory();
                renderStudentHistoryPreview(currentStudent.name, currentStudent.roll, currentStudent.className);
            }
        });
    }

    renderHistory();
    renderStudentDashboard();


    // ==============================
    // SUBJECT FORM
    // ==============================

    subjectForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const subjectCount = parseInt(
            document.getElementById("subjectCount").value
        );

        if (isNaN(subjectCount) || subjectCount < 1) {
            alert("Please enter at least 1 subject.");
            return;
        }

        const studentName = document.getElementById("studentName").value.trim();
        const studentClass = document.getElementById("studentClass").value.trim();

        if (studentName === "") {
            alert("Please enter the student name.");
            document.getElementById("studentName").focus();
            return;
        }

        if (studentClass === "") {
            alert("Please enter the class.");
            document.getElementById("studentClass").focus();
            return;
        }

        const studentRoll = document.getElementById("rollNumber").value.trim();
        if (studentRoll === "") {
            alert("Please enter the roll number so we can show only this student's saved results.");
            document.getElementById("rollNumber").focus();
            return;
        }

        studentInfo = {
            name: studentName,
            className: studentClass,
            roll: document.getElementById("rollNumber").value.trim(),
            exam: document.getElementById("examName").value.trim()
        };

        // Hide student information after moving to the next step.
        // The data is already saved in studentInfo, so it will still be
        // available for the Results/Analysis sections.
        const studentInfoSection = document.getElementById("studentInfoSection");
        if (studentInfoSection) {
            studentInfoSection.classList.add("is-hidden");
        }

        renderStudentDashboard(studentInfo);
        showSubjectNames(subjectCount);
    });


    // ==============================
    // SHOW SUBJECT NAMES - STEP 02
    // ==============================

    function normalizeStudentKey(value) {
        return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    }

    function getStudentHistory(name, roll, className) {
        const normalizedName = normalizeStudentKey(name);
        const normalizedRoll = normalizeStudentKey(roll);
        const normalizedClass = normalizeStudentKey(className);

        if (!normalizedName || !normalizedRoll || !normalizedClass) return [];

        return getHistory().filter(function (item) {
            return normalizeStudentKey(item.name) === normalizedName &&
                   normalizeStudentKey(item.roll) === normalizedRoll &&
                   normalizeStudentKey(item.className) === normalizedClass;
        });
    }

    function renderStudentHistoryPreview(name, roll, className) {
        const preview = document.getElementById("studentHistoryPreview");
        if (!preview) return;

        const matches = getStudentHistory(name, roll, className);

        if (!roll) {
            preview.innerHTML = `
                <div class="student-history-empty">
                    <span class="student-history-icon">🔎</span>
                    <div>
                        <strong>Add a Roll Number to check saved history</strong>
                        <p>Your previous results are linked using Name + Roll Number.</p>
                    </div>
                </div>`;
            preview.hidden = false;
            return;
        }

        if (!matches.length) {
            preview.innerHTML = `
                <div class="student-history-empty">
                    <span class="student-history-icon">👋</span>
                    <div>
                        <span class="student-history-tag">NEW STUDENT</span>
                        <strong>No previous results found</strong>
                        <p>No saved result was found for ${escapeHtml(name)} · Roll No. ${escapeHtml(roll)}${className ? ` · Class ${escapeHtml(className)}` : ""}. Start a new exam below.</p>
                    </div>
                </div>`;
            preview.hidden = false;
            return;
        }

        const sorted = matches.slice().sort(function (a, b) {
            return new Date(b.savedAt || 0) - new Date(a.savedAt || 0);
        });

        preview.innerHTML = `
            <div class="student-history-header">
                <div>
                    <span class="student-history-tag">WELCOME BACK</span>
                    <h4>👋 ${escapeHtml(name)}</h4>
                    <p>Roll No. ${escapeHtml(roll)}${className ? ` · Class ${escapeHtml(className)}` : ""}</p>
                </div>
                <strong>${sorted.length} saved result${sorted.length === 1 ? "" : "s"}</strong>
            </div>
            <div class="student-history-items">
                ${sorted.map(function (item) {
                    const dateText = item.savedAt ? new Date(item.savedAt).toLocaleDateString() : "Saved";
                    return `
                        <div class="student-history-item">
                            <div>
                                <strong>${escapeHtml(item.exam || "Exam Result")}</strong>
                                <span>${dateText}${item.className ? ` · Class ${escapeHtml(item.className)}` : ""}</span>
                            </div>
                            <div class="student-history-score">
                                <strong>${Number(item.average || 0).toFixed(2)}%</strong>
                                <span>Grade ${escapeHtml(item.grade || "-")} · ${escapeHtml(item.result || "")}</span>
                            </div>
                        </div>`;
                }).join("")}
            </div>
            <div class="student-history-actions">
                <button type="button" id="viewStudentHistoryButton">📚 View Full History</button>
                <span>Ready for a new exam? Enter the subjects below.</span>
            </div>`;

        const viewButton = document.getElementById("viewStudentHistoryButton");
        if (viewButton) {
            viewButton.addEventListener("click", function () {
                const historySection = document.getElementById("history");
                if (historySection) historySection.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }

        preview.hidden = false;
    }

    function showSubjectNames(subjectCount) {

        const formStep = document.querySelector(".form-step");

        // Exit animation
        card.classList.remove("card-enter");
        card.classList.add("card-exit");

        setTimeout(function () {

            // Change Step 01 → Step 02
            formStep.innerHTML = `
                <div class="step-number">02</div>

                <div class="step-content">

                    <h3>Enter Subject Names</h3>

                    <p>
                        Enter the name of each subject you want to analyse.
                    </p>

                </div>
            `;


            // Show this student's previous saved results before starting the new exam.
            subjectSection.innerHTML = `
                <div id="studentHistoryPreview" class="student-history-preview" hidden></div>
            `;
            renderStudentHistoryPreview(studentInfo.name, studentInfo.roll, studentInfo.className);

            // Continue with the new exam inputs.


            // ==============================
            // SUBJECT NAME INPUTS
            // ==============================

            for (let i = 1; i <= subjectCount; i++) {

                const div = document.createElement("div");
                div.className = "subject-input";

                const label = document.createElement("label");
                label.textContent = `Subject ${i}`;

                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Enter subject name";
                input.className = "subject-name";
                input.required = true;

                div.appendChild(label);
                div.appendChild(input);

                subjectSection.appendChild(div);
            }


            // ==============================
            // CONTINUE BUTTON
            // ==============================

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = "Continue  →";
            button.id = "subjectNameContinue";

            subjectSection.appendChild(button);


            // Enter animation
            card.classList.remove("card-exit");
            card.classList.add("card-enter");

            setTimeout(function () {
                card.classList.remove("card-enter");
            }, 450);


            // ==============================
            // CONTINUE TO MARKS
            // ==============================

            button.addEventListener("click", function () {

                savedSubjectNames = [];

                const inputs =
                    document.querySelectorAll(".subject-name");


                inputs.forEach(function (input) {

                    savedSubjectNames.push(
                        input.value.trim()
                    );

                });


                // Check subject names
                if (
                    savedSubjectNames.some(
                        function (name) {
                            return name === "";
                        }
                    )
                ) {
                    alert("Please enter all subject names.");
                    return;
                }


                showMarks(subjectCount);

            });

        }, 350);
    }


    // ==============================
    // SHOW MARKS - STEP 03
    // ==============================

    function showMarks(subjectCount) {

        const formStep = document.querySelector(".form-step");

        // Exit animation
        card.classList.remove("card-enter");
        card.classList.add("card-exit");


        setTimeout(function () {

            // Change Step 02 → Step 03
            formStep.innerHTML = `
                <div class="step-number">03</div>

                <div class="step-content">

                    <h3>Enter Marks</h3>

                    <p>
                        Enter the marks obtained in each subject.
                    </p>

                </div>
            `;


            // Clear subject names
            subjectSection.innerHTML = "";


            // ==============================
            // MARKS INPUTS
            // ==============================

            for (let i = 0; i < subjectCount; i++) {

                const div = document.createElement("div");

                div.className = "subject-input";

                div.innerHTML = `
                    <label for="marks${i + 1}">
                        ${savedSubjectNames[i]}
                    </label>

                    <input
                        type="number"
                        id="marks${i + 1}"
                        min="0"
                        max="100"
                        placeholder="Enter marks (0-100)"
                        required
                    >
                `;

                subjectSection.appendChild(div);
            }


            // ==============================
            // BACK BUTTON
            // ==============================

            const backButton =
                document.createElement("button");

            backButton.type = "button";
            backButton.textContent = "Back";

            subjectSection.appendChild(backButton);


            // ==============================
            // CALCULATE BUTTON
            // ==============================

            const calculateButton =
                document.createElement("button");

            calculateButton.type = "button";
            calculateButton.textContent =
                "Calculate Result  →";

            subjectSection.appendChild(calculateButton);


            // Enter animation
            card.classList.remove("card-exit");
            card.classList.add("card-enter");

            setTimeout(function () {
                card.classList.remove("card-enter");
            }, 450);


            // ==============================
            // BACK CLICK
            // ==============================

            backButton.addEventListener(
                "click",
                function () {

                    showSubjectNames(subjectCount);

                }
            );


            // ==============================
            // CALCULATE RESULT
            // ==============================

            calculateButton.addEventListener(
                "click",
                function () {

                    let total = 0;


                    // ==============================
                    // CHECK MARKS
                    // ==============================

                    for (
                        let i = 1;
                        i <= subjectCount;
                        i++
                    ) {

                        const marksInput =
                            document.getElementById(
                                `marks${i}`
                            );


                        if (marksInput.value === "") {

                            alert(
                                "Please enter marks for all subjects."
                            );

                            return;
                        }


                        const marks =
                            parseFloat(
                                marksInput.value
                            );


                        if (
                            isNaN(marks) ||
                            marks < 0 ||
                            marks > 100
                        ) {

                            alert(
                                "Marks must be between 0 and 100."
                            );

                            return;
                        }


                        total += marks;

                    }


                    // ==============================
                    // AVERAGE
                    // ==============================

                    const average =
                        total / subjectCount;


                    // ==============================
                    // GRADE
                    // ==============================

                    let grade;

                    if (average >= 90) {
                        grade = "A+";
                    }
                    else if (average >= 80) {
                        grade = "A";
                    }
                    else if (average >= 70) {
                        grade = "B+";
                    }
                    else if (average >= 60) {
                        grade = "B";
                    }
                    else if (average >= 50) {
                        grade = "D";
                    }
                    else {
                        grade = "F";
                    }


                    // ==============================
                    // PASS / FAIL
                    // ==============================

                    const result =
                        average >= 40
                            ? "PASS"
                            : "FAIL";


                    // ==============================
                    // SHOW RESULT
                    // ==============================

                    const resultCard =
                        document.getElementById(
                            "resultCard"
                        );

                    const studentMeta = [
                        studentInfo.className ? `Class ${studentInfo.className}` : "",
                        studentInfo.roll ? `Roll No. ${studentInfo.roll}` : "",
                        studentInfo.exam ? studentInfo.exam : ""
                    ].filter(Boolean).join(" • ");

                    resultCard.innerHTML = `
                        <div class="result-card">

                            <div class="result-student-heading">
                                <div>
                                    <span class="result-label">STUDENT RESULT</span>
                                    <h3>${studentInfo.name}</h3>
                                    ${studentMeta ? `<p>${studentMeta}</p>` : ""}
                                </div>
                            </div>

                            <h3>Result Summary</h3>

                            <p>
                                <strong>Total Marks:</strong>
                                ${total}
                            </p>

                            <p>
                                <strong>Average:</strong>
                                ${average.toFixed(2)}
                            </p>

                            <p>
                                <strong>Grade:</strong>
                                ${grade}
                            </p>

                            <p>
                                <strong>Result:</strong>
                                ${result}
                            </p>

                            <div class="result-actions">
                                <button type="button" id="saveResultButton" class="save-result-button">
                                    💾 Save Result
                                </button>
                                <button type="button" id="printReportButton" class="print-report-button">
                                    📄 Print / Save PDF
                                </button>
                            </div>

                            <div class="print-report" id="printReport">
                                <div class="print-report-header">
                                    <div>
                                        <span class="print-report-kicker">STUDENT MARKS ANALYSER</span>
                                        <h1>Official Report Card</h1>
                                    </div>
                                    <div class="print-report-date">${new Date().toLocaleDateString()}</div>
                                </div>

                                <div class="print-student-box">
                                    <div><span>Student Name</span><strong>${escapeHtml(studentInfo.name)}</strong></div>
                                    <div><span>Roll Number</span><strong>${escapeHtml(studentInfo.roll || "-")}</strong></div>
                                    <div><span>Class</span><strong>${escapeHtml(studentInfo.className || "-")}</strong></div>
                                    <div><span>Exam</span><strong>${escapeHtml(studentInfo.exam || "Exam Result")}</strong></div>
                                </div>

                                <table class="print-marks-table">
                                    <thead><tr><th>Subject</th><th>Marks</th><th>Performance</th></tr></thead>
                                    <tbody>
                                        ${savedSubjectNames.map(function (subject, index) {
                                            const marks = parseFloat(document.getElementById(`marks${index + 1}`).value) || 0;
                                            const performance = marks >= 90 ? "Excellent" : marks >= 75 ? "Very Good" : marks >= 60 ? "Good" : marks >= 40 ? "Needs Improvement" : "Poor";
                                            return `<tr><td>${escapeHtml(subject)}</td><td>${marks}%</td><td>${performance}</td></tr>`;
                                        }).join("")}
                                    </tbody>
                                </table>

                                <div class="print-summary-grid">
                                    <div><span>Total Marks</span><strong>${total}</strong></div>
                                    <div><span>Average</span><strong>${average.toFixed(2)}%</strong></div>
                                    <div><span>Grade</span><strong>${grade}</strong></div>
                                    <div><span>Result</span><strong>${result}</strong></div>
                                </div>

                                <div class="print-report-footer">
                                    <span>Generated from Student Marks Analyser</span>
                                    <span>Student performance report</span>
                                </div>
                            </div>

                        </div>
                    `;

                    currentResultData = {
                        name: studentInfo.name,
                        className: studentInfo.className,
                        roll: studentInfo.roll,
                        exam: studentInfo.exam,
                        total: total,
                        average: average,
                        grade: grade,
                        result: result,
                        subjects: savedSubjectNames.map(function (subject, index) {
                            return {
                                name: subject,
                                marks: parseFloat(document.getElementById(`marks${index + 1}`).value)
                            };
                        })
                    };

                    renderProgressTracking(currentResultData);
                    renderStudentDashboard(studentInfo, currentResultData);

                    const saveResultButton = document.getElementById("saveResultButton");
                    if (saveResultButton) {
                        saveResultButton.addEventListener("click", saveCurrentResult);
                    }

                    const printReportButton = document.getElementById("printReportButton");
                    if (printReportButton) {
                        printReportButton.addEventListener("click", printReportCard);
                    }


                    // ==============================
                    // ANALYSIS VARIABLES
                    // ==============================

                    let highestMarks = -1;
                    let lowestMarks = 101;

                    let highestSubject = "";
                    let lowestSubject = "";

                    let analysisTable = "";


                    // ==============================
                    // PERFORMANCE COUNTERS
                    // ==============================

                    let excellent = 0;
                    let veryGood = 0;
                    let good = 0;
                    let improvement = 0;
                    let poor = 0;


                    // ==============================
                    // ANALYSE EACH SUBJECT
                    // ==============================

                    for (
                        let i = 0;
                        i < subjectCount;
                        i++
                    ) {

                        const marks =
                            parseFloat(
                                document.getElementById(
                                    `marks${i + 1}`
                                ).value
                            );


                        const subject =
                            savedSubjectNames[i];


                        // Highest
                        if (marks > highestMarks) {

                            highestMarks = marks;
                            highestSubject = subject;

                        }


                        // Lowest
                        if (marks < lowestMarks) {

                            lowestMarks = marks;
                            lowestSubject = subject;

                        }


                        // ==============================
                        // PERFORMANCE
                        // ==============================

                        let performance;


                        if (marks >= 90) {

                            performance = "Excellent";
                            excellent++;

                        }
                        else if (marks >= 75) {

                            performance = "Very Good";
                            veryGood++;

                        }
                        else if (marks >= 60) {

                            performance = "Good";
                            good++;

                        }
                        else if (marks >= 40) {

                            performance = "Needs Improvement";
                            improvement++;

                        }
                        else {

                            performance = "Poor";
                            poor++;

                        }


                        // ==============================
                        // TABLE ROW
                        // ==============================

                        analysisTable += `
                            <tr>

                                <td>
                                    ${subject}
                                </td>

                                <td>
                                    ${marks}
                                </td>

                                <td>
                                    <div class="score-cell">
                                        <span class="score-track"><span style="width: ${marks}%"></span></span>
                                        <strong>${marks}%</strong>
                                    </div>
                                </td>

                                <td>
                                    ${performance}
                                </td>

                            </tr>
                        `;

                    }


                    // ==============================
                    // SHOW ANALYSIS TABLE
                    // ==============================

                    const analysisTableBody =
                        document.getElementById(
                            "analysisTableBody"
                        );

                    analysisTableBody.innerHTML =
                        analysisTable;


                    // ==============================
                    // HIGHEST / LOWEST / AVERAGE
                    // ==============================

                    document.getElementById(
                        "highestScore"
                    ).textContent =
                        `${highestSubject} - ${highestMarks}`;


                    document.getElementById(
                        "lowestScore"
                    ).textContent =
                        `${lowestSubject} - ${lowestMarks}`;


                    document.getElementById(
                        "averageScore"
                    ).textContent =
                        average.toFixed(2);


                    // ==============================
                    // PIE CHART
                    // ==============================

                    const totalSubjects =
                        subjectCount;


                    const excellentDegree =
                        (excellent / totalSubjects) * 360;

                    const veryGoodDegree =
                        (veryGood / totalSubjects) * 360;

                    const goodDegree =
                        (good / totalSubjects) * 360;

                    const improvementDegree =
                        (improvement / totalSubjects) * 360;

                    const poorDegree =
                        (poor / totalSubjects) * 360;


                    const excellentEnd =
                        excellentDegree;

                    const veryGoodEnd =
                        excellentEnd +
                        veryGoodDegree;

                    const goodEnd =
                        veryGoodEnd +
                        goodDegree;

                    const improvementEnd =
                        goodEnd +
                        improvementDegree;


                    const performancePie =
                        document.getElementById(
                            "performancePie"
                        );


                    performancePie.style.background =
                        `conic-gradient(
                            #4CAF50 0deg ${excellentEnd}deg,
                            #2196F3 ${excellentEnd}deg ${veryGoodEnd}deg,
                            #FFA726 ${veryGoodEnd}deg ${goodEnd}deg,
                            #EF5350 ${goodEnd}deg ${improvementEnd}deg,
                            #C62828 ${improvementEnd}deg 360deg
                        )`;


                    // ==============================
                    // AVERAGE CIRCLE
                    // ==============================

                    const averageDegree =
                        (average / 100) * 360;


                    document.getElementById(
                        "averageCircle"
                    ).style.background = `
                        radial-gradient(
                            circle,
                            #F7F4EA 58%,
                            transparent 59%
                        ),
                        conic-gradient(
                            #5E35B1 0deg ${averageDegree}deg,
                            #DED9E2 ${averageDegree}deg 360deg
                        )
                    `;


                    document.getElementById(
                        "circleAverage"
                    ).textContent =
                        `${average.toFixed(2)}%`;


                    // ==============================
                    // PERFORMANCE MESSAGE
                    // ==============================

                    let performanceTitle;
                    let performanceMessage;


                    if (average >= 90) {

                        performanceTitle =
                            "Excellent Performance!";

                        performanceMessage =
                            "Outstanding work! Your overall performance is excellent.";

                    }
                    else if (average >= 75) {

                        performanceTitle =
                            "Very Good Performance!";

                        performanceMessage =
                            "You have performed very well. Keep up the good work and continue improving.";

                    }
                    else if (average >= 60) {

                        performanceTitle =
                            "Good Performance!";

                        performanceMessage =
                            "Your performance is good. Keep practicing to achieve even better results.";

                    }
                    else if (average >= 40) {

                        performanceTitle =
                            "Needs Improvement";

                        performanceMessage =
                            "You passed, but there is room for improvement. Focus on your weaker subjects.";

                    }
                    else {

                        performanceTitle =
                            "More Practice Needed";

                        performanceMessage =
                            "Keep practicing and focus on improving your understanding of each subject.";

                    }


                    document.getElementById(
                        "performanceTitle"
                    ).textContent =
                        performanceTitle;


                    document.getElementById(
                        "performanceMessage"
                    ).textContent =
                        performanceMessage;


                    // ==============================
                    // INSIGHTS
                    // ==============================

                    document.getElementById(
                        "insight1"
                    ).textContent =
                        `🏆 Highest score: ${highestSubject} - ${highestMarks}`;


                    document.getElementById(
                        "insight2"
                    ).textContent =
                        `📉 Lowest score: ${lowestSubject} - ${lowestMarks}`;


                    document.getElementById(
                        "insight3"
                    ).textContent =
                        `📈 Overall average: ${average.toFixed(2)}%. Keep improving.`;


                    // ==============================
                    // PHASE 2: SMART PERFORMANCE DASHBOARD
                    // ==============================
                    const strongSubjects = [];
                    const weakSubjects = [];
                    for (let i = 0; i < subjectCount; i++) {
                        const m = parseFloat(document.getElementById(`marks${i + 1}`).value);
                        const n = savedSubjectNames[i];
                        if (m >= 75) strongSubjects.push({ name: n, marks: m });
                        if (m < 60) weakSubjects.push({ name: n, marks: m });
                    }
                    weakSubjects.sort((a, b) => a.marks - b.marks);

                    const smartBest = document.getElementById("smartBestSubject");
                    const smartFocus = document.getElementById("smartFocusSubject");
                    const smartStrong = document.getElementById("smartStrongCount");
                    const smartAvg = document.getElementById("smartAverage");
                    if (smartBest) smartBest.textContent = `${highestSubject} (${highestMarks})`;
                    if (smartFocus) smartFocus.textContent = `${lowestSubject} (${lowestMarks})`;
                    if (smartStrong) smartStrong.textContent = `${strongSubjects.length} / ${subjectCount}`;
                    if (smartAvg) smartAvg.textContent = `${average.toFixed(2)}%`;

                    const subjectBars = document.getElementById("subjectBars");
                    if (subjectBars) {
                        subjectBars.innerHTML = savedSubjectNames.map(function (name, i) {
                            const m = parseFloat(document.getElementById(`marks${i + 1}`).value);
                            let cls = "bar-good";
                            if (m >= 75) cls = "bar-strong";
                            else if (m < 40) cls = "bar-weak";
                            else if (m < 60) cls = "bar-focus";
                            let label = "Good";
                            if (m >= 90) label = "Excellent";
                            else if (m >= 75) label = "Strong";
                            else if (m >= 60) label = "Good";
                            else if (m >= 40) label = "Needs Focus";
                            else label = "Weak";
                            const medal = i === savedSubjectNames.findIndex(function (subjectName, subjectIndex) {
                                return parseFloat(document.getElementById(`marks${subjectIndex + 1}`).value) === highestMarks;
                            }) ? "🏆" : "";
                            const focus = i === savedSubjectNames.findIndex(function (subjectName, subjectIndex) {
                                return parseFloat(document.getElementById(`marks${subjectIndex + 1}`).value) === lowestMarks;
                            }) ? "🎯" : "";
                            return `<div class="bar-item ${m === highestMarks ? "is-highest" : ""} ${m === lowestMarks ? "is-lowest" : ""}">
                                <div class="bar-topline">
                                    <div class="bar-subject"><strong>${name}</strong><span class="bar-marker">${medal}${focus}</span></div>
                                    <div class="bar-score"><strong>${m}%</strong><span class="bar-status ${cls}">${label}</span></div>
                                </div>
                                <div class="bar-track"><span class="bar-fill ${cls}" style="width:${m}%"></span></div>
                            </div>`;
                        }).join("");
                    }

                    const tipsList = document.getElementById("tipsList");
                    const actionPlanIntro = document.getElementById("actionPlanIntro");
                    const tips = [];
                    if (weakSubjects.length) {
                        const focusNames = weakSubjects.slice(0, 3).map(s => s.name).join(", ");
                        tips.push({icon:"🎯", title:`Focus on ${focusNames}`, text:"Start with your lowest-scoring subjects and practice the topics where you make the most mistakes."});
                        if (actionPlanIntro) actionPlanIntro.textContent = `Your biggest opportunity is ${weakSubjects[0].name}. Start there, then maintain your stronger subjects.`;
                    } else {
                        tips.push({icon:"🌟", title:"No major weak area", text:"Every subject is at 60 or above. Keep a consistent study routine and aim for the next grade."});
                        if (actionPlanIntro) actionPlanIntro.textContent = "Your results are balanced. Keep your current routine and work toward the next milestone.";
                    }
                    if (strongSubjects.length) {
                        tips.push({icon:"💪", title:`Build on ${strongSubjects[0].name}`, text:`You scored ${strongSubjects[0].marks}/100 here. Keep practicing to maintain this strength.`});
                    } else {
                        tips.push({icon:"📚", title:"Build your basics", text:"Start with concepts and short practice sessions before moving to harder questions."});
                    }
                    if (average >= 75) tips.push({icon:"🚀", title:"Aim for the next level", text:`Your ${average.toFixed(2)}% average is strong. Challenge yourself with harder questions and timed practice.`});
                    else if (average >= 40) tips.push({icon:"📈", title:"Improve step by step", text:`Your current average is ${average.toFixed(2)}%. Set a small target for your next test and track the change.`});
                    else tips.push({icon:"🔄", title:"Create a regular practice routine", text:"Review the basics, practice a few questions every day, and check mistakes after each session."});
                    if (tipsList) tipsList.innerHTML = tips.map(t => `<div class="tip-item"><span>${t.icon}</span><div><strong>${t.title}</strong><p>${t.text}</p></div></div>`).join("");

                    // ==============================
                    // GO TO RESULTS
                    // ==============================

                    document.getElementById(
                        "results"
                    ).scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        }, 350);
    }


    // ==============================
    // NAVBAR ACTIVE SECTION
    // ==============================

    const sections =
        document.querySelectorAll("section");

    const navLinks =
        document.querySelectorAll("nav a");


    window.addEventListener(
        "scroll",
        function () {

            let current = "";


            sections.forEach(
                function (section) {

                    const sectionTop =
                        section.offsetTop - 100;

                    const sectionHeight =
                        section.offsetHeight;


                    if (
                        window.scrollY >= sectionTop &&
                        window.scrollY <
                        sectionTop + sectionHeight
                    ) {

                        current =
                            section.getAttribute("id");

                    }

                }
            );


            navLinks.forEach(
                function (link) {

                    link.classList.remove("active");


                    if (
                        link.getAttribute("href") ===
                        "#" + current
                    ) {

                        link.classList.add("active");

                    }

                }
            );

        }
    );

});