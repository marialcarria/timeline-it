var categoria = {};
var subcategorias = [];
var repeticoes = {
    "Y": "por ano",
    "M": "por mês",
    "W": "por semana",
    "D": "por dia",
    "H": "por hora",
    "m": "por minuto"};

console.log(param.id_categoria);
if (param.id_categoria){
    $("#excluir_categoria").show();
    db.categorias.where('id_categoria').equals(parseInt(param.id_categoria)).first().then(
        function (data){
            categoria = data;
            buscar_dados_categoria();
        }
    ).catch(
        function(err){
            console.error(err);
        }
    );
}
function buscar_dados_categoria(){
    $("#nome_categoria").val(categoria.titulo);
    $("#nome_cor").append(`<div style="border: 1px solid #E9E9E9; width: 25px; height: 25px; background-color: ${categoria.cor};"></div>`);
    $("#nome_icone").append(`<i class="material-icons">${categoria.icone}</i>`);
    $("#valor_cor").val(categoria.cor);
    $("#valor_icone").val(categoria.icone);
    db.subcategorias.where('id_categoria').equals(categoria.id_categoria).toArray().then(function (data) {
        subcategorias = data;
        subcategorias.forEach(function (c) {
            add_subcategoria(c.titulo, c.repetir, false, c.id_subcategoria);
        });
    });
}

$('#add_subcategoria').on('click', function(){    
    var subcategoria = $("#input_subcategorias").val();
    var repeticao = $("#subcategoria_repeticao").val();
    if (subcategoria == "" || subcategoria == null){
        alert("Título inválido para a subcategoria.");
    } else {
        add_subcategoria(subcategoria, repeticao, true);    
    }
    $("#input_subcategorias").val("");
});

function add_subcategoria(subcategoria, repeticao, insercao, id){
    $(".lista_subcategorias").show();
    $('.lista_subcategorias').append(
            `<tr data-id="${id || ""}" class="subcategoria_item ${insercao? "inserir" : ""}">
                <td class="titulo_subcategoria"> ${subcategoria} </td>
                <td class="repeticao_subcategoria"> ${descricao_repetir(repeticao)} </td>
                <td onclick="excluir(this)"><i class="material_icons excluir_subcategoria icone_subcategoria">clear</i></td>
            </tr>`);
}

function excluir(val){ 
    var pai = $(val).parent("tr")
    if(pai.hasClass("inserir")){
        pai.remove();
    } else {
        pai.addClass("excluir").hide();
    }
    if ($(".subcategoria_item:visible").length == 0){
        $(".lista_subcategorias").hide();
    }
}

$("#gravar_categoria").on("click", function(){
    //testes de consistencia
    //pegar categoria, gravar, pegar subcategorias e gravar com o id da categoria pai
    var nome_categoria = $("#nome_categoria").val();
    var ok = nome_categoria.length > 3 || nome_categoria.length < 30 || nome_categoria.trim() != "" || nome_categoria.val() != null;
    if (!ok){
        alert("Nome inválido para a categoria (escolher um nome entre 3 e 30 caracteres).");
        return;
    } else {
        var categoria = {};
        categoria.titulo = nome_categoria;
        categoria.icone = $("#valor_icone").val() || "playlist_add_check";
        categoria.cor = $("#valor_cor").val() || "#126286";
        if (param.id_categoria){
            categoria.id_categoria = parseInt(param.id_categoria);
        }
        categoria.excluido = 0;
        db.categorias.put(categoria).then(function(id){
            //incluir subcategorias
            add_subcategorias(id);            
        }).catch(function(e){
            console.log(e);
            alert("Ocorreu um erro.");
        });
    }
});

function add_subcategorias(id){
    var array_subcategorigas = [];
    var i = 0;
    $('.lista_subcategorias tr.inserir').each(function() {
        console.log(++i);
        var obj_subcategorias = {};
        var titulo = $(this).find('.titulo_subcategoria').text();
        console.log(titulo);
        var repeticao = $(this).find('.repeticao_subcategoria').val();
        console.log(repeticao);
        obj_subcategorias = {"titulo": titulo, "id_categoria": id, "repetir": repeticao, "ativo": 1};
        console.log(obj_subcategorias);
        array_subcategorigas.push(obj_subcategorias);
    });
    console.log(array_subcategorigas);
    Promise.all([
        db.subcategorias.bulkAdd(array_subcategorigas),
        db.subcategorias.bulkDelete(
            $('.lista_subcategorias tr.excluir').map(function(){
                return parseInt(this.dataset.id);
            }).get()
        )            
    ]).then(function() {
        bootbox.alert("Categoria incluída", function() {
            window.location.href = "categoria.html?id_categoria="+ id;
        });
    }).catch(function(err) {
        bootbox.alert('Ocorreu um erro');
        console.error(err);
    });
}

$('#selecionar_cor').on('click', function() {    
    var modal = new ModalSelect('#nome_cor', '#valor_cor');   
    modal.setData([
                '#999999',
                '#9c27b0',
                '#03a9f4',
                '#4caf50',
                '#fbc02d',
                '#f44336'
    ].map(function(i){
        return {
            value: i,
            name: `<div style="border: 1px solid #E9E9E9; width: 25px; height: 25px; background-color: ${i};"></div>`
        }
    }));
    modal.show();
    $(".ModalSelectFiltrar").hide();
});
    $('#selecionar_icone').on('click', function() {
        var modal = new ModalSelect('#nome_icone', '#valor_icone');
        modal.setData(icones.map(function(i){
                return {
                    value: i,
                    name: `<i class="material-icons">${i}</i>`
                }
            }));
            modal.show();
        });

$("#excluir_categoria").on("click", function(){
    bootbox.confirm("Excluir categoria?", function(){
        db.categorias.update(parseInt(param.id_categoria), {"excluido": 1}).then(function(){
            bootbox.alert("Categoria excluída", function(){
                window.location.href = "index.html";
            });
        });
    });
});


function descricao_repetir(tipo){
    console.log(repeticoes, tipo);
    return repeticoes[tipo] || "não repetir";
}