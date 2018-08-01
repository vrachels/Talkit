joint.shapes.dialogue.Choice = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement(
            {
                size: { width: 250, height: 135 },
                type: 'dialogue.Choice',
                inPorts: ['input'],
                outPorts: ['output'],
                name: '',
            },
            joint.shapes.dialogue.Base.prototype.defaults
        ),
    });

joint.shapes.dialogue.ChoiceView = joint.shapes.devs.ModelView.extend(
    {
        template:
            `<div class="node">
                <span class="label"> </span>
                <button class="delete">x</button>
                <input type="actor" placeholder="Keyword?" />
                <p> <textarea type="text" class="text" rows="4" cols="27" placeholder="Speech"></textarea></p>
            </div>`,

        initialize: function () {
            _.bindAll(this, 'updateBox');
            joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

            this.$box = $(_.template(this.template)());
            // Prevent paper from handling pointerdown.
            this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
            this.$box.find('textarea').on('mousedown click', function (evt) { evt.stopPropagation(); });

            this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));

            // set data to model
            this.$box.find('input').on('change', _.bind(function (evt) {
                this.model.set('keyword', $(evt.target).val());
            }, this));

            this.$box.find('textarea.text').on('change', _.bind(function (evt) {
                this.model.set('text', $(evt.target).val());
            }, this));

            this.model.on('change', this.updateBox, this);
            this.model.on('remove', this.removeBox, this);

            // fixups
            this.model.set('text', this.model.get('text') || this.model.get('name'));

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

            var textField = this.$box.find('input');
            if (!textField.is(':focus'))
                textField.val(this.model.get('keyword'));

            var nameField = this.$box.find('textarea.text');
            if (!nameField.is(':focus'))
                nameField.val(this.model.get('text') || this.model.get('name')); // use old 'name' if 'text' is not yet set

            var label = this.$box.find('.label');
            var type = this.model.get('type').slice('dialogue.'.length);
            label.text(type);
            label.attr('class', 'label ' + type);

            this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
        },

        removeBox: function (evt) {
            this.$box.remove();
        },
    });

gameDataHandler['dialogue.Choice'] = function (cell, node) {
    node.keyword = cell.keyword;
    node.text = cell.text;
    node.next = null;
}

allTypes['dialogue.Choice'] = true;
allChoiceTypes['dialogue.Choice'] = true,
    allowableConnections['dialogue.Choice'] = allTypesExceptChoice;

AddNodeType('Choice', joint.shapes.dialogue.Choice);
NodeScriptDone();