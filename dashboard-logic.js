// =========================================
// DASHBOARD LOGIC
// =========================================

let currentUser = null;
// isDev ya está definido globalmente en api-client.js

// Cargar usuario
function loadCurrentUser() {
  const userData = localStorage.getItem('scrakk_user');
  if (!userData) {
    window.location.href = 'login.html';
    return null;
  }
  currentUser = JSON.parse(userData);
  return currentUser;
}

// Inicializar dashboard
loadCurrentUser();
if (currentUser) {
  loadProfile();
}

// Navegación entre secciones
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    const section = item.getAttribute('data-section');
    if (!section) return;
    
    // Actualizar sidebar
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Actualizar sección
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    
    // Cargar datos según sección
    if (section === 'projects') loadMyProjects();
    if (section === 'extensions') loadMyExtensions();
    if (section === 'stats') loadStats();
  });
});

// Cargar perfil
async function loadProfile() {
  try {
    // Obtener avatar
    let avatarSrc = 'assets/icons/logo.png';
    
    if (window.isDev) {
      const supabaseImages = window.supabase.createClient(
        window.ENV_CONFIG.SUPABASE_IMAGES_URL,
        window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY
      );
      
      const { data: avatarData } = await supabaseImages
        .from('user_avatars')
        .select('avatar_base64')
        .eq('user_id', currentUser.id)
        .limit(1);
      
      if (avatarData && avatarData.length > 0) {
        avatarSrc = avatarData[0].avatar_base64;
      }
    }
    
    // Calcular tiempo desde creación
    const createdDate = new Date(currentUser.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const memberSince = diffDays < 30 
      ? `${diffDays} días` 
      : diffDays < 365 
        ? `${Math.floor(diffDays / 30)} meses`
        : `${Math.floor(diffDays / 365)} años`;
    
    document.getElementById('profileHeader').innerHTML = `
      <img src="${avatarSrc}" alt="${currentUser.username}" class="profile-avatar" />
      <div class="profile-info" style="flex: 1;">
        <h2>
          ${currentUser.display_name || currentUser.username}
          ${currentUser.verified ? '<span class="profile-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Verificado</span>' : ''}
        </h2>
        <p class="profile-meta">@${currentUser.username}</p>
        <p class="profile-meta">Scrakk ID: ${currentUser.scrakk_id}</p>
        <p class="profile-meta">Miembro desde hace ${memberSince}</p>
      </div>
    `;
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

// Cargar mis proyectos
async function loadMyProjects() {
  try {
    const projects = await window.API.getProjects('my', currentUser.id);
    
    if (projects.length === 0) {
      document.getElementById('myProjects').innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">No tienes proyectos públicos.</p>';
      return;
    }
    
    document.getElementById('myProjects').innerHTML = projects.map(project => `
      <div class="project-card-dash" onclick="window.location.href='producto.html?id=${project.id}'">
        <img src="${project.thumbnail || 'assets/icons/logo.png'}" class="project-thumbnail" alt="${escapeHtml(project.title)}" />
        <div class="project-details">
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description || 'Sin descripción')}</p>
          <div class="project-stats">
            <span>👁 ${project.views_count || 0}</span>
            <span>⬇ ${project.downloads_count || 0}</span>
            <span>❤ ${project.likes_count || 0}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando proyectos:', err);
    document.getElementById('myProjects').innerHTML = '<p style="color: #f85149;">Error al cargar proyectos.</p>';
  }
}

// Cargar mis extensiones
async function loadMyExtensions() {
  try {
    if (!window.isDev) {
      document.getElementById('myExtensions').innerHTML = '<p style="color: rgba(255,255,255,0.6);">Extensiones no disponibles en esta versión.</p>';
      return;
    }
    
    const supabase = window.supabase.createClient(
      window.ENV_CONFIG.SUPABASE_URL,
      window.ENV_CONFIG.SUPABASE_ANON_KEY
    );
    
    // Primero obtener el author_id del usuario
    const { data: author } = await supabase
      .from('extension_authors')
      .select('id')
      .eq('user_id', currentUser.id)
      .single();
    
    if (!author) {
      document.getElementById('myExtensions').innerHTML = '<p style="color: rgba(255,255,255,0.6);">No tienes extensiones publicadas.</p>';
      return;
    }
    
    const { data: extensions } = await supabase
      .from('extensions')
      .select('*')
      .eq('author_id', author.id)
      .eq('is_published', true);
    
    if (!extensions || extensions.length === 0) {
      document.getElementById('myExtensions').innerHTML = '<p style="color: rgba(255,255,255,0.6);">No tienes extensiones publicadas.</p>';
      return;
    }
    
    document.getElementById('myExtensions').innerHTML = extensions.map(ext => `
      <div class="project-card-dash">
        <img src="${ext.icon_url || 'assets/icons/logo.png'}" class="project-thumbnail" alt="${escapeHtml(ext.display_name)}" />
        <div class="project-details">
          <h3>${escapeHtml(ext.display_name)}</h3>
          <p>${escapeHtml(ext.description || 'Sin descripción')}</p>
          <div class="project-stats">
            <span>⬇ ${ext.downloads_count || 0}</span>
            <span>⭐ ${ext.rating_average || 0} (${ext.rating_count || 0})</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando extensiones:', err);
    document.getElementById('myExtensions').innerHTML = '<p style="color: #f85149;">Error al cargar extensiones.</p>';
  }
}

// Cargar estadísticas
async function loadStats() {
  try {
    const stats = await window.API.getUserStats(currentUser.id);
    
    // Calcular totales
    const totalViews = stats.projects.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const totalDownloads = stats.projects.reduce((sum, p) => sum + (p.downloads_count || 0), 0);
    const totalLikes = stats.projects.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalProjects = stats.projects.length;
    
    document.getElementById('statsSummary').innerHTML = `
      <div class="stat-card">
        <h4>Total Proyectos</h4>
        <div class="value">${totalProjects}</div>
      </div>
      <div class="stat-card">
        <h4>Total Vistas</h4>
        <div class="value">${totalViews}</div>
      </div>
      <div class="stat-card">
        <h4>Total Descargas</h4>
        <div class="value">${totalDownloads}</div>
      </div>
      <div class="stat-card">
        <h4>Total Likes</h4>
        <div class="value">${totalLikes}</div>
      </div>
    `;
    
    // Preparar datos para gráficos
    const projectsByDate = {};
    stats.projects.forEach(p => {
      const date = new Date(p.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      if (!projectsByDate[date]) {
        projectsByDate[date] = { downloads: 0, likes: 0 };
      }
      projectsByDate[date].downloads += p.downloads_count || 0;
      projectsByDate[date].likes += p.likes_count || 0;
    });
    
    const labels = Object.keys(projectsByDate);
    const downloadsData = labels.map(l => projectsByDate[l].downloads);
    const likesData = labels.map(l => projectsByDate[l].likes);
    
    // Gráfico de descargas
    const downloadsCtx = document.getElementById('downloadsChart').getContext('2d');
    new Chart(downloadsCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Descargas',
          data: downloadsData,
          borderColor: '#8b00ff',
          backgroundColor: 'rgba(139, 0, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { color: 'rgba(255,255,255,0.6)' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          x: { 
            ticks: { color: 'rgba(255,255,255,0.6)' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    });
    
    // Gráfico de likes
    const likesCtx = document.getElementById('likesChart').getContext('2d');
    new Chart(likesCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Likes',
          data: likesData,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { color: 'rgba(255,255,255,0.6)' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          x: { 
            ticks: { color: 'rgba(255,255,255,0.6)' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
}

// Subir avatar
async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    
    try {
      if (!window.isDev) {
        alert('Función no disponible en producción aún');
        return;
      }
      
      const supabaseImages = window.supabase.createClient(
        window.ENV_CONFIG.SUPABASE_IMAGES_URL,
        window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY
      );
      
      // Upsert avatar
      await supabaseImages.rpc('upsert_user_avatar', {
        user_uuid: currentUser.id,
        avatar_data: base64
      });
      
      alert('¡Avatar actualizado correctamente!');
      loadProfile();
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      alert('Error al actualizar avatar');
    }
  };
  reader.readAsDataURL(file);
}

// Actualizar nombre de usuario
async function updateUsername(event) {
  event.preventDefault();
  const newName = document.getElementById('newDisplayName').value.trim();
  
  if (!newName) {
    alert('Por favor ingresa un nombre');
    return;
  }
  
  try {
    if (!window.isDev) {
      alert('Función no disponible en producción aún');
      return;
    }
    
    const supabase = window.supabase.createClient(
      window.ENV_CONFIG.SUPABASE_URL,
      window.ENV_CONFIG.SUPABASE_ANON_KEY
    );
    
    await supabase
      .from('users')
      .update({ display_name: newName })
      .eq('id', currentUser.id);
    
    currentUser.display_name = newName;
    localStorage.setItem('scrakk_user', JSON.stringify(currentUser));
    
    alert('¡Nombre actualizado correctamente!');
    loadProfile();
  } catch (err) {
    console.error('Error actualizando nombre:', err);
    alert('Error al actualizar nombre');
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('scrakk_user');
  window.location.href = 'login.html';
}

// Helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
