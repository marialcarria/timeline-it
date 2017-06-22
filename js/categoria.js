$('#add_subcategoria').on('click', function(){    
    var subcategoria = $("#input_subcategorias").val();
    var repeticao = $("#subcategoria_repeticao option:selected").text();
    if (subcategoria == "" || subcategoria == null){
        alert("Título inválido para a subcategoria.");
    } else {
        $(".lista_subcategorias").show();
        $('.lista_subcategorias').append(
            `<tr class="subcategoria_item">
                <td class="titulo_subcategoria"> ${subcategoria} </td>
                <td class="repeticao_subcategoria"> ${repeticao} </td>
                <td onclick="excluir(this)"><i class="material_icons excluir_subcategoria icone_subcategoria">clear</i></td>
            </tr>`);
    }
    $("#input_subcategorias").val("");
});

function excluir(val){
    $(val).parent("tr").remove();
    if ($(".subcategoria_item").length == 0){
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
        categoria.ativo = 1;
        db.categorias.add(categoria).then(function(id){
            //incluir subcategorias
            add_subcategorias(id);            
        }).catch(function(e){
            console.log(e);
            alert("Ocorreu um erro.");
        });
    }
});

function add_subcategorias(id){
    alert(id);    
    var array_subcategorigas = [];
    $('.lista_subcategorias tr:not(.header_subcategorias)').each(function() {
        var obj_subcategorias = {};
        var titulo = $(this).find('.titulo_subcategoria').text();
        var repeticao = $(this).find('.repeticao_subcategoria').text();
        obj_subcategorias = {"titulo": titulo, "id_categoria": id, "repetir": repeticao, "ativo": 1};
        array_subcategorigas.push(obj_subcategorias);
    });
    db.subcategorias.bulkAdd(array_subcategorigas).then(function(){
        alert("Categoria incluída.");
        window.location.href = "lista_categorias.html";
    }).catch(function(e){
        console.log(e);
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

