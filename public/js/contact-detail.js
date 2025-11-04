async function loadUserDetail() {
  try {
    // Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
      window.location.href = '/contacts.html';
      return;
    }

    // Lấy thông tin người dùng
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Không thể tải thông tin người dùng');
    }

    const user = await response.json();
    const detailContainer = document.getElementById('userDetail');

    const organizationName = user.organizations ? user.organizations.name : 'Chưa có';

    detailContainer.innerHTML = `
      <div class="detail-item">
        <label>Tên đăng nhập</label>
        <div class="value">${user.username}</div>
      </div>
      <div class="detail-item">
        <label>Họ và tên</label>
        <div class="value">${user.fullname || 'Chưa có'}</div>
      </div>
      <div class="detail-item">
        <label>Phòng/ban</label>
        <div class="value">${organizationName}</div>
      </div>
      <div class="detail-item">
        <label>Mô tả</label>
        <div class="value">${user.description || 'Chưa có'}</div>
      </div>
    `;

  } catch (error) {
    console.error('Lỗi:', error);
    document.getElementById('userDetail').innerHTML = 
      '<div class="error-message">Lỗi khi tải dữ liệu</div>';
  }
}

// Load dữ liệu khi trang được tải
loadUserDetail();