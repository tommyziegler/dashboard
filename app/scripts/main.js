require.config({
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        handlebars: '../bower_components/handlebars/handlebars',
        backbone: '../bower_components/backbone/backbone',
        lodash: '../bower_components/lodash/lodash',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        colorizer: '../bower_components/colorizer/dist/string-to-color.umd'
    },
    map: {
        "*": {
            "underscore": "lodash"
        }
    }
});

require([
    'backbone',
    'dashboard-app'
], function (Backbone, DashboardApp) {
    Backbone.history.start();

    var tags = window.location.search;
    if (tags === undefined || tags.length === 0) {
        tags = 'legacy';
    } else {
        tags = tags.substr(1);
    }

    new DashboardApp({
        listingUrl: './listing.json',
        contentUrl: './',
        providedStringTags: tags
    });
});