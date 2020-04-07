const app = {}; // NAMESPACE OBJECT

app.monthly = true; // Initialize document with "Monthly View" on 
app.chartWidth = 200; //width in pixels 

// -------------- CACHED JQUERY SELECTORS (STATIC) --------------//
// --- Forms & Inputs---
app.$form = $('form[name="calculator"]'); 
app.$modalForm = $('form[name="modalForm"]'); 
app.$income = $('#income');

// --- Buttons ---  
app.$toggleButton = $('.viewToggle'); 
app.$barsButton = $('.barsButton');
app.$chartButton = $('.chartButton');

// --- HTML Elements ---
app.$percentSpend = $('.percentSpend div'); 
app.$canvas = $('canvas'); // Chart.js pie chart
app.$modalBox = $('.modalOuter');
app.$viewType = $('.viewType');  
app.$animatedPTag = $('.subSection1 li p:first-of-type'); 
app.$newLabel = $('#newLabel');
app.$subHeading = $('.subHeading');
app.$percentageBars = $('.barChartContainer'); 

// -------------- FUNCTIONS --------------// 

// GET A RANDOM PASTEL COLOR
app.getRandomColor = () => {
    const hue = (Math.floor(Math.random() * 30)) * 12; // Provides Math.random with a range of 30 different hues
    const randomColor = `hsl(${hue}, 50%, 80%)`;
    return randomColor;
}

// GENERATE AN ARRAY OF RANDOM PASTEL COLOURS
app.getColorArray = (arr) => {
    const array = []; 

    for (let i = 0; i < arr.length; i++) {
        const newColorIndex = app.getRandomColor(); 

        if (array.includes(newColorIndex)) { 
            i = i - 1; // if this color already exists, add one more cycle to the loop
        } else {
            array.push(newColorIndex); // else if this color does not already exist, add it to the array
        }
    }
    return array;
}

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
app.convertToString = (num) => { 
    const array = [...num]; // Array of characters in a string using a spread operator
    
    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");
    } 
    return array.join(""); // Returns the whole string with or w/o comma separation
}

// GETS USER'S NET YEARLY INCOME
app.getYearlyIncome = () => parseFloat(app.$income.val());  

// GETS USER'S MONTHLY INCOME
app.getMonthlyIncome = () => {
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    return monthlyIncome;
}

// GETS USER'S TOTAL MONTHLY EXPENSES
app.getMonthlyExpenses = () => app.expenseValues.reduce((a, b) => a + b);

// DISPLAYS RESULTS TO SUB SECTION 1
app.displayResult = (income, expenses) => {
    const remainder = income - expenses;
    const valuesArray = [income, expenses, remainder];    
    const querySelectors = [ $('.totalIncome'), $('.totalExpenses'), $('.totalRemainder') ];

    // Displaying Income, Expenses and Remainder to Summary
    valuesArray.forEach((value, i) => {
        const strVal = app.convertToString(value.toFixed(2));
        querySelectors[i].text(strVal);
    });

    app.animateCSS(app.$animatedPTag); 
}

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
app.getUserInput = () => {  
    // Creates an array of all labels (DOM elements)
    const labelNodes = $('.expensesField label').toArray(); 
    const inputNodes = $('.expensesField input').toArray(); 

    // Gets the "for" attribute of each label and maps to a new array
    app.expenseLabels = labelNodes.map(label => $(label).text());
    // Gets name of each user input and maps to a new array
    app.expenseAttr = labelNodes.map(label => $(label).attr("for")); 
    // Gets value of each user input and maps to a new array  
    app.expenseValues = inputNodes.map(input => parseFloat($(input).val())); 

    // Displaying results for Sub-section 1
    const monthlyIncome = app.getMonthlyIncome();
    const monthlyExpenses = app.getMonthlyExpenses();
    app.displayResult(monthlyIncome, monthlyExpenses);
    app.displaySubsection1(monthlyExpenses, monthlyIncome);

    // Create an array of random colours
    app.colorArray = app.getColorArray(app.expenseValues); 
    $('.subSection2').show();
}   

app.displaySubsection1 = (val1, val2) => { 
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
        app.$percentSpend.width(percent * app.chartWidth); 
    } else { 
        // If spending exceeds 100%, display bar at full width w/warning message
        app.$percentSpend.width(app.chartWidth); 
        $('.warning').append(warning); 
    }
}

// DISPLAY EXPENSE SUMMARY
app.displaySubsection2 = (param) => {
    let str;

    if (param) {
        str = "total income"; 
        app.displayBars(app.colorArray);
    } else {
        str = "total expenses"; 
        app.displayChart(app.colorArray);
    }
    app.$subHeading.html(`<p>Percentage of <span>${str}</span> spent per category</p>`); 
    app.animateCSS(app.$subHeading);
}

// GENERATE BAR CHART
app.displayBars = (colors) => {  
    app.$percentageBars.empty();
    const percents = app.expenseValues.map(num => (num / app.getMonthlyIncome()) * 100); // Array of expenses as percentages 

    percents.forEach((percent, i) => {
        const roundPercent = percent.toFixed(1); 

        app.$percentageBars.append(
            `<li>
                <p>${app.expenseLabels[i]}: <span>${roundPercent}%</span></p>
                <div class="background">
                    <div class="color"></div>
                </div>
            </li>`
        );

        const colorFill = $('.color').last();
        // Error handling for percentages larger than 100%
        percents.length < 100 ? colorFill.width(roundPercent * 0.01 * app.chartWidth) : colorFill.width(app.chartWidth);  
        colorFill.css("background-color", colors[i]);  
    });
}

// GENERATE PIE CHART
app.displayChart = (colors) => {
    const ctx = $('#chart');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: data = {
            datasets: [{
                data: app.expenseValues,
                backgroundColor: colors,
            }],
            labels: app.expenseLabels,
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
app.toggleViewType = () => {
    const yearlyIncome = app.getYearlyIncome(); 
    const monthlyExpenses = app.getMonthlyExpenses();
    let income;  
    let expenses;

    if (app.monthly) {  
        app.$viewType.text("Yearly View"); // Changes the button text
        app.monthly = false; // Yearly View
        
        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else {  
        app.$viewType.text("Monthly View"); // Changes the button text
        app.monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }

    app.displayResult(income, expenses);
}

// ADD A NEW SPENDING CATEGORY
app.addNewLine = () => { 
    const newLabel = app.$newLabel.val().trim(); // Gets input and trims whitespace around
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

// ANIMATES JQUERY SELECTOR 
app.animateCSS = (selector) => {
    selector.addClass('animated fadeInUp faster');

    const handleAnimationEnd = () => {
        selector.removeClass('animated fadeInUp faster');
        selector.off('animationend', handleAnimationEnd);
    }
    
    selector.on('animationend', handleAnimationEnd);
}

app.toggleChart = () => {
    app.$canvas.toggle();
    app.$percentageBars.toggle();
    app.$barsButton.toggleClass('active');
    app.$chartButton.toggleClass('active');
}

// HIDES TRASH ICONS
app.toggleOffDelete = () => $('.formLine button').hide();

// DISABLES TOGGLE BUTTON
app.disableButton = (boolean) => $('.viewToggle, .barsButton, .chartButton').prop("disabled", boolean);   

// RESET TOGGLE BUTTON 
app.resetToggle = () => {
    app.$viewType.text("Monthly View"); // Changes the button text
    app.$toggleButton.removeClass('move'); 
    app.monthly = true; // Resets view type 
}

// HIDES MODAL BOX
app.hideModal = () => app.$modalBox.removeClass('visible');

// RESET DEFAULT CHART
app.defaultChart = () => {
    app.$canvas.hide();
    app.$percentageBars.show();
}

//-------------- INITIALIZE EVENT LISTENERS --------------//
app.init = () => {    
    app.disableButton(true); 
    //ON MAIN FORM SUBMIT
    app.$form.on('submit', function (e) {  
        e.preventDefault(); 
        $('.percentages, .warning').empty();    

        app.disableButton(false);
        app.resetToggle(); // Resets toggle button position
        app.toggleOffDelete(); 
        app.defaultChart();
        app.getUserInput();   
        app.displaySubsection2(true);
    }); 
    
    //ON MAIN FORM RESET
    app.$form.on('reset', function() {
        app.defaultChart();
        app.displaySubsection2(true);
        app.disableButton(true); 
        app.resetToggle(); // Resets toggle button position
        
        $('.percentExpenses, .percentRemaining, .barChartContainer span').text('0%');  
        $('.color, .percentSpend div').width(0); // Resets bars to 0 percent 
        app.$animatedPTag.text('$0.00'); // Dollar values  
        app.$barsButton.addClass('active');
        app.$chartButton.removeClass('active');
    }); 

    //ON CLICKING VIEW TOGGLE BUTTON 
    app.$toggleButton.on('click', function() {
        $(this).toggleClass('move'); // Animates the toggle button
        app.toggleViewType();
    }); 

    //ON MODAL FORM SUBMIT
    app.$modalForm.on('submit', function(e) {
        e.preventDefault();  
        app.addNewLine();
        app.hideModal();
    });

    //ON CLICKING EXIT MODAL BUTTON
    $('.exitButton').on('click', app.hideModal); 

    //ON CLICKING OUTSIDE MODAL BOX
    app.$modalBox.on('click', function(e){
        //Hide modal box if click event on box is not registered
        e.target.closest('form') === null ? $(this).removeClass('visible'): null; 
    });

    // ON PRESSING THE ESC KEY WHILE IN MODAL - $(this) is the window
    $(this).on('keydown', function (e) { 
        e.key === 'Escape' ? app.hideModal() : null; //shorthand conditional statement
    }); 

    // ON CLICKING CHART TYPE BUTTONS
    $('.resultButtons button').on('click', app.toggleChart);
    
    // ON CLICKING BAR CHART BUTTON
    app.$barsButton.on('click', function() {
        app.displaySubsection2(true);
    });

    // ON CLICKING PIE CHART BUTTON
    app.$chartButton.on('click', function () {
        app.displaySubsection2(false);
    }); 

    //ON CLICKING 'ADD LINE' BUTTON
    $('.addLine').on('click', function () { 
        app.toggleOffDelete();
        app.$modalBox.addClass('visible');
        app.$newLabel.val(""); 
    }); 

    //ON CLICKING 'DELETE LINE' BUTTON
    $('.deleteLine').on('click', function () { 
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
    app.init(); //INITIALIZE
})  