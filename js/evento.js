//$(".datepicker").val("03/12/2016");
$('.valor').mask('000.000.000.000.000,00', { reverse: true });
$("#lista_subcategorias").hide();
console.log(param.id_categoria);
db.categorias.where("id_categoria").equals(parseInt(param.id_categoria)).first().then(
    function (data) {
        $("#titulo_categoria").html("<i class='material-icons'>" + data.icone + "</i> " + data.titulo).css({ "background-color": data.cor });
        //console.log(data);
    }).catch(
    function (x) {
        console.log(x);
        //alert('Ocorreu um erro.');
    }
    );
db.subcategorias.where("id_categoria").equals(parseInt(param.id_categoria)).toArray().then(
    function (data) {
        data.forEach(function (c) {
            $("#lista_subcategorias").append(`<li class="list-group-item" data-repetir="${c.repetir}" id="${c.id_subcategoria}">${c.titulo}</li>`);
        });
        $("#lista_subcategorias>li").on('click', function () {
            $("#input_subcategoria").val($(this).text());
            $(this).parent().slideUp();
            if (this.dataset.repetir == "" || this.dataset.repetir == "null") {
                $("#periodo_repeticao").val("");
                $("#quantidade_repeticao").val("");
                $("#repetir").prop("checked", false);
            } else {
                $("#periodo_repeticao").val(this.dataset.repetir);
                $("#quantidade_repeticao").val(1);
            }   
            $("#id_subcategoria_selecionada").val($(this).attr("id"));            
        });
        $("#input_subcategoria").on('focus', function () {
            $("#lista_subcategorias").show();
        });
    }).catch(
    function (x) {
        console.log(x);
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
    } else {
        $("#div_evt_dt_fim").slideToggle();
        $(this).html("Adicionar data final");
        $(this).data("value", 0);
    }
});

//dia inteiro 
$("#dia_inteiro").on("change", function () {
    $(".div_evt_hr_ini, .div_evt_hr_fim").toggle();
});

$("#repeticao").on("change", function () {
    if ($(this).val() === "5") {
        $("#myModal").modal();
    }
});

//buscar subcategorias ao digitar no input
$("#input_subcategoria").on("input", function () {
    autoCompletar($("#lista_subcategorias>li"), this.value);
});

$("#gravar_evento").on('click', gravar_evento);

function gravar_evento() {
    var evento = {};
    evento.titulo = $("#input_subcategoria").val();
    evento.descricao =  $("#nome_evento").val() || "";
    evento.subcategoria = parseInt($("#id_subcategoria_selecionada").val());
    evento.categoria = parseInt(param.id_categoria);
    evento.dia_inteiro = $("#dia_inteiro").prop("checked");
    var t, d = moment($("#evt_dt_ini").val(), "YYYY-MM-DD");
    if (!evento.dia_inteiro) {
        t = $("#evt_hr_ini").val().split(":");
        d.hour(t[0]).minute(t[1]);
    }
    evento.ts_ini = d.toDate();

    if ($("#evt_dt_fim").is(":visible")) {
        d = moment($("#evt_dt_fim").val(), "YYYY-MM-DD");
        if (!evento.dia_inteiro) {
            t = $("#evt_hr_fim").val().split(":");
            d.hour(t[0]).minute(t[1]);
        }
        evento.ts_fim = d.toDate();
    }
    evento.valor = parseFloat($("#valor_evento").val());
    evento.notificacao = {
        "quantidade": $("#quantidade_notificacao").val(),
        "periodo": $("#periodo_notificacao").val()
    };
    evento.repeticao = {
        "quantidade": $("#quantidade_repeticao").val(),
        "periodo": $("#periodo_repeticao").val()
    };    
    db.eventos.add(evento).then(function(){
        alert("Evento incluído.");
    }).catch(function(){
        alert("Ocorreu um erro.");
    });
}