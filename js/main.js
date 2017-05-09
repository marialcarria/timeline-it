function autoCompletar(lista, valor){
    var val = valor.toLowerCase();
    lista.each(function(e){
        var txtList = $(this).text().toLowerCase();
        if (txtList.search(val) >= 0){
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}  


