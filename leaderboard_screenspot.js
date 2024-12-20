// leaderboard_screenspot.js

document.addEventListener("DOMContentLoaded", function () {
    const jsonPath = "results/screenspot_v2.json";
    const tableElement = document.getElementById("plused");
  
    let currentData = [];
    let sortDirection = true; // true for descending, false for ascending
    let currentSortKey = "overall_avg";
    let simpleMode = false; // Controls display mode
  
    // Fetch the leaderboard JSON
    fetch(jsonPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        currentData = Object.entries(data);
        sortAndRender("overall_avg", true);
      })
      .catch((error) => {
        console.error("Failed to fetch leaderboard data:", error);
        tableElement.innerHTML = `<div class='text-danger'>Error loading leaderboard data.</div>`;
      });
  
    // Function to sort data and render the table
    function sortAndRender(key, direction) {
      currentSortKey = key;
      sortDirection = direction;

    const keyPathSimple = (entry) => key === "overall_avg"
        ? entry[1].results[key]
        : entry[1].results.platform[key].overall_avg;
    const keyPathDetailed = (entry) => key === "overall_avg"
        ? entry[1].results[key]  // Use detailed key if it's "overall_avg"
        : entry[1].results.platform[key.split("_")[0]][key.split("_")[1]];  // Split key for detailed access

    // Assign keyPath based on simpleMode
    const keyPath = simpleMode ? keyPathSimple : keyPathDetailed;


      const sortedData = currentData.sort((a, b) => {
        const aValue = keyPath(a);
        const bValue = keyPath(b);
        return direction ? bValue - aValue : aValue - bValue;
      });
      renderLeaderboardTable(sortedData);
    }
  
    // Function to render leaderboard as a table
    function renderLeaderboardTable(data) {
        let tableHeader = '';
        let tableBody = '';
      
        if (!simpleMode) {
          // Detailed mode
          tableHeader = `
            <thead>
              <tr>
                <th rowspan="2">Rank</th>
                <th rowspan="2">Model</th>
                <th colspan="3">Desktop</th>
                <th colspan="3">Mobile</th>
                <th colspan="3">Web</th>
                <th rowspan="2" class="sortable" data-key="hallucination">Hallucination</th>
                <th rowspan="2" class="sortable" data-key="overall_avg">Overall</th>
              </tr>
              <tr>
                <th class="sortable" data-key="desktop_text">Text</th>
                <th class="sortable" data-key="desktop_icon">Icon</th>
                <th class="sortable" data-key="desktop_avg">Avg</th>
                <th class="sortable" data-key="mobile_text">Text</th>
                <th class="sortable" data-key="mobile_icon">Icon</th>
                <th class="sortable" data-key="mobile_avg">Avg</th>
                <th class="sortable" data-key="web_text">Text</th>
                <th class="sortable" data-key="web_icon">Icon</th>
                <th class="sortable" data-key="web_avg">Avg</th>
              </tr>
            </thead>
          `;
      
          tableBody = data
            .map(([model, { results }], index) => {
              const rank = index + 1; // Rank based on sorted order
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''; // Medal logic
              
              return `
                <tr>
                  <td>${medal} ${rank}</td> <!-- Display rank and medal -->
                  <td class="table-value model-name">${model}</td>
                  <td class="table-value normal-value">${(results.platform.desktop.text * 100).toFixed(1)}</td>
                  <td class="table-value normal-value">${(results.platform.desktop.icon * 100).toFixed(1)}</td>
                  <td class="table-value sub-avg-value">${(results.platform.desktop.avg * 100).toFixed(1)}</td>
                  <td class="table-value normal-value">${(results.platform.mobile.text * 100).toFixed(1)}</td>
                  <td class="table-value normal-value">${(results.platform.mobile.icon * 100).toFixed(1)}</td>
                  <td class="table-value sub-avg-value">${(results.platform.mobile.avg * 100).toFixed(1)}</td>
                  <td class="table-value normal-value">${(results.platform.web.text * 100).toFixed(1)}</td>
                  <td class="table-value normal-value">${(results.platform.web.icon * 100).toFixed(1)}</td>
                  <td class="table-value sub-avg-value">${(results.platform.web.avg * 100).toFixed(1)}</td>
                  <!-- <td class="table-value normal-value">${(results.platform.web.negative * 100).toFixed(1)}</td> -->
                  <td class="table-value sub-avg-value">-</td>

                  <td class="table-value overall-avg-value">${(results.overall_avg * 100).toFixed(1)}</td>
                </tr>
              `;
            })
            .join('');
        } else {
          // Simple mode
          tableHeader = `
            <thead>
              <tr>
                <th>Rank</th> <!-- Add Rank column -->
                <th rowspan="2">Model</th>
                <th rowspan="2" class="sortable" data-key="desktop">Desktop</th>
                <th rowspan="2" class="sortable" data-key="mobile">Mobile</th>
                <th rowspan="2" class="sortable" data-key="web">Web</th>
                <th rowspan="2" class="sortable" data-key="overall_avg">Overall</th>
              </tr>
            </thead>
          `;
          
          tableBody = data
            .map(([model, { results }], index) => {
              const rank = index + 1; // Rank based on sorted order
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''; // Medal logic
              
              return `
                <tr>
                  <td>${medal} ${rank}</td> <!-- Display rank and medal -->
                  <td>${model}</td>
                  <td class="table-value sub-avg-value">${(results.platform.desktop.avg * 100).toFixed(1)}</td>
                  <td class="table-value sub-avg-value">${(results.platform.mobile.avg * 100).toFixed(1)}</td>
                  <td class="table-value sub-avg-value">${(results.platform.web.avg * 100).toFixed(1)}</td>
                  <td class="table-value overall-avg-value">${(results.overall_avg * 100).toFixed(1)}</td>
                </tr>
              `;
            })
            .join('');
        }
      
        // Combine header and body to render the table
        tableElement.innerHTML = tableHeader + `<tbody>${tableBody}</tbody>`;
      
        // Add event listeners to sortable headers
        document.querySelectorAll("th.sortable").forEach((header) => {
          const key = header.getAttribute("data-key");
          header.classList.remove("sorted-asc", "sorted-desc");
          if (key === currentSortKey) {
            header.classList.add(sortDirection ? "sorted-desc" : "sorted-asc");
          }
      
          header.addEventListener("click", () => {
            const newDirection = key === currentSortKey ? !sortDirection : true;
            sortAndRender(key, newDirection);
          });
        });
      }
      
      
      
    // Add event listeners for view toggle buttons
    document.getElementById("btn_simple").addEventListener("click", () => {
      simpleMode = true;
      renderLeaderboardTable(currentData);
    });
  
    document.getElementById("btn_detailed").addEventListener("click", () => {
      simpleMode = false;
      renderLeaderboardTable(currentData);
    });
  });
  