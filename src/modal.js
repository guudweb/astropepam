// modal.js
function openUserModal(day, turno, index) {
  const modal = document.getElementById("userModal");
  modal.classList.remove("hidden");
  modal.dataset.day = day;
  modal.dataset.turno = turno;
  modal.dataset.index = index;
}

function closeUserModal() {
  const modal = document.getElementById("userModal");
  modal.classList.add("hidden");
}

function addUserToSelect(userName) {
  const modal = document.getElementById("userModal");
  const day = modal.dataset.day;
  const turno = modal.dataset.turno;
  const index = modal.dataset.index;

  const select = document.querySelector(
    `select[data-day="${day}"][data-turno="${turno}"][data-index="${index}"]`
  );
  const option = document.createElement("option");
  option.value = userName;
  option.text = userName;
  select.appendChild(option);
  select.value = userName;

  closeUserModal();
}

// Export functions to make them available globally
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.addUserToSelect = addUserToSelect;
