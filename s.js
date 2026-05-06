//  Global Variables
let runningProcesses = [];
let processIdCounter = 1;
let systemStartTime = Date.now();
let totalRAM = 2048;
let totalDisk = 1024;
let files = [];

//  Tab Switching
function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".buttons button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}

//  Device & Process Configs
const deviceMap = {
  Chrome: ["Keyboard", "Mouse", "Disk"],
  Notepad: ["Keyboard", "Disk"],
  Calculator: ["Keyboard"],
  VSCode: ["Keyboard", "Mouse", "Disk"],
  Spotify: ["Mouse", "Disk", "Speaker"],
  Word: ["Keyboard", "Mouse", "Disk", "Printer"],
  Photoshop: ["Keyboard", "Mouse", "Disk", "Scanner"],
  Excel: ["Keyboard", "Mouse", "Disk"],
  Firefox: ["Keyboard", "Mouse", "Disk"],
  Terminal: ["Keyboard"],
  Discord: ["Keyboard", "Mouse", "Microphone", "Speaker"],
  Premiere: ["Keyboard", "Mouse", "Disk", "Speaker"],
  Edge: ["Keyboard", "Mouse", "Disk"],
  PowerPoint: ["Keyboard", "Mouse", "Disk"],
  Slack: ["Keyboard", "Mouse", "Disk", "Microphone"],
  Zoom: ["Keyboard", "Mouse", "Disk", "Webcam", "Microphone", "Speaker"],
};

const threadsConfig = {
  Chrome: [
    {
      name: "Renderer",
      cpu: 45,
    },
    {
      name: "Network",
      cpu: 10,
    },
    {
      name: "JS Engine",
      cpu: 30,
    },
  ],
  Notepad: [
    {
      name: "Main Thread",
      cpu: 5,
    },
  ],
  Calculator: [
    {
      name: "Main Thread",
      cpu: 8,
    },
  ],
  VSCode: [
    {
      name: "Main",
      cpu: 25,
    },
    {
      name: "Extension Host",
      cpu: 15,
    },
    {
      name: "File Watcher",
      cpu: 10,
    },
  ],
  Spotify: [
    {
      name: "Audio Engine",
      cpu: 20,
    },
    {
      name: "Network",
      cpu: 12,
    },
  ],
  Word: [
    {
      name: "Main",
      cpu: 18,
    },
    {
      name: "Spell Checker",
      cpu: 8,
    },
  ],
  Photoshop: [
    {
      name: "Main",
      cpu: 35,
    },
    {
      name: "Renderer",
      cpu: 40,
    },
    {
      name: "GPU Engine",
      cpu: 30,
    },
  ],
  Excel: [
    {
      name: "Main",
      cpu: 22,
    },
    {
      name: "Calc Engine",
      cpu: 18,
    },
  ],
  Firefox: [
    {
      name: "Renderer",
      cpu: 40,
    },
    {
      name: "Network",
      cpu: 12,
    },
    {
      name: "JS Engine",
      cpu: 28,
    },
  ],
  Terminal: [
    {
      name: "Shell",
      cpu: 6,
    },
  ],
  Discord: [
    {
      name: "Main",
      cpu: 15,
    },
    {
      name: "Voice Engine",
      cpu: 20,
    },
    {
      name: "Network",
      cpu: 10,
    },
  ],
  Premiere: [
    {
      name: "Main",
      cpu: 40,
    },
    {
      name: "Video Decoder",
      cpu: 50,
    },
    {
      name: "Audio Engine",
      cpu: 25,
    },
    {
      name: "GPU Render",
      cpu: 45,
    },
  ],
  Edge: [
    {
      name: "Renderer",
      cpu: 42,
    },
    {
      name: "Network",
      cpu: 11,
    },
    {
      name: "JS Engine",
      cpu: 28,
    },
  ],
  PowerPoint: [
    {
      name: "Main",
      cpu: 20,
    },
    {
      name: "Renderer",
      cpu: 15,
    },
  ],
  Slack: [
    {
      name: "Main",
      cpu: 18,
    },
    {
      name: "Voice",
      cpu: 12,
    },
    {
      name: "Network",
      cpu: 8,
    },
  ],
  Zoom: [
    {
      name: "Main",
      cpu: 25,
    },
    {
      name: "Video Engine",
      cpu: 35,
    },
    {
      name: "Audio Engine",
      cpu: 20,
    },
  ],
};

//  Modal Controls
const showProcessesBtn = document.getElementById("showProcessesBtn");
const processModal = document.getElementById("processModal");
const closeModal = document.getElementById("closeModal");

showProcessesBtn.addEventListener("click", () => {
  processModal.classList.add("active");
  renderProcessModal();
});

closeModal.addEventListener("click", () => {
  processModal.classList.remove("active");
});

processModal.addEventListener("click", (e) => {
  if (e.target === processModal) processModal.classList.remove("active");
});

//  App Launch
document.querySelectorAll(".app-icon").forEach((icon) => {
  icon.addEventListener("click", function () {
    const appName = this.dataset.app;
    const loadTime = parseFloat(this.dataset.loadTime);

    if (
      runningProcesses.find((p) => p.name === appName && p.status !== "Closed")
    ) {
      alert(`${appName} is already running!`);
      return;
    }
    launchApp(appName, loadTime);
  });
});

function launchApp(appName, loadTime) {
  const currentCpu = runningProcesses
    .filter((p) => p.status === "Running")
    .reduce((sum, p) => sum + p.cpu, 0);

  if (currentCpu >= 95) {
    alert(
      "⚠️ CPU is at maximum capacity! Please close some processes before launching new apps.",
    );
    return;
  }

  const processId = processIdCounter++;
  const newProcess = {
    id: processId,
    name: appName,
    status: "Loading",
    priority: "Normal",
    loadTime: loadTime,
    elapsedTime: 0,
    cpu: 0,
    ram: Math.floor(Math.random() * 200) + 50,
    threads: threadsConfig[appName] || [{ name: "Main Thread", cpu: 5 }],
    devices: deviceMap[appName] || [],
  };

  runningProcesses.push(newProcess);
  addToProcessManagementTable(newProcess);
  startProcessLoading(newProcess);
  renderProcessModal();
  requestDevicesForProcess(newProcess);
  updateSystemFooter();
  updateMemoryDisplay();
}

function startProcessLoading(process) {
  const interval = setInterval(() => {
    // Total CPU
    const totalCpu = runningProcesses
      .filter((p) => p.status === "Running")
      .reduce((sum, p) => sum + p.cpu, 0);

    // لو CPU عالي، بطء الـ loading
    const speedMultiplier = totalCpu >= 80 ? 0.3 : 1; // 30% سرعة بس لو CPU عالي
    process.elapsedTime += 0.1 * speedMultiplier;

    if (process.elapsedTime >= process.loadTime) {
      process.status = "Running";
      process.cpu = Math.floor(Math.random() * 40) + 10;
      clearInterval(interval);
    } else {
      process.cpu = Math.floor(Math.random() * 15) + 5;
    }

    addToProcessManagementTable(process);
    renderProcessModal();
    updateSystemFooter();
  }, 100);
}
//  Render Process Modal
function renderProcessModal() {
  const modalBody = document.getElementById("processModalBody");
  if (!modalBody) return;

  const activeProcesses = runningProcesses.filter((p) => p.status !== "Closed");
  if (activeProcesses.length === 0) {
    modalBody.innerHTML =
      '<div class="no-process">No processes running. Launch an app from desktop.</div>';
    return;
  }

  modalBody.innerHTML = activeProcesses
    .map(
      (process) => `
        <div class="process-item">
            <div class="process-item-header">
                <h4>${process.name}.exe</h4>
                <span class="process-badge ${process.status.toLowerCase()}">
                    ${process.status === "Loading" ? `Loading ${Math.floor((process.elapsedTime / process.loadTime) * 100)}%` : process.status}
                </span>
            </div>
            <div class="process-stats">
                <div class="stat-item">
                    <span class="stat-label">CPU</span>
                    <span class="stat-value">${process.cpu}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">RAM</span>
                    <span class="stat-value">${process.ram} MB</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time</span>
                    <span class="stat-value">${process.elapsedTime.toFixed(1)}s</span>
                </div>
            </div>
            <div class="threads-list">
                <div class="threads-title">Threads (${process.threads.length})</div>
                ${process.threads
                  .map(
                    (thread) => `
                    <div class="thread-item">
                        <span class="thread-name">${thread.name}</span>
                        <span class="thread-cpu">${process.status === "Running" ? thread.cpu : Math.floor(thread.cpu / 3)}% CPU</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("");
}

//  Device Management
function requestDevicesForProcess(process) {
  process.devices.forEach((deviceName) => {
    const row = document.querySelector(`tr[data-device="${deviceName}"]`);
    if (!row) return;

    const statusBadge = row.querySelector(".status-badge");
    const usedByCell = row.querySelector(".used-by");
    const queueCell = row.querySelector(".queue-count");

    if (statusBadge.classList.contains("idle")) {
      statusBadge.className = "status-badge busy";
      statusBadge.textContent = "Busy";
      usedByCell.textContent = `${process.name}.exe`;
      queueCell.textContent = "0";
    } else {
      const currentQueue = parseInt(queueCell.textContent);
      queueCell.textContent = currentQueue + 1;
    }
  });
}

//  Process Management Table
function addToProcessManagementTable(process) {
  const table = document.getElementById("processTableBody");
  if (!table) return;

  let row = document.getElementById(`process-row-${process.id}`);
  if (!row) {
    row = document.createElement("tr");
    row.id = `process-row-${process.id}`;
    table.appendChild(row);
  }

  if (!process.priority) {
    process.priority = "Normal";
  }

  const isSuspended = process.status === "Suspended";
  const isClosed = process.status === "Closed";
  const isLoading = process.status === "Loading";

  row.innerHTML = `
        <td>${process.id}</td>
        <td>${process.name}.exe</td>
        <td><span class="status ${process.status.toLowerCase()}">${process.status}</span></td>
        <td>
            <select class="priority-select" data-pid="${process.id}" ${isClosed || isLoading ? "disabled" : ""}>
                <option value="Low" ${process.priority === "Low" ? "selected" : ""}>Low</option>
                <option value="Normal" ${process.priority === "Normal" ? "selected" : ""}>Normal</option>
                <option value="High" ${process.priority === "High" ? "selected" : ""}>High</option>
            </select>
        </td>
        <td>${process.ram} MB</td>
        <td>${process.threads.length}</td>
        <td>
            <button class="btn-suspend" data-pid="${process.id}" ${isSuspended || isClosed || isLoading ? "disabled" : ""}>
                ${isSuspended ? "Resume" : "Suspend"}
            </button>
            <button class="btn-kill" data-pid="${process.id}" ${isClosed ? "disabled" : ""}>Kill</button>
        </td>
    `;

  const prioritySelect = row.querySelector(".priority-select");
  const suspendBtn = row.querySelector(".btn-suspend");
  const killBtn = row.querySelector(".btn-kill");

  prioritySelect?.addEventListener("change", (e) => {
    changePriority(process.id, e.target.value);
  });

  suspendBtn?.addEventListener("click", () => {
    suspendProcess(process.id);
  });

  killBtn?.addEventListener("click", () => {
    killProcess(process.id);
  });
}

//  Change Priority Function - Global
window.changePriority = function (processId, newPriority) {
  const process = runningProcesses.find((p) => p.id === processId);
  if (!process || process.status === "Closed" || process.status === "Loading")
    return;

  const oldPriority = process.priority;
  process.priority = newPriority;

  // عدل CPU حسب الأولوية - بس لو Running
  if (process.status === "Running" && process.status !== "Suspended") {
    let baseCpu = Math.floor(Math.random() * 30) + 10; // CPU الأساسي 10-40

    switch (newPriority) {
      case "High":
        process.cpu = Math.min(Math.floor(baseCpu * 1.5), 95);
        break;
      case "Low":
        process.cpu = Math.max(Math.floor(baseCpu * 0.5), 5);
        break;
      case "Normal":
        process.cpu = baseCpu;
        break;
    }
  }

  addToProcessManagementTable(process);
  renderProcessModal();
  updateSystemFooter();

  console.log(
    `✓ Process ${process.name} priority: ${oldPriority} → ${newPriority}, CPU: ${process.cpu}%`,
  );
};

//  Suspend - Global
window.suspendProcess = function (processId) {
  const process = runningProcesses.find((p) => p.id === processId);
  if (!process) return;

  if (process.status === "Suspended") {
    process.status = "Running";
    // رجع CPU حسب الأولوية
    let baseCpu = Math.floor(Math.random() * 30) + 10;
    switch (process.priority) {
      case "High":
        process.cpu = Math.min(Math.floor(baseCpu * 1.5), 95);
        break;
      case "Low":
        process.cpu = Math.max(Math.floor(baseCpu * 0.5), 5);
        break;
      default:
        process.cpu = baseCpu;
    }
  } else {
    process.status = "Suspended";
    process.cpu = 0;
  }

  addToProcessManagementTable(process);
  renderProcessModal();
  updateSystemFooter();
};

//  Kill - Global
window.killProcess = function (processId) {
  const process = runningProcesses.find((p) => p.id === processId);
  if (!process) return;

  process.status = "Closed";
  process.cpu = 0;

  // Release devices
  process.devices.forEach((deviceName) => {
    const row = document.querySelector(`tr[data-device="${deviceName}"]`);
    if (!row) return;

    const statusBadge = row.querySelector(".status-badge");
    const usedByCell = row.querySelector(".used-by");
    const queueCell = row.querySelector(".queue-count");

    const currentQueue = parseInt(queueCell.textContent);
    if (currentQueue > 0) {
      queueCell.textContent = currentQueue - 1;
    } else {
      statusBadge.className = "status-badge idle";
      statusBadge.textContent = "Idle";
      usedByCell.textContent = "-";
    }
  });

  addToProcessManagementTable(process);
  renderProcessModal();
  updateSystemFooter();
  updateMemoryDisplay();

  setTimeout(() => {
    document.getElementById(`process-row-${processId}`)?.remove();
    runningProcesses = runningProcesses.filter((p) => p.id !== processId);
  }, 1000);
};

//  Memory Management
let memoryBlocks = [
  { address: "0x0000", size: totalRAM, status: "Free", process: null },
];

function updateMemoryDisplay() {
  const usedRAM = runningProcesses
    .filter((p) => p.status !== "Closed")
    .reduce((sum, p) => sum + p.ram, 0);

  const usedPercent = (usedRAM / totalRAM) * 100;

  document.getElementById("usedRamText").textContent = usedRAM;
  document.getElementById("ramProgressBar").style.width = `${usedPercent}%`;
  document.getElementById("ramProgressText").textContent =
    `${usedPercent.toFixed(1)}% Used`;

  rebuildMemoryBlocks();
  renderMemoryTable();
  updateProcessDropdown();
}

function rebuildMemoryBlocks() {
  memoryBlocks = [];
  let currentAddress = 0;

  // System reserved
  memoryBlocks.push({
    address: `0x${currentAddress.toString(16).padStart(4, "0")}`,
    size: 45,
    status: "Used",
    process: "System",
  });
  currentAddress += 45;

  // Running processes
  runningProcesses
    .filter((p) => p.status !== "Closed")
    .forEach((process) => {
      memoryBlocks.push({
        address: `0x${currentAddress.toString(16).padStart(4, "0")}`,
        size: process.ram,
        status: "Used",
        process: `${process.name}.exe`,
      });
      currentAddress += process.ram;
    });

  // Free block
  const freeSize = totalRAM - currentAddress;
  if (freeSize > 0) {
    memoryBlocks.push({
      address: `0x${currentAddress.toString(16).padStart(4, "0")}`,
      size: freeSize,
      status: "Free",
      process: "-",
    });
  }
}

function renderMemoryTable() {
  const tbody = document.getElementById("memoryTableBody");
  tbody.innerHTML = memoryBlocks
    .map(
      (block) => `
        <tr>
            <td>${block.address}</td>
            <td>${block.size}</td>
            <td><span class="status ${block.status.toLowerCase()}">${block.status}</span></td>
            <td>${block.process}</td>
        </tr>
    `,
    )
    .join("");
}

function updateProcessDropdown() {
  const select = document.getElementById("current-processes");
  const activeProcesses = runningProcesses.filter((p) => p.status !== "Closed");

  if (activeProcesses.length === 0) {
    select.innerHTML = '<option value="">No processes running</option>';
    return;
  }

  select.innerHTML = activeProcesses
    .map((p) => `<option value="${p.id}">${p.name}.exe (PID: ${p.id})</option>`)
    .join("");
}

function deallocateProcess() {
  const select = document.getElementById("current-processes");
  const processId = parseInt(select.value);
  if (!processId) return;

  killProcess(processId);
}

function defragmentMemory() {
  alert("Memory defragmented! All free blocks merged.");
  updateMemoryDisplay();
}

//  File System
function updateDiskDisplay() {
  const usedDisk = files.reduce((sum, f) => sum + f.size, 0);
  const freeDisk = totalDisk - usedDisk;
  const usedPercent = (usedDisk / totalDisk) * 100;

  document.getElementById("usedDisk").textContent = usedDisk;
  document.getElementById("freeDisk").textContent = freeDisk;
  document.getElementById("diskProgressBar").style.width = `${usedPercent}%`;

  renderFileTable();
  updateFileDropdowns();
}

function renderFileTable() {
  const tbody = document.getElementById("fileTableBody");
  if (files.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No files created</td></tr>';
    return;
  }

  tbody.innerHTML = files
    .map(
      (file) => `
        <tr>
            <td>${file.name}</td>
            <td>${file.size}</td>
            <td><span class="status ${file.status.toLowerCase()}">${file.status}</span></td>
            <td>${file.date}</td>
        </tr>
        `,
    )
    .join("");
}

function updateFileDropdowns() {
  const statusSelect = document.getElementById("fileSelectStatus");
  const deleteSelect = document.getElementById("fileSelectDelete");

  if (files.length === 0) {
    statusSelect.innerHTML = '<option value="">No files</option>';
    deleteSelect.innerHTML = '<option value="">No files</option>';
    return;
  }

  const options = files
    .map((f) => `<option value="${f.name}">${f.name}</option>`)
    .join("");
  statusSelect.innerHTML = options;
  deleteSelect.innerHTML = options;
}

function createFile() {
  const name = document.getElementById("fileNameInput").value.trim();
  const size = parseInt(document.getElementById("fileSizeInput").value);

  if (!name || !size || size <= 0) {
    alert("Please enter valid file name and size");
    return;
  }

  const usedDisk = files.reduce((sum, f) => sum + f.size, 0);
  if (usedDisk + size > totalDisk) {
    alert("Not enough disk space!");
    return;
  }

  if (files.find((f) => f.name === name)) {
    alert("File already exists!");
    return;
  }

  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  files.push({
    name: name,
    size: size,
    status: "Closed",
    date: today,
  });

  document.getElementById("fileNameInput").value = "";
  document.getElementById("fileSizeInput").value = "";
  updateDiskDisplay();
}

function changeFileStatus() {
  const fileName = document.getElementById("fileSelectStatus").value;
  const newStatus = document.getElementById("fileStatusSelect").value;

  const file = files.find((f) => f.name === fileName);
  if (!file) return;

  file.status = newStatus;
  updateDiskDisplay();
}

function deleteFile() {
  const fileName = document.getElementById("fileSelectDelete").value;
  if (!fileName) return;

  files = files.filter((f) => f.name !== fileName);
  updateDiskDisplay();
}

//  System Footer Stats
function updateSystemFooter() {
  const totalCpu = runningProcesses
    .filter((p) => p.status === "Running")
    .reduce((sum, p) => sum + p.cpu, 0);
  const cpuElement = document.querySelector(".cpu-span");
  const cpuValue = Math.min(totalCpu, 100);
  cpuElement.textContent = cpuValue;

  // تحذير لو CPU عالي
  if (cpuValue >= 100) {
    cpuElement.style.color = "#ef4444"; // أحمر
    cpuElement.style.animation = "pulse 1s infinite";
    showCpuWarning();
  } else if (cpuValue >= 80) {
    cpuElement.style.color = "#f59e0b"; // برتقالي
    cpuElement.style.animation = "none";
  } else {
    cpuElement.style.color = "#3b82f6"; // أزرق عادي
    cpuElement.style.animation = "none";
  }

  const usedRam = runningProcesses
    .filter((p) => p.status !== "Closed")
    .reduce((sum, p) => sum + p.ram, 0);
  document.querySelector(".ram-span").textContent = usedRam;

  const activeProcesses = runningProcesses.filter(
    (p) => p.status !== "Closed",
  ).length;
  document.querySelector(".process-span").textContent = activeProcesses;

  const uptime = Math.floor((Date.now() - systemStartTime) / 1000);
  const minutes = Math.floor(uptime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (uptime % 60).toString().padStart(2, "0");
  document.querySelector(".time-span").textContent = `${minutes}:${seconds}`;
}

function showCpuWarning() {
  // يظهر مرة واحدة بس كل 5 ثواني عشان ميسبامش
  if (window.cpuWarningShown) return;
  window.cpuWarningShown = true;

  console.warn(
    "⚠️ CPU at 100%! System performance degraded. Close some processes.",
  );

  setTimeout(() => {
    window.cpuWarningShown = false;
  }, 5000);
}
//  Initialize
setInterval(updateSystemFooter, 1000);
updateMemoryDisplay();
updateDiskDisplay();
updateSystemFooter();
