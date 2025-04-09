const container = document.getElementById("jogos-container");
const filtroCampeonato = document.getElementById("filtroCampeonato");
const filtroClube = document.getElementById("filtro-time"); 
const filtroData = document.getElementById("filtroData");
const loading = document.getElementById("loading"); 
const botaoCarregarMais = document.getElementById("carregar-mais"); 

let todosOsJogos = [];
let jogosFiltrados = []; 
let quantidadeExibida = 0; 
const limitePorClique = 12; 

// Mostra o loading antes do fetch
loading.style.display = "block";

fetch("https://www.scorebat.com/video-api/v3/")
    .then(response => response.json())
    .then(data => {
        todosOsJogos = data.response;

        const campeonatosUnicos = [...new Set(todosOsJogos.map(jogo => jogo.competition).filter(Boolean))];
        campeonatosUnicos.sort((a, b) => a.localeCompare(b));
        campeonatosUnicos.forEach(camp => {
            const option = document.createElement("option");
            option.value = camp;
            option.textContent = camp;
            filtroCampeonato.appendChild(option);
        });

        aplicarFiltros();
    })
    .catch(error => {
        console.error("Erro ao carregar os jogos:", error);
        container.innerHTML = "Erro ao carregar os jogos.";
    })
    .finally(() => {
        loading.style.display = "none"; 
    });

filtroData.addEventListener("change", aplicarFiltros);
filtroCampeonato.addEventListener("change", aplicarFiltros);
filtroClube.addEventListener("input", aplicarFiltros);

// Aplica filtros e exibe
function aplicarFiltros() {
    const campeonatoSelecionado = filtroCampeonato.value.toLowerCase();
    const clubeBuscado = filtroClube.value.toLowerCase();
    const dataSelecionada = filtroData.value;

    const agora = new Date();

    jogosFiltrados = todosOsJogos.filter(jogo => {
        const nomeCampeonato = jogo.competition ? jogo.competition.toLowerCase() : "";
        const tituloJogo = jogo.title ? jogo.title.toLowerCase() : "";
        const dataJogo = new Date(jogo.date);

        const campeonatoOK = campeonatoSelecionado === "todos" || nomeCampeonato === campeonatoSelecionado;
        const clubeOK = tituloJogo.includes(clubeBuscado);

        let dataOK = true;
        if (dataSelecionada === "hoje") {
            dataOK = dataJogo.toDateString() === agora.toDateString();
        } else if (dataSelecionada === "ultimos3") {
            const tresDiasAtras = new Date(agora);
            tresDiasAtras.setDate(agora.getDate() - 3);
            dataOK = dataJogo >= tresDiasAtras;
        } else if (dataSelecionada === "ultimos7") {
            const seteDiasAtras = new Date(agora);
            seteDiasAtras.setDate(agora.getDate() - 7);
            dataOK = dataJogo >= seteDiasAtras;
        }

        return campeonatoOK && clubeOK && dataOK;
    });

    quantidadeExibida = 0;
    container.innerHTML = "";
    carregarMaisJogos(); 
}

// Carrega mais jogos ao clicar
function carregarMaisJogos() {
    const jogosParaExibir = jogosFiltrados.slice(quantidadeExibida, quantidadeExibida + limitePorClique);
    renderizarJogos(jogosParaExibir);
    quantidadeExibida += jogosParaExibir.length;

    if (quantidadeExibida < jogosFiltrados.length) {
        botaoCarregarMais.style.display = "block";
    } else {
        botaoCarregarMais.style.display = "none";
    }
}

function renderizarJogos(jogos) {
    if (jogos.length === 0 && quantidadeExibida === 0) {
        container.innerHTML = "<p>Nenhum jogo encontrado.</p>";
        return;
    }

    jogos.forEach(jogo => {
        const card = document.createElement("div");
        card.className = "jogo";
        card.innerHTML = `
        <h3>${jogo.title}</h3>
        <p><strong>Campeonato:</strong> ${jogo.competition}</p>
        <p><strong>Data:</strong> ${new Date(jogo.date).toLocaleString()}</p>
        <a href="${jogo.matchviewUrl}" target="_blank">
          <img src="${jogo.thumbnail}" alt="Miniatura" style="width: 100%; max-width: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        </a>
      `;
        container.appendChild(card);
    });
}


botaoCarregarMais.addEventListener("click", carregarMaisJogos);
