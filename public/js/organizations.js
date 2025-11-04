async function loadOrganizations() {
  try {
    const response = await fetch('/api/organizations');
    if (!response.ok) {
      throw new Error('Không thể tải danh sách phòng/ban');
    }

    const organizations = await response.json();
    const tableBody = document.getElementById('organizationsTable');
    tableBody.innerHTML = '';

    if (organizations.length === 0) {
      tableBody.innerHTML = '<tr><td>Không có dữ liệu</td></tr>';
      return;
    }

    organizations.forEach(org => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${org.name}</td>`;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Lỗi:', error);
    document.getElementById('organizationsTable').innerHTML = 
      '<tr><td>Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Load dữ liệu khi trang được tải
loadOrganizations();