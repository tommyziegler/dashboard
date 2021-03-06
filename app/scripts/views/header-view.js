define([
    'backbone',
    'underscore',
    'template-manager/template-manager'
], function (Backbone, _, templateManager) {
    'use strict';

    var HeaderView = Backbone.View.extend({

        templateName: 'HeaderView',

        initialize: function () {
            _.bindAll(this, 'render');

            this.template = templateManager.getTemplate(this.templateName);
            this.listenTo(this.model, 'change', this.render);

            this.render();
        },

        create: function (options) {
            return new HeaderView(options);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
        }
    });

    return HeaderView;
});
