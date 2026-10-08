"use strict";

/* =========================================================
   ASSET INTAKE
   Local IT Asset Management
========================================================= */

const STORAGE_KEY = "asset-intake-assets-v3";
const THEME_KEY = "asset-intake-theme";

let assets = loadAssets();

let editingAssetId = null;

let currentChecklist = [];


/* =========================================================
   CHECKLISTS
========================================================= */

const CHECKLISTS = {

    Notebook: [
        "Power / boot",
        "Display",
        "Keyboard",
        "Touchpad",
        "USB ports",
        "Wi-Fi",
        "Audio",
        "Webcam",
        "Charger",
        "Storage",
        "Memory",
        "Physical condition"
    ],

    Desktop: [
        "Power / boot",
        "Display",
        "Keyboard",
        "Mouse",
        "USB ports",
        "Network",
        "Audio",
        "Storage",
        "Memory",
        "Power supply",
        "Physical condition"
    ],

    Monitor: [
        "Power",
        "Display",
        "No dead lines",
        "Brightness",
        "Buttons",
        "HDMI / DisplayPort",
        "Power cable",
        "Physical condition"
    ],

    Scanner: [
        "Power / boot",
        "USB / network",
        "Driver",
        "Feeder",
        "Scan test",
        "Image quality",
        "No image cuts",
        "Buttons",
        "Cover / parts",
        "Physical condition"
    ],

    Impressora: [
        "Power",
        "Network",
        "Driver",
        "Print test",
        "Paper feed",
        "Toner / cartridge",
        "Scanner",
        "Control panel",
        "Physical condition"
    ],

    Servidor: [
        "Power / boot",
        "POST",
        "Network",
        "Storage",
        "Memory",
        "Fans",
        "Power supply",
        "Temperature",
        "Physical condition"
    ],

    default: [
        "Power / boot",
        "Connectivity",
        "Main functions",
        "Cables / accessories",
        "Physical condition"
    ]

};


/* =========================================================
   DOM
========================================================= */

const pages =
    document.querySelectorAll(".page");

const navItems =
    document.querySelectorAll(".nav-item[data-page]");

const breadcrumbTitle =
    document.getElementById("breadcrumbTitle");

const assetForm =
    document.getElementById("assetForm");

const assetType =
    document.getElementById("assetType");

const assetTag =
    document.getElementById("assetTag");

const manufacturer =
    document.getElementById("manufacturer");

const model =
    document.getElementById("model");

const serial =
    document.getElementById("serial");

const assetStatus =
    document.getElementById("assetStatus");

const condition =
    document.getElementById("condition");

const locationInput =
    document.getElementById("location");

const responsible =
    document.getElementById("responsible");

const operatingSystem =
    document.getElementById("operatingSystem");

const processor =
    document.getElementById("processor");

const ram =
    document.getElementById("ram");

const storage =
    document.getElementById("storage");

const ip =
    document.getElementById("ip");

const mac =
    document.getElementById("mac");

const notes =
    document.getElementById("notes");

const checklistContainer =
    document.getElementById("checklist");

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const statusFilter =
    document.getElementById("statusFilter");

const assetsTable =
    document.getElementById("assetsTable");

const emptyAssets =
    document.getElementById("emptyAssets");

const modal =
    document.getElementById("assetModal");

const modalContent =
    document.getElementById("modalContent");

const commandOverlay =
    document.getElementById("commandOverlay");

const commandInput =
    document.getElementById("commandInput");

const commandResults =
    document.getElementById("commandResults");

const toast =
    document.getElementById("toast");


/* =========================================================
   NAVIGATION
========================================================= */

const pageNames = {

    dashboard: "Overview",

    assets: "Assets",

    intake: "New intake",

    maintenance: "Maintenance",

    reports: "Reports"

};


function navigate(pageId) {

    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageId
        );

    });


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageId
        );

    });


    breadcrumbTitle.textContent =
        pageNames[pageId] || "Overview";


    if (pageId === "dashboard") {
        renderDashboard();
    }


    if (pageId === "assets") {
        renderAssets();
    }


    if (pageId === "maintenance") {
        renderMaintenance();
    }


    if (pageId === "reports") {
        renderReports();
    }


    document
        .getElementById("sidebar")
        .classList.remove("open");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => navigate(item.dataset.page)
    );

});


document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        if (
            button.classList.contains("nav-item")
        ) {
            return;
        }

        button.addEventListener(
            "click",
            () => navigate(button.dataset.page)
        );

    });


/* =========================================================
   NEW ASSET
========================================================= */

function openNewAsset() {

    editingAssetId = null;

    assetForm.reset();

    currentChecklist = [];

    document.getElementById(
        "intakeTitle"
    ).textContent = "New asset";

    renderChecklist();

    navigate("intake");

}


document
    .getElementById("headerAddAsset")
    .addEventListener(
        "click",
        openNewAsset
    );


document
    .getElementById("dashboardAdd")
    .addEventListener(
        "click",
        openNewAsset
    );


document
    .getElementById("assetsAddButton")
    .addEventListener(
        "click",
        openNewAsset
    );


document
    .getElementById("emptyAddButton")
    .addEventListener(
        "click",
        openNewAsset
    );


/* =========================================================
   CHECKLIST
========================================================= */

function getChecklist(type) {

    return CHECKLISTS[type] ||
        CHECKLISTS.default;

}


function renderChecklist() {

    const items =
        getChecklist(assetType.value);


    checklistContainer.innerHTML = "";


    items.forEach((item, index) => {

        const checked =
            currentChecklist.includes(item);


        const label =
            document.createElement("label");


        label.className =
            "check-item" +
            (checked ? " checked" : "");


        label.innerHTML = `

            <input
                type="checkbox"
                data-index="${index}"
                ${checked ? "checked" : ""}
            >

            <span>
                ${escapeHTML(item)}
            </span>

        `;


        checklistContainer.appendChild(label);

    });


    updateProgress();

}


assetType.addEventListener(
    "change",
    () => {

        currentChecklist = [];

        renderChecklist();

    }
);


checklistContainer.addEventListener(
    "change",
    event => {

        if (
            !event.target.matches(
                "input[type='checkbox']"
            )
        ) {
            return;
        }


        const items =
            getChecklist(assetType.value);


        const item =
            items[
                Number(
                    event.target.dataset.index
                )
            ];


        if (event.target.checked) {

            if (
                !currentChecklist.includes(item)
            ) {

                currentChecklist.push(item);

            }

        } else {

            currentChecklist =
                currentChecklist.filter(
                    value => value !== item
                );

        }


        renderChecklist();

    }
);


function updateProgress() {

    const total =
        getChecklist(assetType.value).length;

    const completed =
        currentChecklist.length;


    const percentage =
        total
            ? Math.round(
                completed / total * 100
            )
            : 0;


    progressText.textContent =
        `${percentage}%`;


    progressBar.style.width =
        `${percentage}%`;

}


/* =========================================================
   SAVE ASSET
========================================================= */

assetForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const tag =
            assetTag.value.trim();


        if (!tag) {

            notify(
                "Asset tag is required."
            );

            assetTag.focus();

            return;

        }


        if (
            ip.value.trim() &&
            !validIP(ip.value.trim())
        ) {

            notify(
                "Invalid IP address."
            );

            ip.focus();

            return;

        }


        const now =
            new Date().toISOString();


        const existing =
            editingAssetId
                ? getAsset(editingAssetId)
                : null;


        const asset = {

            id:
                editingAssetId ||
                crypto.randomUUID(),

            type:
                assetType.value,

            assetTag:
                tag,

            manufacturer:
                manufacturer.value.trim(),

            model:
                model.value.trim(),

            serial:
                serial.value.trim(),

            status:
                assetStatus.value,

            condition:
                condition.value,

            location:
                locationInput.value.trim(),

            responsible:
                responsible.value.trim(),

            operatingSystem:
                operatingSystem.value.trim(),

            processor:
                processor.value.trim(),

            ram:
                ram.value.trim(),

            storage:
                storage.value.trim(),

            ip:
                ip.value.trim(),

            mac:
                mac.value.trim(),

            notes:
                notes.value.trim(),

            checklist:
                [...currentChecklist],

            createdAt:
                existing?.createdAt || now,

            updatedAt:
                now,

            history:
                existing?.history || []

        };


        if (existing) {

            asset.history.unshift({

                action:
                    "Asset updated",

                date:
                    now

            });


            const index =
                assets.findIndex(
                    item =>
                        item.id ===
                        editingAssetId
                );


            assets[index] =
                asset;


            notify(
                "Asset updated."
            );

        } else {

            asset.history.unshift({

                action:
                    "Asset created",

                date:
                    now

            });


            assets.unshift(asset);


            notify(
                "Asset created."
            );

        }


        saveAssets();

        updateNavCount();

        editingAssetId = null;

        assetForm.reset();

        currentChecklist = [];

        renderChecklist();


        setTimeout(
            () => navigate("assets"),
            250
        );

    }
);


/* =========================================================
   EDIT
========================================================= */

function editAsset(id) {

    const asset =
        getAsset(id);


    if (!asset) {
        return;
    }


    editingAssetId = id;


    assetType.value =
        asset.type;

    assetTag.value =
        asset.assetTag;

    manufacturer.value =
        asset.manufacturer;

    model.value =
        asset.model;

    serial.value =
        asset.serial;

    assetStatus.value =
        asset.status;

    condition.value =
        asset.condition;

    locationInput.value =
        asset.location;

    responsible.value =
        asset.responsible;

    operatingSystem.value =
        asset.operatingSystem;

    processor.value =
        asset.processor;

    ram.value =
        asset.ram;

    storage.value =
        asset.storage;

    ip.value =
        asset.ip;

    mac.value =
        asset.mac;

    notes.value =
        asset.notes;


    currentChecklist =
        [...(asset.checklist || [])];


    document.getElementById(
        "intakeTitle"
    ).textContent =
        "Edit asset";


    renderChecklist();

    navigate("intake");

}


/* =========================================================
   DELETE
========================================================= */

function deleteAsset(id) {

    const asset =
        getAsset(id);


    if (!asset) {
        return;
    }


    const confirmed =
        confirm(
            `Delete asset ${asset.assetTag}?`
        );


    if (!confirmed) {
        return;
    }


    assets =
        assets.filter(
            item => item.id !== id
        );


    saveAssets();

    closeModal();

    renderDashboard();

    renderAssets();

    renderMaintenance();

    renderReports();

    updateNavCount();

    notify(
        "Asset deleted."
    );

}


/* =========================================================
   ASSET TABLE
========================================================= */

function getFilteredAssets() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const type =
        typeFilter.value;


    const status =
        statusFilter.value;


    return assets.filter(asset => {

        const searchable = [

            asset.assetTag,

            asset.serial,

            asset.manufacturer,

            asset.model,

            asset.location,

            asset.responsible,

            asset.type

        ]
            .join(" ")
            .toLowerCase();


        return (

            (!query ||
                searchable.includes(query))

            &&

            (!type ||
                asset.type === type)

            &&

            (!status ||
                asset.status === status)

        );

    });

}


function renderAssets() {

    const filtered =
        getFilteredAssets();


    assetsTable.innerHTML = "";


    document.getElementById(
        "assetResultCount"
    ).textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "asset"
                : "assets"
        }`;


    if (!filtered.length) {

        emptyAssets.classList.remove(
            "hidden"
        );

        return;

    }


    emptyAssets.classList.add(
        "hidden"
    );


    filtered.forEach(asset => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="asset-cell">

                    <div class="asset-avatar">
                        ${getAssetInitial(asset)}
                    </div>

                    <div>

                        <strong>
                            ${
                                escapeHTML(
                                    asset.manufacturer ||
                                    "Unknown"
                                )
                            }
                        </strong>

                        <span>
                            ${
                                escapeHTML(
                                    asset.model ||
                                    "Model not specified"
                                )
                            }
                        </span>

                    </div>

                </div>

            </td>


            <td>
                <span class="mono">
                    ${escapeHTML(asset.assetTag)}
                </span>
            </td>


            <td>
                ${escapeHTML(asset.type)}
            </td>


            <td>
                ${statusBadge(asset.status)}
            </td>


            <td>
                ${escapeHTML(
                    asset.location || "—"
                )}
            </td>


            <td>
                ${escapeHTML(
                    asset.responsible || "—"
                )}
            </td>


            <td>
                <span class="mono">
                    ${formatDateShort(asset.updatedAt)}
                </span>
            </td>


            <td>

                <div class="row-actions">

                    <button
                        class="row-action"
                        title="View"
                        data-action="view"
                        data-id="${asset.id}"
                    >
                        ◉
                    </button>

                    <button
                        class="row-action"
                        title="Edit"
                        data-action="edit"
                        data-id="${asset.id}"
                    >
                        ✎
                    </button>

                    <button
                        class="row-action"
                        title="Delete"
                        data-action="delete"
                        data-id="${asset.id}"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        assetsTable.appendChild(row);

    });

}


assetsTable.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (action === "view") {
            viewAsset(id);
        }


        if (action === "edit") {
            editAsset(id);
        }


        if (action === "delete") {
            deleteAsset(id);
        }

    }
);


searchInput.addEventListener(
    "input",
    renderAssets
);


typeFilter.addEventListener(
    "change",
    renderAssets
);


statusFilter.addEventListener(
    "change",
    renderAssets
);


/* =========================================================
   VIEW ASSET
========================================================= */

function viewAsset(id) {

    const asset =
        getAsset(id);


    if (!asset) {
        return;
    }


    const checklist =
        getChecklist(asset.type);


    const completed =
        asset.checklist?.length || 0;


    const percentage =
        checklist.length
            ? Math.round(
                completed /
                checklist.length *
                100
            )
            : 0;


    modalContent.innerHTML = `

        <div class="modal-kicker">
            ${escapeHTML(asset.type)}
        </div>


        <h2>
            ${
                escapeHTML(
                    asset.manufacturer ||
                    "Unknown manufacturer"
                )
            }

            ${
                escapeHTML(
                    asset.model
                )
            }
        </h2>


        <p class="modal-subtitle">
            Asset ${escapeHTML(asset.assetTag)}
        </p>


        <div class="detail-grid">

            ${detail(
                "Status",
                statusBadge(asset.status)
            )}

            ${detail(
                "Condition",
                asset.condition
            )}

            ${detail(
                "Asset tag",
                asset.assetTag
            )}

            ${detail(
                "Serial number",
                asset.serial || "—"
            )}

            ${detail(
                "Manufacturer",
                asset.manufacturer || "—"
            )}

            ${detail(
                "Model",
                asset.model || "—"
            )}

            ${detail(
                "Location",
                asset.location || "—"
            )}

            ${detail(
                "Assigned to",
                asset.responsible || "—"
            )}

            ${detail(
                "Operating system",
                asset.operatingSystem || "—"
            )}

            ${detail(
                "Processor",
                asset.processor || "—"
            )}

            ${detail(
                "Memory",
                asset.ram || "—"
            )}

            ${detail(
                "Storage",
                asset.storage || "—"
            )}

            ${detail(
                "IP address",
                asset.ip || "—"
            )}

            ${detail(
                "MAC address",
                asset.mac || "—"
            )}

        </div>


        <div class="modal-section">

            <div class="modal-section-title">
                INSPECTION
            </div>

            <div style="margin-top:9px">

                <div
                    class="progress"
                >
                    <span
                        style="
                            width:${percentage}%
                        "
                    ></span>
                </div>

            </div>

            <p
                style="
                    margin-top:7px;
                    color:var(--muted);
                    font-size:9px;
                "
            >
                ${completed}
                of
                ${checklist.length}
                checks completed
            </p>

        </div>


        ${
            asset.notes
                ? `

                    <div class="modal-section">

                        <div class="modal-section-title">
                            NOTES
                        </div>

                        <p
                            style="
                                margin-top:8px;
                                color:var(--text-soft);
                                font-size:10px;
                                line-height:1.7;
                            "
                        >
                            ${escapeHTML(asset.notes)}
                        </p>

                    </div>

                `
                : ""
        }


        <div class="modal-section">

            <div class="modal-section-title">
                HISTORY
            </div>


            ${
                (asset.history || [])
                    .map(history => `

                        <div class="history-item">

                            <span>
                                ${escapeHTML(
                                    history.action
                                )}
                            </span>

                            <span>
                                ${formatDate(
                                    history.date
                                )}
                            </span>

                        </div>

                    `)
                    .join("")
            }

        </div>


        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Close
            </button>

            <button
                class="primary-button"
                onclick="
                    closeModal();
                    editAsset('${asset.id}');
                "
            >
                Edit asset
            </button>

        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

}


function detail(label, value) {

    return `

        <div class="detail">

            <small>
                ${escapeHTML(label)}
            </small>

            <strong>
                ${value}
            </strong>

        </div>

    `;

}


/* =========================================================
   MODAL
========================================================= */

function closeModal() {

    modal.classList.add(
        "hidden"
    );

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {
            closeModal();
        }

    }
);


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const total =
        assets.length;


    const inUse =
        countStatus("Em uso");


    const maintenance =
        countStatus("Manutenção");


    const received =
        countStatus("Recebido");


    document.getElementById(
        "totalAssets"
    ).textContent = total;


    document.getElementById(
        "inUseAssets"
    ).textContent = inUse;


    document.getElementById(
        "maintenanceAssets"
    ).textContent = maintenance;


    document.getElementById(
        "receivedAssets"
    ).textContent = received;


    renderRecentActivity();

    renderStatusDistribution();

    renderTypeDistribution();

    updateNavCount();

}


function renderRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    const recent =
        [...assets]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            )
            .slice(0, 6);


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    —
                </div>

                <h3>
                    No activity yet
                </h3>

                <p>
                    Your asset activity will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        recent
            .map(asset => `

                <div class="activity-item">

                    <div class="activity-dot"></div>

                    <div class="activity-main">

                        <strong>
                            ${escapeHTML(
                                asset.manufacturer ||
                                "Asset"
                            )}
                            ${
                                escapeHTML(
                                    asset.model
                                )
                            }
                        </strong>

                        <span>
                            ${escapeHTML(
                                asset.history?.[0]?.action ||
                                "Asset updated"
                            )}
                            ·
                            ${escapeHTML(
                                asset.assetTag
                            )}
                        </span>

                    </div>

                    <div class="activity-time">
                        ${formatRelative(
                            asset.updatedAt
                        )}
                    </div>

                </div>

            `)
            .join("");

}


function renderStatusDistribution() {

    const container =
        document.getElementById(
            "statusDistribution"
        );


    const statuses = [

        "Em uso",

        "Em estoque",

        "Recebido",

        "Reservado",

        "Manutenção",

        "Indisponível",

        "Perdido",

        "Aposentado"

    ];


    if (!assets.length) {

        container.innerHTML = `
            <p
                style="
                    padding:25px 0;
                    color:var(--muted);
                    font-size:10px;
                "
            >
                No inventory data.
            </p>
        `;

        return;

    }


    container.innerHTML =
        statuses
            .map(status => {

                const count =
                    countStatus(status);


                const percentage =
                    Math.round(
                        count /
                        assets.length *
                        100
                    );


                return `

                    <div class="status-line">

                        <div class="status-line-top">

                            <span>
                                ${status}
                            </span>

                            <span>
                                ${count}
                            </span>

                        </div>

                        <div class="status-track">

                            <span
                                style="
                                    width:${percentage}%
                                "
                            ></span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


function renderTypeDistribution() {

    const container =
        document.getElementById(
            "typeDistribution"
        );


    const types = {};


    assets.forEach(asset => {

        types[asset.type] =
            (types[asset.type] || 0) + 1;

    });


    const sorted =
        Object.entries(types)
            .sort(
                (a, b) => b[1] - a[1]
            )
            .slice(0, 8);


    if (!sorted.length) {

        container.innerHTML = `
            <div class="type-item">
                <span>No assets</span>
                <strong>0</strong>
            </div>
        `;

        return;

    }


    container.innerHTML =
        sorted
            .map(
                ([type, count]) => `

                    <div class="type-item">

                        <span>
                            ${escapeHTML(type)}
                        </span>

                        <strong>
                            ${count}
                        </strong>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   MAINTENANCE
========================================================= */

function renderMaintenance() {

    const table =
        document.getElementById(
            "maintenanceTable"
        );


    const maintenance =
        assets.filter(
            asset =>
                asset.status ===
                "Manutenção"
        );


    if (!maintenance.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        height:180px;
                        color:var(--muted);
                    "
                >
                    No assets currently in maintenance.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        maintenance
            .map(asset => `

                <tr>

                    <td>
                        <div class="asset-cell">

                            <div class="asset-avatar">
                                ${getAssetInitial(asset)}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        asset.manufacturer ||
                                        "Unknown"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        asset.model
                                    )}
                                </span>

                            </div>

                        </div>
                    </td>

                    <td>
                        <span class="mono">
                            ${escapeHTML(
                                asset.assetTag
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            asset.condition
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            asset.location || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            asset.notes || "No notes"
                        )}
                    </td>

                    <td>
                        <span class="mono">
                            ${formatDateShort(
                                asset.updatedAt
                            )}
                        </span>
                    </td>

                </tr>

            `)
            .join("");

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const container =
        document.getElementById(
            "reportSummary"
        );


    const types = {};


    assets.forEach(asset => {

        types[asset.type] =
            (types[asset.type] || 0) + 1;

    });


    container.innerHTML = `

        <div class="summary-line">

            <span>Total assets</span>

            <strong>
                ${assets.length}
            </strong>

        </div>


        ${
            Object.entries(types)
                .map(
                    ([type, count]) => `

                        <div class="summary-line">

                            <span>
                                ${escapeHTML(type)}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>

                    `
                )
                .join("")
        }

    `;

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    if (!assets.length) {

        notify(
            "No assets to export."
        );

        return;

    }


    const headers = [

        "ID",
        "Type",
        "Asset Tag",
        "Manufacturer",
        "Model",
        "Serial",
        "Status",
        "Condition",
        "Location",
        "Assigned To",
        "Operating System",
        "Processor",
        "Memory",
        "Storage",
        "IP",
        "MAC",
        "Notes"

    ];


    const rows =
        assets.map(asset => [

            asset.id,
            asset.type,
            asset.assetTag,
            asset.manufacturer,
            asset.model,
            asset.serial,
            asset.status,
            asset.condition,
            asset.location,
            asset.responsible,
            asset.operatingSystem,
            asset.processor,
            asset.ram,
            asset.storage,
            asset.ip,
            asset.mac,
            asset.notes

        ]);


    const csv = [

        headers,
        ...rows

    ]
        .map(
            row =>
                row.map(csvEscape)
                    .join(";")
        )
        .join("\n");


    download(
        "asset-inventory.csv",
        "\ufeff" + csv,
        "text/csv;charset=utf-8;"
    );


    notify(
        "CSV exported."
    );

}


document
    .getElementById("exportCsv")
    .addEventListener(
        "click",
        exportCSV
    );


document
    .getElementById("exportTable")
    .addEventListener(
        "click",
        exportCSV
    );


/* =========================================================
   EXPORT JSON
========================================================= */

document
    .getElementById("exportJson")
    .addEventListener(
        "click",
        () => {

            if (!assets.length) {

                notify(
                    "No assets to export."
                );

                return;

            }


            download(
                "asset-inventory-backup.json",

                JSON.stringify(
                    assets,
                    null,
                    2
                ),

                "application/json"
            );


            notify(
                "JSON backup created."
            );

        }
    );


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );


    const light =
        document.body.classList.contains(
            "light"
        );


    localStorage.setItem(
        THEME_KEY,
        light
            ? "light"
            : "dark"
    );

}


document
    .getElementById("themeToggle")
    .addEventListener(
        "click",
        toggleTheme
    );


document
    .getElementById("topTheme")
    .addEventListener(
        "click",
        toggleTheme
    );


function loadTheme() {

    if (
        localStorage.getItem(
            THEME_KEY
        ) === "light"
    ) {

        document.body.classList.add(
            "light"
        );

    }

}


/* =========================================================
   CLEAR DATA
========================================================= */

document
    .getElementById("clearData")
    .addEventListener(
        "click",
        () => {

            if (!assets.length) {

                notify(
                    "There is no local data."
                );

                return;

            }


            const confirmed =
                confirm(
                    "This will delete all assets stored in this browser. Continue?"
                );


            if (!confirmed) {
                return;
            }


            assets = [];

            saveAssets();

            renderDashboard();

            renderAssets();

            renderMaintenance();

            renderReports();

            updateNavCount();

            notify(
                "Local data cleared."
            );

        }
    );


/* =========================================================
   COMMAND MENU
========================================================= */

const commands = [

    {
        title: "Go to Overview",
        action: () => navigate("dashboard")
    },

    {
        title: "Go to Assets",
        action: () => navigate("assets")
    },

    {
        title: "Create new asset",
        action: openNewAsset
    },

    {
        title: "Go to Maintenance",
        action: () => navigate("maintenance")
    },

    {
        title: "Go to Reports",
        action: () => navigate("reports")
    }

];


function openCommandMenu() {

    commandOverlay.classList.remove(
        "hidden"
    );


    commandInput.value = "";

    renderCommands("");

    setTimeout(
        () => commandInput.focus(),
        30
    );

}


function closeCommandMenu() {

    commandOverlay.classList.add(
        "hidden"
    );

}


function renderCommands(query) {

    const q =
        query
            .trim()
            .toLowerCase();


    const results =
        commands.filter(
            command =>
                command.title
                    .toLowerCase()
                    .includes(q)
        );


    commandResults.innerHTML =
        results
            .map(
                (command, index) => `

                    <div
                        class="command-result"
                        data-command="${index}"
                    >
                        ${escapeHTML(
                            command.title
                        )}
                    </div>

                `
            )
            .join("");


}


commandInput.addEventListener(
    "input",
    () =>
        renderCommands(
            commandInput.value
        )
);


commandResults.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                "[data-command]"
            );


        if (!item) {
            return;
        }


        const command =
            commands[
                Number(
                    item.dataset.command
                )
            ];


        closeCommandMenu();

        command.action();

    }
);


document
    .getElementById("searchShortcut")
    .addEventListener(
        "click",
        openCommandMenu
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            (event.metaKey ||
                event.ctrlKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            openCommandMenu();

        }


        if (
            event.key === "Escape"
        ) {

            closeCommandMenu();

            closeModal();

        }

    }
);


commandOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            commandOverlay
        ) {

            closeCommandMenu();

        }

    }
);


/* =========================================================
   MOBILE
========================================================= */

document
    .getElementById("mobileMenu")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("sidebar")
                .classList.toggle(
                    "open"
                );

        }
    );


/* =========================================================
   DASHBOARD FILTER SHORTCUTS
========================================================= */

document
    .querySelectorAll(".metric")
    .forEach(metric => {

        metric.addEventListener(
            "click",
            () => {

                const status =
                    metric.dataset.status;


                navigate("assets");


                statusFilter.value =
                    status;


                renderAssets();

            }
        );

    });


/* =========================================================
   UTILITIES
========================================================= */

function loadAssets() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveAssets() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(assets)
    );

}


function getAsset(id) {

    return assets.find(
        asset => asset.id === id
    );

}


function countStatus(status) {

    return assets.filter(
        asset =>
            asset.status === status
    ).length;

}


function updateNavCount() {

    document.getElementById(
        "navAssetCount"
    ).textContent =
        assets.length;

}


function getAssetInitial(asset) {

    if (asset.type) {

        return asset.type
            .slice(0, 2)
            .toUpperCase();

    }

    return "IT";

}


function statusBadge(status) {

    let className = "";


    if (
        status === "Em uso" ||
        status === "Em estoque"
    ) {

        className = "success";

    }


    if (
        status === "Recebido" ||
        status === "Reservado" ||
        status === "Manutenção"
    ) {

        className = "warning";

    }


    if (
        status === "Indisponível" ||
        status === "Perdido"
    ) {

        className = "danger";

    }


    return `

        <span
            class="status-badge ${className}"
        >
            ${escapeHTML(status)}
        </span>

    `;

}


function validIP(value) {

    const parts =
        value.split(".");


    if (
        parts.length !== 4
    ) {

        return false;

    }


    return parts.every(part => {

        if (!/^\d+$/.test(part)) {

            return false;

        }


        const number =
            Number(part);


        return (
            number >= 0 &&
            number <= 255
        );

    });

}


function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return `"${String(value)
        .replace(/"/g, '""')}"`;

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(date) {

    if (!date) {
        return "—";
    }


    return new Date(date)
        .toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

}


function formatDateShort(date) {

    if (!date) {
        return "—";
    }


    return new Date(date)
        .toLocaleDateString(
            "pt-BR"
        );

}


function formatRelative(date) {

    if (!date) {
        return "";
    }


    const difference =
        Date.now() -
        new Date(date).getTime();


    const minutes =
        Math.floor(
            difference / 60000
        );


    if (minutes < 1) {
        return "now";
    }


    if (minutes < 60) {
        return `${minutes}m`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {
        return `${hours}h`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    return `${days}d`;

}


function download(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            { type }
        );


    const url =
        URL.createObjectURL(blob);


    const anchor =
        document.createElement("a");


    anchor.href = url;

    anchor.download =
        filename;


    document.body.appendChild(
        anchor
    );


    anchor.click();

    anchor.remove();


    URL.revokeObjectURL(
        url
    );

}


function notify(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2300
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

loadTheme();

renderDashboard();

renderAssets();

renderMaintenance();

renderReports();

renderChecklist();

updateNavCount();