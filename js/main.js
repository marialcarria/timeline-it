var timelineBlocks;
var offset = 0.8;
var categorias = [];
//var somaValor = 0.0;

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

function get_eventos() {
	$.getJSON('eventos.json').then(
		function(data) {
			data.forEach(renderizar);
			
			timelineBlocks = $('.cd-timeline-block');		
			hideBlocks(timelineBlocks, offset);
			//on scolling, show/animate timeline blocks when enter the viewport
			$(window).on('scroll', function(){
				window.requestAnimationFrame(function(){  showBlocks(timelineBlocks, offset); });
			});
		},
		function() {
			alert('Ocorreu um erro.');
		}
	);
}

$.getJSON('categorias.json').then(
    function(data) {
        data.forEach(function(c){
        	categorias[c.id_categoria] = {titulo: c.titulo, icone: c.icone, cor: c.cor};
        	console.log(categorias[c.id_categoria].icone);	
        });
		get_eventos();
        $(window).trigger('categorias-load');
    },
    function() {
        alert('Ocorreu um erro ao carregar as categorias.');
    }
);

function renderizar_categorias(seletor){
    var html = "";
    categorias.forEach(function(c){
        html +=`<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">
                    <button class="btn btn-categoria" style="background-color: ${c.cor};"><i class="material-icons" style="padding-top: 30%; font-size: 4em;">${c.icone}</i><br><span style="font-size: 1em;">${c.titulo}</span></button>  
                </div>`;  
    });   
    $(seletor).append(html);                     
}

$(window).on('categorias-load', function(){
    renderizar_categorias(".lista-categorias");
});
        