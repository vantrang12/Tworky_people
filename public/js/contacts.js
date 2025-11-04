let isAdmin = false;
let userToDelete = null;

async function loadContacts() {
  try {
    // Kiểm tra quyền admin
    isAdmin = await checkAdmin();
    
    if (isAdmin) {
      document.getElementById('adminActions').style.display = 'block';
      document.getElementById('actionsHeader').style.display = 'table-cell';
    }

    // Lấy danh sách người dùng
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Không thể tải danh sách người dùng');
    }

    const users = await response.json();
    const tableBody = document.getElementById('contactsTable');
    tableBody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      
      // Thêm sự kiện click để xem chi tiết
      row.style.cursor = 'pointer';
      row.onclick = (e) => {
        // Không chuyển trang nếu click vào nút action
        if (!e.target.closest('button')) {
          window.location.href = `/contact-detail.html?id=${user.id}`;
        }
      };

      const organizationName = user.organizations ? user.organizations.name : 'Chưa có';

      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.fullname || ''}</td>
        <td>${organizationName}</td>
        ${isAdmin ? `
          <td class="actions">
            <button class="btn-success" onclick="event.stopPropagation(); editUser(${user.id})">Sửa</button>
            <button class="btn-danger" onclick="event.stopPropagation(); deleteUser(${user.id})">Xóa</button>
          </td>
        ` : ''}
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Lỗi:', error);
    document.getElementById('contactsTable').innerHTML = 
      '<tr><td colspan="3">Lỗi khi tải dữ liệu</td></tr>';
  }
}

function editUser(userId) {
  window.location.href = `/contact-form.html?id=${userId}`;
}

function deleteUser(userId) {
  userToDelete = userId;
  document.getElementById('deleteModal').classList.add('show');
}

// Xử lý modal xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!userToDelete) return;

  try {
    const response = await fetch(`/api/users/${userToDelete}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      document.getElementById('deleteModal').classList.remove('show');
      loadContacts();
    } else {
      alert('Lỗi khi xóa người dùng');
    }
  } catch (error) {
    alert('Lỗi kết nối server');
  }

  userToDelete = null;
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
  document.getElementById('deleteModal').classList.remove('show');
  userToDelete = null;
});

// Load dữ liệu khi trang được tải
loadContacts();