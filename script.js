const personagens = document.querySelectorAll('.personagem');
const expandido = document.getElementById('expandido');
const expandidoImg = document.getElementById('expandido-img');
const expandidoName = document.getElementById('expandido-name');
const expandidoDescription = document.getElementById('expandido-description');
const fechar = document.getElementById('fechar');
const main = document.querySelector('main');

let divAberta = false;
let ultimoFoco = null;

function abrirExpandidoFor(p) {
  const name = p.dataset.name;
  const color = p.dataset.color;
  const imgSrc = p.dataset.img;
  const description = p.dataset.description;

  personagens.forEach(other => {
    other.style.display = 'none';
  });

  setTimeout(() => {
    expandido.style.background = color;
    expandidoImg.src = imgSrc;
    expandidoName.textContent = name;
    expandidoDescription.textContent = description;
    // mostrar diálogo de forma acessível
    expandido.removeAttribute('hidden');
    expandido.classList.add('show');
    expandido.setAttribute('aria-hidden', 'false');
    if (main) main.inert = true; // preferível para navegadores que suportam

    // foco gerenciado
    ultimoFoco = document.activeElement;
    // tentar focar o primeiro foco dentro do dialog
    const focoInicial = expandido.querySelector('button, [tabindex="-1"], [tabindex="0"]') || fechar;
    focoInicial && focoInicial.focus();

    divAberta = true;
  }, 100);
}

personagens.forEach(p => {
  p.addEventListener('click', () => abrirExpandidoFor(p));
  // suporte básico para teclado se .personagem não for nativo
  p.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirExpandidoFor(p);
    }
  });
});

fechar.addEventListener('click', fecharExpandido);

// fechar ao clicar fora do conteúdo
expandido.addEventListener('click', e => {
  if (e.target === expandido) {
    fecharExpandido();
  }
});

// fechar com Escape e trap de foco simples
document.addEventListener('keydown', e => {
  if (!divAberta) return;
  if (e.key === 'Escape') {
    fecharExpandido();
    return;
  }

  if (e.key === 'Tab') {
    // foco trap simples: limita ao diálogo
    const focusables = expandido.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const primeiros = focusables[0];
    const ultimos = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primeiros) {
      e.preventDefault();
      ultimos.focus();
    } else if (!e.shiftKey && document.activeElement === ultimos) {
      e.preventDefault();
      primeiros.focus();
    }
  }
});

function fecharExpandido() {
  expandido.classList.remove('show');
  expandido.setAttribute('hidden', '');
  expandido.setAttribute('aria-hidden', 'true');
  divAberta = false;

  personagens.forEach(p => {
    p.style.display = 'flex';
  });

  if (main) main.inert = false;
  // retornar foco ao elemento que abriu
  if (ultimoFoco) ultimoFoco.focus();
}

// ---- Scroll para centralizar seções (exceto #inicio) ----
function scrollToCenter(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const elCenter = rect.top + rect.height / 2;
  const viewportCenter = window.innerHeight / 2;
  const delta = elCenter - viewportCenter;

  // calcula posição alvo no documento
  const targetY = window.scrollY + delta;

  window.scrollTo({ top: targetY, behavior: 'smooth' });
}

// intercepta links de navegação
document.querySelectorAll('nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id);
    // comportamento especial para inicio: rolar ao topo (mais alto possível)
    if (id === 'inicio') {
      history.pushState({ scrollTo: id }, '', `#${id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target) {
      // atualiza hash sem pular diretamente para topo
      history.pushState({ scrollTo: id }, '', `#${id}`);
      // usar pequeno timeout para permitir layout/paint
      setTimeout(() => scrollToCenter(target), 50);
    }
  });
});

// ao carregar com hash
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash;
  if (hash) {
    if (hash === '#inicio') {
      // rolar ao topo o mais alto possível
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else {
      const target = document.getElementById(hash.slice(1));
      if (target) setTimeout(() => scrollToCenter(target), 100);
    }
  }
});

// ao usar back/forward
window.addEventListener('popstate', e => {
  const hash = location.hash;
  if (hash) {
    if (hash === '#inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.getElementById(hash.slice(1));
      if (target) setTimeout(() => scrollToCenter(target), 50);
    }
  } else {
    // comportamento para remover hash (vai para topo)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

