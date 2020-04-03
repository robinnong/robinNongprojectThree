const app = {}; // NAMESPACE OBJECT

app.monthly = true; // Initialize document with "Monthly View" on 

// -------------- CACHED JQUERY SELECTORS (STATIC) --------------
// --- Forms & Inputs---
const $form = $('form[name="calculator"]');
const $expenseFieldset = $('.expensesField');
const $modalForm = $('form[name="modalForm"]'); 
const $income = $('#income');

// --- Buttons ---
const $formButtons = $('.formButtons'); // Div container for add and delete buttons
const $addButton = $('.addLine');
const $deleteButton = $('.deleteLine');
const $toggleButton = $('.viewToggle');
const $modalExitButton = $('.exitButton');  
const $barsButton = $('.barsButton');
const $chartButton = $('.chartButton');

// --- Content Sections ---
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $percentSpend = $('.percentSpend div');
const $expensesSummary = $('.subSection2');
const $colorBar = $('.color');
const $canvas = $('canvas'); // Chart.js pie chart

// --- HTML Elements ---  
const $modalBox = $('.modalDisplay');
const $viewType = $('.viewType');  
const $animatedPTag = $('.subSection1 li p:first-of-type'); 
const $newLabel = $('#newLabel');
const $subHeading = $('.subHeading');
const $percentageBars = $('.barChartContainer');
const $warning = $('.warning');

// -------------- FUNCTIONS -------------- 
// GENERATE A RANDOM PASTEL COLOR
app.getRandomColor = () => {
    const hue = (Math.floor(Math.random() * 30)) * 12; // Provides Math.random with a range of 30 different hues instead of 360 
    const randomColor = `hsl(${hue}, 50%, 80%)`;
    return randomColor;
}

// GENERATE AN ARRAY OF RANDOM PASTEL COLOURS
app.getColorArray = () => {
    app.colorArray = []; 

    for (let i = 0; i < app.expenseValues.length; i++) {
        const newColorIndex = app.getRandomColor(); 

        if (app.colorArray.includes(newColorIndex)) { 
            i = i - 1; // if this color already exists, add one more cycle to the loop
        } else {
            // else if this color does not already exist, add it to the array
            app.colorArray.push(newColorIndex);
        }
    }
    return app.colorArray;
}

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
app.convertToString = (num) => { 
    const array = [...num]; // Array of characters in a string using a spread operator
    
    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");
    } // Else, do nothing
    
    return array.join(""); // Returns the whole string with or w/o comma separation
}

// GETS USER'S NET YEARLY INCOME
app.getYearlyIncome = () => parseFloat($income.val()); 

// GET THE SUM OF EXPENSES
app.addExpenses = (array) => array.reduce((a, b) => a + b); 

// DISPLAYS RESULTS TO SUB SECTION 1
app.displayResult = (income, expenses) => {
    const remainder = income - expenses;
    const valuesArray = [income, expenses, remainder]; 
    
    const strArray = valuesArray.map(value => app.convertToString(value.toFixed(2)));

    $totalIncome.text(`$${strArray[0]}`);
    $totalExpenses.text(`$${strArray[1]}`);
    $totalRemainder.text(`$${strArray[2]}`);
}

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
app.getUserInput = () => {

    app.expenseLabels = []; // Array of user's expenses (labels)
    app.expenseAttr = []; // Array of user's expenses ("for" attribute of input)
    app.expenseValues = []; // Array of user's expenses (value of input)  

    // Creates an array of all labels (DOM elements)
    const labelNodes = $('.expensesField label').toArray(); 
    const inputNodes = $('.expensesField input').toArray(); 

    // Gets the "for" attribute of each label in the array of elements
    // Gets name of each user input and adds it to the array of labels
    labelNodes.forEach(label => {
        const name = $(label).text();
        app.expenseLabels.push(name);
        const value = $(label).attr("for");
        app.expenseAttr.push(value);
    });

    // Gets value of each user input and adds it to the array of expenses
    inputNodes.forEach(val => {
        const input = $(val).val();
        const value = parseFloat(input);
        app.expenseValues.push(value);
    });
    
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    const monthlyExpenses = app.addExpenses(app.expenseValues); // Expression that returns the sum of expenses
    
    // Displaying results for Sub-section 1
    app.displayResult(monthlyIncome, monthlyExpenses);
    app.animateCSS($animatedPTag); 
    
    // Displaying results for Sub-section 2
    app.getColorArray(); // Create an array of random colours
    app.expensePercents = app.expenseValues.map(num => (num / monthlyIncome) * 100); // Array of expenses as percentages
    app.displaySummary(monthlyExpenses, monthlyIncome, app.displayBars());
}   

app.displaySummary = (val1, val2) => {

    const barWidth = 200; //width in pixels
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
        $percentSpend.width(percent * barWidth); 
    } else { 
        // If spending exceeds 100%, display bar at full width w/warning message
        $percentSpend.width(barWidth); 
        $warning.append(warning); 
    }
    $expensesSummary.show();
}

app.displayBars = () => {  

    const barChartWidth = 200; //width in pixels
    let i = 0;

    $canvas.hide();
    $percentageBars.show().empty();
    $subHeading.html(`<p>Percentage of <span>total income</span> spent per category</p>`); 

    app.expensePercents.forEach(index => {
        const percent = index.toFixed(1)
        const html = `<li>
                        <p>${app.expenseLabels[i]}: ${percent}%</p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;
        $percentageBars.append(html);

        let colorFill = $('.barChartContainer li').last().find('.color');
        // Error handling for percentages larger than 100%
        index < 100 ? colorFill.width(index * 0.01 * barChartWidth) : colorFill.width(barChartWidth);  
        colorFill.css("background-color", app.colorArray[i]);

        i++;
    })

    app.animateCSS($subHeading);
    $chartButton.css('color', '#b3b3b3');
    $barsButton.css('color', 'grey');
}

app.displayChart = () => {
    const ctx = $('#chart');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: data = {
            datasets: [{
                data: app.expenseValues,
                backgroundColor: app.colorArray,
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
    
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyExpenses = app.addExpenses(app.expenseValues);
    let buttonText;
    let income;  
    let expenses;

    if (app.monthly) { 
        $toggleButton.addClass('move'); // Animates the toggle button
        buttonText = "Yearly View"; // Changes the button text
        app.monthly = false; // Yearly View
        
        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else { 
        $toggleButton.removeClass('move'); // Animates the toggle button
        buttonText = "Monthly View"; // Changes the button text
        app.monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }
    
    app.displayResult(income, expenses);
    app.animateCSS($animatedPTag); 
    $viewType.text(buttonText);  
}

// FORM RESET
app.resetForm = () => {
    // TOGGLE BUTTON
    app.monthly = true; 
    $toggleButton.removeClass('move').prop("disabled", true); 
    $chartButton.prop("disabled", true); 
    // RESULTS
    $animatedPTag.text('$0.00'); // Dollar values 
    $('.percentExpenses, .percentRemaining').text('0%'); 
    $percentSpend.width(0); // Expenses bar color   
}

// ADD A NEW SPENDING CATEGORY
app.addNewLine = (e) => { 
    e.preventDefault();  
    
    const newLabel = $newLabel.val().trim(); // Gets input and trims whitespace around
    const inputId = newLabel.toLowerCase().replace(/\s+/g, ''); // Assigns the new input's #id in lowercase w/o whitespaces using regex
    const html =`<div class="formLine">
                    <label for="${inputId}">${newLabel}</label>
                    <div class="inputField">
                        <span>$</span>
                        <input type="number" step="0.01" id="${inputId}" name="${inputId}" required="">
                        <button type="button" aria-label="Click to delete category">
                            <i aria-hidden="true" class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;

    $formButtons.before(html); 
    app.hideModal(); // Hides modal box
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

// HIDES MODAL BOX
app.hideModal = () => $modalBox.hide(); 

//-------------- INITIALIZED EVENT LISTENERS --------------
const init = () => {   

    $form.on('submit', function (e) { //ON MAIN FORM SUBMIT
        e.preventDefault(); 
        
        $percentSpend.width(0); // Expenses bar color
        $('.percentages, .warning').empty(); 
        $('.formLine button').hide(); // Resolves bug when delete icons are still visible before toggling their visibility off
        $toggleButton.removeClass('move').prop("disabled", false); 
        $chartButton.prop("disabled", false); 

        app.getUserInput(); 
    }); 

    //ON FORM RESET
    $form.on('reset', app.resetForm); 

    //ON CLICKING VIEW TOGGLE BUTTON 
    $toggleButton.on('click', app.toggleViewType); 

    //ON MODAL FORM SUBMIT
    $modalForm.on('submit', app.addNewLine);

    //ON CLICKING EXIT MODAL BUTTON
    $modalExitButton.on('click', app.hideModal); 

    //ON PRESSING THE ESC KEY WHILE IN MODAL - $(this) is the window
    $(this).on('keydown', function (event) { 
        event.key === 'Escape' ? app.hideModal() : null; //shorthand conditional statement
    }); 

    // ON CLICKING BAR CHART BUTTON
    $barsButton.on('click', app.displayBars); 

    // ON CLICKING PIE CHART BUTTON
    $chartButton.on('click', function() {

        $percentageBars.hide();
        $canvas.show();
        $chartButton.css('color', 'grey');
        $barsButton.css('color', '#b3b3b3');

        $subHeading.html(`<p>Percentage of <span>total expenses</span> spent per category</p>`);
        app.animateCSS($subHeading); 
    
        app.displayChart()
    }); 

    //ON CLICKING 'ADD LINE' BUTTON
    $addButton.on('click', function () { 
        $('.formLine button').hide(); // Resolves bug when delete icons are still visible before toggling their visibility off
        $modalBox.show(); 
        $newLabel.val(""); 
    }); 

    //ON CLICKING 'DELETE LINE' BUTTON
    $deleteButton.on('click', function () { 
        const trashButton = $('.formLine button'); 
        trashButton.toggle(); 

        trashButton.on('click', function(){ 
            let thisLine = $(this).closest('.formLine'); 
            // Animates the line fading out left
            thisLine.addClass('animated fadeOutLeft faster'); 
            // Deletes the line when animation ends
            thisLine.on('animationend', function(){ 
                this.remove(); 
            }); 
        }); 
        
    }); 
}

// -------------- DOCUMENT READY --------------
$(() => {
    init();
})  