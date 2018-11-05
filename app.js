var Chart = (function (window, d3) {
    
    var svgWidth, svgHeight, width, height, margin = {}, x, y, line, svg;
    var currentDateObject = new Date();
    var startDateForAPICall = calculateStartDateForAPICall(currentDateObject);
    var endDateForAPICall = calculateEndDateForAPICall(currentDateObject);
    var formatValue = d3.format(",.2f");
    var apiForHistoricalBitcoinData = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDateForAPICall}&end=${endDateForAPICall}`;
    var apiForCurrentBitcoinData = 'https://api.coindesk.com/v1/bpi/currentprice.json';

    document.addEventListener("DOMContentLoaded", function () {
        fetch(apiForHistoricalBitcoinData)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                parsedData = parseData(data);
                drawChart(parsedData);
            });
    });

    function addZeroIfNumberIsLessThan10(number) {
        if(number < 10) {
            return "0" + number;
        } else {
            return number;
        }
    }

    function calculateStartDateForAPICall(currentDateObject) {
        var currentYear = currentDateObject.getFullYear();
        var currentMonth = currentDateObject.getMonth() + 1;
        currentMonth = addZeroIfNumberIsLessThan10(currentMonth);
        var currentDay = currentDateObject.getDate();
        currentDay = addZeroIfNumberIsLessThan10(currentDay);
        return `${currentYear - 1}-${currentMonth}-${currentDay}`;
    }

    function calculateEndDateForAPICall(currentDateObject) {
        var currentYear = currentDateObject.getFullYear();
        var currentMonth = currentDateObject.getMonth() + 1;
        currentMonth = addZeroIfNumberIsLessThan10(currentMonth);
        var currentDay = currentDateObject.getDate();
        currentDay = addZeroIfNumberIsLessThan10(currentDay);
        return `${currentYear}-${currentMonth}-${currentDay}`;
    }

    function formatCurrency(data) {
        return "$" + formatValue(data);
    }

    function parseData(data) {
        var arr = [];
        for (var i in data.bpi) {
            arr.push(
                {
                    date: new Date(i), //date
                    value: +data.bpi[i] //convert string to number
                });
        }
        return arr;
    }

    function updateDimensions() {
        svgWidth = 600;
        svgHeight = 400;
        margin.top = 20;
        margin.right = 100;
        margin.bottom = 50;
        margin.left = 70;
        width = svgWidth - margin.left - margin.right;
        height = svgHeight - margin.top - margin.bottom;
    }

    function drawChart(data) {
        updateDimensions();
        //Sets Ranges
        x = d3.scaleTime().rangeRound([0, width]);
        y = d3.scaleLinear().rangeRound([height, 0]);

        //Defines the line
        line = d3.line()
            .x((d) => {
                return x(d.date)
            })
            .y((d) => {
                return y(d.value);
            });

        //Appends SVG object to body of the page
        //Appends a 'group' element to the 'svg'
        //Moved the 'group' element to the top left margin
        svg = d3.select('.card').append('svg')
            .attr("width", svgWidth)
            .attr("class", "lineChart")
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        //Scale the range of the data
        x.domain(d3.extent(data, (d) => {
            return d.date;
        }));

        y.domain([0, d3.max(data, (d) => {
            return d.value;
        })]);

        // Add the line path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line);

        //Add the x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        //Add text label for x-axis
        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .style('text-anchor', "middle")
            .text("Date");

        //Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(y));

        //Add text label for y-axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Price ($)");

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", () => {
                focus.style("display", null);
            })
            .on("mouseout", () => {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);

        function mousemove() {
            var bisectDate = d3.bisector((d) => {
                return d.date;
            }).left;

            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisectDate(data, x0, 1);
            var d0 = data[i - 1];
            var d1 = data[i];
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.attr("transform", `translate(${x(d.date)}, ${y(d.value)})`);
            focus.select("text").text(formatCurrency(d.value));
        }
    }


    document.addEventListener("DOMContentLoaded", function () {
        fetch(apiForCurrentBitcoinData)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                currentBitcoinPrice = data.bpi.USD.rate_float;
                populateDivWithCurrentBitcoinPrice(currentBitcoinPrice);
            });
    });

    function populateDivWithCurrentBitcoinPrice() {
        var div = document.querySelector("#currentBitcoinPrice");

        div.innerHTML = formatCurrency(currentBitcoinPrice);
    }

})(window, d3);