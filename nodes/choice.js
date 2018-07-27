joint.shapes.dialogue.Choice = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement(
            {
                size: { width: 250, height: 135 },
                type: 'dialogue.Choice',
                inPorts: ['input'],
                outPorts: ['output'],
                title: '',
                name: '',
            },
            joint.shapes.dialogue.Base.prototype.defaults
        ),
    });

joint.shapes.dialogue.ChoiceView = joint.shapes.devs.ModelView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"> </span>',
                '<button class="delete">x</button>',
                '<input type="choice" class="title" placeholder="Meta" />',
                '<p> <textarea type="text" class="name" rows="4" cols="27" placeholder="Speech"></textarea></p>',
                '</div>',

            ].join(''),

        initialize: function () {


            _.bindAll(this, 'updateBox');
            joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

            this.$box = $(_.template(this.template)());
            // Prevent paper from handling pointerdown.
            this.$box.find('textarea').on('mousedown click', function (evt) { evt.stopPropagation(); });
            this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
            this.$box.find('idd').on('mousedown click', function (evt) { evt.stopPropagation(); });

            // This is an example of reacting on the input change and storing the input data in the cell model.
            this.$box.find('textarea.name').on('change', _.bind(function (evt) {
                this.model.set('name', $(evt.target).val());
            }, this));

            // This is an example of reacting on the input change and storing the input data in the cell model.
            this.$box.find('input.title').on('change', _.bind(function (evt) {
                this.model.set('title', $(evt.target).val());
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
            var nameField = this.$box.find('textarea.name');
            if (!nameField.is(':focus'))
                nameField.val(this.model.get('name'));

            // Example of updating the HTML with a data stored in the cell model.
            var nameField = this.$box.find('input.title');
            if (!nameField.is(':focus'))
                nameField.val(this.model.get('title'));


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
    node.name = cell.name;
    node.title = cell.title;
    node.next = null;
}

allTypes['dialogue.Choice'] = true;
allChoiceTypes['dialogue.Choice'] = true,
allowableConnections['dialogue.Choice'] = allTypesExceptChoice;

AddNodeType('Choice', joint.shapes.dialogue.Choice);
NodeScriptDone();