var timelineBlocks;
var offset = 0.8;
var eventos, categorias;
var f_ini, f_fim, f_categorias;
if(param.filtro_ini){// || localStorage.getItem("filtro_categorias")){
	f_ini = moment(param.filtro_ini, "YYYY-MM-DD").toDate();
}
if(param.filtro_fim){// || localStorage.getItem("filtro_categorias")){
	f_fim = moment(param.filtro_fim, "YYYY-MM-DD").toDate();
}
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
	var categoria = categorias.filter(function(c){
		return c.id_categoria == conteudo.categoria;
	})[0];
    var evento_html =
    `<div class="cd-timeline-block">
			<div class="cd-timeline-img cd-picture" data-categoria="${conteudo.categoria}" style="background-color: ${categoria.cor};">
				<i class="material-icons icone-timeline">${categoria.icone}</i>
			</div>

			<div class="cd-timeline-content evento_timeline" onclick="gerenciar_evento(this);" data-evento="${conteudo.id_evento}">
				<h2>${conteudo.descricao}</h2>
				<p>${conteudo.descricao}</p>
				<span class="mdl-chip mdl-chip-valor">
				    <span class="mdl-chip__text valor_evento" data-valor="${conteudo.valor}">R$ ${conteudo.valor}</span>
				</span>
				<span class="cd-date">${moment(conteudo.ts_ini).format("DD/MM/YYYY HH:mm")}</span>
			</div>
		</div>`;
    $('section').append(evento_html);  
	calculaValor();
	}

db.carga_feita.then(function() {
	return Promise.all([
		db.eventos.toArray(),
		db.categorias.orderBy('titulo').toArray()
	])
}).then(function(data) {
    eventos = data[0];
    categorias = data[1];
	console.log(localStorage.getItem('jaMostrou'));
    if (!eventos.length && localStorage.getItem('jaMostrou') != "true"){
		bootbox.alert("Novo por aqui? Comece criando um evento para visualizar na timeline!", function(){
			$('#mais_opcoes').click();
			$('#add_evento').attr('data-original-title', 'Pressione para inserir seu evento');
			$('#add_evento[data-toggle="tooltip"]').tooltip("show");
			$('#add_evento').removeAttr('data-original-title');			
			localStorage.setItem('jaMostrou', "true");
		});
	}	
    eventos.forEach(renderizar);
    
    timelineBlocks = $('.cd-timeline-block');		
    hideBlocks(timelineBlocks, offset);
    $(window).on('scroll', function(){
        window.requestAnimationFrame(function(){  showBlocks(timelineBlocks, offset); });
    });
}).catch(function(err) { throw err; });


//abre "mais opções (adicionar evento, filtrar)"
$("#mais_opcoes").on("click", function(){
     $("#add_evento, #filtrar_evento").fadeToggle();
});

//editar eventos
function gerenciar_evento(evt){
	console.log('oi');
	window.location.href = "evento.html?id_evento=" + $(evt).attr("data-evento");
}

function calculaValor(){
	var soma = 0;
	$("span.valor_evento:visible").each(function(e){
		soma += $(this).data("valor");		
	});
	$(".label-soma-valor").html("R$ " + soma.toFixed(2).replace(".",","));
}

$("#pesquisar").on("input", function(){
	var txt = this.value;
	var rgx = new RegExp(txt, 'i');
	// var eventos = [];

	var q1, q2;

	q1 = db.categorias.filter(function(c) {
		return rgx.test(c.titulo)
	}).primaryKeys();
	q2 = db.subcategorias.filter(function(s) {
		return rgx.test(s.titulo)
	}).primaryKeys();
	
	Promise.all([q1, q2]).then(function(result) {
		return db.eventos
					.where('categoria')
					.anyOf(result[0])
					.or('subcategoria')
					.anyOf(result[1])
					.primaryKeys();
	}).then(function(ids) {
		return db.eventos.filter(function(e){
			return rgx.test(e.titulo) || rgx.test(e.descricao) || ids.indexOf(e.id_evento) !== -1
		}).toArray()	
	}).then(function(eventos){
		$("section").empty();
		eventos.forEach(renderizar);
	});
});

$("#pesquisar-icone").on("click", function(){
	$("#pesquisar").toggleClass("esconder");
	$(".logo").toggleClass("sem-titulo");
});


/*Funçoes para o filtro de evt*/ 

$('#filtrar_evento').on('click',function(){
	window.location.href = "filtrar.html";
	buscar_categorias_filtro();
});
function buscar_categorias_filtro(){
	categorias.forEach(function(c){
		$(".modal-filtro-evento").append(`
			<button class='btn' style='background-color: ${c.cor}';>
				<i class='material-icons'>${c.icone}</i> ${c.titulo}
			</button>
		`);
	});
}