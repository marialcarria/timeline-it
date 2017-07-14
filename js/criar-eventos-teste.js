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
    //evento.descricao = faker.lorem.sentence();
    evento.dia_inteiro = faker.random.boolean();
    
    evento.repetir = faker.random.boolean();
    if (evento.repetir) {
        evento.repeticao = {};
        evento.repeticao.quantidade = faker.random.number({min: 1, max: 10});
        evento.repeticao.periodo = faker.random.arrayElement(["M", "h", "d", "w"]);
    }
    evento.notificacao = {};
    evento.notificacao.quantidade = faker.random.number({min: 1, max: 10});
    evento.notificacao.periodo = faker.random.arrayElement(["m", "h", "d", "w"]);  

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
    if(!sem_fim) {
        if(evento.repetir) {
            /* 
                jeito ruim
                evento.ts_fim = moment(evento.ts_ini).add(faker.random.number({min: 1, max: 10}), evento.repeticao.periodo).toDate();
            */ 
                       
            // jeito bom
            evento.ts_fim = evento.ts_ini;
            switch(evento.repeticao.periodo) {
                case 'h':
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 1, max: 2}), 'd').toDate();
                    break;
                case 'd':
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 6}), 'd').toDate();
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 2}), 'w').toDate();        
                    break;
                case 'w':
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 10}), 'd').toDate();
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 3}), 'w').toDate();
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 2}), 'M').toDate();
                    break;
                case 'M':
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 10}), 'd').toDate();
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 2}), 'w').toDate();
                    evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 6}), 'M').toDate();
                    break;
            }
            if(evento.ts_ini === evento.ts_fim) {
                evento.ts_fim = moment(evento.ts_fim).add(evento.repeticao.quantidade, evento.repeticao.periodo);
            }
        } else {
            evento.ts_fim = evento.ts_ini;
            evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 27}), 'd').toDate();
            evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 3}), 'w').toDate();
            evento.ts_fim = moment(evento.ts_fim).add(faker.random.number({min: 0, max: 11}), 'M').toDate();
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