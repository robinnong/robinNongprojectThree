const budgetApp = {}; // NAMESPACE OBJECT

budgetApp.monthly = true; // Initialize document with "Monthly View" on 
budgetApp.chartWidth = 200; //width in pixels 

// -------------- CACHED JQUERY SELECTORS (STATIC) --------------//
// Forms & Inputs
budgetApp.$form = $('form[name="calculator"]'); 
budgetApp.$modalForm = $('form[name="modalForm"]'); 

// HTML Elements 
budgetApp.$toggleButton = $('.viewToggle');  
budgetApp.$newLabel = $('#newLabel');
budgetApp.$modalBox = $('.modalOuter');
budgetApp.$viewType = $('.viewType');  
budgetApp.$totals = $('.subSection1 li p:first-of-type'); 
budgetApp.$percentSpend = $('.percentSpend div'); 
budgetApp.$subHeading = $('.subHeading');
budgetApp.$barChart = $('.barChartContainer'); 

// -------------- FUNCTIONS --------------// 
// GET A RANDOM PASTEL COLOR
budgetApp.getRandomColor = () => {
    const hue = (Math.floor(Math.random() * 30)) * 12; // Provides Math.random with a range of 30 different hues
    const randomColor = `hsl(${hue}, 50%, 80%)`;
    return randomColor;
}

// GENERATE AN ARRAY OF RANDOM PASTEL COLOURS
budgetApp.getColorArray = (arr) => {
    const array = []; 

    for (let i = 0; i < arr.length; i++) {
        const newColorIndex = budgetApp.getRandomColor(); 

        if (array.includes(newColorIndex)) { 
            i = i - 1; // if this color already exists, add one more cycle to the loop
        } else {
            array.push(newColorIndex); // else if this color does not already exist, add it to the array
        }
    }
    return array;
}

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
budgetApp.convertToString = (num) => { 
    const array = [...num]; // Array of characters in a string using a spread operator
    
    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");
    } 
    return array.join(""); // Returns the whole string with or w/o comma separation
}

// ANIMATES A SELECTED HTML ELEMENT
budgetApp.animateCSS = (selector) => {
    selector.addClass('animated fadeInUp faster');
    const handleAnimationEnd = () => {
        selector.removeClass('animated fadeInUp faster');
        selector.off('animationend', handleAnimationEnd);
    }
    selector.on('animationend', handleAnimationEnd);
}

// GETS USER'S NET YEARLY INCOME
budgetApp.getYearlyIncome = () => parseFloat($('#income').val());  

// GETS USER'S MONTHLY INCOME
budgetApp.getMonthlyIncome = () => {
    const yearlyIncome = budgetApp.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    return monthlyIncome;
}

// GETS USER'S TOTAL MONTHLY EXPENSES
budgetApp.getMonthlyExpenses = () => budgetApp.expenseValues.reduce((a, b) => a + b);

// DISPLAYS RESULTS TO SUB SECTION 1
budgetApp.displayTotalNumbers = (income, expenses) => {
    const remainder = income - expenses;
    const valuesArray = [income, expenses, remainder];    
    const querySelectors = [ $('.totalIncome'), $('.totalExpenses'), $('.totalRemainder') ];

    // Displaying Income, Expenses and Remainder to Summary
    valuesArray.forEach((value, i) => {
        const strVal = budgetApp.convertToString(value.toFixed(2));
        querySelectors[i].text(`$${strVal}`);
    });

    budgetApp.animateCSS(budgetApp.$totals); 
} 

budgetApp.displayTotalBar = (val1, val2) => { 
    const percent = val1 / val2; 
    const spend = percent * 100;
    const save = 100 - spend;  
    
    $('.percentExpenses').text(`${spend.toFixed(1)}%`); 
    $('.percentRemaining').text(`${save.toFixed(1)}%`);
    
    const warning = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span> Warning! Your spending exceeds income by ${percent.toFixed(1)} times</span>`;
    
    // Error handling for percentages larger than 100%
    if (spend <= 100) { 
        // If spending is less or equal to 100%, display % bar at x percent
        budgetApp.$percentSpend.width(percent * budgetApp.chartWidth); 
    } else { 
        // If spending exceeds 100%, display bar at full width w/warning message
        budgetApp.$percentSpend.width(budgetApp.chartWidth); 
        $('.warning').append(warning); 
    }
}

// DISPLAY EXPENSE SUMMARY
budgetApp.displayChart = (param) => {
    let str;

    if (param === "bar") {
        str = "total income"; 
        budgetApp.displayBarChart();
    } else if (param === "pie") {
        str = "total expenses"; 
        budgetApp.displayPieChart();
    }
    budgetApp.$subHeading.html(`<p>Percentage of <span>${str}</span> spent per category</p>`); 
    budgetApp.animateCSS(budgetApp.$subHeading);
}

// GENERATE BAR CHART
budgetApp.displayBarChart = () => {  
    budgetApp.$barChart.empty();
    const percents = budgetApp.expenseValues.map(num => (num / budgetApp.getMonthlyIncome()) * 100); // Array of expenses as percentages 

    percents.forEach((percent, i) => {
        const roundPercent = percent.toFixed(1); 

        budgetApp.$barChart.append(
            `<li>
                <p>${budgetApp.expenseLabels[i]}: <span>${roundPercent}%</span></p>
                <div class="background">
                    <div class="color"></div>
                </div>
            </li>`
        );

        const colorFill = $('.color').last();
        colorFill.css("background-color", budgetApp.colorArray[i]);  
        // Error handling for percentages larger than 100%
        percents.length < 100 ? colorFill.width(roundPercent * 0.01 * budgetApp.chartWidth) : colorFill.width(budgetApp.chartWidth);  
    });
}

// GENERATE PIE CHART
budgetApp.displayPieChart = () => {
    const ctx = $('canvas');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: data = {
            datasets: [{
                data: budgetApp.expenseValues,
                backgroundColor: budgetApp.colorArray,
            }],
            labels: budgetApp.expenseLabels,
        },
        options: { 
            responsive: true,
            aspectRatio: 1, 
            legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                    boxWidth: 15,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontColor: 'grey'
                }
            }
        }
    })
}

// TOGGLE BETWEEN MONTHLY & YEARLY VIEW
budgetApp.toggleViewType = () => {
    const yearlyIncome = budgetApp.getYearlyIncome(); 
    const monthlyExpenses = budgetApp.getMonthlyExpenses();
    let income;  
    let expenses;

    if (budgetApp.monthly) {  
        budgetApp.$viewType.text("Yearly View"); // Changes the button text
        budgetApp.monthly = false; // Yearly View
        
        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else {  
        budgetApp.$viewType.text("Monthly View"); // Changes the button text
        budgetApp.monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }

    budgetApp.displayTotalNumbers(income, expenses);
}

// ADD A NEW SPENDING CATEGORY
budgetApp.addNewLine = () => { 
    const newLabel = budgetApp.$newLabel.val().trim(); // Gets input and trims whitespace around
    const inputId = newLabel.toLowerCase().replace(/\s+/g, ''); // Assigns the new input's #id in lowercase w/o whitespaces using regex
    const html =
    `<li class="formLine">
        <label for="${inputId}">${newLabel}</label>
        <div class="inputField">
            <span>$</span>
            <input type="number" step="0.01" id="${inputId}" name="${inputId}" min="0" max="10000" required>
            <button type="button" aria-label="Click to delete category">
                <i aria-hidden="true" class="fas fa-trash"></i>
            </button>
        </div>
    </li>`;

    $('.formButtons').before(html);  
}

// HIDES TRASH ICONS
budgetApp.toggleOffDelete = () => $('.formLine button').hide();

// DISABLES TOGGLE BUTTON
budgetApp.disableButtons = (boolean) => $('.viewToggle, #bar, #pie').prop("disabled", boolean);   

// RESET TOGGLE BUTTON 
budgetApp.resetToggle = () => {
    budgetApp.$viewType.text("Monthly View"); // Changes the button text
    budgetApp.$toggleButton.removeClass('move'); 
    budgetApp.monthly = true; // Resets view type 
}

// HIDES MODAL BOX
budgetApp.hideModal = () => budgetApp.$modalBox.removeClass('visible');

// RESET DEFAULT CHART
budgetApp.defaultChart = () => {
    $('#pieChart').hide();
    $('#barChart').show();
}

//-------------- INITIALIZE EVENT LISTENERS --------------//
budgetApp.init = () => {    
    budgetApp.disableButtons(true); 

    // ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
    budgetApp.$form.on('submit', function (e) {  
        e.preventDefault(); 
        $('.percentages, .warning').empty();    

        budgetApp.disableButtons(false);
        budgetApp.defaultChart();
        budgetApp.resetToggle(); // Resets toggle button position
        budgetApp.toggleOffDelete(); 

        // Creates an array of all labels  
        const labelNodes = $('.expensesField label').toArray();
        const inputNodes = $('.expensesField input').toArray();
        // Gets the "for" attribute of each label and maps to a new array
        budgetApp.expenseLabels = labelNodes.map(label => $(label).text()); 
        // Gets value of each user input and maps to a new array  
        budgetApp.expenseValues = inputNodes.map(input => parseFloat($(input).val()));
        // Create an array of random colours
        budgetApp.colorArray = budgetApp.getColorArray(budgetApp.expenseValues);

        // Displaying results for Sub-section 1
        const monthlyIncome = budgetApp.getMonthlyIncome();
        const monthlyExpenses = budgetApp.getMonthlyExpenses();

        budgetApp.displayTotalNumbers(monthlyIncome, monthlyExpenses);
        budgetApp.displayTotalBar(monthlyExpenses, monthlyIncome); 
        budgetApp.displayChart("bar"); 
    }); 
    
    //ON MAIN FORM RESET
    budgetApp.$form.on('reset', function() {
        budgetApp.disableButtons(true); 
        budgetApp.defaultChart(); 
        budgetApp.resetToggle(); // Resets toggle button position
        
        $('.warning').empty();
        $('.percentExpenses, .percentRemaining, .barChartContainer span').text('0%');  
        $('.color, .percentSpend div').width(0); // Resets bars to 0 percent 
        budgetApp.$totals.text('$0.00'); // Dollar values  
        $('#bar').addClass('active');
        $('#pie').removeClass('active');
    }); 

    //ON CLICKING VIEW TOGGLE BUTTON 
    budgetApp.$toggleButton.on('click', function() {
        $(this).toggleClass('move'); // Animates the toggle button
        budgetApp.toggleViewType();
    }); 

    //ON MODAL FORM SUBMIT
    budgetApp.$modalForm.on('submit', function(e) {
        e.preventDefault(); 
        budgetApp.addNewLine(); 
        budgetApp.hideModal(); 
    });

    //ON CLICKING EXIT MODAL BUTTON
    $('.exitButton').on('click', budgetApp.hideModal); 

    //ON CLICKING OUTSIDE MODAL BOX
    budgetApp.$modalBox.on('click', function(e){        
        e.target.closest('form') === null ? $(this).removeClass('visible') : null; //Hide modal box if click event on box is not registered
    });

    // ON PRESSING THE ESC KEY WHILE IN MODAL 
    $(this).on('keydown', function(e) { 
        e.key === 'Escape' ? budgetApp.hideModal() : null; 
    }); 

    // ON CLICKING CHART TYPE BUTTONS
    $('.resultButtons button').on('click', function() { 
        $('#barChart, #pieChart').toggle(); 
        $('#bar, #pie').toggleClass('active');  
        const buttonType = $(this).attr("id");
        budgetApp.displayChart(buttonType);
    }); 

    //ON CLICKING 'ADD LINE' BUTTON
    $('.addLine').on('click', function() { 
        budgetApp.toggleOffDelete();
        budgetApp.$modalBox.addClass('visible');
        budgetApp.$newLabel.val(""); 
    }); 

    //ON CLICKING 'DELETE LINE' BUTTON
    $('.deleteLine').on('click', function() { 
        const trashButton = $('.formLine button'); 
        trashButton.toggle(); 

        trashButton.on('click', function(){ 
            const thisLine = $(this).closest('.formLine'); 
            // Animates the line fading out left
            thisLine.addClass('animated fadeOutLeft faster'); 
            // Deletes the line when animation ends
            thisLine.on('animationend', function(){ 
                this.remove(); 
            }); 
        }); 
    }); 
}

// -------------- DOCUMENT READY --------------//
$(() => {
    budgetApp.init(); //INITIALIZE
})  