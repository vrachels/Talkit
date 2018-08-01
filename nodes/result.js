joint.shapes.dialogue.Result = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement(
            {
                size: { width: 250, height: 177 },
                type: 'dialogue.Result',
                inPorts: ['input'],
                outPorts: ['output'],
            },
            joint.shapes.dialogue.Base.prototype.defaults
        ),
    });

joint.shapes.dialogue.ResultView = joint.shapes.devs.ModelView.extend(
    {
        template:
            `<div class="node">
                <span class="label" />
                <button class="delete">x</button>
                <p>
                   <label>Tags(): string => {}</label>
                   <textarea type="text" class="code" rows="4" cols="31" placeholder="return '';" />
                </p>
                <p>
                   <label>Text:</label>
                   <input type="text" placeholder="$var$" />
                </p>
            </div>`,

        initialize: function () {

            _.bindAll(this, 'updateBox');
            joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

            this.$box = $(_.template(this.template)());
            // Prevent paper from handling pointerdown.
            this.$box.find('textarea').on('mousedown click', function (evt) { evt.stopPropagation(); });
            this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });

            this.$box.find('textarea').on('change', _.bind(function (evt) {
                this.model.set('code', $(evt.target).val());
            }, this));

            this.$box.find('input').on('change', _.bind(function (evt) {
                this.model.set('text', $(evt.target).val());
            }, this));

            this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));

            // Update the box position whenever the underlying model changes.
            this.model.on('change', this.updateBox, this);
            // Remove the box when the model gets removed from the graph.
            this.model.on('remove', this.removeBox, this);

            this.updateBox();
        },

        render: function () {
            joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
            this.paper.$el.prepend(this.$box);
            this.updateBox();
            return this;
        },

        updateBox: function () {
            // Set the position and dimension of the box so that it covers the JointJS element.
            var bbox = this.model.getBBox();
            // Example of updating the HTML with a data stored in the cell model.
            var codeField = this.$box.find('textarea');
            if (!codeField.is(':focus'))
                codeField.val(this.model.get('code'));

            var textField = this.$box.find('input');
            if (!textField.is(':focus'))
                textField.val(this.model.get('text'));

            var label = this.$box.find('.label');
            var type = this.model.get('type').slice('dialogue.'.length);
            label.text(type);
            label.attr('class', 'label ' + type);

            this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y });
        },

        removeBox: function (evt) {
            this.$box.remove();
        },
    });

gameDataHandler['dialogue.Result'] = function (cell, node) {
    node.code = cell.code;
    node.text = cell.text;
    node.next = null;
}

allTypes['dialogue.Result'] = true;
allChoiceTypes['dialogue.Result'] = true,
    allowableConnections['dialogue.Result'] = allTypesExceptChoice;

AddNodeType('Result', joint.shapes.dialogue.Result);