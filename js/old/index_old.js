
function renderizar(conteudo) {
    var evento_html =
    `<div class="cd-timeline-block">
			<div class="cd-timeline-img cd-picture">
				<i class="material-icons">face</i>
			</div>

			<div class="cd-timeline-content">
				<h2>${conteudo.titulo}</h2>
				<p>${conteudo.descricao}</p>
				<span class="mdl-chip mdl-chip-valor">
				    <span class="mdl-chip__text">R$ ${conteudo.valor}</span>
				</span>
				<span class="cd-date">${conteudo.ts_ini}</span>
			</div>
		</div>`;
    $('section').append(evento_html);
}

$.getJSON('eventos.json').then(
    function(data) {
        data.forEach(renderizar);
    },
    function() {
        alert('Ocorreu um erro ao carregar os eventos.');
    }
)

var categorias = [];
$.getJSON('categorias.json').then(
    function(data) {
        data.forEach(function(c){
        	categorias[c.id_categoria] = {titulo: c.titulo, icone: c.icone, cor: c.cor};	
        });
    },
    function() {
        alert('Ocorreu um erro ao carregar as categorias.');
    }
)
