document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.getElementById("plused");

    let currentData = {};
    let sortDirection = true; // true: descending, false: ascending
    let currentSortKey = "overall_avg";
    let simpleMode = false;

    const categories = {
        "Development": ["android_studio", "pycharm", "vscode", "vmware", "unreal_engine"],
        "Creative": ["photoshop", "blender", "premiere", "davinci", "illustrator", "fruitloops"],
        "CAD": ["autocad", "solidworks", "inventor", "quartus", "vivado"],
        "Scientific": ["matlab", "origin", "eviews", "stata"],
        "Office": ["powerpoint", "excel", "word"],
        "Operating Systems": ["linux_common", "macos_common", "windows_common"]
    };

    const fullDisplayNames = {
        "android_studio": "Android Studio",
        "pycharm": "PyCharm",
        "vscode": "VSCode",
        "photoshop": "Photoshop",
        "blender": "Blender",
        "premiere": "Premiere",
        "davinci": "DaVinci Resolve",
        "illustrator": "Illustrator",
        "fruitloops": "FruitLoops Studio",
        "autocad": "AutoCAD",
        "solidworks": "SolidWorks",
        "inventor": "Inventor",
        "quartus": "Quartus",
        "vivado": "Vivado",
        "eviews": "EViews",
        "stata": "Stata",
        "matlab": "MATLAB",
        "powerpoint": "PowerPoint",
        "excel": "Excel",
        "word": "Word",
        "linux_common": "Linux",
        "macos_common": "macOS",
        "windows_common": "Windows",
        "vmware": "VMware",
        "origin": "Origin",
        "unreal_engine": "Unreal Engine"
    };

    const displayNames = {
        "android_studio": "AS",
        "pycharm": "PyC",
        "vscode": "VSC",
        "photoshop": "PS",
        "blender": "Bl",
        "premiere": "PR",
        "davinci": "DR",
        "illustrator": "AI",
        "fruitloops": "FL",
        "autocad": "CAD",
        "solidworks": "SW",
        "inventor": "Inv",
        "quartus": "Qrs",
        "vivado": "Vvd",
        "eviews": "Evw",
        "stata": "Stt",
        "matlab": "MAT",
        "powerpoint": "PPT",
        "excel": "Exc",
        "word": "Wrd",
        "linux_common": "Lnx",
        "macos_common": "mac",
        "windows_common": "Win",
        "vmware": "VM",
        "origin": "Org",
        "unreal_engine": "UE"
    };
    

    fetch("results/screenspot_pro.json")
        .then(response => response.json())
        .then(data => {
            currentData = data;
            sortAndRender(currentSortKey, sortDirection);
        })
        .catch(error => {
            console.error("Failed to fetch data:", error);
            tableElement.innerHTML = `<div class='text-danger'>Error loading data.</div>`;
        });

    function sortAndRender(key, direction) {
        currentSortKey = key;
        sortDirection = direction;

        const sortedModels = Object.entries(currentData).sort((a, b) => {
            const aValue = getSoftwareAvg(a[1], key);
            const bValue = getSoftwareAvg(b[1], key);
            return direction ? bValue - aValue : aValue - bValue;
        });

        renderTable(sortedModels);
    }

    function renderTable(data) {
        if (simpleMode) {
            renderTableSimple(data);  // Render in simple mode
        } else {
            renderTableDetailed(data); // Render in detailed mode
        }
    }

    function renderTableSimple(data) {
        let tableHeader = "";
        let tableBody = "";

        // Create table header for simple mode (with category headers and overall average)
        tableHeader = `
            <thead>
                <tr>
                    <th class="table-header-group sortable" data-key="model_name">Model</th>
                    ${Object.keys(categories).map(category => 
                        `<th class="table-header-group sortable" data-key="${category}">${category}</th>`).join("")}
                    <th class="table-header-group sortable" data-key="overall_avg">Overall Avg</th>
                </tr>
            </thead>
        `;

        // Create table rows for simple mode
        tableBody = data.map(([modelName, modelData]) => {
            const overallAvg = (modelData.results.overall.avg * 100).toFixed(1);

            // If modelData has a non-empty link, make modelName a <a> tag
            if (modelData.link) {
                modelName = `<a href="${modelData.link}" target="_blank" class="model-link">${modelName}</a>`;
            }
            
            // Hardcoded category names and their corresponding keys in the data
            const categoryKeys = {
                Development: "Dev",
                Creative: "Creative",
                CAD: "CAD",
                Scientific: "Scientific",
                Office: "Office",
                "Operating Systems": "OS"
            };

            // Calculate average for each category (group)
            const categoryAverages = Object.keys(categoryKeys).map(categoryName => {
                const key = categoryKeys[categoryName]; // Get the key from the mapping
                const groupData = modelData.results.group[key];
                const groupAvg = (groupData.avg * 100).toFixed(1); // Convert to percentage and format to 1 decimal place.
                return groupAvg; // Return the formatted group average.
            });
            // Calculate average for each category (group)
            // const categoryAverages = Object.keys(categories).map(category => {
            //     const groupData = categories[category];
            //     const categoryAvg = groupData.map(software => {
            //         const appData = modelData.results.application[software];
            //         return appData ? appData.avg : 0;  // Use 0 if no data
            //     });
            //     // Average the group values
            //     const groupAvg = categoryAvg.length ? (categoryAvg.reduce((sum, value) => sum + value, 0) / categoryAvg.length) : 0;
            //     return (groupAvg * 100).toFixed(1);  // Convert to percentage
            // });

            return [
                modelName,          // Model Name
                categoryAverages,   // Category averages
                overallAvg          // Overall Average
            ];
        });

        // Sort the rows based on the current sort key
        const sortedRows = sortRows(tableBody);

        // Create the table body using the sorted rows
        tableBody = sortedRows.map(row => {
            return `
                <tr>
                    <td class="table-value model-name">${row[0]}</td>
                    ${row[1].map(avg => `<td class="table-value normal-value">${avg}</td>`).join('')}
                    <td class="table-value overall-avg-value">${row[2]}</td>
                </tr>
            `;
        }).join("");

        tableElement.innerHTML = `<table class="table">${tableHeader}<tbody>${tableBody}</tbody></table>`;

        addSortingEventListeners();  // Add sorting event listeners
    }

    function sortRows(rows) {
        return rows.sort((a, b) => {
            let aValue, bValue;

            if (currentSortKey === "model_name") {
                aValue = a[0];
                bValue = b[0];
            } else if (currentSortKey === "overall_avg") {
                aValue = a[2]; // Overall average column
                bValue = b[2];
            } else {
                // Sort by category averages (group)
                const categoryIndex = Object.keys(categories).indexOf(currentSortKey);
                aValue = a[1][categoryIndex];
                bValue = b[1][categoryIndex];
            }

            // Convert to float for proper comparison (remove % and parse)
            aValue = parseFloat(aValue.replace('%', ''));
            bValue = parseFloat(bValue.replace('%', ''));

            // Sort in the correct direction
            return sortDirection ? bValue - aValue : aValue - bValue;
        });
    }

    function renderTableDetailed(data) {
        let tableHeader = "";
        let tableBody = "";

        // Create table header for detailed mode (software names under each category)
        tableHeader = `
            <thead>
                <tr>
                    <th class="table-header-group sortable" data-key="model_name">Model</th>
                    ${Object.keys(categories).map(category => 
                        `<th class="table-header-group" colspan="${categories[category].length}">${category}</th>`).join("")}
                    <th class="table-header-group sortable" data-key="overall_avg">Avg</th>
                </tr>
                <tr>
                    <th></th>
                    ${Object.values(categories).flat().map(software => 
                        `<th class="table-header-application sortable" title="${fullDisplayNames[software]}" data-key="${software}">${displayNames[software]}</th>`).join("")}
                    <th></th>
                </tr>
            </thead>
        `;

        // Create table rows for detailed mode
        tableBody = data.map(([modelName, modelData]) => {
            const overallAvg = (modelData.results.overall.avg * 100).toFixed(1) + "%";

            // If modelData has a non-empty link, make modelName a <a> tag
            if (modelData.link) {
                modelName = `<a href="${modelData.link}" target="_blank" class="model-link">${modelName}</a>`;
            }
            
            const softwareValues = Object.values(categories).flat().map(software => {
                const appData = modelData.results.application[software];
                const displayValue = appData ? (appData.avg * 100).toFixed(1) : "-";
                return `<td class='table-compact table-value normal-value'>${displayValue}</td>`;
            }).join("");
    
            return `
                <tr>
                    <td class="table-compact table-value model-name">${modelName}</td>
                    ${softwareValues}
                    <td class="table-compact table-value overall-avg-value">${overallAvg}</td>
                </tr>
            `;
        }).join("");

        tableElement.innerHTML = `<table class="table">${tableHeader}<tbody>${tableBody}</tbody></table>`;

        addSortingEventListeners();  // Add sorting event listeners
    }

    // Function to add sorting event listeners (common for both modes)
    function addSortingEventListeners() {
        document.querySelectorAll("th.sortable").forEach(header => {
            const key = header.getAttribute("data-key");
            
            // Apply sorting direction classes
            if (key === currentSortKey) {
                header.classList.remove("sorted-asc", "sorted-desc");
                header.classList.add(sortDirection ? "sorted-desc" : "sorted-asc");
            } else {
                header.classList.remove("sorted-asc", "sorted-desc");
            }

            header.addEventListener("click", () => {
                const newDirection = key === currentSortKey ? !sortDirection : true;
                sortAndRender(key, newDirection);
            });
        });
    }

    function getSoftwareAvg(model, softwareKey) {
        if (softwareKey === "overall_avg") return model.results.overall.avg || 0;
        return model.results.application[softwareKey]?.avg || 0;
    }

    // UI Events
    document.getElementById("btn_simple").addEventListener("click", () => {
        simpleMode = true;
        currentSortKey = "overall_avg";
        sortAndRender(currentSortKey, sortDirection);
    });

    document.getElementById("btn_detailed").addEventListener("click", () => {
        simpleMode = false;
        currentSortKey = "overall_avg";
        sortAndRender(currentSortKey, sortDirection);
    });
});
