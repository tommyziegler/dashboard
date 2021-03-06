define([
    'backbone',
    'underscore',
    'jquery',
    'models/source',
    'models/sources',
    'models/status',
    'models/header',
    'models/content',
    'models/dashboard',
    'views/dashboard-view',
    'services/source-provider',
    'services/source-filter',
    'services/source-statistics',
    'services/timer'
], function (Backbone, _, $, SourceModel, Sources, StatusModel, HeaderModel, ContentModel, DashboardModel, DashboardView, SourceProvider, SourceFilter, statistics, Timer) {
    'use strict';

    var DashboardApp = Backbone.Model.extend({

        defaults: {
            contentUrl: undefined,
            listingUrl: undefined,
            providedStringTags: undefined,
            sources: new Sources(),
            headerModel: new HeaderModel(),
            contentModel: new ContentModel(),
            statusModel: new StatusModel()
        },

        initialize: function () {
            _.bindAll(this, 'render', 'initializeLoadSources', 'loadSources', 'triggerPrev', 'triggerNext', 'changeSource', 'filter');

            this.get('statusModel').on('prev', this.triggerPrev);
            this.get('statusModel').on('next', this.triggerNext);

            this.sourceProvider = new SourceProvider({
                listingUrl: this.get('listingUrl'),
                contentUrl: this.get('contentUrl')
            });

            this.sourceFilter = new SourceFilter({
                providedStringTags: this.get('providedStringTags')
            });

            this.timerService = new Timer({
                model: this.get('statusModel')
            });

            this.initializeLoadSources();
            this.render();
        },

        create: function (options) {
            return new DashboardApp(options);
        },

        render: function () {

            var model = new DashboardModel({
                headerModel: this.get('headerModel'),
                contentModel: this.get('contentModel'),
                statusModel: this.get('statusModel'),
                sources: this.get('sources')
            });

            DashboardView.prototype.create({
                el: $('#dashboard'),
                model: model
            });
        },

        filter: function (sources) {
            var filteredSources = this.sourceFilter.filter(sources);
            if (filteredSources.size() === 0) {
                filteredSources.add(statistics.sources(sources, this.get('providedStringTags')));
            }
            return filteredSources;
        },

        initializeLoadSources: function () {
            this.sourceProvider.getSources(this.loadSources);
            this.triggerNext();
        },

        loadSources: function (sources) {
            var filteredSources = this.filter(sources);

            this.get('statusModel').set({
                current: undefined,
                next: 0,
                prev: filteredSources.length - 1,
                total: filteredSources.length
            });
            this.get('sources').reset(filteredSources.toArray());
        },

        triggerNext: function () {
            this.changeSource(this.get('statusModel').get('next'));
        },

        triggerPrev: function () {
            this.changeSource(this.get('statusModel').get('prev'));
        },

        changeSource: function (index) {

            var status = this.get('statusModel');
            if (index === status.get('next') && status.get('next') === 0) {
                this.sourceProvider.getSources(this.loadSources);
            }

            var source = this.get('sources').at(index);

            this.get('headerModel').set(source.get('header').attributes);
            this.get('contentModel').set(source.get('content').attributes);

            status.set('prev', this.mod(index - 1, status.get('total')));
            status.set('current', index);
            status.set('next', this.mod(index + 1, status.get('total')));

            this.timerService.play(source.get('importance') * 20);
        },

        mod: function (n1, n2) {
            return ((n1 % n2) + n2) % n2;
        }
    });

    return DashboardApp;
});
