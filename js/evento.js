var subcategorias = [];
$('.valor').mask('000.000.000.000.000,00', { reverse: true });
$("#lista_subcategorias").hide();


/*********************************************************************************************************************/
/*notificações do device*/ 
var info = null;

document.addEventListener("deviceready", function(){
	if(!localStorage.getItem("rp_data")){
		var rp_data = {data: []};
		localStorage.setItem("rp_data", JSON.stringify(rp_data));
	}

	info = JSON.parse(localStorage.getItem("rp_data"));
}, false);


var sound = 'file://sound.mp3';
var date = new Date('2017-07-02T22:30:00-03:00');
function schedule(id, title, message, schedule_time){
	cordova.plugins.notification.local.schedule({
		/*id: id,
		title: title,
		message: message,
		at: schedule_time*/
        id: 1,
        title: "teste titulo",
        message: "teste txt mensagem",
        firstAt: date//,
        // every: 5,
        // sound: sound,
	});
	var array = [id, title, message, schedule_time];
	info.data[info.data.length] = array;
	localStorage.setItem("rp_data", JSON.stringify(info));
	bootbox.alert("Notificação incluída", function(){
		return;
	});
}

function add_reminder(){
	var date = moment($("#evt_dt_ini").val() + " " +  $("#evt_hr_ini").val()).toDate();
	var title = $("#nome_subcategoria").val();
	var message = $("#nome_evento").val() || $("#nome_subcategoria").val();
	cordova.plugins.notification.local.hasPermission(function(granted){
		if(granted == true){
			schedule((new Date()).getTime(), title, message, date);
		}
		else{
			cordova.plugins.notification.local.registerPermission(function(granted) {
				if(granted == true){
					schedule((new Date()).getTime(), title, message, date);
				} else{
					bootbox.alert("App não tem permissão para notificar.", function(){
                        return;
                    });
				}
			});
		}
	});
}

/*fim notificações device*/ 
/*********************************************************************************************************************/


var evento = {};
var promise_evento = new Promise(function(resolve, reject){
    if (param.id_evento){
        $("#excluir_evento").show();        
        db.eventos.where('id_evento').equals(parseInt(param.id_evento)).first().then(
        function(data){
            evento = data;
            param.id_categoria = evento.categoria;
            $("#id_subcategoria_selecionada").val(evento.subcategoria);
            db.subcategorias.where('id_subcategoria').equals(evento.subcategoria).first().then(function(subcategoria){
                $("#nome_subcategoria").val(subcategoria.titulo);
                $("#informacao_subcategoria").show();
            });
            buscar_dados_evento();
            resolve();
        });
    } else {
        $("#evt_dt_ini").val(moment(new Date()).format("YYYY-MM-DD"));
        resolve();
    }
});

$("#excluir_evento").on("click",function(){
    bootbox.confirm("Excluir evento?", function(result){
        console.log(result);
        if (result){
            db.eventos.delete(parseInt(param.id_evento)).then(function(){
                bootbox.alert("Evento excluído", function(){
                    window.location.href = "index.html";
                });
            });
        }
    });
});

promise_evento.then(function(){
    db.categorias.where("id_categoria").equals(parseInt(param.id_categoria)).first().then(
    function (data) {
        $("#titulo_categoria").html("<i class='material-icons'>" + data.icone + "</i> " + data.titulo).css({ "background-color": data.cor });
            //console.log(data);
        }
    );
    db.subcategorias.where("id_categoria").equals(parseInt(param.id_categoria)).toArray().then(function (data) {
        subcategorias = data;
        data.forEach(function (c) {
            $("#lista_subcategorias").append(`<li class="list-group-item" data-repetir="${c.repetir}" id="${c.id_subcategoria}">${c.titulo}</li>`);
        });
        //$("#lista_subcategorias>li").on('click', function () {
           // $("#input_subcategoria").val($(this).text());
            //$(this).parent().slideUp();
            //if (this.dataset.repetir == "" || this.dataset.repetir == "null") {
            //    $("#periodo_repeticao").val("");
            //    $("#quantidade_repeticao").val("");
            //    $("#repetir").prop("checked", false);
            //} else {
            //    $("#periodo_repeticao").val(this.dataset.repetir);
            //    $("#quantidade_repeticao").val(1);
            //}   
            //$("#id_subcategoria_selecionada").val($(this).attr("id"));            
        });
        /*$("#input_subcategoria").on('focus', function () {
            $("#lista_subcategorias").show();
        });*/
    //});
    $("#nome_subcategoria").on("change", function(){

    });
}).catch(
    function (x) {
        console.error(x);
        //alert('Ocorreu um erro.');
    }
);

$("#repetir").on("change", function () {
    if ($(this).prop("checked")) {
        $("#repetir_detalhes").show();
    } else {
        $("#repetir_detalhes").hide();
    }
});

//adicionar data final
$("#btn_dt_final").click(function () {
    if ($(this).data("value") === 0) {
        $("#div_evt_dt_fim").slideToggle();
        $(this).html("Remover data final");
        $(this).data("value", 1);
        if(!param.id_evento){
            $("#evt_dt_fim").val(moment(new Date()).add(1,'days').format("YYYY-MM-DD"));
        }
    } else {
        $("#evt_dt_fim, #evt_hr_fim").val("");
        $("#div_evt_dt_fim").slideToggle();
        $(this).html("Adicionar data final");
        $(this).data("value", 0);
    }
    var dia_inteiro = $("#dia_inteiro").prop("checked");
    var tem_data_fim = $("#btn_dt_final").data("value") == 1;
    add_horas(dia_inteiro, tem_data_fim);
});

//dia inteiro 
$("#dia_inteiro").on("change", function () {
    var dia_inteiro = $("#dia_inteiro").prop("checked");
    var tem_data_fim = $("#btn_dt_final").data("value") == 1;
    add_horas(dia_inteiro, tem_data_fim);
    $(".div_evt_hr_ini, .div_evt_hr_fim").toggle();
});

function add_horas(dia_inteiro, tem_data_fim){
    if(!dia_inteiro){
        $("#evt_hr_ini").val(moment(new Date()).add(1,'hours').format("hh:00"));
        if(tem_data_fim){
            $("#evt_hr_fim").val(moment(new Date()).add(2,'hours').format("hh:00"));
        } else {
            $("#evt_hr_fim").val("");
        }
    } else {
        $("#evt_hr_ini").val("");
    }
}
//buscar subcategorias ao digitar no input
$("#input_subcategoria").on("input", function () {
    autoCompletar($("#lista_subcategorias>li"), this.value);
});
var repeticao_subcategoria, subcategoria_selecionada;
function selecionar_subcategoria(){
    var modal = new ModalSelect('#nome_subcategoria','#id_subcategoria_selecionada');
    modal.setData(subcategorias, 'titulo', 'id_subcategoria');
    modal.show(function(){
        $("#informacao_subcategoria").show();
        carregar_dados_repeticao();
    });
}
function carregar_dados_repeticao(){
    db.subcategorias.where('id_subcategoria').equals(parseInt($('#id_subcategoria_selecionada').val())).toArray().then(
        function(data){
            subcategoria_selecionada = data[0];
            console.log(subcategoria_selecionada);
            console.log(subcategoria_selecionada.repetir);
            repeticao_subcategoria = subcategoria_selecionada.repetir;
            if(repeticao_subcategoria){
                $("#repetir").prop("checked", true).trigger('change');
                $("#periodo_repeticao").val(repeticao_subcategoria);
            }
        }
    ).catch(
        function(e){
            console.error(e);
        }
    );
}

function buscar_dados_evento(){
    $("#nome_evento").val(evento.titulo || evento.descricao);
    $("#valor_evento_hidden").val(parseFloat($("#valor_evento").val()).toFixed(2));
    $("#valor_evento").val(evento.valor.toFixed(2)).trigger('input');                
    $("#evt_dt_ini").val(moment(evento.ts_ini).format("YYYY-MM-DD"));
    $("#evt_hr_ini").val(moment(evento.ts_ini).format("hh:mm"));
    if(evento.ts_fim){
        $("#btn_dt_final").click();
        $("#evt_dt_fim").val(moment(evento.ts_fim).format("YYYY-MM-DD"));
        $("#evt_hr_fim").val(moment(evento.ts_fim).format("hh:mm"));
    }
    $("#dia_inteiro").prop("checked", evento.dia_inteiro).trigger('change');
    $("#quantidade_notificacao").val(evento.notificacao.quantidade);
    $("#periodo_notificacao").val(evento.notificacao.periodo);
    $("#quantidade_repeticao").val(evento.repeticao.quantidade);
    $("#periodo_repeticao").val(evento.repeticao.periodo);
    $("#repetir").prop("checked", evento.repetir).trigger('change');
    //notificacao
    //repeticao
    console.log('teste');
    console.log(moment(evento.ts_ini).format("YYYY-MM-DD"));
}


$("#gravar_evento").on('click', function () {
    var e = {};
    var nome_ok, dt_ini_ok, dt_fim_ok, hr_ini_ok, hr_fim_ok, categoria_ok, subcategoria_ok;
    if(param.id_evento){
        e.id_evento = evento.id_evento;
    }
    e.titulo = $("#input_subcategoria").val();
    e.descricao =  $("#nome_evento").val() || "";
    e.subcategoria = parseInt($("#id_subcategoria_selecionada").val());
    e.categoria = parseInt(param.id_categoria);
    e.dia_inteiro = $("#dia_inteiro").prop("checked");    
    var t, d = moment($("#evt_dt_ini").val(), "YYYY-MM-DD");
    if (!e.dia_inteiro) {
        t = $("#evt_hr_ini").val().split(":");
        d.hour(t[0]).minute(t[1]);
    }
    e.ts_ini = d.toDate();

    if ($("#evt_dt_fim").is(":visible")) {
        d = moment($("#evt_dt_fim").val(), "YYYY-MM-DD");
        if (!e.dia_inteiro) {
            t = $("#evt_hr_fim").val().split(":");
            d.hour(t[0]).minute(t[1]);
        }
        e.ts_fim = d.toDate();
    } else {
        e.ts_fim = null;
    }
    e.valor = parseFloat($("#valor_evento").val().replace(".","").replace(",","."));
    e.notificacao = {
        "quantidade": $("#quantidade_notificacao").val(),
        "periodo": $("#periodo_notificacao").val()
    };
    e.repetir = $("#repetir").prop("checked");
    if (e.repetir){
        dt_fim_ok = false;
        e.repeticao = {
            "quantidade": $("#quantidade_repeticao").val(),
            "periodo": $("#periodo_repeticao").val()
        };
    } else{
        e.repeticao = {};
    }

    var dt_ini = $("#evt_dt_ini").val();
    var dt_fim = $("#evt_dt_fim").val();
    var hr_ini = $("#evt_hr_ini").val();
    var hr_fim = $("#evt_hr_fim").val();
    var tem_data_fim = $("#btn_dt_final").data("value") == "1";
    //nome_ok = !($("#nome_evento").val().trim() == "" || $("#nome_evento").val() == "undefined" || $("#nome_evento").val() == null);
    categoria_ok = param.id_categoria;
    subcategoria_ok = !($ ("#id_subcategoria_selecionada").val() == "" || $("#id_subcategoria_selecionada").val() == "undefined" || $("#id_subcategoria_selecionada").val() == null);
    dt_ini_ok = dt_ini && moment(dt_ini).isSameOrAfter(new Date(), 'day');
    dt_fim_ok = (!tem_data_fim) || (dt_fim && moment(dt_ini).isSameOrBefore(dt_fim, 'day'));
    hr_ini_ok = (e.dia_inteiro || hr_ini);
    hr_fim_ok = ((e.dia_inteiro || !tem_data_fim) || hr_fim);
    if (!e.dia_inteiro){
        if (dt_ini == dt_fim){
            if (parseInt(hr_ini.replace(":","")) <= parseInt(hr_fim.replace(":",""))){
                hr_intervalo_ok = true;
            } else {
                hr_intervalo_ok = false;
            }
        } else {
            hr_intervalo_ok = true;
        }
    } else {
        hr_intervalo_ok = true;
    }
    var evt_valido = dt_ini_ok && dt_fim_ok && hr_ini_ok && hr_fim_ok && categoria_ok && subcategoria_ok && hr_intervalo_ok;    
    if (evt_valido){ 
        db.eventos.put(e).then(function(){
            bootbox.alert("Evento incluído.", function(){
                try {
                    if(e.notificacao && !!window.cordova) {
                        add_reminder();
                    }
                    window.location.href = "index.html";
                } catch (err) {
                    bootbox.alert("err: " || err);
                }
            });            
        }).catch(function(x){
            alert("Ocorreu um erro.");
            console.error(x);
        });
    } else {
        //if (!nome_ok) alert ("Nome inválido");
        if (!dt_fim_ok){
            if (!e.dia_inteiro) {
                bootbox.alert("Informe a data final do evento.", function(){
                    return;
                });
            }
            if (e.repeticao){
                bootbox.alert("Eventos com repetição devem possuir uma data final.", function(){
                    return;
                });
            }
        }
        if (!dt_ini_ok){
             bootbox.alert("Informe a data inicial.", function(){
                return;
            });
        }
        if (!hr_fim_ok || !hr_ini_ok){
             bootbox.alert("Hora deve ser informada.", function(){
                return;
            });
        }
        if (!subcategoria_ok){
             bootbox.alert("Informe a subcategoria.", function(){
                return;
            });
        }
        if (!categoria_ok){
            bootbox.alert ("Ocorreu um erro ao escolher a categoria.", function(){
                window.location.href ="index.html";
            });
        }        
    }
});