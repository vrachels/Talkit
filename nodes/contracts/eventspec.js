joint.shapes.dialogue.EventSpec = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.EventSpec',
            size: { width: 200, height: 165 },
            inPorts: ['input'],
            parameters: [
                'Action: Action: ?',
            ]
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.EventSpecView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node EventSpec">
            <span class="label"></span>
            <button class="delete">x</button>
            <input type="text" id="name" class="noprop" placeholder="Name" />
            <input type="text" id="scriptLong" class="noprop" placeholder="Long" />
            <p>
                <div id="Params">
                    <label>Params:</label>
                    <button class="add">+</button>
                    <button class="remove">-</button>
                    <input type="text" class="parameter" placeholder="Action: Action: Value" />
                </div>
            </p>
            <p>
                <input type="checkbox" id="isRestriction" />
                <label>Restriction</label>
                <input type="checkbox" id="isOngoing" />
                <label>Ongoing</label>
            </p>
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        var paramDiv = this.$box.find('#Params');
        paramDiv.find('.add').on('click', _.bind(this.addParameter, this));
        paramDiv.find('.remove').on('click', _.bind(this.removeParameter, this));
        this.$box.find('#name').on('change', _.bind(function (e) {
            this.model.set('name', $(e.target).val());
        }, this));
        this.$box.find('#scriptLong').on('change', _.bind(function (e) {
            this.model.set('scriptLong', $(e.target).val());
        }, this));

        this.$box.find('#isRestriction').on('change', _.bind(function (e) {
            var value = $(e.target).prop("checked");
            this.model.set('isRestriction', value);
            if (value) this.model.set('isOngoing', false);
        }, this));
        this.$box.find('#isOngoing').on('change', _.bind(function (e) {
            var value = $(e.target).prop("checked");
            this.model.set('isOngoing', value);
            if (value) this.model.set('isRestriction', false);
        }, this));

        this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });

        this.$box.find('input.parameter').on('change', _.bind(function (evt) {
            var parameters = this.model.get('parameters');
            var target = $(evt.target);
            parameters[0] = target.val();
            this.model.set('parameters', parameters);
        }, this));
    },

    removeParameter: function () {
        if (this.model.get('parameters').length > 1) {
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

        var name = this.$box.find('#name');
        if (!name.is(':focus')) {
            name.val(this.model.get('name'));
        }
        var scriptLong = this.$box.find('#scriptLong');
        if (!scriptLong.is(':focus')) {
            scriptLong.val(this.model.get('scriptLong'));
        }

        this.$box.find('#isRestriction').prop("checked", this.model.get('isRestriction'));
        this.$box.find('#isOngoing').prop("checked", this.model.get('isOngoing'));

        var parameters = this.model.get('parameters');
        var parameterFields = this.$box.find('input.parameter');
        var paramDiv = this.$box.find('#Params');

        for (var i = parameterFields.length; i < parameters.length; i++) {
            // parameter boxes
            var field = $('<input type="text" class="parameter" />');
            field.attr('placeholder', 'Key: Type: Value');
            field.attr('index', i);
            paramDiv.append(field);

            // Prevent paper from handling pointerdown.
            field.on('mousedown click', function (evt) { evt.stopPropagation(); });

            field.on('change', _.bind(function (evt) {
                var parameters = this.model.get('parameters').slice(0);
                var target = $(evt.target);
                parameters[target.attr('index')] = target.val();
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
        this.model.set('size', { width, height: 165 + Math.max(0, (this.model.get('parameters').length - 1) * 25) });
    }
});

gameDataHandler['dialogue.EventSpec'] = function (cell, node) {
    node.name = cell.name;
    node.scriptLong = cell.scriptLong;
    node.isRestriction = cell.isRestriction;
    node.isOngoing = cell.isOngoing;
    node.parameters = cell.parameters;
    node.next = null;
}


allTypes['dialogue.EventSpec'] = true;
allContractTypes['dialogue.EventSpec'] = true;

AddNodeType('EventSpec', joint.shapes.dialogue.EventSpec, 'Contracts');