require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - Đặt trước static files
app.use(session({
  secret: process.env.SESSION_SECRET || 'tworky-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Đặt false để hoạt động trên cả HTTP và HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

app.use(express.static('public'));

// Middleware kiểm tra đăng nhập
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// API Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, role, organization_id')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    req.session.user = data;
    
    // Lưu session trước khi trả về response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Lỗi lưu phiên đăng nhập' });
      }
      res.json({ success: true, user: data });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

// Get all users with organization info
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        fullname,
        description,
        role,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .order('id');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng' });
  }
});

// Get user by id
app.get('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        fullname,
        description,
        role,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' });
  }
});

// Create user (admin only)
app.post('/api/users', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền thực hiện' });
    }

    const { username, password, fullname, description, organization_id, role } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        password,
        fullname,
        description,
        organization_id,
        role,
        role_approve: 'normal'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Lỗi khi tạo người dùng mới' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền thực hiện' });
    }

    const { username, password, fullname, description, organization_id, role } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        username,
        password,
        fullname,
        description,
        organization_id,
        role,
        role_approve: 'normal'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền thực hiện' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
  }
});

// Get all organizations
app.get('/api/organizations', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('id');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get organizations error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng/ban' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});