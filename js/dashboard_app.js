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

        chart.addYAxis('facturations', "Facturations / mois", {
            numberSuffix: '€',
            numberHumanize: true
        });

        chart.addYAxis('plafond', "Plafond", {
            numberSuffix: '%'
        });

        chart.lock();

        self.loadDatas(function (bilans) {
            self.bilans = self.sortBilans(bilans.bilans);
            self.forNMonths(12, self.bilans, chart, self.chartFacturations);
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
            });
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

    self.forNMonths = function (nbMonth, bilans, chart, cb) {
        var months = {};
        var keys = Object.keys(bilans).sort();
        var _monthsKeys = keys.slice(keys.length - nbMonth, keys.length);
        var _monthKey = 0;

        for (var _monthsIndex in _monthsKeys) {
            _monthKey = _monthsKeys[_monthsIndex];
            months[_monthKey] = bilans[_monthKey];
        }

        cb(chart, months, _monthsKeys);
    }

    self.chartFacturations = function (chart, bilans, months) {
        var facturationsSeries = [];
        var facturationsLabels = [];
        var plafondSeries = [];

        months.forEach(function (month) {
            var monthTotal = 0;
            var plafondTotal = 0;
            var date = month.split('/');

            bilans[month].forEach(function (bilan) {
                var fieldBilan = JSON.parse(bilan.field_bilan);
                var fieldBilanInitial = bilan.field_bilan_initial;
                var fieldBilanPourFacturation = bilan.field_pour_facturation;
                var fieldPlafondFacturation = bilan.field_plafond_facturation;
                var keyWords = fieldBilan.keyWords;

                var total = 0;
                var coeffFactu = 1;

                if (fieldBilanPourFacturation == 0) {
                    return;
                }

                keyWords.forEach(function (keyWord) {
                    if (keyWord.found) {
                        var position = keyWord.positions[0];

                        if (position.position < 0 || position.position > 10) {
                            return;
                        }

                        total += 1 * bilan['field_factu_place_' + position.position];
                    }
                });

                if (fieldBilanInitial == fieldBilanPourFacturation && fieldBilanInitial == 1) {
                    coeffFactu = bilan.field_coef_factu_first_iso;
                } else if (fieldBilanInitial <= fieldBilanPourFacturation) {
                    coeffFactu = bilan.field_coef_factu_inf;
                } else if (fieldBilanInitial == fieldBilanPourFacturation) {
                    coeffFactu = bilan.field_coef_factu_iso;
                }

                total *= coeffFactu;
                monthTotal += parseFloat(total);
                plafondTotal += parseFloat(fieldPlafondFacturation);

                if(total > fieldPlafondFacturation) {
                    console.warn("Une facture de " + month + " a dépassé le plafond (facture = "
                    + total + ", plafond = " + fieldPlafondFacturation + ") ");
                }
            });

            console.log(plafondTotal);
            console.log(monthTotal);

            facturationsSeries.push(monthTotal);
            facturationsLabels.push(date[1] + '/' + date[0]);
            plafondSeries.push( monthTotal / plafondTotal * 100);
        });

        chart.addSeries("Facturations", "facturations", facturationsSeries);

        chart.addSeries("Plafond", "plafond", plafondSeries, {
            yAxis: 'plafond',
            seriesDisplayType: 'line',
        });

        chart.setLabels(facturationsLabels);
        chart.unlock();
    });
    
    self.init();
});
