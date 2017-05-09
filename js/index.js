var timelineBlocks;
var offset = 0.8;
//var somaValor = 0.0;
var eventos, categorias;

function hideBlocks(blocks, offset) {
	blocks.each(function(){
		if ($(this).offset().top > $(window).scrollTop()+$(window).height()*offset){
			$(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
		}
	});
}

function showBlocks(blocks, offset) {
	var teste;
	blocks.each(function(){
		if($(this).offset().top <= $(window).scrollTop()+$(window).height()*offset){
			if ($(this).find('.cd-timeline-img').hasClass('is-hidden')){
				$(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
			}
		}
	});
}

function renderizar(conteudo) {
    var evento_html =
    `<div class="cd-timeline-block">
			<div class="cd-timeline-img cd-picture" style="background-color: ${categorias[conteudo.categoria].cor};">
				<i class="material-icons icone-timeline">${categorias[conteudo.categoria].icone}</i>
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

Promise.all([
    db.eventos.toArray(),
    db.categorias.toArray()
]).then(function(data) {
    eventos = data[0];
    categorias = data[1];
    
    eventos.forEach(renderizar);
    
    timelineBlocks = $('.cd-timeline-block');		
    hideBlocks(timelineBlocks, offset);
    //on scolling, show/animate timeline blocks when enter the viewport
    $(window).on('scroll', function(){
        window.requestAnimationFrame(function(){  showBlocks(timelineBlocks, offset); });
    });
}).catch(function(err) { throw err; });

$("#mais_opcoes").on("click", function(){
     $("#add_evento, #filtrar_evento").fadeToggle();
});











