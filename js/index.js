var timelineBlocks;
var offset = 0.8;
var eventos, categorias;
var f_ini, f_fim, f_categorias;
var eventos_offset = 0;
var eventos_limit = 20;
var pesquisando = false;
var eventos_pendentes = [];

if(localStorage.getItem('filtros')){
    $(".btn-remover-filtros").show();
} else {
    $(".btn-remover-filtros").hide();
}

function renderizar(conteudo) {
	var categoria = categorias.filter(function(c){
		return c.id_categoria == conteudo.categoria;
	})[0];
	var subcategoria = subcategorias.filter(function(s){
        return s.id_subcategoria == conteudo.subcategoria;
    })[0];
    var evento_html =
    `<div class="cd-timeline-block">
			<div class="cd-timeline-img cd-picture" data-categoria="${conteudo.categoria}" style="background-color: ${categoria.cor};">
				<i class="material-icons icone-timeline">${categoria.icone}</i>
			</div>

			<div class="cd-timeline-content evento_timeline" onclick="gerenciar_evento(this);" data-evento="${conteudo.id_evento}">
				<h2>${conteudo.descricao || subcategoria.titulo}</h2>
                <p>${subcategoria.titulo}</p>
				<span class="mdl-chip mdl-chip-valor">
				    <span class="mdl-chip__text valor_evento" data-valor="${conteudo.valor}">R$ ${conteudo.valor}</span>
				</span>
				<span class="cd-date">${moment(conteudo.ts_ini).format("DD/MM/YYYY HH:mm")}</span>
			</div>
		</div>`;
    $('section').append(evento_html);  
	calculaValor();
}

function mostrar_eventos() {
	Promise.all([
		filtrar(),
		db.categorias.orderBy('titulo').toArray(),
		db.subcategorias.toArray()
	]).then(function(data) {
		eventos = data[0];
		categorias = data[1];
		subcategorias = data[2];
		console.log(data);
		var pode_ter_mais_eventos;
		if(pesquisando) {
			pode_ter_mais_eventos = false;
		} else {
			pode_ter_mais_eventos = (eventos.length >= eventos_limit);
		}

		var eventos_renderizar = [];
		var ultima_data = eventos.length === 0 ? null : eventos[eventos.length-1].ts_ini;

		eventos_pendentes.forEach(function(evento, i) {
			var d = moment(evento.ts_ini);
			var o;
			while(d.add(evento.repeticao.quantidade, evento.repeticao.periodo).toDate() <= ultima_data && d.toDate() <= evento.ts_fim) {
				o = Object.assign({}, evento);
				o.ts_ini = d.toDate();
				eventos_renderizar.push(o);
			}
			if(d.toDate() <= evento.ts_fim) {
				eventos_pendentes[i].ts_ini = d.toDate();
			} else {
				eventos_pendentes[i].ts_ini = null;
			}
		});
		eventos_pendentes = eventos_pendentes.filter(function(evento) {
			return evento.ts_ini !== null;
		})

		eventos.forEach(function(evento) {
			eventos_renderizar.push(evento);
			if(evento.repetir) {
				var d = moment(evento.ts_ini);
				var o;
				while(d.add(evento.repeticao.quantidade, evento.repeticao.periodo).toDate() <= ultima_data && d.toDate() <= evento.ts_fim) {
					o = Object.assign({}, evento);
					o.ts_ini = d.toDate();
					eventos_renderizar.push(o);
				}
				if(d.toDate() <= evento.ts_fim) {
					o = Object.assign({}, evento);
					o.ts_ini = d.toDate();
					eventos_pendentes.push(o);
				}
			}
		})

		if(eventos_renderizar.length === 0) {
			$("section").append("<span style='padding-left: 35px;'>Nenhum evento encontrado.</span>");
		} else {
			eventos_renderizar.sort(function(a,b) {
				if (a.ts_ini < b.ts_ini)
					return -1;
				if (a.ts_ini > b.ts_ini)
					return 1;
				return 0;
			});
			eventos_renderizar.forEach(renderizar);
		}

		if(!pode_ter_mais_eventos) {
			$('#carregar-mais').hide();
			eventos_renderizar = [];
			eventos_pendentes.forEach(function(evento, i) {
				var d = moment(evento.ts_ini);
				var o;
				while(d.add(evento.repeticao.quantidade, evento.repeticao.periodo).toDate() <= evento.ts_fim) {
					o = Object.assign({}, evento);
					o.ts_ini = d.toDate();
					eventos_renderizar.push(o);
				}
			});
			eventos_pendentes = [];
			eventos_renderizar.sort(function(a,b) {
				if (a.ts_ini < b.ts_ini)
					return -1;
				if (a.ts_ini > b.ts_ini)
					return 1;
				return 0;
			});
			eventos_renderizar.forEach(renderizar);
		} else {
			$('#carregar-mais').show();
			eventos_offset+= eventos_limit;
		}
	})
	/*.catch(function(err) { 
		console.error(err);
		bootbox.alert((typeof err === 'string') ? err : JSON.stringify(err));
	});*/
}

db.carga_feita.then(function() {
	return db.eventos.count()
}).then(function(eventoslength) {
	if (!eventoslength && localStorage.getItem('jaMostrou') != "true"){
		bootbox.alert("Novo por aqui? Comece criando um evento para visualizar na timeline!", function(){
			$('#mais_opcoes').click();
			$('#add_evento').attr('data-original-title', 'Pressione para inserir seu evento');
			$('#add_evento[data-toggle="tooltip"]').tooltip("show");
			$('#add_evento').removeAttr('data-original-title');			
			localStorage.setItem('jaMostrou', "true");
		});
	} else {
		mostrar_eventos();
	}
});

$('#carregar-mais').on('click', mostrar_eventos);

//abre "mais opções (adicionar evento, filtrar)"
$("#mais_opcoes").on("click", function(){
     $("#add_evento, #filtrar_evento").fadeToggle();
});

//editar eventos
function gerenciar_evento(evt){
	console.log('oi');
	window.location.href = "evento.html?id_evento=" + $(evt).attr("data-evento");
}

function filtrar(){
	var query;
	var filtros = localStorage.getItem("filtros");
	if (filtros){
		filtros = JSON.parse(filtros);
		if(filtros["data_ini"] && filtros["data_fim"]) {
			query = db.eventos.where('ts_ini').between(moment(filtros["data_ini"]).toDate(), moment(filtros["data_fim"]).toDate(), true, false)
								 .or('ts_fim').between(moment(filtros["data_ini"]).toDate(), moment(filtros["data_fim"]).toDate(), true, false);

			if(filtros["categorias"]) {
				query = query.and(function(e) {
					return (filtros["categorias"].indexOf(e.categoria) !== -1);
				});
			}
		} else if(filtros["data_ini"] && !filtros["data_fim"]) {
			query = db.eventos.where('ts_fim').aboveOrEqual(moment(filtros["data_ini"]).toDate());

			if(filtros["categorias"]) {
				query = query.and(function(e) {
					return (filtros["categorias"].indexOf(e.categoria) !== -1);
				});
			}
		} else if(!filtros["data_ini"] && filtros["data_fim"]) {
			query = db.eventos.where('ts_ini').belowOrEqual(moment(filtros["data_fim"]).toDate());
		} else if(filtros["categorias"]) {
			query = db.eventos.where('categoria').anyOf(filtros["categorias"]);
		}
	} 
	if(query === undefined) {
		query = db.eventos.toCollection();
	}

	if(pesquisando) {
		var q1, q2;
		var txt = removerAcentos($('#pesquisar').val());
		txt = txt.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');//.replace(/[^\w\s]/gi, ''); 
		var rgx = new RegExp(txt, 'i');

		q1 = db.categorias.filter(function(c) {
			return rgx.test(removerAcentos(c.titulo))
		}).primaryKeys();
		q2 = db.subcategorias.filter(function(s) {
			return rgx.test(removerAcentos(s.titulo))
		}).primaryKeys();
		
		return Promise.all([q1, q2]).then(function(result) {
			return db.eventos
				.where('categoria')
				.anyOf(result[0])
				.or('subcategoria')
				.anyOf(result[1])
				.primaryKeys();
		}).then(function(ids) {
			return query.filter(function(e){
				var ok = false;
				if(e.titulo) {
					//ok = rgx.test(e.titulo);
					ok = ok || rgx.test(removerAcentos(e.titulo));
				}
				if(e.descricao) {
					//ok = rgx.test(e.descricao);
					ok = ok || rgx.test(removerAcentos(e.descricao));
				}
				ok = ok || ids.indexOf(e.id_evento) !== -1;

				return ok;
			}).sortBy('ts_ini');
		});
	} else {
		return query.offset(eventos_offset).limit(eventos_limit).sortBy('ts_ini');
	}
}

function calculaValor(){
	var soma = 0;
	$("span.valor_evento:visible").each(function(e){
		soma += $(this).data("valor");		
	});
	$(".label-soma-valor").html("R$ " + soma.toFixed(2).replace(".",","));
}

function onPesquisar(texto) {
	eventos_offset = 0;
	eventos_pendentes = [];
	pesquisando = (texto != '');
	$('#cd-timeline').empty();
	mostrar_eventos();
}

$("#pesquisar").on("input", function(){
	onPesquisar(this.value);
});

$("#pesquisar-icone").on("click", function(){
	$("#pesquisar").toggleClass("esconder");
	$(".logo").toggleClass("sem-titulo");
	
	if($('#pesquisar').hasClass('esconder')) {
		pesquisando = false;
		if($('#pesquisar').val() != '') {
			$('#pesquisar').val('');
			eventos_offset = 0;
			eventos_pendentes = [];
			$('#cd-timeline').empty();
			mostrar_eventos();
		}
	} else {
		$('#pesquisar').focus();
	}
});

$('.btn-remover-filtros').on('click', function(){
    localStorage.setItem('filtros', '');
    location.reload();
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

function removerAcentos(newStringComAcento) {
var string = newStringComAcento;
    var mapaAcentosHex  = {
        a : /[\xE0-\xE6]/g,
        e : /[\xE8-\xEB]/g,
        i : /[\xEC-\xEF]/g,
        o : /[\xF2-\xF6]/g,
        u : /[\xF9-\xFC]/g,
        c : /\xE7/g,
        n : /\xF1/g
    };

    for ( var letra in mapaAcentosHex ) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace( expressaoRegular, letra );
    }

    return string;
}