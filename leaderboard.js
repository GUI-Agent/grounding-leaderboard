document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.getElementById("plused");

    let currentData = {};
    let sortDirection = true; 
    let currentSortKey = "overall_avg";
    let simpleMode = false;

    // ... [Keep your existing categories, fullDisplayNames, and displayNames objects here] ...
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

    // --- UPDATED HELPER FUNCTION ---
    function formatModelName(name, link, description) {
        // 1. Create the Name Link
        let nameHtml = name;
        if (link) {
            nameHtml = `<a href="${link}" target="_blank" class="model-link">${name}</a>`;
        } else {
            nameHtml = `<span class="fw-bold">${name}</span>`;
        }
        
        // 2. Create the Clickable Info Icon (if description exists)
        let iconHtml = "";
        if (description) {
            // tabindex="0" is crucial: it makes the SVG focusable so the 'focus' trigger works
            // role="button" improves accessibility
            iconHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                 class="info-icon" viewBox="0 0 16 16"
                 tabindex="0" 
                 role="button"
                 data-bs-toggle="popover" 
                 data-bs-trigger="focus" 
                 data-bs-placement="right" 
                 data-bs-title="Model Description" 
                 data-bs-content="${description}">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>`;
        }

        return `<div class="d-flex align-items-center">${nameHtml}${iconHtml}</div>`;
    }

    function renderTable(data) {
        // Cleanup old popovers
        const existingPopovers = document.querySelectorAll('.popover');
        existingPopovers.forEach(p => p.remove());

        if (simpleMode) {
            renderTableSimple(data);
        } else {
            renderTableDetailed(data);
        }

        // --- UPDATED INITIALIZATION ---
        // 1. Initialize Popovers with 'focus' trigger (Click to open, click away to close)
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl, {
                html: true,
                trigger: 'focus' 
            });
        });
        
        // 2. Initialize Tooltips for headers
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            if(!tooltipTriggerEl.getAttribute('data-bs-toggle') || tooltipTriggerEl.getAttribute('data-bs-toggle') === 'tooltip') {
                 return new bootstrap.Tooltip(tooltipTriggerEl);
            }
        });
    }

    function renderTableSimple(data) {
        let tableHeader = `
            <thead>
                <tr>
                    <th class="table-header-group text-center">#</th>
                    <th class="table-header-group sortable" data-key="model_name">Model</th>
                    ${Object.keys(categories).map(category => 
                        `<th class="table-header-group sortable" data-key="${category}">${category}</th>`).join("")}
                    <th class="table-header-group sortable" data-key="overall_avg">Overall Avg</th>
                </tr>
            </thead>
        `;

        const processedRows = data.map(([modelName, modelData]) => {
            const overallAvg = (modelData.results.overall.avg * 100).toFixed(1);
            const categoryKeys = {
                Development: "Dev", Creative: "Creative", CAD: "CAD",
                Scientific: "Scientific", Office: "Office", "Operating Systems": "OS"
            };

            const categoryAverages = Object.keys(categoryKeys).map(categoryName => {
                const key = categoryKeys[categoryName]; 
                const groupData = modelData.results.group[key];
                return (groupData.avg * 100).toFixed(1); 
            });

            return {
                rawName: modelName,
                link: modelData.link,
                description: modelData.description,
                categoryAverages: categoryAverages,
                overallAvg: overallAvg
            };
        });

        const sortedRows = sortRows(processedRows);

        let tableBody = sortedRows.map((row, index) => {
            const modelCell = formatModelName(row.rawName, row.link, row.description);

            return `
                <tr>
                    <td class="table-value text-center text-muted">${index + 1}</td>
                    <td class="table-value model-name text-start">${modelCell}</td>
                    ${row.categoryAverages.map(avg => `<td class="table-value normal-value">${avg}</td>`).join('')}
                    <td class="table-value overall-avg-value">${row.overallAvg}</td>
                </tr>
            `;
        }).join("");

        tableElement.innerHTML = `<table class="table">${tableHeader}<tbody>${tableBody}</tbody></table>`;
        addSortingEventListeners(); 
    }

    function renderTableDetailed(data) {
        let tableHeader = `
            <thead>
                <tr>
                    <th class="table-header-group text-center">#</th>
                    <th class="table-header-group sortable" data-key="model_name">Model</th>
                    ${Object.keys(categories).map(category => 
                        `<th class="table-header-group" colspan="${categories[category].length}">${category}</th>`).join("")}
                    <th class="table-header-group sortable" data-key="overall_avg">Avg</th>
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    ${Object.values(categories).flat().map(software => 
                        `<th class="table-header-application sortable" title="${fullDisplayNames[software]}" data-key="${software}">${displayNames[software]}</th>`).join("")}
                    <th></th>
                </tr>
            </thead>
        `;

        let tableBody = data.map(([modelName, modelData], index) => {
            const overallAvg = (modelData.results.overall.avg * 100).toFixed(1) + "%";
            const modelCell = formatModelName(modelName, modelData.link, modelData.description);
            
            const softwareValues = Object.values(categories).flat().map(software => {
                const appData = modelData.results.application[software];
                const displayValue = appData ? (appData.avg * 100).toFixed(1) : "-";
                return `<td class='table-compact table-value normal-value'>${displayValue}</td>`;
            }).join("");
    
            return `
                <tr>
                    <td class="table-compact table-value text-center text-muted">${index + 1}</td>
                    <td class="table-compact table-value model-name text-start">${modelCell}</td>
                    ${softwareValues}
                    <td class="table-compact table-value overall-avg-value">${overallAvg}</td>
                </tr>
            `;
        }).join("");

        tableElement.innerHTML = `<table class="table">${tableHeader}<tbody>${tableBody}</tbody></table>`;
        addSortingEventListeners();
    }

    function sortRows(rows) {
        return rows.sort((a, b) => {
            let aValue, bValue;
            if (currentSortKey === "model_name") {
                aValue = a.rawName; bValue = b.rawName;
            } else if (currentSortKey === "overall_avg") {
                aValue = a.overallAvg; bValue = b.overallAvg;
            } else {
                const categoryIndex = Object.keys(categories).indexOf(currentSortKey);
                aValue = a.categoryAverages[categoryIndex];
                bValue = b.categoryAverages[categoryIndex];
            }
            if (currentSortKey !== "model_name") {
                aValue = parseFloat(aValue); bValue = parseFloat(bValue);
            }
            if (currentSortKey === "model_name") {
                 return sortDirection ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            }
            return sortDirection ? bValue - aValue : aValue - bValue;
        });
    }

    function addSortingEventListeners() {
        document.querySelectorAll("th.sortable").forEach(header => {
            const key = header.getAttribute("data-key");
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

    document.getElementById("btn_simple").addEventListener("click", () => {
        simpleMode = true; currentSortKey = "overall_avg"; sortAndRender(currentSortKey, sortDirection);
    });
    document.getElementById("btn_detailed").addEventListener("click", () => {
        simpleMode = false; currentSortKey = "overall_avg"; sortAndRender(currentSortKey, sortDirection);
    });
});