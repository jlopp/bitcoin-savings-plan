var unit = "BTC";

$(function () {
    updatePage();
});

$(".trigger").change(updatePage);

$("#btc").change(function () {
    unit = "BTC";
    updatePage();
});

$("#mBtc").change(function () {
    unit = "mBTC";
    updatePage();
});

$("#btnFixed").click(function () {
    var rake = parseFloat(cleanString($("#inputRake").val()));
    $("#inputMultiplier").val(100 / (100 - rake));
    updatePage();
});

function updatePage() {

    validateInitial();
    validateExchRate();
    validateRake();
    validateCycles();
    validateMultiplier();
    
    $(".btc").text(unit);
    
    var initial = parseFloat(cleanString($("#inputInitial").val()));
    var exchange = parseFloat(cleanString($("#inputExchRate").val()));
    var rake = parseFloat(cleanString($("#inputRake").val()));
    var cycles = parseInt(cleanString($("#inputCycles").val()), 10);
    var multiplier = parseFloat(cleanString($("#inputMultiplier").val()));

    $('#results').html('');

    var conversionFactor = (unit == "mBTC") ? 1000 : 1;
	
	var remainingBtc = initial;
	remainingBtc *= conversionFactor;
	var initialBtcOrMbtc = remainingBtc;
	var previousBtc = initialBtcOrMbtc;
	
    // First row
    var row = $('<tr class="initial-row">');
    row.append($('<td>').html(''));
    row.append($('<td>').html(formatCurrency(exchange)));
    row.append($('<td>').html(numberWithCommas(initialBtcOrMbtc.toFixed(2))));
    row.append($('<td>').html(formatCurrency(initial * exchange)));
    row.append($('<td>').html('0'));
    row.append($('<td>').html(' '));
    row.append($('<td>').html(' '));
    row.append($('<td>').html('100.00%'));
	$('#results').append(row);

	var runningTotal = 0;

    // Subsequent rows
    for (var i = 0; i < cycles; i++) {
        var row = $('<tr>');
        
		
		btcCurrentValue = exchange * Math.pow(multiplier, i + 1);
		remainingBtc = remainingBtc * (1 - rake / 100);
		remainingBtcValue = btcCurrentValue * remainingBtc / conversionFactor
	    var soldBtc = previousBtc - remainingBtc;
		previousBtc = remainingBtc;
		var soldValue = btcCurrentValue * soldBtc / conversionFactor;
		runningTotal += soldValue;
		
        row.append($('<td>').html(i + 1));
        row.append($('<td>').html(formatCurrency((btcCurrentValue).toFixed(2))));
        row.append($('<td>').html(numberWithCommas(remainingBtc.toFixed(4))));
        row.append($('<td>').html(formatCurrency((remainingBtcValue).toFixed(2))));
        row.append($('<td>').html(soldBtc.toFixed(4)));
        row.append($('<td>').html(formatCurrency((soldValue).toFixed(2))));
        row.append($('<td>').html(formatCurrency((runningTotal).toFixed(2))));
        row.append($('<td>').html((remainingBtcValue / (remainingBtcValue + runningTotal) * 100).toFixed(2) + '%'));

        $('#results').append(row);
    }

    var data = $('#results').table2CSV({
        delivery: 'value',
        header: ['Cycle', '$/BTC', unit + ' Remaining', 'Value in $', unit + ' Sold', '$ Out', '$ Out Running Total', '% BTC']
    });

    if (navigator.userAgent.search("Chrome") >= 0) {
        blob = new Blob([data], { type: 'text/csv' }); //new way
        var csvUrl = URL.createObjectURL(blob);
    }
    else {
        var csvUrl = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
    }

    $('#dtLink').empty();
    $('#dtLink').append(
        $('<a>')
            .attr({
                'href': csvUrl,
                'download': 'bitcoinsavingsplan.csv'
                }
            ).html(
                '<span class="glyphicon glyphicon-save"></span> Download data in .CSV format'
                )
            );

}

function validateInitial() {
    var value = parseFloat(cleanString($("#inputInitial").val())).toFixed(2);
    if (isNaN(value) || value <= 0)
        value = 1;
    $("#inputInitial").val(numberWithCommas(value));
}

function validateExchRate() {
    var value = parseFloat(cleanString($("#inputExchRate").val())).toFixed(2);
    if (isNaN(value) || value <= 0)
        value = 1;
    $("#inputExchRate").val(numberWithCommas(value));
}

function validateRake() {
    var value = parseFloat(cleanString($("#inputRake").val())).toFixed(2);
    if (isNaN(value) || value <= 0)
        value = 10;
    if (value > 100)
        value = 100;
    $("#inputRake").val(value);
}

function validateCycles() {
    var value = parseInt(cleanString($("#inputCycles").val()), 10);
    if (isNaN(value) || value < 0) {
        value = 0;
    } else if (value > 1000) {
        value = 1000;
    }
    $("#inputCycles").val(value);
}

function validateMultiplier() {
    var value = parseFloat(cleanString($("#inputMultiplier").val()));
    if (isNaN(value) || value <= 1) {
        value = 2;
    } else if (value > 100) {
        value = 100;
    }
    $("#inputMultiplier").val(value);
}

function cleanString(x) {
    return x.replace(/[^\d\.\-\ ]/g, '');
}

function formatCurrency(x) {
    return '$' + numberWithCommas(x);
}

function numberWithCommas(x) {
    var num_parts = x.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
}