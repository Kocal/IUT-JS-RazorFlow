// Welcome to the RazorFlow Dashbord Quickstart. Simply copy this "dashboard_quickstart"
// to somewhere in your computer/web-server to have a dashboard ready to use.
// This is a great way to get started with RazorFlow with minimal time in setup.
// However, once you're ready to go into deployment consult our documentation on tips for how to 
// maintain the most stable and secure 

StandaloneDashboard(function (db) {
    // YOU CAN DELETE THE ENTIRE CONTENTS OF THIS FUNCTION AND CUSTOMIZE
    // AS PER YOUR REQUIREMENT.
    // These components are simply here to give you a quick introduction of how RazorFlow Works
    var self = this;

    self.JSON_URL = 'http://www.francelink.net/datas.json';

    self.bilans = {};

    self.init = function () {
        db.setDashboardTitle("My Dashboard");
        self.initChart();
    };

    self.initChart = function () {
        var chart = new ChartComponent();
        chart.setCaption('Facturations');
        chart.setDimensions(12, 6);
        chart.lock();

        self.loadDatas(function (bilans) {
            self.bilans = self.sortBilans(bilans.bilans);
            self.forNMonths(12, self.bilans, function (bilans, months) {
                var series = [];
                chart.setLabels(months);

                months.forEach(function (month) {
                    var monthTotal = 0;

                    bilans[month].forEach(function (bilan) {
                        var fieldBilan = JSON.parse(bilan.field_bilan);
                        var fieldBilanInitial = bilan.field_bilan_initial;
                        var fieldBilanPourFacturation = bilan.field_pour_facturation;
                        var keyWords = fieldBilan.keyWords;

                        var total = 0;
                        var coeffFactu = 1;

                        keyWords.forEach(function(keyWord) {

                            if(keyWord.found) {
                                var position = keyWord.positions[0];

                                if(position.position < 0 || position.position > 10) {
                                    return;
                                }

                                total += 1 * bilan['field_factu_place_' + position.position];
                            }
                        });

                        if(fieldBilanInitial == fieldBilanPourFacturation && fieldBilanInitial == 1) {
                            coeffFactu = bilan.field_coef_factu_first_iso;
                        } else if(fieldBilanInitial <= fieldBilanPourFacturation) {
                            coeffFactu = bilan.field_coef_factu_inf;
                        } else if(fieldBilanInitial == fieldBilanPourFacturation) {
                            coeffFactu = bilan.field_coef_factu_iso;
                        }

                        total *= coeffFactu;
                        monthTotal += total;
                    });

                    series.push(monthTotal);
                });

                chart.addSeries(series);
                chart.unlock();
            });
        });

        db.addComponent(chart);
    }

    self.loadDatas = function (cb) {
        $.ajax(self.JSON_URL, {
                dataType: 'json'
            })
            .done(cb)
            .fail(function (jqXHR, textStatus, errorThrown) {
                alert("Impossible de récupérer le flux JSON");
                console.error(textStatus, errorThrown);
            })
    }

    self.sortBilans = function (bilans) {
        var _bilans = {};

        for (var bilan of bilans) {
            bilan = bilan.bilan;

            var created = {
                year: '',
                month: '',
                parts: bilan.created.split('/'),
                normalized: ''
            }

            created.year = created.parts[1];
            created.month = created.parts[0];
            created.normalized = created.year + '/' + created.month;

            if (_bilans[created.normalized] == void 0) {
                _bilans[created.normalized] = [];
            }

            _bilans[created.normalized].push(bilan);
        }

        return _bilans;
    }

    self.forNMonths = function (nbMonth, bilans, cb) {
        var months = {};
        var keys = Object.keys(bilans).sort();
        var _monthsKeys = keys.slice(keys.length - nbMonth, keys.length);
        var _monthKey = 0;

        for (var _monthsIndex in _monthsKeys) {
            _monthKey = _monthsKeys[_monthsIndex];
            months[_monthKey] = bilans[_monthKey];
        }

        cb(months, _monthsKeys);
    }

    // // Add a chart to the dashboard. This is a simple chart with no customization.
    // var chart = new ChartComponent();
    // chart.setCaption("Sales");
    // chart.setDimensions(6, 6);
    // chart.setLabels(["2013", "2014", "2015"]);
    // chart.addSeries([3151, 1121, 4982]);
    //
    // db.addComponent(chart);
    //
    // // You can add multiple charts to the same dashboard. In fact you can add many
    // // different types of components. Check out the docs at razorflow.com/docs
    // // to read about all the types of components.
    // //
    // // This is another chart with additional parameters passed to "addSeries" to
    // // make customizations like change it to a line chart, and add "$" to indicate currency
    // var chart2 = new ChartComponent();
    // chart2.setCaption("Sales");
    // chart2.setDimensions(6, 6);
    // chart2.setLabels(["2013", "2014", "2015"]);
    // chart2.addSeries([3151, 1121, 4982], {
    //     numberPrefix: "$",
    //     seriesDisplayType: "line"
    // });
    //
    // db.addComponent(chart2);
    self.init();
});