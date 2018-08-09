joint.shapes.dialogue.Exec = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Exec',
            size: { width: 200, height: 76, },
            inPorts: ['input'],
            outPorts: ['output'],
            parameters: []
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.ExecView = joint.shapes.dialogue.BaseView.extend({
    template: [
        '<div class="node">',
        '    <span class="label"></span>',
        '    <button class="delete">x</button>',
        '    <button class="add">+</button>',
        '    <button class="remove">-</button>',
        '    <input type="text" class="method" placeholder="method" />',
        '</div>'
    ].join(''),

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        this.$box.find('.add').on('click', _.bind(this.addParameter, this));
        this.$box.find('.remove').on('click', _.bind(this.removeParameter, this));
        this.$box.find('input.method').on('change', _.bind(function (e) {
            this.model.set('method', $(e.target).val());
        }, this));
    },

    removeParameter: function () {
        if (this.model.get('parameters').length > 0) {
            var parameters = this.model.get('parameters').slice(0);
            parameters.pop();
            this.model.set('parameters', parameters);
            this.updateSize();
        }
    },

    addParameter: function () {
        var parameters = this.model.get('parameters').slice(0);
        parameters.push(null);
        this.model.set('parameters', parameters);
        this.updateSize();
    },

    updateBox: function () {
        joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);
        var method = this.$box.find('input.method');
        if (!method.is(':focus')) {
            method.val(this.model.get('method'));
        }
        var parameters = this.model.get('parameters');
        var parameterFields = this.$box.find('input.parameter');

        for (var i = parameterFields.length; i < parameters.length; i++) {
            // parameter boxes
            var field1 = $('<input type="text" class="parameter" />');
            field1.attr('placeholder', 'Arg: Value');
            field1.attr('index', i);
            this.$box.append(field1);

            // Prevent paper from handling pointerdown.
            field1.on('mousedown click', function (evt) { evt.stopPropagation(); });

            field1.on('change', _.bind(function (evt) {
                var parameters = this.model.get('parameters').slice(0);
                parameters[$(evt.target).attr('index')] = $(evt.target).val();
                this.model.set('parameters', parameters);
            }, this));
        }

        // Remove value fields if necessary
        for (var j = parameters.length; j < parameterFields.length; j++) {
            $(parameterFields[j]).remove();
        }

        // Update value fields
        parameterFields = this.$box.find('input.parameter');
        for (var k = 0; k < parameterFields.length; k++) {
            var field2 = $(parameterFields[k]);
            if (!field2.is(':focus')) {
                field2.val(parameters[k]);
            }
        }
    },

    updateSize: function () {
        var width = this.model.get('size').width;
        this.model.set('size', { width, height: 101 + Math.max(0, (this.model.get('parameters').length - 1) * 25) });
    }
});

gameDataHandler['dialogue.Exec'] = function (cell, node) {
    node.method = cell.method;
    node.parameters = cell.parameters;
    node.next = null;
}

allTypes['dialogue.Exec'] = true;
allTypesExceptChoice['dialogue.Exec'] = true;
allowableConnections['dialogue.Exec'] = allTypesExceptChoice;

AddNodeType('Exec', joint.shapes.dialogue.Exec, 'Behavior');
AddNodeType('Exec', joint.shapes.dialogue.Exec, 'Interaction');