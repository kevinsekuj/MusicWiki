const allEditButtons = document.querySelectorAll(".editButton");
const allDeleteButtons = document.querySelectorAll(".deleteButton");
let rowRestoreValues = [];
let editInProgress = false;

// Trim function for text inputs
if (typeof String.prototype.trim === "undefined") {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, "");
  };
}

const addEditButtonListener = (editButton) => {
  editButton.addEventListener("click", () => {
    if (editInProgress) {
      alert(
        "Save or cancel modifications to your row before modifying another row."
      );
      return;
    }

    // bool until changes made, take focus off button
    editInProgress = true;
    editButton.blur();

    // grab td column holding edit & delete | row | rowId | artist name column
    const oldButtonCell = editButton.parentElement;
    const row = editButton.parentElement.parentElement;
    const rowId = row.getAttribute("id");

    // Save pre-edited values in case user cancels modifications
    // e.g. array will save [ "Crystal Castles", "2"] for artist & label ID

    rowRestoreValues = Object.values(row.children).map(
      (child) => child.innerHTML
    );
    rowRestoreValues.push(oldButtonCell);

    // Grab all columns from row except first and last
    // Create new: <td> -> <input type="text">
    for (let i = 1; i < row.children.length - 1; i++) {
      // Build the text input and its properties
      const input = document.createElement("input");
      input.id = `i${i}`;
      input.type = "text";
      input.autofocus = i === 1 ? true : false;
      input.value = `${rowRestoreValues[i].trim()}`;
      input.onmouseover =
        "this.setSelectionRange(this.value.length,this.value.length);";
      input.onfocus =
        "this.setSelectionRange(this.value.length,this.value.length);";

      // Build the parent <td>
      const newEditableColumn = document.createElement("td");
      newEditableColumn.appendChild(input);

      // Replace row <td> with this newly built <td>
      row.replaceChild(newEditableColumn, row.children[i]);
    }

    // update button column buttons: edit/delete -> save/cancel
    newButtonCell = document.createElement("td");
    newButtonCell.innerHTML = `
    <button class="button is-small is-primary" id="saveBtn${rowId}" style="margin-right:2px;">
    <strong>Save</strong>
    <span class="icon is-small">
      <i class="fas fa-check" aria-hidden="true"></i>
    </span>
    </button>
    <button class="button is-small is-danger" id="cancelBtn${rowId}" style="margin-right:2px;">
    <strong>Cancel</strong>
    <span class="icon is-small">
      <i class="fas fa-ban" aria-hidden="true"></i>
    </span>
    </button>
    `;

    row.replaceChild(newButtonCell, oldButtonCell);

    // Add listener to SAVE button
    document.getElementById(`saveBtn${rowId}`).addEventListener("click", () => {
      const rowCells = Object.values(row.children);

      // get user input values
      const values = rowCells
        .filter((child) => child.firstChild.nodeName === "INPUT")
        .map((td) => td.firstChild.value);

      values.forEach((value, i) => {
        rowCells[i + 1].innerHTML = `<td>${value}</td>`;
      });

      // Restore edit/delete buttons
      row.children[3].innerHTML = rowRestoreValues[3];

      const buttonCell = row.children[row.children.length - 1];
      const editButton = buttonCell.firstElementChild;
      const deleteButton = editButton.nextElementSibling;

      // Add listener to edit button
      addEditButtonListener(editButton);

      // Add listener to cancel button
      addDeleteButtonListener(deleteButton);

      rowRestoreValues.length = 0;
      editInProgress = false;
    });

    // Add listener to CANCEL button
    document
      .getElementById(`cancelBtn${rowId}`)
      .addEventListener("click", () => {
        for (let i = 0; i < row.children.length; i++) {
          row.children[i].innerHTML = rowRestoreValues[i];
        }
        const buttonCell = row.children[row.children.length - 1];
        const editButton = buttonCell.firstElementChild;
        const deleteButton = editButton.nextElementSibling;

        // Add listener to edit button
        addEditButtonListener(editButton);

        // Add listener to cancel button
        addDeleteButtonListener(deleteButton);

        rowRestoreValues.length = 0;
        editInProgress = false;
        document.activeElement.blur();
      });
    row.children[1].focus();
  });
};

const addDeleteButtonListener = (deleteButtonElement) => {
  deleteButtonElement.addEventListener("click", (e) => {
    if (editInProgress) {
      alert(
        "Save or cancel modifications to your row before modifying another row."
      );
      return;
    }
    const row = deleteButtonElement.parentElement.parentElement;
    const id = row.getAttribute("id");
    row.parentElement.removeChild(row);

    const deleteRequest = async (id) => {
      await fetch("/artist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });
    };

    deleteRequest(id);
    e.preventDefault();
  });
};

// Add editing functionality to all edit buttons on page
allEditButtons.forEach((button) => addEditButtonListener(button));

// Add delete functionality to all delete buttons on page
allDeleteButtons.forEach((button) => addDeleteButtonListener(button));

// Functionality for navbar burger resizing
const navbarBurger = document.querySelectorAll(".navbar-burger");
navbarBurger.forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.dataset.target;
    const targ = document.getElementById(target);

    el.classList.toggle("is-active");
    targ.classList.toggle("is-active");
  });
});

// Search results popup
const searchBtn = document.getElementById("searchForm");
searchBtn.addEventListener("submit", (e) => {
  // popUpWindow function will center the popup in the parent window
  const popupWindow = (url, windowName, win, w, h) => {
    const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
    const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;
    return win.open(
      url,
      windowName,
      `toolbar=no, location=no, directories=no, status=no, 
      menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, 
      width=${w}, height=${h}, top=${y}, left=${x}`
    );
  };
  const searchParam = document.getElementById("searchQueryInput").value;
  const url = "/search?searchQuery=" + searchParam;
  popupWindow(url, "popup", window, 800, 500);
  e.preventDefault();
});
