const personagens = document.querySelectorAll('.personagem');
const expandido = document.getElementById('expandido');
const expandidoImg = document.getElementById('expandido-img');
const expandidoName = document.getElementById('expandido-name');
const expandidoDescription = document.getElementById('expandido-description');
const fechar = document.getElementById('fechar');
const main = document.querySelector('main');

let divAberta = false;
let ultimoFoco = null;
let personagemOculto = null;

function abrirExpandidoFor(p) {
  // transformar o elemento clicado em um "hero" que se move para a área do diálogo
  if (divAberta) return;
  divAberta = true;
  ultimoFoco = document.activeElement;

  const rect = p.getBoundingClientRect();

  // placeholder para manter o fluxo do layout
  const placeholder = document.createElement('div');
  placeholder.className = 'personagem-placeholder';
  placeholder.style.width = rect.width + 'px';
  placeholder.style.height = rect.height + 'px';
  placeholder.style.display = getComputedStyle(p).display;
  p.parentNode.insertBefore(placeholder, p);

  // armazenar estilos originais para restaurar depois
  p._origStyles = {
    position: p.style.position || '',
    left: p.style.left || '',
    top: p.style.top || '',
    width: p.style.width || '',
    height: p.style.height || '',
    margin: p.style.margin || '',
    zIndex: p.style.zIndex || '',
    transition: p.style.transition || '',
    background: p.style.background || '',
    color: p.style.color || ''
  };

  // capturar background/computed color atual para usar no hero
  const computed = getComputedStyle(p);
  const computedBackground = computed.background || computed.backgroundImage || computed.backgroundColor || '';
  const computedColor = computed.color || '';

  // mover para body e posicionar fixo onde estava
  p.style.position = 'fixed';
  p.style.left = rect.left + 'px';
  p.style.top = rect.top + 'px';
  p.style.width = rect.width + 'px';
  p.style.height = rect.height + 'px';
  p.style.margin = '0';
  p.style.zIndex = 2000;
  p.style.transition = 'all 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  document.body.appendChild(p);

  // aplicar o background do personagem no elemento fixo (sobrepõe o background do .hero)
  if (computedBackground) {
    p.style.background = computedBackground;
  }
  if (computedColor) {
    p.style.color = computedColor;
  }

  // calcular posição alvo (onde estava o diálogo)
  const targetWidth = Math.min(800, window.innerWidth * 0.7);
  const targetHeight = Math.min(window.innerHeight * 0.65, window.innerHeight - 80);
  const targetLeft = Math.max(120, (window.innerWidth - targetWidth) / 2);
  const targetTop = window.innerHeight / 2 - targetHeight / 2;

  // disparar animação para tamanho/posição alvo
  requestAnimationFrame(() => {
    p.style.left = targetLeft + 'px';
    p.style.top = targetTop + 'px';
    p.style.width = targetWidth + 'px';
    p.style.height = targetHeight + 'px';
  });

  // Após animação, aplicar estilo hero e inserir conteúdo (nome/descrição/fechar)
  const onEnd = () => {
    p.classList.add('hero');
    p.setAttribute('data-placeholder-id', 'true');

    // adicionar painel de informação dentro do próprio elemento
    let info = p.querySelector('.hero-info');
    if (!info) {
      info = document.createElement('div');
      info.className = 'hero-info';
      const h2 = document.createElement('h2');
      h2.textContent = p.dataset.name || '';
      const desc = document.createElement('p');
      desc.textContent = p.dataset.description || '';
      info.appendChild(h2);
      info.appendChild(desc);
      p.appendChild(info);
    }

    // adicionar botão de fechar
    let btn = p.querySelector('.hero-close');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'fechar hero-close';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Fechar');
      btn.innerHTML = '&times;';
      p.appendChild(btn);
      btn.addEventListener('click', () => fecharHero(p, placeholder), { once: true });
    }

    // foco no botão fechar
    btn.focus();
  };

  p.addEventListener('transitionend', onEnd, { once: true });
}

function fecharHero(p, placeholder) {
  // remover estado hero e animar de volta para o placeholder
  p.classList.remove('hero');

  // remover info e botão
  const info = p.querySelector('.hero-info');
  const btn = p.querySelector('.hero-close');
  if (info) info.remove();
  if (btn) btn.remove();

  // calcular posição original com base no placeholder
  const rect = placeholder.getBoundingClientRect();

  // animar de volta
  requestAnimationFrame(() => {
    p.style.left = rect.left + 'px';
    p.style.top = rect.top + 'px';
    p.style.width = rect.width + 'px';
    p.style.height = rect.height + 'px';
  });

  p.addEventListener('transitionend', () => {
    // restaurar estilos originais e reinserir no lugar do placeholder
    p.style.position = p._origStyles.position;
    p.style.left = p._origStyles.left;
    p.style.top = p._origStyles.top;
    p.style.width = p._origStyles.width;
    p.style.height = p._origStyles.height;
    p.style.margin = p._origStyles.margin;
    p.style.zIndex = p._origStyles.zIndex;
    p.style.transition = p._origStyles.transition;
  p.style.background = p._origStyles.background;
  p.style.color = p._origStyles.color;

    placeholder.parentNode.insertBefore(p, placeholder);
    placeholder.remove();

    divAberta = false;
    if (ultimoFoco) ultimoFoco.focus();
  }, { once: true });
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

  // restaurar somente o personagem que foi ocultado
  if (personagemOculto) {
    personagemOculto.style.display = 'flex';
    personagemOculto = null;
  }

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

