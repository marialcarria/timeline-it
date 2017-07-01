function ModalSelect(el_name, el_value, data, id) {
    this._valueElement = el_value || '';
    this._nameElement = el_name;
    this._callback = null;
    this._data = [];
    this._id = id || 'modal-' + (new Date()).getTime()

    if (data) {
        this.setData(data);
    }
};

ModalSelect.prototype.setData = function (data, nameProperty, valueProperty) {
    if (!(data instanceof Array)) {
        throw '"data" must be an Array';
    }
    if (data.length === 0) {
        return;
    }

    var name = nameProperty || 'name';
    var value = valueProperty || 'value';

    this._data = data.map(function (d) {
        if (typeof d === 'object') {
            return {
                name: d[name],
                value: d[value]
            };
        }

        return {
            name: d,
            value: d
        };
    });
}

ModalSelect.prototype.show = function (callback) {
    $('body').append(`
    <div class="modal fade ModalSelect" id="${this._id}" data-valueelement="${this._valueElement}" data-nameelement="${this._nameElement}">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">Fechar &times;</button>
                    <input type="text" class="form-control modal-heading ModalSelectFiltrar" placeholder="Filtrar">
                </div>
                <div class="modal-body">
                    <ul class="list-group">
                        ${this._data.map(function(d) {
                            return `<li class="list-group-item" data-value="${d.value}">${d.name}</li>`
                        }).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </div>`);
    $(`#${this._id}`).modal('show').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });/*.on('shown.bs.modal', function() {
        $(this).find('.ModalSelectFiltrar').focus();
    });*/
    $(`#${this._id} .ModalSelectFiltrar`).on('input', function() {
        var val = this.value.toLowerCase();
        $(this).parents('.ModalSelect').find('.list-group-item').each(function(){
            var txtList = $(this).text().toLowerCase();
            if (txtList.search(val) >= 0){
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    $(`#${this._id} .list-group-item`).on('click', function() {
        var name = this.innerHTML;
        var value = this.dataset.value;
        var modal = $(this).parents('.ModalSelect');
        console.log(modal.get(0).dataset);
        var valueElement = modal.get(0).dataset.valueelement;
        var nameElement = modal.get(0).dataset.nameelement;
        console.log(name, value, modal, valueElement, nameElement);
        if($(nameElement).is('input')) {
            $(nameElement).val(name);
        } else {
            $(nameElement).html(name);
        }
        if($(valueElement).is('input')) {
            $(valueElement).val(value);
        } else {
            $(valueElement).text(value);
        }
        modal.modal('hide');
        if (callback) callback();
    });
}