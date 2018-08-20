joint.shapes.dialogue.BountyOpt = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.BountyOpt',
            size: { width: 200, height: 30, },
            inPorts: ['input'],
            values: []
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.BountyOptView = joint.shapes.dialogue.BaseView.extend({
    template: `
        <div class="node BountyOpt">
            <span class="label"></span>
            <button class="delete">x</button>
            <button class="add">+</button>
            <button class="remove">-</button>
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        this.$box.find('.add').on('click', _.bind(this.addValue, this));
        this.$box.find('.remove').on('click', _.bind(this.removeValue, this));
    },

    removeValue: function () {
        if (this.model.get('values').length > 0) {
            var values = this.model.get('values').slice(0);
            values.pop();
            this.model.set('values', values);
            this.updateSize();
        }
    },

    addValue: function () {
        var values = this.model.get('values').slice(0);
        values.push(null);
        this.model.set('values', values);
        this.updateSize();
    },

    updateBox: function () {
        joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

        var values = this.model.get('values');
        var valueFields = this.$box.find('input.value');

        for (var i = valueFields.length; i < values.length; i++) {
            var field1 = $('<input type="text" class="value" />');
            field1.attr('placeholder', 'N*Value');
            field1.attr('index', i);
            this.$box.append(field1);

            field1.on('mousedown click', function (evt) { evt.stopPropagation(); });

            field1.on('change', _.bind(function (evt) {
                var values = this.model.get('values').slice(0);
                values[$(evt.target).attr('index')] = $(evt.target).val();
                this.model.set('values', values);
            }, this));
        }

        for (var j = values.length; j < valueFields.length; j++) {
            $(valueFields[j]).remove();
        }

        valueFields = this.$box.find('input.value');
        for (var k = 0; k < valueFields.length; k++) {
            var field2 = $(valueFields[k]);
            if (!field2.is(':focus')) {
                field2.val(values[k]);
            }
        }
    },

    updateSize: function () {
        var width = this.model.get('size').width;
        this.model.set('size', { width, height: 30 + Math.max(0, (this.model.get('values').length) * 25) });
    }
});

gameDataHandler['dialogue.BountyOpt'] = function (cell, node) {
    node.values = cell.values;
    node.next = null;
}

allTypes['dialogue.BountyOpt'] = true;
allTypesExceptChoice['dialogue.BountyOpt'] = true;

AddNodeType('BountyOpt', joint.shapes.dialogue.BountyOpt, 'Contracts');