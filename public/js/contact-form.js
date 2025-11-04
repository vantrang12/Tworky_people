let isEditMode = false;
let userId = null;

async function init() {
  // Kiểm tra quyền admin
  const admin = await checkAdmin();
  if (!admin) {
    alert('Bạn không có quyền truy cập trang này');
    window.location.href = '/contacts.html';
    return;
  }

  // Load danh sách organizations
  await loadOrganizations();

  // Kiểm tra nếu là chế độ sửa
  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get('id');

  if (userId) {
    isEditMode = true;
    document.getElementById('formTitle').textContent = 'Chỉnh sửa người dùng';
    await loadUserData(userId);
  }
}

async function loadOrganizations() {
  try {
    const response = await fetch('/api/organizations');
    if (!response.ok) throw new Error('Không thể tải danh sách phòng/ban');

    const organizations = await response.json();
    const select = document.getElementById('organization_id');

    organizations.forEach(org => {
      const option = document.createElement('option');
      option.value = org.id;
      option.textContent = org.name;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Lỗi:', error);
  }
}

async function loadUserData(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Không thể tải thông tin người dùng');

    const user = await response.json();

    document.getElementById('username').value = user.username;
    document.getElementById('password').value = user.password;
    document.getElementById('fullname').value = user.fullname || '';
    document.getElementById('description').value = user.description || '';
    document.getElementById('organization_id').value = user.organization_id || '';
    document.getElementById('role').value = user.role || 'user';

  } catch (error) {
    console.error('Lỗi:', error);
    alert('Lỗi khi tải dữ liệu người dùng');
    window.location.href = '/contacts.html';
  }
}

// Xử lý form submit
document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = '';

  const formData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    fullname: document.getElementById('fullname').value,
    description: document.getElementById('description').value,
    organization_id: document.getElementById('organization_id').value || null,
    role: document.getElementById('role').value
  };

  try {
    let response;
    
    if (isEditMode) {
      response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    } else {
      response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    }

    const data = await response.json();

    if (response.ok) {
      alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      window.location.href = '/contacts.html';
    } else {
      errorMessage.textContent = data.error || 'Có lỗi xảy ra';
    }

  } catch (error) {
    errorMessage.textContent = 'Lỗi kết nối server';
  }
});

// Khởi tạo trang
init();