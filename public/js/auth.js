// Xử lý đăng xuất
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', {
          method: 'POST'
        });
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        window.location.href = '/login.html';
      }
    });
  }
});

// Hàm kiểm tra quyền admin
async function checkAdmin() {
  try {
    const response = await fetch('/api/me');
    if (!response.ok) {
      window.location.href = '/login.html';
      return false;
    }
    const user = await response.json();
    return user.role === 'admin';
  } catch (error) {
    window.location.href = '/login.html';
    return false;
  }
}