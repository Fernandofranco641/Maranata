// ============================================
// Menu mobile
// ============================================
const menuBotao = document.getElementById('menu-botao');
const nav = document.getElementById('nav');

menuBotao.addEventListener('click', () => {
  const aberto = nav.classList.toggle('aberto');
  menuBotao.classList.toggle('aberto', aberto);
  menuBotao.setAttribute('aria-expanded', aberto);
});

// fecha o menu ao clicar em um link (útil no celular)
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('aberto');
    menuBotao.classList.remove('aberto');
    menuBotao.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// Animação de revelar elementos ao rolar a página
// ============================================
const elementosRevelaveis = document.querySelectorAll('.reveal');

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
      observador.unobserve(entrada.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

const iniciarReveals = () => elementosRevelaveis.forEach(el => observador.observe(el));

const intro = document.getElementById('intro');
const videoHero = document.querySelector('.meu-video');
let videoMostrado = false;

// o vídeo só aparece (e começa do início) quando o site é revelado
function mostrarVideo() {
  if (videoMostrado || !videoHero) return;
  videoMostrado = true;
  videoHero.currentTime = 0;
  videoHero.play().catch(() => {});
  videoHero.classList.add('visivel');
}

if (intro) {
  // o site começa a aparecer quando o fundo da intro começa a sumir
  intro.addEventListener('animationstart', (e) => {
    if (e.animationName === 'intro-sai') {
      iniciarReveals();
      mostrarVideo();
    }
  });
  intro.addEventListener('animationend', (e) => {
    if (e.animationName === 'intro-sai') intro.remove();
  });
  // clicar ou tocar pula a intro
  intro.addEventListener('click', () => {
    const logo = intro.querySelector('.intro-logo');
    if (logo) logo.style.animation = 'intro-logo-sai 0.2s ease forwards';
    intro.style.animation = 'intro-sai 0.3s ease 0.2s forwards';
  });
  // garantia: se algo travar a animação, o site aparece mesmo assim
  setTimeout(() => { iniciarReveals(); mostrarVideo(); intro.remove(); }, 3000);
} else {
  iniciarReveals();
  mostrarVideo();
}

// ============================================
// Carrossel de fotos (setas para os lados)
// ============================================
document.querySelectorAll('.carrossel').forEach(carrossel => {
  const trilho = carrossel.querySelector('.carrossel-trilho');
  const slides = Array.from(carrossel.querySelectorAll('.carrossel-slide'));
  const setaAnterior = carrossel.querySelector('.carrossel-seta-anterior');
  const setaProxima = carrossel.querySelector('.carrossel-seta-proxima');
  const indicadores = carrossel.querySelector('.carrossel-indicadores');

  if (!trilho || slides.length === 0) return;

  let indiceAtual = 0;
  const total = slides.length;

  // cria as bolinhas indicadoras, uma por foto
  const pontos = slides.map((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.className = 'carrossel-ponto';
    ponto.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
    ponto.addEventListener('click', () => irPara(i));
    indicadores?.appendChild(ponto);
    return ponto;
  });

  function atualizar() {
    trilho.style.transform = `translateX(-${indiceAtual * 100}%)`;
    pontos.forEach((ponto, i) => ponto.classList.toggle('ativo', i === indiceAtual));
  }

  function irPara(indice) {
    indiceAtual = (indice + total) % total; // roda em loop nas duas pontas
    atualizar();
  }

  setaProxima?.addEventListener('click', () => irPara(indiceAtual + 1));
  setaAnterior?.addEventListener('click', () => irPara(indiceAtual - 1));

  // arrastar/deslizar no celular
  let inicioX = null;
  trilho.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
  trilho.addEventListener('touchend', (e) => {
    if (inicioX === null) return;
    const diferenca = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferenca) > 40) {
      diferenca < 0 ? irPara(indiceAtual + 1) : irPara(indiceAtual - 1);
    }
    inicioX = null;
  }, { passive: true });

  atualizar();
});

// ============================================
// Trilha decorativa: desenha o caminho conforme a rolagem
// ============================================
const trilhaPath = document.getElementById('trilha-path');

if (trilhaPath) {
  const comprimento = trilhaPath.getTotalLength();
  trilhaPath.style.strokeDasharray = `${comprimento}`;
  trilhaPath.style.strokeDashoffset = `${comprimento}`;

  const atualizarTrilha = () => {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? window.scrollY / alturaTotal : 0;
    const offset = comprimento - (comprimento * Math.min(progresso, 1));
    trilhaPath.style.strokeDashoffset = `${offset}`;
  };

  window.addEventListener('scroll', atualizarTrilha);
  window.addEventListener('resize', atualizarTrilha);
  atualizarTrilha();
}
// ============================================
// Card com galeria: setas trocam a foto e o texto junto
// ============================================
document.querySelectorAll('.cartao-galeria').forEach(galeria => {
  const trilho = galeria.querySelector('.galeria-trilho');
  const fotos = trilho ? Array.from(trilho.children) : [];
  const textos = Array.from(galeria.querySelectorAll('.galeria-texto'));
  const setaAnterior = galeria.querySelector('.galeria-seta-anterior');
  const setaProxima = galeria.querySelector('.galeria-seta-proxima');
  const pontosCaixa = galeria.querySelector('.galeria-pontos');

  if (fotos.length === 0) return;

  let atual = 0;

  // sem mais de uma foto, não precisa de setas nem bolinhas
  if (fotos.length < 2) {
    setaAnterior?.remove();
    setaProxima?.remove();
    pontosCaixa?.remove();
    return;
  }

  const pontos = fotos.map((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.className = 'galeria-ponto';
    ponto.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
    ponto.addEventListener('click', () => irPara(i));
    pontosCaixa?.appendChild(ponto);
    return ponto;
  });

  function atualizar() {
    trilho.style.transform = `translateX(-${atual * 100}%)`;
    pontos.forEach((ponto, i) => ponto.classList.toggle('ativo', i === atual));
    textos.forEach((texto, i) => {
      texto.classList.toggle('ativo', i === atual);
      texto.setAttribute('aria-hidden', i === atual ? 'false' : 'true');
    });
  }

  function irPara(indice) {
    atual = (indice + fotos.length) % fotos.length; // volta ao começo no fim
    atualizar();
  }

  setaProxima?.addEventListener('click', () => irPara(atual + 1));
  setaAnterior?.addEventListener('click', () => irPara(atual - 1));

  // deslizar o dedo no celular
  let inicioX = null;
  trilho.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
  trilho.addEventListener('touchend', (e) => {
    if (inicioX === null) return;
    const diferenca = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferenca) > 40) irPara(diferenca < 0 ? atual + 1 : atual - 1);
    inicioX = null;
  }, { passive: true });

  atualizar();
});
