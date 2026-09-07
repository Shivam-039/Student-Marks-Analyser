document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // VARIABLES
    // ==============================

    const card = document.querySelector(".student-card");
    const subjectSection = document.getElementById("subjectSection");
    const subjectForm = document.getElementById("subjectForm");

    let savedSubjectNames = [];


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

        showSubjectNames(subjectCount);
    });


    // ==============================
    // SHOW SUBJECT NAMES - STEP 02
    // ==============================

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


            // Clear old content
            subjectSection.innerHTML = "";


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

                    resultCard.innerHTML = `
                        <div class="result-card">

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

                        </div>
                    `;


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