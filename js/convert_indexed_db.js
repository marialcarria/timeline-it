var db;
var request = indexedDB.open("TimelineIt",3);
request.onerror = function(event) {
  alert("Você não habilitou minha web app para usar IndexedDB?!");
};
request.onsuccess = function(event) {
  db = request.result;
  console.log('oi');
};
request.onupgradeneeded = function(event) {
	console.log('onupgradeneeded', event);
	var eventoStore = request.result.createObjectStore("evento", { keyPath: "id" , autoIncrement: true});
	eventoStore.createIndex("titulo", "titulo", {unique: false});
	eventoStore.createIndex("categoria", "categoria", {unique: false});

	eventoStore.transaction.oncomplete = function(event) {
	    console.log('oncomplete', event);
	    // Armazenando valores no evento
	   	//carregarDados();
	};
}
function carregarDados(evt){
	var eventoObjectStore = db.transaction("evento", "readwrite").objectStore("evento");
	var arr;
	if (Array.isPrototypeOf(evt)){
		arr = evt;
	} else {
		arr = [evt];
	}
    arr.forEach(function(e){
    	eventoObjectStore.add(e);
    });
}
// var objectStore = db.transaction("evento").objectStore("evento");

// objectStore.openCursor().onsuccess = function(event) {
//   var cursor = event.target.result;
//   if (cursor) {
//     console.log(cursor);
//     cursor.continue();
//   }
//   else {
//     alert("Não existe mais registros!");
//   }
// };
// function (event) {
//   var cursor = event.target.result;
//   if (cursor) {
//     console.log(cursor);
//     cursor.continue();
//   }
//   else {
//     alert("Não existe mais registros!");
//   }
// }

