const personagens = document.querySelectorAll('.personagem');
const expandido = document.getElementById('expandido');
const expandidoImg = document.getElementById('expandido-img');
const expandidoName = document.getElementById('expandido-name');
const expandidoDescription = document.getElementById('expandido-description');
const fechar = document.getElementById('fechar');

let divAberta = false;

personagens.forEach(p => {
  p.addEventListener('click', () => {
    const name = p.dataset.name;
    const color = p.dataset.color;
    const imgSrc = p.dataset.img; // Correção aqui
    const description = p.dataset.description;

    personagens.forEach(other => {
      other.style.display = 'none';
    });

    setTimeout(() => {
      expandido.style.background = color;
      expandidoImg.src = imgSrc;
      expandidoName.textContent = name;
      expandidoDescription.textContent = description;
      expandido.classList.add('show');
      divAberta = true;
    }, 100);
  });
});

fechar.addEventListener('click', fecharExpandido);

expandido.addEventListener('click', e => {
  if (e.target === expandido) {
    fecharExpandido();
  }
});

function fecharExpandido() {
  expandido.classList.remove('show');
  divAberta = false;

  personagens.forEach(p => {
    p.style.display = 'flex';
  });
}
