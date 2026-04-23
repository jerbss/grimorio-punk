// Estado do Jogo de Cartas
let unrevealedProjects = [1, 2, 3, 4, 5];
const romanNumerals = ["", "I", "II", "III", "IV", "V"];
let isDrawing = false;

// Função para embaralhar os projetos
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para dispor as cartas em Leque (em Arco Lado a Lado)
// NOTA: Usa TODAS as cartas (incluindo fantasmas) para manter ângulos constantes
function updateFan() {
    const cards = document.querySelectorAll('.tarot-card');
    const count = cards.length;
    
    // Se acabaram as cartas, esconde a mesa de leitura
    if (count === 0) {
        document.querySelector('.instruction-text').style.display = 'none';
        document.getElementById('card-fan').style.height = '0px';
        return;
    }

    const centerIndex = (count - 1) / 2;

    cards.forEach((card, index) => {
        const dist = index - centerIndex;
        const angle = dist * 8; // Grau de rotação suave em arco
        const yOffset = Math.abs(dist) * Math.abs(dist) * 18; // Curva parabólica vertical (U) - aumentado para mais espaço
        
        // Atualiza a posição base para o hover saber como se comportar
        card.dataset.angle = angle;
        card.dataset.yOffset = yOffset;
        card.dataset.baseZIndex = 5 - Math.abs(dist);
        
        // Reinicia a transição para reposicionar suavemente
        card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s, z-index 0s';
        card.style.transform = `translateY(${yOffset}px) rotate(${angle}deg)`;
        card.style.zIndex = card.dataset.baseZIndex;
    });
}

// Função para scroll suave para seções
function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Inicialização quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔮 Os Arquivos Criativos - As cartas estão embaralhadas');
    
    // 1. Esconder todos os projetos do HTML
    document.querySelectorAll('.project-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // 2. Embaralhar o "Destino" (a ordem dos projetos que vão aparecer)
    shuffle(unrevealedProjects);

    // 3. Criar as 5 Cartas visuais na mesa
    const fanContainer = document.getElementById('card-fan');
    if (fanContainer) {
        for (let i = 0; i < 5; i++) {
            const card = document.createElement('div');
            card.className = 'tarot-card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back"><span class="card-roman"></span></div>
                </div>
            `;
            
            // Lógica ao passar o mouse (Hover)
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('flipped') && !card.classList.contains('drawn')) {
                    const angle = card.dataset.angle;
                    const yOffset = card.dataset.yOffset;
                    card.style.transform = `translateY(${yOffset - 30}px) rotate(${angle}deg) scale(1.05)`;
                    card.style.zIndex = 10; // Traz para frente ao selecionar
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('flipped') && !card.classList.contains('drawn')) {
                    const angle = card.dataset.angle;
                    const yOffset = card.dataset.yOffset;
                    card.style.transform = `translateY(${yOffset}px) rotate(${angle}deg)`;
                    card.style.zIndex = card.dataset.baseZIndex; // Volta pro estado normal
                }
            });
            
            // Lógica ao Clicar (Comprar a carta)
            card.addEventListener('click', () => {
                if (isDrawing || card.classList.contains('flipped')) return;
                isDrawing = true;
                
                // Pega o próximo projeto na fila embaralhada
                const projectId = unrevealedProjects.pop();
                const numeral = romanNumerals[projectId];
                
                // Prepara a face virada da carta com o Número Romano correspondente
                card.querySelector('.card-roman').textContent = numeral;
                
                // Animação da Virada 3D da Carta, elevando a partir da sua curva Y
                card.classList.add('flipped');
                card.style.transform = `translateY(${card.dataset.yOffset - 80}px) rotate(0deg) scale(1.2)`;
                card.style.zIndex = 50;
                
                // Espera a pessoa absorver o mistério e o suspense
                setTimeout(() => {
                    // Remove a carta do leque (Fade Out)
                    card.classList.add('drawn');
                    
                    // Revela a seção do projeto no site
                    const section = document.getElementById(`projeto-${projectId}`);
                    if (section) section.style.display = 'block';
                    
                    // Destranca o link correspondente no Pilar Lateral
                    const navLink = document.querySelector(`.side-link[data-id="${projectId}"]`);
                    if (navLink) navLink.classList.remove('locked');
                    
                    // Reposiciona o Leque, faz o scroll, e libera para o próximo clique
                    setTimeout(() => {
                        updateFan();
                        scrollTo(`#projeto-${projectId}`);
                        isDrawing = false;
                    }, 500); 
                    
                }, 1600); // 1.6 segundos admirando a carta antes do pulo
            });
            
            fanContainer.appendChild(card);
        }
        
        // Espalhar o Leque
        updateFan();
    }

    // Adiciona interatividade manual aos links de navegação já destrancados
    const navLinks = document.querySelectorAll('.side-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if(!link.classList.contains('locked')) {
                const href = link.getAttribute('href');
                scrollTo(href);
            }
        });
    });

    // Observer para atualizar botão ativo no pilar lateral pelo scroll
    const sections = document.querySelectorAll('.project-section, #reading-table');
    const observerOptions = { root: null, rootMargin: '-40% 0px -60% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => observer.observe(section));

    // CAROUSEL GAMIFICADO
    const carousels = document.querySelectorAll('.image-carousel');
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-image');
        const dots = carousel.querySelectorAll('.dot');
        const prevBtn = carousel.querySelector('.carousel-nav.prev');
        const nextBtn = carousel.querySelector('.carousel-nav.next');
        
        let currentIndex = 0;

        function updateCarousel(index) {
            // Wrap around
            if (index >= images.length) currentIndex = 0;
            else if (index < 0) currentIndex = images.length - 1;
            else currentIndex = index;

            // Atualiza visibilidade das imagens
            images.forEach((img, i) => {
                img.style.display = i === currentIndex ? 'block' : 'none';
            });

            // Atualiza dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        if (images.length <= 1) {
            // Esconde botões e dots se houver apenas 1 imagem
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            const dotsContainer = carousel.querySelector('.carousel-dots');
            if (dotsContainer) dotsContainer.style.display = 'none';
        } else {
            // Botões de navegação
            if (prevBtn) prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
            if (nextBtn) nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));

            // Dots clicáveis
            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => updateCarousel(i));
            });
        }

        // Inicializa na primeira imagem
        updateCarousel(0);
    });
});