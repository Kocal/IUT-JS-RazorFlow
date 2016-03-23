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
        chart.setDimensions(4, 4);
        chart.lock();

        self.loadDatas(function (bilans) {
            self.sortBilans(bilans.bilans);

            // C'est juste pour des tests :-)
            setTimeout(function () {
                chart.unlock();
            }, 2000);
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
        for (var bilan of bilans) {
            bilan = bilan.bilan;

            var created = {
                year: 0,
                month: 0,
                parts: bilan.created.split('/')
            }

            created.year = created.parts[1];
            created.month = created.parts[0];

            if (self.bilans[created.year] == void 0) {
                self.bilans[created.year] = {};
            }

            if (self.bilans[created.year][created.month] == void 0) {
                self.bilans[created.year][created.month] = []
            }

            self.bilans[created.year][created.month].push(bilan);
        }
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