// =========================================
// NAVBAR - Componente Reutilizable
// Animaciones y comportamiento de la barra de navegación
// =========================================

(function() {
  'use strict';

  // ========================================
  // ANIMACIÓN DE ESCRITURA DEL LOGO
  // ========================================
  function initTypingAnimation() {
    const text = "Scrakk Code Editor";
    const typingText = document.querySelector('.typing-text');
    const cursor = document.querySelector('.cursor');
    const logo = document.querySelector('.logo img');
    
    if (!typingText) return;
    
    let charIndex = 0;
    
    function type() {
      if (charIndex < text.length) {
        typingText.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
      } else if (cursor) {
        cursor.style.animation = 'cursorFadeOut 0.5s forwards';
      }
    }
    
    if (logo) {
      logo.addEventListener('animationend', () => setTimeout(type, 300));
    } else {
      type();
    }
  }

  // ========================================
  // EFECTO DE SOMBRA AL HACER SCROLL
  // ========================================
  function initScrollEffect() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // ========================================
  // HOVER ANIMADO DE LOS ENLACES
  // ========================================
  function initHoverEffect() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    // Obtener solo los enlaces <a>, excluyendo buttons y user-menu
    const links = Array.from(navLinks.querySelectorAll('a')).filter(link => 
      !link.classList.contains('nav-button') && 
      !link.closest('.user-menu')
    );
    
    let hoverTimeout;
    
    function setHoverFor(el) {
      if (!el) return;
      const linkRect = el.getBoundingClientRect();
      const navRect = navLinks.getBoundingClientRect();
      const leftPos = linkRect.left - navRect.left;
      
      navLinks.style.setProperty('--hover-left', `${leftPos}px`);
      navLinks.style.setProperty('--hover-width', `${linkRect.width}px`);
      navLinks.classList.add('has-hover');
    }
    
    // Determinar enlace activo según la página actual
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    let activeLink = null;
    
    if (currentPage.includes('proyectos')) {
      activeLink = links.find(a => a.getAttribute('href')?.includes('proyectos'));
    } else if (currentPage.includes('home') || currentPage === '') {
      // En home, buscar el primer enlace con # o sin proyectos/login
      activeLink = links.find(a => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('#') || (href.includes('home') && href.includes('#'));
      });
    }
    
    // Establecer hover inicial si hay enlace activo
    if (activeLink) {
      setTimeout(() => setHoverFor(activeLink), 100);
    }
    
    // Event listeners para cada enlace
    links.forEach(link => {
      link.addEventListener('mouseenter', function() {
        clearTimeout(hoverTimeout);
        setHoverFor(this);
      });
      
      link.addEventListener('mouseleave', function() {
        hoverTimeout = setTimeout(() => {
          if (!links.some(l => l.matches(':hover'))) {
            // Restaurar al enlace activo o quitar hover
            if (activeLink) {
              setHoverFor(activeLink);
            } else {
              navLinks.classList.remove('has-hover');
            }
          }
        }, 50);
      });
    });
    
    navLinks.addEventListener('mouseleave', function() {
      // Mantener hover del activo al salir del contenedor
      if (activeLink) {
        setHoverFor(activeLink);
      } else {
        navLinks.classList.remove('has-hover');
      }
    });
  }

  // ========================================
  // SISTEMA DE AUTENTICACIÓN DEL NAVBAR
  // ========================================
  function initUserSession() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userButton = document.getElementById('userButton');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Cargar sesión desde localStorage
    const userData = localStorage.getItem('scrakk_user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Mostrar menú de usuario
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = user.username || user.display_name || 'Usuario';
        
        // Toggle dropdown
        if (userButton && userDropdown) {
          userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
          });
          
          // Cerrar dropdown al clicar fuera
          document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
          });
        }
        
        // Logout
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('scrakk_user');
            window.location.href = 'home.html';
          });
        }
        
      } catch (err) {
        console.error('Error cargando sesión:', err);
        localStorage.removeItem('scrakk_user');
      }
    } else {
      // Mostrar botón de login
      if (loginBtn) loginBtn.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  function init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initTypingAnimation();
        initScrollEffect();
        initHoverEffect();
        initUserSession();
      });
    } else {
      initTypingAnimation();
      initScrollEffect();
      initHoverEffect();
      initUserSession();
    }
  }

  // Ejecutar inicialización
  init();

  // Exportar funciones globalmente por si se necesitan
  window.ScrakKNavbar = {
    initTypingAnimation,
    initScrollEffect,
    initHoverEffect,
    reinit: init
  };
})();
