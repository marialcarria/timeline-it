var db = new Dexie('timeline_it');
//var ip = "localhost:8081";
var ip = '/data';
db.version(1).stores({
    categorias: '++id_categoria,titulo,icone',
    subcategorias: '++id_subcategoria,titulo,id_categoria',
    eventos: '++id_evento,titulo,descricao,id_categoria,id_subcategoria,ts_ini,ts_fim,valor'
});
db.version(2).stores({
    eventos: '++id_evento,titulo,descricao,categoria,subcategoria,ts_ini,ts_fim,valor'
});
db.carga_feita = new Promise(function(resolve, reject) {
    db.finalizar_carga = resolve;
});


db.on('ready', function () {

    return db.categorias.count(function (count) {
        if (count > 0) {
            console.log("Já tenho categorias");
        } else {
            console.log("Não tenho categorias. Baixando...");
            // We want framework to continue waiting, so we encapsulate
            // the ajax call in a Dexie.Promise that we return here.
            return new Dexie.Promise(function (resolve, reject) {
                $.ajax(`${ip}/categorias.json`, {
                    type: 'get',
                    dataType: 'json',
                    error: function (xhr, textStatus) {
                        // Rejecting promise to make db.open() fail.
                        reject(textStatus);
                    },
                    success: function (data) {
                        // Resolving Promise will launch then() below.
                        resolve(data);
                    }
                });
            }).then(function (data) {
                // By returning the db.transaction() promise, framework will keep
                // waiting for this transaction to commit before resuming other
                // db-operations.
                return db.transaction('rw', db.categorias, function () {
                    data.forEach(function (item) {
                        console.log("Adding categoria: " + JSON.stringify(item));
                        db.categorias.add(item);
                    });
                });
            }).then(function () {
                console.log ("Transaction committed");
            });
        }
    }).then(function() {
        db.subcategorias.count(function (count) {
            if (count > 0) {
                console.log("Já tem subcategorias");
            } else {
                console.log("Não tem subcategorias, baixando....");
                return new Dexie.Promise(function (resolve, reject) {
                    $.ajax(`${ip}/subcategorias.json`, {
                        type: 'get',
                        dataType: 'json',
                        error: function (xhr, textStatus) {
                            // Rejecting promise to make db.open() fail.
                            reject(textStatus);
                        },
                        success: function (data) {
                            // Resolving Promise will launch then() below.
                            resolve(data);
                        }
                    });
                }).then(function (data) {
                    // By returning the db.transaction() promise, framework will keep
                    // waiting for this transaction to commit before resuming other
                    // db-operations.
                    return db.transaction('rw', db.subcategorias, function () {
                        data.forEach(function (item) {
                            console.log("Adding subcategoria: " + JSON.stringify(item));
                            db.subcategorias.add(item);
                        });
                    });
                }).then(function () {
                    console.log ("Transaction committed");
                });
            }
        })
    }).then(function() {
        db.eventos.count(function (count) {
            if (count > 0) {
                console.log("Já tem eventos");
            } else {
                console.log("Não tem eventos, baixando....");
                return new Dexie.Promise(function (resolve, reject) {
                    $.ajax(`${ip}/eventos.json`, {
                        type: 'get',
                        dataType: 'json',
                        error: function (xhr, textStatus) {
                            // Rejecting promise to make db.open() fail.
                            reject(textStatus);
                        },
                        success: function (data) {
                            // Resolving Promise will launch then() below.
                            resolve(data);
                        }
                    });
                }).then(function (data) {
                    // By returning the db.transaction() promise, framework will keep
                    // waiting for this transaction to commit before resuming other
                    // db-operations.
                    return db.transaction('rw', db.eventos, function () {
                        data.forEach(function (item) {
                            console.log("Adding evento: " + JSON.stringify(item));
                            db.eventos.add(item);
                        });
                    });
                }).then(function () {
                    console.log ("Transaction committed");
                });
            }
        })
    }).then(function() {
        // Promise.resolve(db.carga_feita);
        db.finalizar_carga();
    });
});

db.open();