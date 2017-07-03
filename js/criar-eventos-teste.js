function createEvent() {
    let evento = {};
    let p = db.subcategorias.toArray().then(function(sub) {
        evento.categoria = faker.random.arrayElement([... new Set(sub.map(function(s) { return s.id_categoria }))]);
        evento.subcategoria = faker.random.arrayElement(sub.filter(function(s) {
            return s.id_categoria === evento.categoria
        }).map(function(s) {
            return s.id_subcategoria
        }));
    })
    evento.titulo = faker.random.words();
    evento.descricao = faker.lorem.sentence();
    evento.dia_inteiro = faker.random.boolean();
    
    evento.repetir = faker.random.boolean();
    if (evento.repetir) {
        evento.repeticao = {};
        evento.repeticao.quantidade = faker.random.number({min: 1, max: 10});
        evento.repeticao.periodo = faker.random.arrayElement(["M", "H", "D", "W"]);
    }
    evento.notificacao = {};
    evento.notificacao.quantidade = faker.random.number({min: 1, max: 10});
    evento.notificacao.periodo = faker.random.arrayElement(["M", "Y", "D", "W"]);  

    var sem_fim = evento.repetir ? false : faker.random.boolean();
    evento.ts_ini = faker.date.future();
    if (evento.dia_inteiro) {
        evento.ts_ini.setHours(0);
        evento.ts_ini.setMinutes(0);
        evento.ts_ini.setSeconds(0);
    } else {
        evento.ts_ini.setHours(faker.random.number({min: 0, max: 23}));
        evento.ts_ini.setMinutes(faker.random.number({min: 0, max: 59}));
        evento.ts_ini.setSeconds(faker.random.number({min: 0, max: 59}));
    }
    while (!sem_fim && (evento.ts_fim === undefined || evento.ts_fim <= evento.ts_ini)) {
        evento.ts_fim = faker.date.future();
        if (evento.dia_inteiro && !sem_fim) {
            evento.ts_fim.setHours(0);
            evento.ts_fim.setMinutes(0);
            evento.ts_fim.setSeconds(0);
        } else {
            evento.ts_fim.setHours(faker.random.number({min: 0, max: 23}));
            evento.ts_fim.setMinutes(faker.random.number({min: 0, max: 59}));
            evento.ts_fim.setSeconds(faker.random.number({min: 0, max: 59}));
        }
    }
    evento.valor = parseFloat(faker.finance.amount());
    
    p.then(function() {
        console.log(evento);
        db.eventos.add(evento);
    });
}

function createEvents(count) {
    for(let i=0;i<count;i++) {
        createEvent();
    }
}

// db.eventos.count(function(c) {
//     if (c === 0) {
//         createEvents(500);
//     }
// })